🧾 Reconciliation & Audit System

A full-stack MERN web application for data reconciliation and audit tracking.
The system enables users to upload CSV files, reconcile transactions against existing records, and monitor results through dashboards — all secured with role-based access control.

📌 Overview

This application is designed to help organizations reconcile transactional data efficiently while maintaining a clear audit trail.
It supports three roles:

Admin – Full access

Analyst – Upload and reconcile data

Viewer – Read-only access

✨ Features
🔐 Authentication & Authorization

JWT-based authentication

Role-based access control:

Admin: Full access

Analyst: Upload & reconcile

Viewer: Read-only

📂 CSV Upload & Reconciliation

Upload large CSV files for reconciliation

Detect:

Matches

Partial matches

Duplicates

Unmatched records

Preview first 20 rows before confirming upload

Graceful handling of partial failures

📊 Dashboard & Visualizations

Summary cards for:

Total records

Matched

Unmatched

Partial matches

Duplicates

Responsive bar charts using Recharts

Status-based filtering

🧾 Audit Trail

Track edits made to reconciliation records

Capture:

Who made the change

What was changed

When it was changed

🛡 Role Enforcement

Frontend and backend authorization checks

Prevents unauthorized access or operations

🧪 Test Data & Sample Records

To simplify testing and evaluation:

The database is pre-populated with 30 sample reconciliation records

A sample CSV file named transactions.csv is included

These are used to:

Test CSV upload functionality

Preview the first 20 rows before submission

Validate reconciliation outcomes (matched, unmatched, partial, duplicate)

Verify dashboard statistics and visualizations

Test audit trail behavior

This allows evaluators to test the system end-to-end immediately, without manual setup.

🏆 Achievements

Implemented JWT authentication with role-based access control

Built dynamic dashboards using React + Recharts

Designed clear summary cards and reconciliation charts

Enabled large CSV uploads while keeping the UI responsive

Implemented detailed audit trails for record edits

Ensured reconciliation accuracy with partial match & duplicate detection

Enforced security via frontend and backend validation

Maintained a modular and scalable project structure

🧱 Architecture

Frontend: React.js, Material UI, Recharts

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT

File Handling: Multer (CSV uploads)

Charts: Recharts (Bar charts)

🔄 Application Flow

User logs in → JWT token issued

CSV file uploaded → processed asynchronously

Reconciliation results stored in MongoDB

Dashboard displays summary and charts

Any edits are logged in the audit trail

⚙ Non-Functional Requirements

Efficient handling of large CSV files

Responsive UI during uploads

Partial failures do not break processing

Clear, actionable error messages

🗂 Project Structure

backend/
Contains Express server, API routes, authentication, reconciliation logic, audit logging, and database models.

src/
Contains React components, dashboards, charts, role-based UI logic, and API integrations.

This separation keeps the codebase clean, maintainable, and scalable.

📡 API Documentation
Authentication

POST /api/login → Returns JWT token and user info

POST /api/signup → Create user account

Reconciliation

POST /api/upload → Upload CSV and reconcile data

PUT /api/reconciliation/:id → Edit reconciliation record (Admin/Analyst)

Dashboard & Reports

GET /api/dashboard → Fetch summary statistics

GET /api/reports/:uploadJobId → Fetch reconciliation records by upload

Audit Logs

GET /api/audits → Retrieve all edits with user and timestamp

🚀 Setup Instructions
Backend
cd backend
npm install
node app.cjs

Frontend
cd frontend
npm install
npm start

📄 Sample Input Files

CSV format:

TransactionID, Amount, ReferenceNumber, Date

Supports:

Partial matches

Duplicate detection

🧠 Assumptions

CSV files are well-formatted with required headers

Users are assigned correct roles

Audit logs track edits only (not initial uploads)

⚖ Trade-offs & Limitations

CSV processing is sequential; parallel processing could improve performance for very large files

Frontend uses browser memory for CSV preview (first 20 rows only)