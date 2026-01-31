import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import Navbar from "./Navbar"; 
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CssBaseline,
  Chip,
  Stack,
  Card,
  CardContent,
  Pagination,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";

const statusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PROCESSING":
      return "warning";
    case "FAILED":
      return "error";
    default:
      return "default";
  }
};

export default function Upload() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [uploads, setUploads] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 13;

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    const res = await api.get("/uploads", { params: { userId: user.id } });
    setUploads(res.data.uploads || []);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    navigate("/upload/preview", { state: { file } });
  };

  const handleChangePage = (event, value) => setPage(value);

  const startIndex = (page - 1) * rowsPerPage;
  const currentUploads = uploads.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(uploads.length / rowsPerPage);

  return (
    <>
      <CssBaseline />
      <Navbar /> 

      <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
    
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Uploaded Files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View reconciliation status and detailed reports
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            component="label"
            size="large"
          >
            Upload CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </Button>
        </Stack>

        {/* Table Card */}
        <Card elevation={3}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                    <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded At</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {uploads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No uploads yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUploads.map((u) => (
                      <TableRow key={u._id} hover>
                        <TableCell>{u.fileName}</TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.status}
                            size="small"
                            color={statusColor(u.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/report/${u._id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Stack spacing={2} sx={{ p: 2 }} alignItems="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
