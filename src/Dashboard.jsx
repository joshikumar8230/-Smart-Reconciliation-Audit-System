import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import Navbar from "./Navbar";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Paper,
  CssBaseline,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchDashboard();
  }, []);

  if (!summary)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );


  const chartData = [
    { name: "Matched", count: summary.matched, total: summary.totalRecords },
    { name: "Unmatched", count: summary.unmatched, total: summary.totalRecords },
    { name: "Partial Match", count: summary.partialMatched, total: summary.totalRecords },
    { name: "Duplicate", count: summary.duplicate, total: summary.totalRecords },
  ].filter((item) => !statusFilter || item.name.toUpperCase().replace(" ", "_") === statusFilter);

  return (
    <>
      <CssBaseline />
      <Navbar />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard ({user.role})
        </Typography>

     
        <Paper sx={{ p: 2, mb: 4, width: 200 }}>
          <TextField
            select
            fullWidth
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="MATCHED">Matched</MenuItem>
            <MenuItem value="UNMATCHED">Unmatched</MenuItem>
            <MenuItem value="DUPLICATE">Duplicate</MenuItem>
            <MenuItem value="PARTIAL_MATCH">Partial Match</MenuItem>
          </TextField>
        </Paper>

 
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={2}>
            <SummaryCard label="Total Records" value={summary.totalRecords} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SummaryCard label="Matched" value={summary.matched} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SummaryCard label="Unmatched" value={summary.unmatched} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SummaryCard label="Partial Match" value={summary.partialMatched} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SummaryCard label="Duplicate" value={summary.duplicate} />
          </Grid>
        </Grid>

      
        <Paper sx={{ p: 2, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => [`${value} / ${props.payload.total}`, "Count"]} />
              <Legend />
              <Bar dataKey="count" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </>
  );
}


function SummaryCard({ label, value }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
