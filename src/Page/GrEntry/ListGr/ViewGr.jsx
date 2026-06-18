import {
  Box,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Grid,
  TextField,
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

const BulkTagForm = ({ product, onSuccess, setSnackbar }) => {
  const [specFields, setSpecFields] = useState([]);
  const [tagDataList, setTagDataList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCategorySpecs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/catalog/categories/${product.categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const specFieldsData = res.data.data?.categorySpecFields?.map(csf => csf.specField).filter(Boolean) || [];
        setSpecFields(specFieldsData);
      } catch (error) {
        console.error("Error fetching spec fields", error);
      }
    };
    fetchCategorySpecs();

    const initialList = product.untaggedDetails.map(detail => ({
      inventoryProductDetailId: detail.id,
      uuid: detail.uuid,
      serialNo1: "",
      sapCode: "",
      modelName: "",
      warrantyTill: null,
      specValues: {}
    }));
    setTagDataList(initialList);
  }, [product]);

  const handleChange = (index, field, value) => {
    const updated = [...tagDataList];
    updated[index][field] = value;
    setTagDataList(updated);
  };

  const handleSpecChange = (index, specId, value) => {
    const updated = [...tagDataList];
    updated[index].specValues = {
      ...updated[index].specValues,
      [specId]: value
    };
    setTagDataList(updated);
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < tagDataList.length; i++) {
      const item = tagDataList[i];
      if (!item.serialNo1 || !item.modelName) {
        setSnackbar({ open: true, message: `Please fill Serial Number and Model Name for Item ${i + 1}`, severity: "error" });
        return;
      }
      for (const spec of specFields) {
        if (!item.specValues[spec.id]) {
          setSnackbar({ open: true, message: `Please fill attribute '${spec.name}' for Item ${i + 1}`, severity: "error" });
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payloadItems = tagDataList.map(item => ({
        inventoryProductDetailId: item.inventoryProductDetailId,
        serialNo1: item.serialNo1,
        sapCode: item.sapCode,
        modelName: item.modelName,
        warrantyTill: item.warrantyTill ? item.warrantyTill.toISOString() : null,
        specValues: Object.keys(item.specValues).map(id => ({
          specFieldId: Number(id),
          value: item.specValues[id]
        }))
      }));

      await axios.post(`${baseUrl}/gr/bulk-tag-item`, { items: payloadItems }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({ open: true, message: "All items tagged successfully", severity: "success" });
      if (onSuccess) onSuccess();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Failed to tag items", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (specFields.length === 0 && tagDataList.length === 0) return <Typography p={2}>Loading...</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2, border: "1px solid #ddd", m: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Bulk Tagging: {product.category?.name} ({product.untaggedCount} Items)
      </Typography>

      {tagDataList.map((item, index) => (
        <Paper key={item.inventoryProductDetailId} sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" color="primary" mb={1}>
            Item {index + 1} (ID: {item.uuid})
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField
                label="Model Name *"
                value={item.modelName}
                onChange={(e) => handleChange(index, "modelName", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField
                label="Serial Number *"
                value={item.serialNo1}
                onChange={(e) => handleChange(index, "serialNo1", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField
                label="SAP Code (Optional)"
                value={item.sapCode}
                onChange={(e) => handleChange(index, "sapCode", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Warranty Till (Optional)"
                  value={item.warrantyTill}
                  onChange={(date) => handleChange(index, "warrantyTill", date)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            {specFields.map((spec) => (
              <Grid item xs={12} sm={6} md={3} key={spec.id}>
                <CustomTextField
                  label={`${spec.name} *`}
                  value={item.specValues[spec.id] || ""}
                  onChange={(e) => handleSpecChange(index, spec.id, e.target.value)}
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveAll} disabled={isSaving} sx={{ px: 4 }}>
          {isSaving ? "Saving..." : "Save All"}
        </Button>
      </Box>
    </Box>
  );
};

const ViewGr = () => {
  const [grDetails, setGrDetails] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [untaggedProducts, setUntaggedProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchGrDetails();
  }, [id]);

  const fetchGrDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/gr/${id}?t=${new Date().getTime()}`, { headers: { Authorization: `Bearer ${token}` } });
      setGrDetails(res.data.data);
      
      const taggedItemsList = [];
      res.data.data.inventoryProducts.forEach((ip) => {
        ip.inventoryDetails.forEach((det) => {
          if (det.assignedStatus !== "Untagged") {
            taggedItemsList.push({ ...det, grInventoryProduct: ip });
          }
        });
      });
      setTableData(taggedItemsList);

      const untaggedProductsList = res.data.data.inventoryProducts.map(ip => {
        const untaggedDetails = ip.inventoryDetails.filter(d => d.assignedStatus === "Untagged");
        return {
          ...ip,
          untaggedDetails,
          untaggedCount: untaggedDetails.length
        };
      }).filter(ip => ip.untaggedCount > 0);
      setUntaggedProducts(untaggedProductsList);
    } catch (error) {
      console.error("error fetching GR details", error);
      setSnackbar({ open: true, message: "Error fetching GR details", severity: "error" });
    }
  };

  const columnHelper = createMRTColumnHelper();
  
  const untaggedColumns = [
    columnHelper.accessor("category.name", { header: "Asset Reference", size: 150 }),
    columnHelper.accessor("brand.name", { header: "Brand", size: 150 }),
    columnHelper.accessor("quantity", { header: "Total Quantity", size: 120 }),
    columnHelper.accessor("untaggedCount", { header: "Untagged Quantity", size: 120 })
  ];

  const taggedColumns = [
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
      Cell: ({ cell }) => <span style={{ color: "green", fontWeight: "bold" }}>{cell.getValue()}</span>
    }),
    columnHelper.accessor("qrCode.qrCodeUrl", {
      header: "QR Code",
      size: 100,
      Cell: ({ row }) => {
        const url = row.original.qrCode?.qrCodeUrl;
        if (!url) return "-";
        const cleanUrl = url.startsWith("http") ? url : `${baseUrl.replace('/api/v1', '')}${url}`;
        return (
          <a href={cleanUrl} target="_blank" rel="noreferrer" style={{ color: "#1976d2", textDecoration: "none", fontWeight: "bold" }}>
            View QR
          </a>
        );
      }
    })
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
      {untaggedProducts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Untagged Items (Requires Tagging)</Typography>
          <MaterialReactTable
            columns={untaggedColumns}
            data={untaggedProducts}
            enablePagination={false}
            enableGlobalFilter={false}
            enableColumnActions={false}
            renderDetailPanel={({ row }) => (
              <BulkTagForm 
                product={row.original} 
                onSuccess={fetchGrDetails} 
                setSnackbar={setSnackbar}
              />
            )}
            muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid #e0e0e0", borderRadius: 2 } }}
            muiTableHeadRowProps={{ sx: { backgroundColor: "#FFF4E5" } }}
            muiTableBodyCellProps={{ sx: { fontSize: "13px" } }}
          />
        </Box>
      )}

      {/* Tagged Items */}
      {tableData.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>Tagged Items</Typography>
          <MaterialReactTable
            columns={taggedColumns}
            data={tableData}
            enablePagination={true}
            muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid #e0e0e0", borderRadius: 2 } }}
            muiTableHeadRowProps={{ sx: { backgroundColor: "#E8F5E9" } }}
            muiTableBodyCellProps={{ sx: { fontSize: "13px" } }}
          />
        </Box>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewGr;
