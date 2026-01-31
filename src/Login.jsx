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
  CssBaseline,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing credentials",
        text: "Please enter both email and password",
      });
      return;
    }

    try {
      const res = await api.post("/login", { email, password });

      const { token, user } = res.data;

    
      sessionStorage.setItem("token", token);

     
      sessionStorage.setItem("user", JSON.stringify(user));

      Swal.fire({
        icon: "success",
        title: "Authentication successful",
        text: "Redirecting to dashboard…",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Authentication failed",
        text: "Invalid email or password",
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
            <LockOutlinedIcon sx={{ color: "white" }} />
          </Box>

          <Typography variant="h6" fontWeight={600}>
            Smart Reconciliation & Audit System
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Secure Role-Based Access Portal
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

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
            onClick={login}
          >
            Sign In
          </Button>

          <Typography variant="body2" sx={{ mt: 3 }}>
            New here?{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => navigate("/signup")}
            >
              Create an account
            </Box>
          </Typography>
        </Paper>
      </Box>
    </>
  );
}
