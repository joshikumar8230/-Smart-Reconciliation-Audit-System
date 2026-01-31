import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api } from "./api";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import Navbar from "./Navbar"; 
import Swal from "sweetalert2";

function EditReconciliation() {
  const { reconciliationId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

 const user = JSON.parse(sessionStorage.getItem("user"));

  const [form, setForm] = useState({
    TransactionID: state.TransactionID,
    Amount: state.Amount,
    ReferenceNumber: state.ReferenceNumber,
    Date: state.Date
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitEdit = async () => {
  try {
    await api.put(
      `/reconciliation/${reconciliationId}`, 
      { updates: { ...form, editedBy: user.id } } 
    );


    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Reconciliation record has been updated successfully.",
      timer: 1000,
      showConfirmButton: false,
    });

    setTimeout(() => navigate(-1), 1000);
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Failed to update",
      text: err.response?.data?.error || err.message,
    });
  }
};

  return (
    <> <Navbar />
    <Box
    
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 6
      }}
    >
      
      <Paper sx={{ p: 4, width: "400px", boxShadow: 3 }}>
        <Typography variant="h5" mb={3} align="center">
          Edit Reconciliation
        </Typography>

        <TextField
          label="Transaction ID"
          name="TransactionID"
          value={form.TransactionID}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Amount"
          name="Amount"
          type="number"
          value={form.Amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Reference Number"
          name="ReferenceNumber"
          value={form.ReferenceNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Date"
          name="Date"
          type="date"
          value={form.Date.split("T")[0]} 
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={submitEdit}
        >
          Save & Mark Matched
        </Button>
      </Paper>
    </Box>
    </>
  );
}

export default EditReconciliation;
