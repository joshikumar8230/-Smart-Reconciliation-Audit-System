import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import Swal from "sweetalert2";
import { api } from "./api";
import Navbar from "./Navbar"; 

import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
} from "@mui/material";

const SYSTEM_FIELDS = [
  { key: "transactionId", label: "Transaction ID *" },
  { key: "amount", label: "Amount *" },
  { key: "referenceNumber", label: "Reference Number *" },
  { key: "date", label: "Date *" },
];

export default function UploadPreview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const file = state?.file;
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    if (!file) {
      navigate("/upload");
      return;
    }
    Papa.parse(file, {
      header: true,
      preview: 20,
      skipEmptyLines: true,
      complete: (res) => {
        setHeaders(res.meta.fields || []);
        setRows(res.data || []);
      },
    });
  }, [file, navigate]);

  const upload = async () => {
    for (const f of SYSTEM_FIELDS) {
      if (!mapping[f.key]) {
        Swal.fire("Missing mapping", f.label, "warning");
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping", JSON.stringify(mapping));
    formData.append("userId", user.id);

    try {
      navigate("/upload");
      const res = await api.post("/upload", formData);
      if (res.data.reused) {
        Swal.fire({
          icon: "info",
          title: "File already exists",
          text: `The file "${file.name}" has already been uploaded.`,
        });
      } else {
        Swal.fire("Success", "File uploaded successfully", "success");
      }

      
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.error || "Upload failed", "error");
    }
  };

  return (
    <>  <Navbar />
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        p: 4,
      }}
    >
     
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 3,
        }}
      >

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Typography variant="h5" fontWeight={600}>
            Preview & Mapping
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            {SYSTEM_FIELDS.map((f) => (
              <FormControl key={f.key} size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{f.label}</InputLabel>
                <Select
                  value={mapping[f.key] || ""}
                  label={f.label}
                  onChange={(e) =>
                    setMapping({ ...mapping, [f.key]: e.target.value })
                  }
                >
                  {headers.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {headers.map((h) => (
                  <TableCell key={h}>{r[h]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button variant="contained" onClick={upload}>
            Confirm & Upload
          </Button>
          <Button variant="outlined" onClick={() => navigate("/upload")}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
    </>
  );
}
