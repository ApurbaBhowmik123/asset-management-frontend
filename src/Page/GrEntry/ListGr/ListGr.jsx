import React, { useEffect, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { Box, Button, IconButton, Typography, Snackbar, Alert, Chip, Grid } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../../assets/EmployeeImages/Group (2).png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import AddGr from "./AddGr";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../../Api";
import QRIcon from "../../../assets/GR/QRIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename: 'gr_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
});

const ListGr = () => {
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [summaryData, setSummaryData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [taggedFilter, setTaggedFilter] = useState("true");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleGotoQRList = (grId) => {
    navigate(`/grentry/listgr/qr/${grId}`);
  };
  const handleViewGr = (grId) => {
    navigate(`/grentry/listgr/viewgr/${grId}`);
  };
  const handleTagGr = async (grUuid) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${baseUrl}/gr/${grUuid}/tag`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar("GR Tagged successfully and inventory activated!", "success");
      fetchData();
    } catch (error) {
      console.error("Failed to tag GR:", error);
      const errMsg = error.response?.data?.message || "Failed to tag GR";
      showSnackbar(errMsg, "error");
    }
  };

  const columns = [
    columnHelper.accessor("grId", {
      header: "GR ID",
      size: 120,
    }),
    columnHelper.accessor("vendor.name", {
      header: "Vendor",
      size: 200,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 150,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          {/* {taggedFilter === "false" && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleTagGr(row?.original?.uuid)}
              sx={{
                fontSize: "10px",
                py: 0.5,
                px: 1,
                minWidth: "auto",
                height: "28px",
                backgroundColor: "#2e7d32",
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
                '&:hover': {
                  backgroundColor: "#1b5e20",
                }
              }}
            >
              Tag
            </Button>
          )} */}
          <IconButton
            onClick={() => handleGotoQRList(row?.original?.uuid)}
            color="primary"
            size="small"
          >
            <img src={QRIcon} alt="edit" />
          </IconButton>
          <IconButton
            onClick={() => handleViewGr(row?.original?.uuid)}
            color="error"
            size="small"
          >
            <img src={Editicon1} alt="delete" />
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("sapDate", {
      header: "PO Date",
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? dateTimeHelper.formatDate(value, "DD/MM/YYYY") : "NA";
      },
    }),
    columnHelper.accessor("grDate", {
      header: "GR Date",
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? dateTimeHelper.formatDate(value, "DD/MM/YYYY") : "NA";
      },
    }),

    columnHelper.accessor("createdAt", {
      header: "Creation Date",
      size: 150,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),

  ];

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const sortBy = sorting[0]?.id || "sapDate";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    // Convert columnFilters to query string
    const filterQuery = columnFilters
      .map((filter) => `${filter.id}=${encodeURIComponent(filter.value)}`)
      .join("&");

    try {
      const res = await axios.get(
        `${baseUrl}/gr?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${globalFilter}&tagged=${taggedFilter}&vendor=${selectedVendor}&location=${selectedLocation}&brand=${selectedBrand}&${filterQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(res.data.data.data);
      setRowCount(res.data.data.total);
    } catch (error) {
      console.error("Failed to fetch GR data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, globalFilter, sorting, columnFilters, taggedFilter, selectedVendor, selectedLocation, selectedBrand]);

  const fetchOptions = async () => {
    const token = localStorage.getItem("token");
    try {
      const [venRes, locRes, brandRes] = await Promise.all([
        axios.get(`${baseUrl}/super-admin/vendors?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/super-admin/locations?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/super-admin/brands?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setVendors(venRes.data?.data?.data || venRes.data?.data || []);
      setLocations(locRes.data?.data?.data || locRes.data?.data || []);
      setBrands(brandRes.data?.data?.data || brandRes.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch filters", e);
    }
  };

  const fetchSummaryData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${baseUrl}/gr/summary?search=${globalFilter}&tagged=${taggedFilter}&vendor=${selectedVendor}&location=${selectedLocation}&brand=${selectedBrand}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummaryData(res.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch summary", e);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [globalFilter, taggedFilter, selectedVendor, selectedLocation, selectedBrand]);

  // Flatten GR data for CSV export
  const flattenGrData = (gr) => {
    return {
      grId: gr.grId || 'N/A',
      vendor: gr.vendor?.name || 'N/A',
      poDate: dateTimeHelper.formatDate(gr.sapDate, "DD/MM/YYYY"),
      grDate: dateTimeHelper.formatDate(gr.grDate, "DD/MM/YYYY"),
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map(row => flattenGrData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map(gr => flattenGrData(gr));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: false, // 👈 disables filter by column
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        whiteSpace: "nowrap",
      },
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
          onClick={handleExportData}
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
        Total Rows: {rowCount}
      </Typography>
    ),
  });

  const handlePage = () => {
    setShowAddProduct(true);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {!showAddProduct && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setTaggedFilter("true")}
            sx={{
              backgroundColor: taggedFilter === "true" ? "#FFE3E1" : "#fff",
              color: "#333",
              border: "1px solid #FFE3E1",
              fontWeight: "bold",
              '&:hover': {
                backgroundColor: "#FFE3E1",
              }
            }}
          >
            Tagged GRs
          </Button>
          <Button
            variant="contained"
            onClick={() => setTaggedFilter("false")}
            sx={{
              backgroundColor: taggedFilter === "false" ? "#FFE3E1" : "#fff",
              color: "#333",
              border: "1px solid #FFE3E1",
              fontWeight: "bold",
              '&:hover': {
                backgroundColor: "#FFE3E1",
              }
            }}
          >
            Untagged GRs
          </Button>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* {!showAddProduct && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            onClick={handlePage}
          >
            Add GR
          </Button>
        )} */}
      </Box>

      {showAddProduct ? (
        <AddGr onBack={() => setShowAddProduct(false)} />
      ) : (
        <Box sx={{ flexGrow: 1, width: "100%", overflowX: "hidden", pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Box sx={{ width: "100%", overflow: "auto" }}>
                <MaterialReactTable table={table} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2, backgroundColor: "#fafafa" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, borderBottom: "1px solid #ddd", pb: 1 }}>
                  Filters
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "#666" }}>Vendor</Typography>
                  <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
                    <option value="">All Vendors</option>
                    {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "#666" }}>Location</Typography>
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
                    <option value="">All Locations</option>
                    {locations.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                  </select>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "#666" }}>Brand</Typography>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
                    <option value="">All Brands</option>
                    {brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                  </select>
                </Box>
                <Button variant="outlined" fullWidth onClick={() => { setSelectedVendor(""); setSelectedLocation(""); setSelectedBrand(""); }} sx={{ mb: 3 }}>
                  Clear Filters
                </Button>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, borderBottom: "1px solid #ddd", pb: 1 }}>
                  GR Summary
                </Typography>
                <Box sx={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
                  {summaryData.length === 0 ? (
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "#999" }}>No products found.</Typography>
                  ) : (
                    summaryData.map((item, idx) => (
                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, backgroundColor: "#fff", border: "1px solid #eee", borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#444" }}>{item.brand} - {item.product}</Typography>
                        <Chip label={item.quantity} size="small" sx={{ backgroundColor: "#FFE3E1", color: "#D32F2F", fontWeight: "bold" }} />
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

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

    </Box>
  );
};

export default ListGr;
