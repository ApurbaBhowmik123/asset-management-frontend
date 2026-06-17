import {
  Box,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createMRTColumnHelper, MaterialReactTable } from "material-react-table";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../../Api";
import axios from "axios";
import { CustomTextField } from "../../../utils/CustomTextField";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#D9D9D9", borderRadius: "4px" },
    "&:hover fieldset": { borderColor: "#D9D9D9" },
    "&.Mui-focused fieldset": { borderColor: "#D9D9D9" },
  },
  "& .MuiInputBase-input": { padding: "8px 12px" },
  backgroundColor: "#f9fafb",
};

const ViewGr = () => {
  const [grDetails, setGrDetails] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Tag Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tagData, setTagData] = useState({ warrantyTill: null, serialNo1: "", sapCode: "", modelName: "" });
  const [specFields, setSpecFields] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [isTagging, setIsTagging] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchGrDetails();
  }, [id]);

  const fetchGrDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/gr/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGrDetails(res.data.data);
      
      const flattened = [];
      res.data.data.inventoryProducts.forEach((ip) => {
        ip.inventoryDetails.forEach((det) => {
          flattened.push({
            ...det,
            grInventoryProduct: ip
          });
        });
      });
      setTableData(flattened);
    } catch (error) {
      console.error("error fetching GR details", error);
      setSnackbar({ open: true, message: "Error fetching GR details", severity: "error" });
    }
  };

  const handleOpenTagModal = async (row) => {
    setSelectedItem(row);
    setTagData({ warrantyTill: null, serialNo1: "", sapCode: "", modelName: "" });
    setSpecValues({});
    
    // Fetch attributes for the category
    try {
      const categoryId = row.grInventoryProduct.categoryId;
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/catalog/categories/${categoryId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSpecFields(res.data.data?.categorySpecFields || []);
    } catch (error) {
      console.error("Error fetching spec fields", error);
    }
    
    setIsTagModalOpen(true);
  };

  const handleTagSubmit = async () => {
    setIsTagging(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        inventoryProductDetailId: selectedItem.id,
        serialNo1: tagData.serialNo1,
        sapCode: tagData.sapCode,
        modelName: tagData.modelName,
        warrantyTill: tagData.warrantyTill ? tagData.warrantyTill.toISOString() : null,
        specValues: Object.keys(specValues).map(id => ({ specFieldId: Number(id), value: specValues[id] }))
      };
      
      await axios.post(`${baseUrl}/gr/tag-item`, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      setSnackbar({ open: true, message: "Item tagged successfully", severity: "success" });
      setIsTagModalOpen(false);
      // Let the modal close immediately, then fetch updates
      setTimeout(() => fetchGrDetails(), 100);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Failed to tag item", severity: "error" });
    } finally {
      setIsTagging(false);
    }
  };

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("grInventoryProduct.category.name", { header: "Asset Reference", size: 150 }),
    columnHelper.accessor("grInventoryProduct.brand.name", { header: "Brand", size: 100 }),
    columnHelper.accessor("modelName", { 
      header: "Model Name", 
      size: 120,
      Cell: ({ cell }) => cell.getValue() || "-"
    }),
    columnHelper.accessor("specValues", {
      header: "Attributes",
      size: 200,
      Cell: ({ row }) => {
        const specValues = row.original.specValues || [];
        if (specValues.length === 0) return "-";
        return specValues.map(sv => `${sv.specField?.name || ""}: ${sv.value}`).join(", ");
      }
    }),
    columnHelper.accessor("uuid", { header: "Asset ID", size: 150 }),
    columnHelper.accessor("assignedStatus", { 
      header: "Status", 
      size: 100,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return (
          <span style={{ color: val === "Untagged" ? "red" : "green", fontWeight: "bold" }}>
            {val}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      size: 100,
      Cell: ({ row }) => {
        if (row.original.assignedStatus === "Untagged") {
          return (
            <Button variant="contained" size="small" onClick={() => handleOpenTagModal(row.original)} sx={{ bgcolor: "#DB3027" }}>
              Tag Item
            </Button>
          );
        }
        return <Typography variant="caption" color="textSecondary">Tagged</Typography>;
      }
    }),
  ];

  if (!grDetails) return <Typography p={3}>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight="bold">View GR: {grDetails.grId}</Typography>
      </Box>

      {/* GR Header Info */}
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
        <Box>
          <Typography variant="caption" color="textSecondary">Vendor</Typography>
          <Typography fontWeight="bold">{grDetails.vendor?.name || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="textSecondary">Invoice Number</Typography>
          <Typography fontWeight="bold">{grDetails.invoiceNumber || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="textSecondary">Invoice Date</Typography>
          <Typography fontWeight="bold">{grDetails.invoiceDate ? dateTimeHelper.formatDate(grDetails.invoiceDate) : "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="textSecondary">GR Date</Typography>
          <Typography fontWeight="bold">{grDetails.grDate ? dateTimeHelper.formatDate(grDetails.grDate) : "N/A"}</Typography>
        </Box>
      </Box>

      {/* Untagged Items */}
      {tableData.filter(d => d.assignedStatus === "Untagged").length > 0 && (
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Untagged Items</Typography>
          <MaterialReactTable 
            columns={columns} 
            data={tableData.filter(d => d.assignedStatus === "Untagged")} 
            muiTableContainerProps={{ sx: { overflowX: "auto" } }}
          />
        </Box>
      )}

      {/* Tagged / InStock Items */}
      {tableData.filter(d => d.assignedStatus !== "Untagged").length > 0 && (
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Tagged / In-Stock Items</Typography>
          <MaterialReactTable 
            columns={columns} 
            data={tableData.filter(d => d.assignedStatus !== "Untagged")} 
            muiTableContainerProps={{ sx: { overflowX: "auto" } }}
          />
        </Box>
      )}

      {/* Tag Modal */}
      <Dialog open={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #eee" }}>Tag Item</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
            <Box>
              <InputLabel sx={{ color: "black", mb: 0.5 }}>Model Name</InputLabel>
              <CustomTextField fullWidth size="small" value={tagData.modelName} onChange={e => setTagData({...tagData, modelName: e.target.value})} sx={textFieldStyles} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black", mb: 0.5 }}>Serial Number</InputLabel>
              <CustomTextField fullWidth size="small" value={tagData.serialNo1} onChange={e => setTagData({...tagData, serialNo1: e.target.value})} sx={textFieldStyles} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black", mb: 0.5 }}>Tag No / SAP Code</InputLabel>
              <CustomTextField fullWidth size="small" value={tagData.sapCode} onChange={e => setTagData({...tagData, sapCode: e.target.value})} sx={textFieldStyles} />
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box>
                <InputLabel sx={{ color: "black", mb: 0.5 }}>Warranty Expiry</InputLabel>
                <DatePicker value={tagData.warrantyTill} onChange={date => setTagData({...tagData, warrantyTill: date})} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={textFieldStyles} />} />
              </Box>
            </LocalizationProvider>

            {specFields.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1} color="primary">Asset Attributes</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {specFields.map((f) => (
                    <Box key={f.specField.id}>
                      <InputLabel sx={{ color: "black", mb: 0.5, fontSize: "13px" }}>{f.specField.name} {f.specField.unit ? `(${f.specField.unit})` : ""}</InputLabel>
                      <CustomTextField 
                        fullWidth size="small" 
                        value={specValues[f.specField.id] || ""} 
                        onChange={e => setSpecValues({...specValues, [f.specField.id]: e.target.value})} 
                        sx={textFieldStyles} 
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #eee", p: 2 }}>
          <Button onClick={() => setIsTagModalOpen(false)} color="inherit" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleTagSubmit} variant="contained" disabled={isTagging} sx={{ bgcolor: "#DB3027", textTransform: "none" }}>
            {isTagging ? "Tagging..." : "Tag"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewGr;
