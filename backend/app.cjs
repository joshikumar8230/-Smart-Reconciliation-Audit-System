const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({
  origin: "*", 
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));
app.use(express.json());

const JWT_SECRET = "settyl"; 

/* -------------------- FILE UPLOAD -------------------- */
const upload = multer({ dest: "uploads/" });

/* -------------------- AUTH MIDDLEWARE -------------------- */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* -------------------- USER MODEL -------------------- */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "ANALYST", "VIEWER"], required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

/* -------------------- RECORD MODEL -------------------- */
const recordSchema = new mongoose.Schema({
  TransactionID: { type: String, index: true },
  Amount: Number,
  ReferenceNumber: { type: String, index: true },
  Date: String
});
const Record = mongoose.model("Record", recordSchema);

/* -------------------- RECONCILIATION -------------------- */
const reconciliationSchema = new mongoose.Schema({
  TransactionID: String,
  Amount: Number,
  ReferenceNumber: String,
  Date: String,
  status: String,
  reason: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadJobId: { type: mongoose.Schema.Types.ObjectId, ref: "UploadJob", index: true },
  createdAt: { type: Date, default: Date.now }
});
const Reconciliation = mongoose.model("Reconciliation", reconciliationSchema);

/* -------------------- UPLOAD JOB -------------------- */
const uploadJobSchema = new mongoose.Schema({
  fileName: String,
  status: {
    type: String,
    enum: ["PROCESSING", "COMPLETED", "FAILED"],
    default: "PROCESSING"
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  totalRecords: Number,
  matchedCount: Number,
  unmatchedCount: Number,
  duplicateCount: Number,
  partialMatchedCount: Number,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});
const UploadJob = mongoose.model("UploadJob", uploadJobSchema);

/* -------------------- AUDIT LOG -------------------- */
const auditSchema = new mongoose.Schema({
  reconciliationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reconciliation", index: true },
  before: Object,
  after: Object,
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  editedAt: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model("AuditLog", auditSchema);

/* -------------------- MONGODB -------------------- */
mongoose
  .connect("mongodb+srv://joshikumar_db_user:joshikumar@auditsystem.obptqdi.mongodb.net/reconciliationDB")
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

/* -------------------- AUTH ROUTES -------------------- */

app.post("/api/signup", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ message: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role });

  res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } });
});

          /* -------------------- LOGIN -------------------- */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
});

 /* -------------------- CSV UPLOAD -------------------- */

app.post("/api/upload", authenticate, upload.single("file"), async (req, res) => {
  const userId = req.user.id;
  let mapping;
  try {
    mapping = JSON.parse(req.body.mapping);
  } catch {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Invalid mapping format" });
  }

  const required = ["transactionId", "amount", "referenceNumber", "date"];
  for (const key of required) {
    if (!mapping[key]) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `${key} mapping missing` });
    }
  }

  const fileName = req.file.originalname;

  const existingJob = await UploadJob.findOne({ fileName, uploadedBy: userId, status: "COMPLETED" });
  if (existingJob) {
    fs.unlinkSync(req.file.path);
    return res.json({ message: "File already processed", uploadJobId: existingJob._id, reused: true });
  }

  const uploadJob = await UploadJob.create({ fileName, uploadedBy: userId, status: "PROCESSING" });

  const rows = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      let matched = 0, unmatched = 0, duplicate = 0, partialMatched = 0;
      try {
        const txCountMap = {};
        rows.forEach(r => { txCountMap[r[mapping.transactionId]] = (txCountMap[r[mapping.transactionId]] || 0) + 1; });

        for (const row of rows) {
          const transactionId = row[mapping.transactionId] || "";
          // Cast invalid or empty amount as 0
          let amount = Number(row[mapping.amount]);
          if (isNaN(amount)) amount = 0;

          const reference = row[mapping.referenceNumber] || "";
          const date = row[mapping.date] || "";

          let status = "UNMATCHED";
          let reason = "No match";

          if (txCountMap[transactionId] > 1) {
            status = "DUPLICATE";
            reason = "Duplicate Transaction ID in CSV";
            duplicate++;
          } else {
            const exact = await Record.findOne({ TransactionID: transactionId, Amount: amount });
            if (exact) {
              status = "MATCHED";
              reason = "Exact match";
              matched++;
            } else {
              const lower = amount * 0.98, upper = amount * 1.02;
              const partial = await Record.findOne({ ReferenceNumber: reference, Amount: { $gte: lower, $lte: upper } });
              if (partial) {
                status = "PARTIAL_MATCH";
                reason = "Partial match";
                partialMatched++;
              } else unmatched++;
            }
          }

          await Reconciliation.create({
            TransactionID: transactionId,
            Amount: amount,         
            ReferenceNumber: reference,
            Date: date,
            status,
            reason,
            uploadedBy: userId,
            uploadJobId: uploadJob._id
          });
        }

        await UploadJob.findByIdAndUpdate(uploadJob._id, {
          status: "COMPLETED",
          totalRecords: rows.length,
          matchedCount: matched,
          unmatchedCount: unmatched,
          duplicateCount: duplicate,
          partialMatchedCount: partialMatched,
          completedAt: new Date()
        });

        fs.unlinkSync(req.file.path);
        res.json({ message: "Upload processed", uploadJobId: uploadJob._id, reused: false });
      } catch (err) {
        await UploadJob.findByIdAndUpdate(uploadJob._id, { status: "FAILED", completedAt: new Date() });
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: err.message });
      }
    });
});

/* -------------------- DASHBOARD -------------------- */

app.get("/api/dashboard", authenticate, async (req, res) => {
  const filter = req.user.role === "ANALYST" ? { uploadedBy: req.user.id } : {};
  const jobs = await UploadJob.find(filter).sort({ createdAt: -1 });
  const summary = {
    totalRecords: jobs.reduce((sum, j) => sum + (j.totalRecords || 0), 0),
    matched: jobs.reduce((sum, j) => sum + (j.matchedCount || 0), 0),
    unmatched: jobs.reduce((sum, j) => sum + (j.unmatchedCount || 0), 0),
    partialMatched: jobs.reduce((sum, j) => sum + (j.partialMatchedCount || 0), 0),
    duplicate: jobs.reduce((sum, j) => sum + (j.duplicateCount || 0), 0),
  };
  res.json({ summary, jobs });
});

/* -------------------- AUDITS -------------------- */
app.get("/api/audits", authenticate, async (req, res) => {
  const filter = req.user.role === "ANALYST" ? { editedBy: req.user.id } : {};
  const audits = await AuditLog.find(filter).populate("editedBy", "email role").populate({ path: "reconciliationId", populate: { path: "uploadJobId", select: "fileName" } }).sort({ editedAt: -1 });
  res.json(audits);
});

/* -------------------- USER UPLOADS -------------------- */
app.get("/api/uploads", authenticate, async (req, res) => {
  const uploads = await UploadJob.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
  res.json({ uploads });
});

/* -------------------- REPORT BY UPLOAD JOB -------------------- */
app.get("/api/reports/:uploadJobId", async (req, res) => {
  const { uploadJobId } = req.params;

  try {
    const rows = await Reconciliation.find({
      uploadJobId: new mongoose.Types.ObjectId(uploadJobId)
    }).sort({ createdAt: 1 });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

/* -------------------- EDIT RECONCILIATION -------------------- */
app.put("/api/reconciliation/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { updates } = req.body;

  const existing = await Reconciliation.findById(id);
  if (!existing) return res.status(404).json({ message: "Record not found" });

  const before = existing.toObject();
  Object.assign(existing, updates);
  existing.status = "MATCHED";
  existing.reason = "Manually reconciled";
  await existing.save();

  await AuditLog.create({ reconciliationId: existing._id, before, after: existing.toObject(), editedBy: req.user.id });

  res.json({ message: "Updated & audited" });
});

/* -------------------- START SERVER -------------------- */
app.listen(5000, () => console.log("Backend running at http://localhost:5000"));
