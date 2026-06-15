import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import React, { useEffect, useState } from "react";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  createMRTColumnHelper,
  MaterialReactTable,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const ViewGr = () => {
  const [grDetails, setGrDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [editFormData, setEditFormData] = useState({
    sapId: "",
    sapDate: "",
    invoiceNumber: "",
    invoiceDate: "",
    grId: "",
    grDate: "",
    vendorId: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const inputLabelStyle = {
    fontWeight: "medium",
    marginBottom: "8px",
    display: "block",
    fontSize: "14px",
    color: "#333",
  };

  const textFieldStyles = {
    backgroundColor: "#f5f5f5",
    borderRadius: 1,
    "& .MuiInputBase-root": {
      height: "40px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "8px 12px",
      height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  };

  const datePickerStyles = {
    ...textFieldStyles,
    width: "100%",

  };

  const selectStyles = {
    backgroundColor: "#f5f5f5",
    "& .MuiInputBase-root": { height: "40px" },
    "& .MuiSelect-select": {
      padding: "8px 12px",
      height: "100% !important",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    width: "100%",
  };

  // CSV Configuration
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename: `GR_${grDetails?.grId || "export"}_${new Date().toISOString().split("T")[0]
      }`,
  });

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("product.name", {
      header: "Product",
      size: 200,
      Cell: ({ row }) => {
        const name = row.original.product?.name || "N/A";
        const specValues = row.original.inventoryDetails?.[0]?.specValues || [];
        const specs = specValues
          .filter((sv) => sv.specField && sv.value)
          .map((sv) => `${sv.specField.name}: ${sv.value}`);

        return (
          <Box>
            <Typography sx={{ fontWeight: "600", fontSize: "0.875rem", color: "#333" }}>
              {name}
            </Typography>
            {specs.length > 0 && (
              <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {specs.map((spec, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </Box>
            )}
          </Box>
        );
      },
    }),
    columnHelper.accessor("product.category.name", {
      header: "Category",
      size: 100,
      Cell: ({ row }) => row.original.product?.category?.name || "N/A",
    }),


    columnHelper.accessor("assetId", {
      header: "Asset Id",
      size: 150,
      Cell: ({ row }) => {
        const inventoryDetails = row.original.inventoryDetails || [];
        return (
          <div>
            {inventoryDetails.map((item, index) => (
              <div key={index}>{item.uuid || "N/A"}</div>
            ))}
          </div>
        );
      },
    }),

    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 80,
    }),
    columnHelper.accessor("freeQty", {
      header: "Free Qty",
      size: 80,
      Cell: ({ cell }) => cell.getValue() || "0",
    }),

    columnHelper.accessor("ratePerPiece", {
      header: "Price",
      size: 80,
      Cell: ({ cell }) => `₹${cell.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("totalAmount", {
      header: "Total",
      size: 100,
      Cell: ({ cell }) => `₹${cell.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 150,
      Cell: ({ cell }) => (
        <div
          style={{
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {cell.getValue() || "N/A"}
        </div>
      ),
    }),
    columnHelper.accessor("inventoryDetails", {
      header: "Serial Numbers",
      size: 150,
      Cell: ({ row }) => {
        const inventoryDetails = row.original.inventoryDetails || [];
        return (
          <div>
            {inventoryDetails.map((item, index) => (
              <div key={index}>{item.serialNo1 || item.serialNo2 || "N/A"}</div>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor("warrantyTill", {
      header: "Warranty Till",
      size: 120,
      Cell: ({ cell }) => {
        const date = new Date(cell.getValue());
        return date.toLocaleDateString();
      },
    }),
  ];

  const handleDownloadInvoice = async () => {
    if (!grDetails?.invoiceFile) {
      setSnackbar({
        open: true,
        message: "No agreement file available for download",
        severity: "warning",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const fileUrl = grDetails?.invoiceFile;
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();

      let fileName = fileUrl.split("/").pop();

      if (!fileName || !fileName.includes(".")) {
        const contentType = response.headers.get("Content-Type") || "";
        const extension = contentType.split("/")[1] || "file";
        fileName = `Download_Invoice_${grDetails?.invoiceNumber}.${extension}`;
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      // Clean up

      setTimeout(() => {
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading agreement:", error);

      setSnackbar({
        open: true,

        message: "Failed to download agreement. Please try again.",

        severity: "error",
      });
    }
  };

  const handleGoBack = () => {
    navigate("/grentry/listgr");
  };

  const handleFetchGrDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/gr/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res?.json();
      setGrDetails(data?.data);
      if (data?.data) {
        setEditFormData({
          sapId: data.data.sapId || "",
          sapDate: data.data.sapDate || "",
          invoiceNumber: data.data.invoiceNumber || "",
          invoiceDate: data.data.invoiceDate || "",
          grId: data.data.grId || "",
          grDate: data.data.grDate || "",
          vendorId: data.data.vendor?.id || "",
          description: data.data.description || "",
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleGetAllVendors = async () => {
    try {
      const res = await fetch(`${baseUrl}/super-admin/vendors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res?.json();
      if (data?.status) {
        // The API returns paginated data (data.data.data) or a flat array (data.data)
        setVendors(data.data?.data || data.data || []);
      }
    } catch (error) {
      console.error("error fetching vendors", error);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${baseUrl}/gr/${grDetails.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data?.status) {
        setSnackbar({
          open: true,
          message: "GR updated successfully",
          severity: "success",
        });
        setIsEditing(false);
        await handleFetchGrDetails();
      } else {
        setSnackbar({
          open: true,
          message: data?.message || "Failed to update GR",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("error updating GR", error);
      setSnackbar({
        open: true,
        message: "An error occurred while saving changes",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to format data for CSV export
  const formatDataForExport = (data) => {
    return data.map((row) => ({
      Product: row.product?.name || "N/A",
      Category: row.product?.category?.name || "N/A",
      Subcategory: row.product?.subcategory?.name || "N/A",
      Quantity: row.quantity || 0,
      "Free Qty": row.freeQty || 0,
      "Maintenance Freq (months)": row.maintenanceFrequency || "N/A",
      Rate: row.ratePerPiece || 0,
      Total: row.totalAmount || 0,
      Description: row.description || "N/A",
      "Serial Numbers":
        row.inventoryDetails
          ?.map((item) => item.serialNo1 || item.serialNo2)
          .join(", ") || "N/A",
      "Warranty Till": row.warrantyTill
        ? new Date(row.warrantyTill).toLocaleDateString()
        : "N/A",
    }));
  };

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const formattedData = formatDataForExport(rowData);
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const inventoryProducts = grDetails?.inventoryProducts || [];
    const formattedData = formatDataForExport(inventoryProducts);
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    if (!grDetails?.inventoryProducts) return 0;
    return grDetails.inventoryProducts.reduce((total, item) => {
      return total + (item.totalAmount || 0);
    }, 0);
  };

  useEffect(() => {
    handleFetchGrDetails();
    handleGetAllVendors();
  }, []);

  if (!grDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={handleGoBack} />
        <Box sx={{ display: "flex", gap: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  if (grDetails) {
                    setEditFormData({
                      sapId: grDetails.sapId || "",
                      sapDate: grDetails.sapDate || "",
                      invoiceNumber: grDetails.invoiceNumber || "",
                      invoiceDate: grDetails.invoiceDate || "",
                      grId: grDetails.grId || "",
                      grDate: grDetails.grDate || "",
                      vendorId: grDetails.vendor?.id || "",
                      description: grDetails.description || "",
                    });
                  }
                }}
                disabled={isSaving}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                disabled={isSaving}
                sx={{ textTransform: "none", backgroundColor: "#DB3027", color: "white", "&:hover": { backgroundColor: "#b8241d" } }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ textTransform: "none", backgroundColor: "#DB3027", color: "white", "&:hover": { backgroundColor: "#b8241d" } }}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
      <div style={{ backgroundColor: "#FFF", padding: "16px" }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            {/* PO Id */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                PO Id <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                sx={textFieldStyles}
                value={isEditing ? editFormData.sapId : (grDetails?.sapId || "N/A")}
                disabled={!isEditing}
                onChange={(e) => setEditFormData(prev => ({ ...prev, sapId: e.target.value }))}
              />
            </div>

            {/* PO Date */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                PO Date
              </InputLabel>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: datePickerStyles,

                  },
                }}
                value={isEditing ? (editFormData.sapDate ? new Date(editFormData.sapDate) : null) : (grDetails?.sapDate ? new Date(grDetails?.sapDate) : null)}
                disabled={!isEditing}
                onChange={(newVal) => setEditFormData(prev => ({ ...prev, sapDate: newVal }))}
              />
            </div>

            {/* Invoice Number */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                Invoice Number <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <TextField
                value={isEditing ? editFormData.invoiceNumber : (grDetails?.invoiceNumber || "N/A")}
                disabled={!isEditing}
                onChange={(e) => setEditFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                fullWidth
                size="small"
                sx={textFieldStyles}
              />
            </div>

            {/* Invoice Date */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                Invoice Date <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: datePickerStyles,
                  },
                }}
                value={isEditing ? (editFormData.invoiceDate ? new Date(editFormData.invoiceDate) : null) : (grDetails?.invoiceDate ? new Date(grDetails?.invoiceDate) : null)}
                disabled={!isEditing}
                onChange={(newVal) => setEditFormData(prev => ({ ...prev, invoiceDate: newVal }))}
              />
            </div>

            {/* GR Id */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                SAP GR Id <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <TextField
                value={isEditing ? editFormData.grId : (grDetails?.grId || "N/A")}
                disabled={!isEditing}
                onChange={(e) => setEditFormData(prev => ({ ...prev, grId: e.target.value }))}
                fullWidth
                size="small"
                sx={textFieldStyles}
              />
            </div>

            {/* GR Date */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                SAP GR Date <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: datePickerStyles,
                  },
                }}
                value={isEditing ? (editFormData.grDate ? new Date(editFormData.grDate) : null) : (grDetails?.grDate ? new Date(grDetails?.grDate) : null)}
                disabled={!isEditing}
                onChange={(newVal) => setEditFormData(prev => ({ ...prev, grDate: newVal }))}
              />
            </div>

            {/* Vendor */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                Select Vendor <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <FormControl fullWidth size="small" sx={selectStyles}>
                <Select
                  value={isEditing ? editFormData.vendorId : (grDetails?.vendor?.id || "")}
                  disabled={!isEditing}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return "Select Vendor";
                    }
                    const found = vendors.find(v => v.id === selected) || grDetails?.vendor;
                    return found?.name || "N/A";
                  }}
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Unit */}
            {/* Unit */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                Unit <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <FormControl fullWidth size="small" sx={selectStyles}>
                <Select
                  value={
                    grDetails?.inventoryProducts?.[0]?.inventoryDetails?.[0]
                      ?.unit?.id || ""
                  }
                  disabled
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return "Select Unit";
                    }
                    return (
                      grDetails?.inventoryProducts?.[0]?.inventoryDetails?.[0]
                        ?.unit?.name || "N/A"
                    );
                  }}
                >
                  <MenuItem
                    value={
                      grDetails?.inventoryProducts?.[0]?.inventoryDetails?.[0]
                        ?.unit?.id || ""
                    }
                  >
                    {grDetails?.inventoryProducts?.[0]?.inventoryDetails?.[0]
                      ?.unit?.name || "N/A"}
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Location */}
            <div>
              <InputLabel sx={inputLabelStyle}>
                Location <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <TextField
                fullWidth
                size="small"
                sx={textFieldStyles}
                value={
                  grDetails?.inventoryProducts?.[0]?.inventoryDetails?.[0]?.location?.name ||
                  "N/A"
                }
                disabled
              />
            </div>


            {/* Created By */}
            <div>
              <InputLabel sx={inputLabelStyle}>Created By</InputLabel>
              <TextField
                fullWidth
                size="small"
                sx={textFieldStyles}
                value={grDetails?.createdUser?.name || "N/A"}
                disabled
              />
            </div>

            {/* Created At */}
            <div>
              <InputLabel sx={inputLabelStyle}>Created At</InputLabel>
              <TextField
                fullWidth
                size="small"
                sx={textFieldStyles}
                value={dateTimeHelper.formatDate(grDetails?.createdAt) || "N/A"}
                disabled
              />
            </div>

            {/* Download */}
            {/* <div>
              <InputLabel sx={inputLabelStyle}>Download Invoice</InputLabel>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box>
                  <Button
                    onClick={handleDownloadInvoice}
                    className="Global-Button4"
                  >
                    Download Invoice
                  </Button>
                </Box>
              </Box>
            </div> */}
            {grDetails?.invoiceFile && (
              <div>
                <InputLabel sx={inputLabelStyle}>Download Invoice</InputLabel>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box>
                    <Button
                      onClick={handleDownloadInvoice}
                      className="Global-Button4"
                    >
                      Download Invoice
                    </Button>
                  </Box>
                </Box>
              </div>
            )}
          </div>

          {/**Table */}
          <Box
            style={{ marginTop: "2rem" }}
            sx={{
              width: {
                xs: "100%",
                sm: "100%",
                md: "100%",
                lg: "1000px",
                xl: "1400px",
              },
              overflow: "auto",
              mx: "auto",
              px: { xs: 1, sm: 1 },
            }}
          >
            <MaterialReactTable
              columns={columns}
              data={grDetails?.inventoryProducts || []}
              initialState={{
                density: "compact",
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: "#FFE3E1",
                  color: "#333",
                },
              }}
              muiTableContainerProps={{
                sx: {
                  width: "100%",
                  overflowX: "auto",
                  maxWidth: "100%",
                  "&::-webkit-scrollbar": {
                    height: "8px",
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "8px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#555",
                  },
                },
              }}

              renderTopToolbarCustomActions={({ table }) => (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {/* <Button
                    onClick={handleExportData}
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button4"
                    variant="outlined"
                    size="small"
                  >
                    Export All Data
                  </Button>
                  <Button
                    onClick={() =>
                      handleExportRows(table.getPrePaginationRowModel().rows)
                    }
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button4"
                    variant="outlined"
                    size="small"
                  >
                    Export All Rows
                  </Button>
                  <Button
                    onClick={() => handleExportRows(table.getRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button4"
                    variant="outlined"
                    size="small"
                  >
                    Export Page Rows
                  </Button>
                  <Button
                    disabled={
                      !table.getIsSomeRowsSelected() &&
                      !table.getIsAllRowsSelected()
                    }
                    onClick={() =>
                      handleExportRows(table.getSelectedRowModel().rows)
                    }
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button5"
                    variant="outlined"
                    size="small"
                  >
                    Export Selected Rows
                  </Button> */}
                </Box>
              )}
              renderBottomToolbar={({ table }) => (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "16px",
                    border: "1px solid #e0e0e0",
                    marginTop: "-1px",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    Grand Total: ₹{calculateGrandTotal()}
                  </Typography>
                </div>
              )}
            />
          </Box>
        </LocalizationProvider>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ViewGr;
