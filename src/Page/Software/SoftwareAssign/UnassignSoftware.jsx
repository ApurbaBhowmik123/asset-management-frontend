import React, { useState } from "react";
import { Box, Typography, Button, TextField, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { baseUrl } from "../../Api";

const UnassignSoftware = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const assignData = location.state?.data;
  
  const [selectedItems, setSelectedItems] = useState({});
  const [remarks, setRemarks] = useState("");
  const [condition, setCondition] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  if (!assignData) return <Typography>No assignment selected.</Typography>;

  const handleSelect = (id, maxQty, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: { selected: value, unassignQty: value ? maxQty : 0, maxQty }
    }));
  };

  const handleQtyChange = (id, val) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: { ...prev[id], unassignQty: Number(val) }
    }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(selectedItems)
      .filter(([_, v]) => v.selected && v.unassignQty > 0)
      .map(([id, v]) => ({ assignmentId: Number(id), quantity: v.unassignQty }));

    if (items.length === 0) return setSnackbar({ open: true, message: "Select items to unassign" });

    try {
      const res = await fetch(`${baseUrl}/software/unassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ items, remarks, condition })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Unassigned successfully" });
        setTimeout(() => navigate('/software-list'), 1500);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error unassigning" });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>Unassign Software: {assignData.assignedId}</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Software</TableCell>
              <TableCell>Assigned Qty</TableCell>
              <TableCell>Unassign Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignData.products.filter(p => p.quantity > 0).map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox onChange={(e) => handleSelect(p.id, p.quantity, e.target.checked)} />
                </TableCell>
                <TableCell>{p.software.name}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>
                  <TextField type="number" disabled={!selectedItems[p.id]?.selected} 
                    inputProps={{ max: p.quantity, min: 1 }}
                    value={selectedItems[p.id]?.unassignQty || ''}
                    onChange={(e) => handleQtyChange(p.id, e.target.value)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" gap={2} mb={3}>
        <TextField fullWidth label="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
        <TextField fullWidth label="Condition" value={condition} onChange={e => setCondition(e.target.value)} />
      </Box>

      <Button variant="contained" color="primary" onClick={handleSubmit}>Submit Unassignment</Button>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false })} message={snackbar.message} />
    </Box>
  );
};
export default UnassignSoftware;
