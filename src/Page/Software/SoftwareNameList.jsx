import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../assets/EmployeeImages/Vector.png";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import SoftwareName from "./SoftwareName";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const SoftwareNameList = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showAddSoftware, setShowAddSoftware] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [softwareToDelete, setSoftwareToDelete] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLogSoftware, setSelectedLogSoftware] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uRes, locRes, usrRes] = await Promise.all([
          fetch(`${baseUrl}/gr/units/list`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/super-admin/locations?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseUrl}/asset-mng/asset-helper/user-list`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const [uData, locData, usrData] = await Promise.all([uRes.json(), locRes.json(), usrRes.json()]);
        if (uData.data) setUnits(uData.data);
        if (locData.data) setLocations(locData.data.data || locData.data);
        if (usrData.data) setUsers(usrData.data);
      } catch (err) { console.error(err); }
    };
    fetchDropdowns();
  }, []);


  const columns = [
    columnHelper.accessor("uuid", { header: "ID", size: 60 }),
    columnHelper.accessor("name", { header: "Software Name", size: 160 }),
    columnHelper.accessor("activationKey", { header: "Activation Key", size: 160 }),
    columnHelper.accessor("LicenseType", { header: "License Type", size: 160 }),
    columnHelper.accessor("IssueDate", {
      header: "Issue Date",
      size: 120,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? dateTimeHelper.formatDate(value, "DD/MM/YYYY") : "NA";
      },
    }),

    columnHelper.accessor("ExpiryDate", {
      header: "Expiry Date",
      size: 120,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? dateTimeHelper.formatDate(value, "DD/MM/YYYY") : "NA";
      },
    }),

    columnHelper.accessor("addedQuantity", { header: "Added Qty", size: 120 }),
    columnHelper.accessor("currentQuantity", {
      header: "Current Qty",
      size: 120,
    }),
    columnHelper.accessor("createdUser.name", {
      header: "Created By",
      size: 130,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 130,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setSelectedSoftwareId(row.original.id);
              setShowAddSoftware(true);
            }}
          >
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleOpenLogs(row.original)}
            sx={{ ml: 1, p: 0.5, fontSize: "10px" }}
          >
            Logs
          </Button>
          {/* <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSoftwareToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton> */}
        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "software_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const fetchData = useCallback(
    async ({ pageIndex, pageSize, sorting, globalFilter }) => {
      setLoading(true);

      // sorting setup
      const sort = sorting?.[0] || { id: "name", desc: false };

      try {
        const response = await axios.get(`${baseUrl}/software/list`, {
          params: {
            page: pageIndex + 1,
            limit: pageSize,
            sortBy: sort.id,
            sortOrder: sort.desc ? "desc" : "asc",
            search: globalFilter || "",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status) {
          setData(response.data.data.data);
          setTotalRows(response.data.data.total);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("Failed to fetch data", "error");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  }, [pagination, sorting, globalFilter, fetchData]);

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => row.original);
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const handleExportData = () => {
    try {
      const csv = generateCsv(csvConfig)(data);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  
  const handleOpenLogs = async (software) => {
    setSelectedLogSoftware(software);
    setLogModalOpen(true);
    try {
      const response = await axios.get(`${baseUrl}/software/logs?softwareId=${software.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setLogs(response.data.data?.data || response.data.data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      showSnackbar("Failed to fetch logs", "error");
    }
  };

  const handleDeleteSoftware = async () => {
    if (!softwareToDelete) return;
    try {
      setLoading(true);
      const response = await axios.delete(
        `${baseUrl}/software/delete/${softwareToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        showSnackbar(response.data.message, "success");
        fetchData({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          globalFilter,
        });
      }
    } catch (error) {
      console.error(error);
      showSnackbar(
        error?.response?.data?.message ||
        "Failed to delete software. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSoftwareToDelete(null);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalRows,
    state: { pagination, sorting, globalFilter, isLoading: loading },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    layoutMode: "grid",
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
      sx: { "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } },
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
          onClick={() =>
            handleExportRows(table.getSelectedRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
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
        {!showAddSoftware && (
          <Button
            className="Global-Button4"
            sx={{ marginRight: "16px" }}
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedSoftwareId(null);
              setShowAddSoftware(true);
            }}
          >
            Add Software
          </Button>
        )}
      </Box>

      {showAddSoftware ? (
        <SoftwareName
          onBack={(refresh = false) => {
            setShowAddSoftware(false);
            setSelectedSoftwareId(null);
            if (refresh) {
              fetchData({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sorting,
                globalFilter,
              });
            }
          }}
          softwareId={selectedSoftwareId}
        />
      ) : (
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "1050px",
              xl: "1300px",
            },
            overflow: "auto",
            mx: "auto",
            px: { xs: 1, sm: 2 },
          }}
        >
          <MaterialReactTable table={table} />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the software{" "}
            <strong>{softwareToDelete?.name}</strong>? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="Global-Button3"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSoftware}
            autoFocus
            className="Global-Button6"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
          <Dialog open={logModalOpen} onClose={() => setLogModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Logs for {selectedLogSoftware?.name}</DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">No logs found</TableCell></TableRow>
                ) : (
                  logs.map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{log.user?.name || '-'}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.actionDetails}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SoftwareNameList;
