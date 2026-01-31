import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user) return null;

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <Box sx={{ width: 200 }} />
        <Typography
          variant="h6"
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Reconciliation App
        </Typography>

 
        <Box>
          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>

          {user.role !== "VIEWER" && (
            <>
              <Button color="inherit" onClick={() => navigate("/upload")}>
                Upload
              </Button>
              <Button color="inherit" onClick={() => navigate("/audits")}>
                Audit
              </Button>
            </>
          )}

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}