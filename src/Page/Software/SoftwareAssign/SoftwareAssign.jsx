import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Snackbar, Alert, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { baseUrl } from "../../Api";

const SoftwareAssign = () => {
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [softwares, setSoftwares] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLicenseType, setSelectedLicenseType] = useState("");
  const [unitLocations, setUnitLocations] = useState([]);
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [items, setItems] = useState([]);
  const [currentSoftware, setCurrentSoftware] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [uRes, locRes, usrRes, licRes] = await Promise.all([
        fetch(`${baseUrl}/gr/units/list`, { headers }),
        fetch(`${baseUrl}/super-admin/locations?limit=1000`, { headers }),
        fetch(`${baseUrl}/asset-mng/asset-helper/user-list`, { headers }),
        fetch(`${baseUrl}/software/license-types`, { headers }),
      ]);
      const [uData, locData, usrData, licData] = await Promise.all([
        uRes.json(), locRes.json(), usrRes.json(), licRes.json()
      ]);

      if (uData.data) setUnits(uData.data);
      if (locData.data) setLocations(locData.data.data || locData.data);
      if (usrData.data) setUsers(usrData.data);
      if (licData.data) setLicenseTypes(licData.data);
    } catch (err) {
      showSnackbar("Error fetching data", "error");
    }
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const handleUnitChange = (e) => {
    const uId = e.target.value;
    setSelectedUnit(uId);
    setSelectedLocation("");
    if (uId) {
      const unit = units.find(u => u.id === uId);
      if (unit && unit.unitlocation && unit.unitlocation.length > 0) {
         const uLocs = [];
         unit.unitlocation.forEach(ul => {
            if (ul.location && !uLocs.some(l => l.id === ul.location.id)) {
               uLocs.push(ul.location);
            }
         });
         setUnitLocations(uLocs);
      } else {
         setUnitLocations([]);
      }
    } else {
      setUnitLocations([]);
    }
  };

  const handleAddItem = () => {
    if (!currentSoftware || currentQuantity < 1) {
      showSnackbar("Select software and valid quantity", "error");
      return;
    }
    const softwareObj = softwares.find(s => s.id === currentSoftware);
    if (!softwareObj) return;

    if (softwareObj.currentQuantity < currentQuantity) {
      showSnackbar(`Insufficient quantity. Available: ${softwareObj.currentQuantity}`, "error");
      return;
    }

    setItems([...items, { softwareId: currentSoftware, name: softwareObj.name, quantity: currentQuantity }]);
    setCurrentSoftware("");
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedUnit && !selectedLocation && !selectedUser) {
      showSnackbar("Select Unit, Location, or User", "error");
      return;
    }
    if (items.length === 0) {
      showSnackbar("Add at least one software to assign", "error");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/software/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          unitId: selectedUnit || null,
          locationId: selectedLocation || null,
          assignToUser: selectedUser || null,
          notes,
          items: items.map(i => ({ softwareId: i.softwareId, quantity: i.quantity })),
          expiryDate: expiryDate || null
        })
      });
      const data = await res.json();
      // Backend error handler returns 200 OK but sets status: false and errorResponse
      if (res.ok && data.status !== false && !data.errorResponse) {
        showSnackbar(data.message || "Assigned successfully", "success");
        setItems([]);
        setSelectedUnit("");
        setSelectedLocation("");
        setSelectedUser("");
        setNotes("");
        setExpiryDate("");
        setSelectedLicenseType("");
        setSoftwares([]);
        setCurrentSoftware("");
        fetchData(); // refresh dropdowns
      } else {
        showSnackbar(data.errorResponse?.message || data.message || "Failed to assign", "error");
      }
    } catch (err) {
      showSnackbar("Error submitting assignment", "error");
    }
  };

  const displayLocations = selectedUnit ? unitLocations : locations;
  

  const handleLicenseTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedLicenseType(type);
    setCurrentSoftware("");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    if (type) {
      try {
        const res = await fetch(`${baseUrl}/software/all?licenseType=${encodeURIComponent(type)}`, { headers });
        const data = await res.json();
        if (data.data) setSoftwares(data.data);
      } catch(err) { console.error(err); }
    } else {
      setSoftwares([]);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#100b31" }}>
        Assign Software
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" gap={2} mb={2}>
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select value={selectedUnit} onChange={handleUnitChange} label="Unit">
              <MenuItem value="">None</MenuItem>
              {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Location">
              <MenuItem value="">None</MenuItem>
              {displayLocations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Assign To User</InputLabel>
            <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} label="Assign To User">
              <MenuItem value="">None</MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField 
          fullWidth 
          label="Notes / Remarks" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          sx={{ mb: 3 }} 
        />
        <TextField 
          fullWidth 
          type="date"
          label="Expiry Date" 
          value={expiryDate} 
          onChange={(e) => setExpiryDate(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }} 
        />

        <Typography variant="h6" sx={{ mb: 2 }}>Add Software Items</Typography>
        <Box display="flex" gap={2} mb={3}>
          <FormControl fullWidth>
            <InputLabel>License Type</InputLabel>
            <Select value={selectedLicenseType} onChange={handleLicenseTypeChange} label="License Type">
              <MenuItem value="">All Types</MenuItem>
              {licenseTypes.map(lt => <MenuItem key={lt} value={lt}>{lt}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Software</InputLabel>
            <Select value={currentSoftware} onChange={(e) => setCurrentSoftware(e.target.value)} label="Software">
              {softwares.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} (Qty: {s.currentQuantity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField 
            label="Quantity" 
            type="number" 
            value={currentQuantity} 
            onChange={(e) => setCurrentQuantity(Number(e.target.value))} 
            sx={{ width: 150 }} 
          />

          <Button variant="contained" onClick={handleAddItem} sx={{ bgcolor: "#00005e" }}>
            Add Item
          </Button>
        </Box>

        {items.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Software Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveItem(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#00005e" }}>
            Submit Assignment
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SoftwareAssign;
