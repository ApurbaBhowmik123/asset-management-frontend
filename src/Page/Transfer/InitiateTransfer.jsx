import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import { baseUrl } from "../Api";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import useInputStyle from "../../CustomHooks/useInputStyle";
import axios from "axios";
import { productStatusHelper } from "../../Helper/StatusHelper/StatusHelper";
import { CustomTextField } from "../../utils/CustomTextField";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const InitiateTransfer = () => {
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'warning', 'info'
  });

  // New form state
  const [transferForm, setTransferForm] = useState({
    transferId: "",
    issuedBy: "",
    approvedBy: "",
    transferDate: "",
    source: "",
    sourceLocation: "",
    destination: "",
    destinationLocation: "",
    remarks: "",
  });

  const [userList, setUserList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [grUnitsList, setGrUnitsList] = useState([]); // New state for GR units
  const [sourceLocations, setSourceLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);
  const { textFieldStyles, inputLabelStyle, selectStyles, datePickerStyles, textAreaStyle } = useInputStyle();

  // Product list states
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState({});

  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseUrl}/asset-mng/asset-helper/user-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status) {
          setUserList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching user list:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch user list",
          severity: "error",
        });
      }
    };

    const fetchUnitsList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseUrl}/super-admin/units`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status) {
          setUnitsList(response.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching units list:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch units list",
          severity: "error",
        });
      }
    };

    // New function to fetch GR units for Source
    const fetchGrUnitsList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseUrl}/gr/units/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status) {
          setGrUnitsList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching GR units list:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch GR units list",
          severity: "error",
        });
      }
    };

    fetchUserList();
    fetchUnitsList();
    fetchGrUnitsList(); // Call new function
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      // Only fetch products if both source and sourceLocation are selected
      if (!transferForm.source || !transferForm.sourceLocation) {
        setData([]);
        setTotalRows(0);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Build query params
        const params = {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sourceUnitId: transferForm.source,
          sourceLocationId: transferForm.sourceLocation,
        };

        // Add search if globalFilter is set
        if (globalFilter) {
          params.search = globalFilter;
        }

        // Add sorting if sorting is set
        if (sorting.length > 0) {
          params.sortBy = sorting[0].id;
          params.sortOrder = sorting[0].desc ? "desc" : "asc";
        }

        const response = await axios.get(`${baseUrl}/asset-transfer/transfer/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });

        if (response.data.status) {
          // Transform the data to match the table structure
          const transformedData = response.data.data.data.map(item => ({
            id: item.id,
            productId: item.uuid,
            product: item.grInventoryProduct.product.name,
            category: item.grInventoryProduct.product.category.name,
            subcategory: item.grInventoryProduct.product.subcategory.name,
            status: item.assignedStatus,
          }));

          setData(transformedData);
          setTotalRows(response.data.data.total);
          setTotalPages(response.data.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch products",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pagination, sorting, globalFilter, transferForm.source, transferForm.sourceLocation]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // When source changes, update source locations using GR units
    if (name === "source") {
      const selectedUnit = grUnitsList.find(unit => unit.id === value);
      if (selectedUnit) {
        setSourceLocations(selectedUnit.unitlocation.map(loc => ({
          id: loc.location.id,
          name: loc.location.name
        })));
      }
      setTransferForm(prev => ({
        ...prev,
        [name]: value,
        sourceLocation: "", // Reset source location when source changes
        destination: "", // Reset destination when source changes
        destinationLocation: "" // Reset destination location when source changes
      }));
      setDestinationLocations([]); // Clear destination locations
      setData([]); // Clear product data when source changes
      setSelectedRows({}); // Clear selected rows
    }
    // When source location changes
    else if (name === "sourceLocation") {
      setTransferForm(prev => ({
        ...prev,
        [name]: value
      }));
      setSelectedRows({}); // Clear selected rows when location changes
    }
    // When destination changes, update destination locations using original units
    else if (name === "destination") {
      const selectedUnit = unitsList.find(unit => unit.id === value);
      if (selectedUnit) {
        // Filter out the source location if the destination unit is the same as source unit
        let filteredLocations = selectedUnit.unitlocation.map(loc => ({
          id: loc.locationId,
          name: loc.location.name
        }));

        // If destination is same as source, filter out the source location
        if (parseInt(transferForm.source) === parseInt(value)) {
          filteredLocations = filteredLocations.filter(loc =>
            loc.id !== parseInt(transferForm.sourceLocation)
          );
        }

        setDestinationLocations(filteredLocations);
      }
      setTransferForm(prev => ({
        ...prev,
        [name]: value,
        destinationLocation: ""
      }));
    }
    else {
      setTransferForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Filter destination units to exclude the selected source
  const filteredDestinationUnits = unitsList.filter(unit =>
    unit.id !== parseInt(transferForm.source)
  );

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("productId", {
      header: "Asset ID",
      size: 130,
      enableColumnFilter: false,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("product", {
      header: "Product",
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("subcategory", {
      header: "Subcategory",
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);

        return (
          <Chip
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: bg,
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
    }),
  ];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = (exportData) => {
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  const selectedProducts = Object.keys(selectedRows)
    .filter((key) => selectedRows[key])
    .map((key) => data[parseInt(key)]);

  const productListTable = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
      rowSelection: selectedRows,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRows,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px", whiteSpace: "nowrap" },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": {
          backgroundColor: "#fafafa",
        },
      },
    },
      muiTableContainerProps: {
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
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => handleExportData(data)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  const transferTable = useMaterialReactTable({
    columns,
    data: selectedProducts,
    enablePagination: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableRowSelection: false,
    enableTopToolbar: true,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => handleExportData(selectedProducts)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={selectedProducts.length === 0}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": {
          backgroundColor: "#fafafa",
        },
      },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px", whiteSpace: "nowrap" },
    },
    muiTableContainerProps: {
      sx: { width: "100%", overflowX: "auto" },
    },
  });

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!transferForm.issuedBy || !transferForm.approvedBy || !transferForm.transferDate ||
        !transferForm.source || !transferForm.sourceLocation || !transferForm.destination ||
        !transferForm.destinationLocation || selectedProducts.length === 0) {
        setSnackbar({
          open: true,
          message: "Please fill all required fields and select at least one product",
          severity: "warning",
        });
        return;
      }

      const token = localStorage.getItem("token");

      // Prepare the request payload
      const payload = {
        issuerId: parseInt(transferForm.issuedBy),
        approverId: parseInt(transferForm.approvedBy),
        transferDate: new Date(transferForm.transferDate).toISOString(),
        sourceUnitId: parseInt(transferForm.source),
        sourceUnitLocationId: parseInt(transferForm.sourceLocation),
        destinationUnitId: parseInt(transferForm.destination),
        destinationUnitLocationId: parseInt(transferForm.destinationLocation),
        remarks: transferForm.remarks || "",
        inventoryProductDetailIds: selectedProducts.map(product => product.id)
      };

      const response = await axios.post(`${baseUrl}/asset-transfer/transfer/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Transfer initiated successfully!",
          severity: "success",
        });
        // Reset form and selections
        setTransferForm({
          transferId: "",
          issuedBy: "",
          approvedBy: "",
          transferDate: "",
          source: "",
          sourceLocation: "",
          destination: "",
          destinationLocation: "",
          remarks: "",
        });
        setSelectedRows({});
        setData([]);
      } else {
        setSnackbar({
          open: true,
          message: `Failed to initiate transfer: ${response.data.message}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting transfer:", error);
      setSnackbar({
        open: true,
        message: `Error submitting transfer: ${error.response?.data?.message || error.message}`,
        severity: "error",
      });
    }
  };

  return (
    <Box>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Transfer Form */}
      <Box>
       
        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
          {/* Row 1: Transfer Details */}

          <Typography sx={{ fontSize: "15px", fontWeight: 500 }} gutterBottom>
            Transfer Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <InputLabel variant="body2" sx={inputLabelStyle}>Issued By</InputLabel>
              <CustomTextField
                select
                fullWidth
                size="small"
                name="issuedBy"
                value={transferForm.issuedBy}
                onChange={handleFormChange}
              >
                {userList.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <InputLabel variant="body2" sx={inputLabelStyle}>Approved By</InputLabel>
              <CustomTextField
                select
                fullWidth
                size="small"
                name="approvedBy"
                value={transferForm.approvedBy}
                onChange={handleFormChange}
              >
                {userList.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <InputLabel variant="body2" sx={inputLabelStyle}>Transfer Date</InputLabel>
              <CustomTextField
                type="date"
                fullWidth
                size="small"
                name="transferDate"
                value={transferForm.transferDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          {/* Row 2: Location Information */}
          <Box mt={3}>
            <Typography sx={{ fontSize: "15px", fontWeight: 500 }} gutterBottom>
              Location Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 3 }}>
                <InputLabel variant="body2" sx={inputLabelStyle}>Source</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                  name="source"
                  value={transferForm.source}
                  onChange={handleFormChange}
                >
                  {grUnitsList.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <InputLabel variant="body2" sx={inputLabelStyle}>Source Location</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                  name="sourceLocation"
                  value={transferForm.sourceLocation}
                  onChange={handleFormChange}
                  disabled={!transferForm.source}
                >
                  {sourceLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <InputLabel variant="body2" sx={inputLabelStyle}>Destination</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                  name="destination"
                  value={transferForm.destination}
                  onChange={handleFormChange}
                >
                  {filteredDestinationUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <InputLabel variant="body2" sx={inputLabelStyle}>Destination Location</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                  name="destinationLocation"
                  value={transferForm.destinationLocation}
                  onChange={handleFormChange}
                  disabled={!transferForm.destination}
                >
                  {destinationLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          </Box>

          {/* Row 3: Remarks */}
          <Box mt={2}>
            <Grid container>
              <Grid size={{ md: 6 }}>
                <InputLabel sx={inputLabelStyle} variant="body2">Remarks</InputLabel>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  name="remarks"
                  value={transferForm.remarks}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Box mt={2}>
            <Typography sx={{ fontSize: "15px", fontWeight: 500 }} gutterBottom>
              Product List
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {transferForm.source && transferForm.sourceLocation 
                ? "Select product to transfer" 
                : "Please select Source and Source Location to view available products"}
            </Typography>

            {transferForm.source && transferForm.sourceLocation && (
              <Box
                sx={{
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "1000px",
                    xl: "1300px",
                  },
                  overflow: "auto",
                  mx: "auto",
                  px: { xs: 1, sm: 2 },
                }}
              >
                <MaterialReactTable table={productListTable} />
              </Box>
            )}

            {selectedProducts.length > 0 && (
              <Box
                sx={{
                  mt: 4,
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "1000px",
                    xl: "1300px",
                  },
                  mx: "auto",
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Typography sx={{ fontSize: "15px", fontWeight: 500 }} gutterBottom>
                  Transfer Product List
                </Typography>
                <MaterialReactTable table={transferTable} />
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: "right", width: { xs: "100%", lg: "1000px", xl: "1300px" }, mx: "auto" }}>
              <Button
                className="Global-Button2"
                onClick={handleSubmit}
                disabled={selectedProducts.length === 0}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InitiateTransfer;