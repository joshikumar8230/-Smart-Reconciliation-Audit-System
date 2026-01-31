import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import Navbar from "./Navbar";

import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Pagination,
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

export default function AuditPage() {
  const navigate = useNavigate();

 
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [audits, setAudits] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    api.get("/audits", {
      params: {
        role: user.role,
        userId: user.id,
      },
    })
    .then((res) => setAudits(res.data))
    .catch((err) => console.error(err));
  }, []);

  if (!audits.length)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No audit records available</Typography>
      </Box>
    );

  const totalPages = Math.ceil(audits.length / perPage);
  const paginatedAudits = audits.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Box>
      <Navbar />

      <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
        <Typography
          variant="h4"
          fontWeight={600}
          mb={4}
          align="center"
          color="#1976d2"
        >
          Audit Logs
        </Typography>

        <Stack spacing={3}>
          {paginatedAudits.map((audit, index) => (
            <Box
              key={audit._id}
              sx={{ display: "flex", alignItems: "flex-start" }}
            >
   
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 24,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "#1976d2",
                    mb: 1,
                  }}
                />
                {index !== paginatedAudits.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flexGrow: 1,
                      bgcolor: "#ccc",
                    }}
                  />
                )}
              </Box>

       
              <Paper
                elevation={2}
                sx={{
                  ml: 3,
                  p: 2,
                  borderLeft: "3px solid #1976d2",
                  width: "100%",
                }}
              >
                <Typography fontWeight={600} mb={1}>
                  File:{" "}
                  {audit.reconciliationId?.uploadJobId?.fileName ||
                    "N/A"}
                </Typography>

                <Typography fontWeight={500}>
                  Transaction: {audit.after?.TransactionID}
                </Typography>

                <Typography mt={0.5}>
                  Status:{" "}
                  <Chip
                    label={audit.before?.status}
                    color={statusColor(audit.before?.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  →
                  <Chip
                    label={audit.after?.status}
                    color={statusColor(audit.after?.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <Typography mt={1}>
                  Edited by: {audit.editedBy?.email}
                </Typography>

                <Typography
                  fontSize={12}
                  color="text.secondary"
                  mt={0.5}
                >
                  {new Date(audit.editedAt).toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Stack>

     
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
}
