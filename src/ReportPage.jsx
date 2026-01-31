import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
  Chip,
  Button,
  TableContainer,
  Pagination,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";

const statusColor = (status) => {
  switch (status) {
    case "MATCHED":
      return "success";
    case "UNMATCHED":
      return "error";
    case "DUPLICATE":
      return "warning";
    case "PARTIAL_MATCH":
      return "info";
    default:
      return "default";
  }
};

export default function ReportPage() {
  const { uploadJobId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(13); // rows per page
  const [statusFilter, setStatusFilter] = useState(""); // filter state

  const user = JSON.parse(sessionStorage.getItem("user"));
  const canEdit = user?.role === "ADMIN" || user?.role === "ANALYST";

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/reports/${uploadJobId}`)
      .then((res) => {
        setRows(res.data);
        setFilteredRows(res.data);
      })
      .catch((err) => console.error(err));
  }, [uploadJobId]);

  // Handle status filter change
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);

    if (!value) {
      setFilteredRows(rows);
    } else {
      setFilteredRows(rows.filter((row) => row.status === value));
    }
    setPage(1); // reset to first page
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  if (!rows.length) return <Box sx={{ p: 4 }}>Loading report...</Box>;

  const startIndex = (page - 1) * rowsPerPage;
  const currentRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{ mb: 3 }}
          align="center"
          color="#1976d2"
        >
          Reconciliation Report
        </Typography>

        {/* Status Filter */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <TextField
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={handleStatusFilter}
            size="small"
            sx={{ width: 200 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="MATCHED">Matched</MenuItem>
            <MenuItem value="UNMATCHED">Unmatched</MenuItem>
            <MenuItem value="DUPLICATE">Duplicate</MenuItem>
            <MenuItem value="PARTIAL_MATCH">Partial Match</MenuItem>
          </TextField>
        </Box>

        <Paper elevation={3}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  {canEdit && <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {currentRows.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{row.TransactionID}</TableCell>
                    <TableCell>{row.Amount}</TableCell>
                    <TableCell>{row.ReferenceNumber}</TableCell>
                    <TableCell>{new Date(row.Date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status.replace("_", " ")}
                        color={statusColor(row.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            navigate(`/edit/${row._id}`, { state: row })
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
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
        </Paper>
      </Box>
    </>
  );
}
