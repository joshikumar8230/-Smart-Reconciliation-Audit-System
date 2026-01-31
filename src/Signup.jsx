import { useState } from "react";
import { api } from "./api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CssBaseline,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ANALYST");
  const navigate = useNavigate();

  const signup = async () => {
    if (!email || !password || !role) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please enter email, password, and select a role",
      });
      return;
    }

    try {
      await api.post("/signup", { email, password, role });
      Swal.fire({
        icon: "success",
        title: "User created",
        text: "Redirecting to login page…",
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup failed",
        text: err?.response?.data?.message || "Please try again",
      });
    }
  };

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: 380,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              borderRadius: "50%",
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonAddIcon sx={{ color: "white" }} />
          </Box>

          <Typography variant="h6" fontWeight={600}>
            Smart Reconciliation & Audit System
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Create your account
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Select Role"
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="ANALYST">Analyst</MenuItem>
            <MenuItem value="VIEWER">Viewer</MenuItem>
          </TextField>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
            onClick={signup}
          >
            Create Account
          </Button>

          <Typography variant="body2" sx={{ mt: 3 }}>
            Already have an account?{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              Login
            </Box>
          </Typography>
        </Paper>
      </Box>
    </>
  );
}
