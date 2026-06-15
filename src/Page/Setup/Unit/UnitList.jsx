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
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AddUnit from "./AddUnit";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const UnitList = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);

  const token = localStorage.getItem("token");

  const columns = [
    columnHelper.accessor("identificationNumber", { header: "ID", size: 80 }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("abbriviatedName", {
      header: "Abbr Name",
      size: 120,
    }),
    columnHelper.accessor("address.city", { header: "City", size: 60 }),
    columnHelper.accessor("address.state", { header: "State", size: 70 }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("createdUser.name", {
      header: "Created By",
      size: 100,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const isActive = cell.getValue();
        return (
          <Chip
            label={isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              borderRadius: 2,
              backgroundColor: isActive
                ? "rgba(40, 167, 69, 0.1)"
                : "rgba(220, 53, 69, 0.1)",
              color: isActive ? "#28A745" : "#DC3545",
              fontSize: "12px",
            }}
          />
        );
      },
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
              setSelectedUnitId(row.original.id);
              setShowAddVendor(true);
            }}
          >
            <img src={Editicon1} alt="edit" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setUnitToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            {/* <img src={Deleteicon1} alt="delete" /> */}
          </IconButton>
        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "units_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const flattenUnitData = (unit) => {
    return {
      id: unit.identificationNumber,
      name: unit.name,
      city: unit.address?.city || "N/A",
      state: unit.address?.state || "N/A",
      createdAt: dateTimeHelper.formatDate(unit.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(unit.updatedAt, "DD/MM/YYYY"),
      createdBy: unit.createdUser?.name || "N/A",
      status: unit.status ? "Active" : "Inactive",
    };
  };

  const fetchData = useCallback(
    async ({ pageIndex, pageSize, sorting, globalFilter }) => {
      setLoading(true);
      const sort = sorting?.[0] || { id: "name", desc: false };

      try {
        const response = await axios.get(`${baseUrl}/super-admin/units`, {
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
      const rowData = rows.map((row) => flattenUnitData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map((unit) => flattenUnitData(unit));
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

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    try {
      setLoading(true);
      const response = await axios.delete(
        `${baseUrl}/super-admin/units/delete/${unitToDelete.id}`,
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
        "Failed to delete unit. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalRows,
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false, // 👈 disables filter by column
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
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
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
    loading,
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
        {!showAddVendor && (
          <Button
            className="Global-Button4"
            sx={{ marginRight: "16px" }}
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUnitId(null);
              setShowAddVendor(true);
            }}
          >
            Add Business Unit
          </Button>
        )}
      </Box>

      {showAddVendor ? (
        <AddUnit
          onBack={(refresh = false) => {
            setShowAddVendor(false);
            setSelectedUnitId(null);
            if (refresh) {
              fetchData({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sorting,
                globalFilter,
              });
            }
          }}
          unitId={selectedUnitId}
        />
      ) : (
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "1050px",
              xl: "1400px",
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
            Are you sure you want to delete the unit{" "}
            <strong>{unitToDelete?.name}</strong>? This action cannot be undone.
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
            onClick={handleDeleteUnit}
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
    </Box>
  );
};

export default UnitList;
