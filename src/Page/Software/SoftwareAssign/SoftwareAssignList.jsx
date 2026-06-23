import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button, Chip, TextField, MenuItem, Select, FormControl, InputLabel, Drawer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../Api";

const SoftwareAssignList = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    unitId: "",
    locationId: "",
    userId: "",
    licenseType: "",
    softwareId: "",
    expiryDate: ""
  });

  // Dropdown Data
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [softwares, setSoftwares] = useState([]);
  const [unitLocations, setUnitLocations] = useState([]);

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchDropdowns = async () => {
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
      console.error(err);
    }
  };

  const handleUnitChange = (e) => {
    const uId = e.target.value;
    setFilters({ ...filters, unitId: uId, locationId: "" });
    if (uId) {
      setUnitLocations(locations.filter(l => l.unitId === uId));
    } else {
      setUnitLocations([]);
    }
  };

  const handleLicenseTypeChange = async (e) => {
    const type = e.target.value;
    setFilters({ ...filters, licenseType: type, softwareId: "" });
    if (type) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl}/software/all?licenseType=${encodeURIComponent(type)}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const d = await res.json();
        if (d.data) setSoftwares(d.data);
      } catch (err) { console.error(err); }
    } else {
      setSoftwares([]);
    }
  };

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.unitId) params.append("unitId", filters.unitId);
      if (filters.locationId) params.append("locationId", filters.locationId);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.licenseType) params.append("licenseType", filters.licenseType);
      if (filters.softwareId) params.append("softwareId", filters.softwareId);
      if (filters.expiryDate) params.append("expiryDate", filters.expiryDate);

      const res = await fetch(`${baseUrl}/software/assign-list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const json = await res.json();
      if (json.data) setData(json.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const clearFilters = () => {
    setFilters({ unitId: "", locationId: "", userId: "", licenseType: "", softwareId: "", expiryDate: "" });
    setUnitLocations([]);
    setSoftwares([]);
  };

  const handleView = (row) => {
    setSelectedAssignment(row.original);
    setViewModalOpen(true);
  };

  const columns = useMemo(() => [
    { accessorKey: "assignedId", header: "Assign ID" },
    { accessorKey: "assignedUser.name", header: "Assigned To User", Cell: ({ row }) => row.original.assignedUser?.name || '-' },
    { accessorKey: "assignedUnit.name", header: "Unit", Cell: ({ row }) => row.original.assignedUnit?.name || '-' },
    { accessorKey: "assignedLocation.name", header: "Location", Cell: ({ row }) => row.original.assignedLocation?.name || '-' },
    { accessorKey: "products", header: "Softwares", Cell: ({ row }) => (
      <Box display="flex" gap={1} flexWrap="wrap">
        {row.original.products.map(p => (
          <Chip key={p.id} label={`${p.software.name} (Qty: ${p.quantity})`} size="small" />
        ))}
      </Box>
    )},
    {
      id: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Button variant="outlined" color="primary" size="small" onClick={() => handleView(row)}>
            View
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => navigate(`/software/unassign/${row.original.assignedId}`, { state: { data: row.original } })}>
            Unassign
          </Button>
        </Box>
      )
    }
  ], [navigate]);

  const table = useMaterialReactTable({ columns, data });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Software Assignments</Typography>
        <Button variant="contained" startIcon={<FilterListIcon />} onClick={() => setIsFilterOpen(true)}>
          Filters
        </Button>
      </Box>
      <MaterialReactTable table={table} />

      <Drawer anchor="right" open={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <Box p={3} width="300px" display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Filters</Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Unit</InputLabel>
            <Select value={filters.unitId} label="Unit" onChange={handleUnitChange}>
              {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Location</InputLabel>
            <Select value={filters.locationId} label="Location" onChange={(e) => setFilters({...filters, locationId: e.target.value})}>
              {(filters.unitId ? unitLocations : locations).map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>User</InputLabel>
            <Select value={filters.userId} label="User" onChange={(e) => setFilters({...filters, userId: e.target.value})}>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>License Type</InputLabel>
            <Select value={filters.licenseType} label="License Type" onChange={handleLicenseTypeChange}>
              {licenseTypes.map(lt => <MenuItem key={lt} value={lt}>{lt}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Software</InputLabel>
            <Select value={filters.softwareId} label="Software" onChange={(e) => setFilters({...filters, softwareId: e.target.value})}>
              {softwares.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            label="Expiry Date"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filters.expiryDate}
            onChange={(e) => setFilters({...filters, expiryDate: e.target.value})}
          />

          <Box display="flex" gap={2} mt={2}>
            <Button variant="outlined" fullWidth onClick={clearFilters}>Clear</Button>
            <Button variant="contained" fullWidth onClick={() => setIsFilterOpen(false)}>Done</Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assignment Details</DialogTitle>
        <DialogContent dividers>
          {selectedAssignment && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography><strong>Assign ID:</strong> {selectedAssignment.assignedId}</Typography>
              <Typography><strong>User:</strong> {selectedAssignment.assignedUser?.name || 'N/A'}</Typography>
              <Typography><strong>Unit:</strong> {selectedAssignment.assignedUnit?.name || 'N/A'}</Typography>
              <Typography><strong>Location:</strong> {selectedAssignment.assignedLocation?.name || 'N/A'}</Typography>
              <Typography><strong>Assigned By:</strong> {selectedAssignment.assignedByUser?.name || 'N/A'}</Typography>
              <Typography><strong>Assigned At:</strong> {new Date(selectedAssignment.assignedAt).toLocaleString()}</Typography>
              <Typography><strong>Notes:</strong> {selectedAssignment.notes || 'None'}</Typography>
              
              <Typography mt={2} variant="subtitle1" fontWeight="bold">Softwares Included:</Typography>
              {selectedAssignment.products.map(p => (
                <Box key={p.id} pl={2}>
                  - {p.software.name} (Qty: {p.quantity}) 
                  {p.software.LicenseType ? ` [${p.software.LicenseType}]` : ''}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default SoftwareAssignList;
