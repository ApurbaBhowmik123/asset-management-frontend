import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import DepartmentAdd from "./DepartmentAdd";
import axios from "axios";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const token = localStorage.getItem("token");

const columnHelper = createMRTColumnHelper();

const DepartmentList = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("uuid", { header: "ID", size: 50 }),
      columnHelper.accessor("name", {
        header: "Name",
        size: 150,
        Cell: ({ cell }) => (
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {cell.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        size: 100,
        Cell: ({ cell }) =>
          dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        size: 100,
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
          const status = cell.getValue();
          const isActive = status === true || status === "Active";
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
              size="small"
              onClick={() => handleEditDepartment(row.original)}
            >
              <img src={Editicon1} alt="edit" width={16} height={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row.original)}
            >
              {/* <img src={Deleteicon1} alt="delete" width={16} height={16} /> */}
            </IconButton>
          </Box>
        ),
      }),
    ],
    []
  );

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "departments_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });
  const fetchDepartments = useCallback(async () => {
    try {
      const sort = sorting[0];
      const filters = columnFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {});

      const response = await axios.get(`${baseUrl}/super-admin/departments`, {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          sortBy: sort?.id || "name",
          sortOrder: sort?.desc ? "desc" : "asc",
          ...filters,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(response.data.data.data);
      setRowCount(response.data.data.total);
    } catch (error) {
      console.error("Failed to fetch departments", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch departments",
        severity: "error",
      });
    }
  }, [pagination, globalFilter, sorting, columnFilters]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowAddDepartment(true);
  };

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    try {
      const response = await axios.delete(
        `${baseUrl}/super-admin/departments/delete/${departmentToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbar({
        open: true,
        message: response.data.message || "Department deleted",
        severity: response.data.status ? "success" : "error",
      });

      fetchDepartments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting department",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateDepartment = async (departmentData) => {
    try {
      const response = await axios.put(
        `${baseUrl}/super-admin/departments/update/${editingDepartment.id}`,
        {
          name: departmentData.departmentName,
          description: departmentData.description,
          updatedBy: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message || response.data.errorResponse.message,
        severity: response.data.status ? "success" : "error",
      });

      fetchDepartments();
      return { success: response.data.status };
    } catch (error) {
      setSnackbar({
        open: true,
        message: response.data.errorResponse.message,
        severity: response.data.status ? "success" : "error",
      });
      return { success: false };
    }
  };

  const flattenDepartmentData = (department) => {
    return {
      id: department.uuid,
      name: department.name,
      createdAt: dateTimeHelper.formatDate(department.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(department.updatedAt, "DD/MM/YYYY"),
      createdBy: department.createdUser?.name || "-",
      status: department.status ? "Active" : "Inactive",
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => flattenDepartmentData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error",
      });
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map((department) =>
        flattenDepartmentData(department)
      );
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: false, // 👈 disables filter by column
    enableRowSelection: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
    muiTableBodyCellProps: { sx: { fontSize: "12px", whiteSpace: "nowrap" } },
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
        Total Rows: {rowCount}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the department "
            {departmentToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="Global-Button3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDepartment}
            autoFocus
            className="Global-Button6"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {!showAddDepartment && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingDepartment(null);
              setShowAddDepartment(true);
            }}
          >
            Add Department
          </Button>
        )}
      </Box>

      {showAddDepartment ? (
        <DepartmentAdd
          onBack={() => {
            setShowAddDepartment(false);
            setEditingDepartment(null);
          }}
          onSuccess={fetchDepartments}
          editingDepartment={editingDepartment}
          onUpdate={handleUpdateDepartment}
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
    </Box>
  );
};

export default DepartmentList;
