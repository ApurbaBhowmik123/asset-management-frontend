import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";
import CreateRole from "./CreateRole";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Editicon1 from "../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const RoleList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const columnHelper = createMRTColumnHelper();
  const navigate = useNavigate()

  const handleGetRoleListId = (details) => {
    navigate(`/role/${details?.id}`)
  }

  const columns = [
    columnHelper.accessor("name", { header: "Role Name", size: 200 }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 200,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("slug", { header: "Slug", size: 200 }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 200,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    // Action Column
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 120,
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            onClick={() => {
              handleGetRoleListId(row.original)
              setEditingRole(row.original);
              setShowCreateRole(true);
            }}
          >
             <img src={Editicon1} alt="edit" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              setDeleteRoleId(row.original.id);
              setDeleteDialogOpen(true);
            }}
          >
            <img src={Deleteicon1} alt="delete" /> 
          </IconButton>
        </Box>
      ),
    }),
  ];

  // Fetch API data
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const sortBy = sorting[0]?.id || "updatedAt";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const response = await fetch(
        `${baseUrl}/super-admin/acl/role?page=${pagination.pageIndex + 1
        }&limit=${pagination.pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${globalFilter || ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result?.data?.data) {
        setData(result.data.data);
        setTotalRows(result.data.total || result.data.data.length);
        setTotalPages(
          Math.ceil(
            (result.data.total || result.data.data.length) /
            pagination.pageSize
          )
        );
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setSnackbar({ open: true, message: "Error fetching roles", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [pagination, sorting, globalFilter]);

  // Handle Update API
  const handleUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${baseUrl}/super-admin/acl/role/${editingRole.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.status) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.errorResponse.message };
      }
    } catch (error) {
      console.error("Update Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${baseUrl}/super-admin/acl/role/${deleteRoleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.status) {
        setSnackbar({ open: true, message: "Role deleted successfully!", severity: "success" });
        // Refresh the data
        fetchRoles();
      } else {
        setSnackbar({ open: true, message: response.data?.message || "Failed to delete role", severity: "error" });
      }
    } catch (error) {
      console.error("Delete Error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Something went wrong.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteRoleId(null);
    }
  };

  // Export Functions
  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: { globalFilter, pagination, sorting, isLoading: loading },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: { rowsPerPageOptions: [5, 10, 20, 50] },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
    muiTableBodyCellProps: { sx: { fontSize: "12px", whiteSpace: "nowrap" } },
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
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  // Conditional Rendering
  if (showCreateRole) {
    return (
      <CreateRole
        onBack={() => {
          setShowCreateRole(false);
          setEditingRole(null);
        }}
        onSuccess={() => {
          setShowCreateRole(false);
          setEditingRole(null);
          // refresh list after create/update
          fetchRoles();
        }}
        editingRole={editingRole}
        onUpdate={handleUpdate}
      />
    );
  }
  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this role? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} className="Global-Button3">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} className="Global-Button6" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="flex-end" mb={2} px={{ xs: 1, sm: 2 }}>
        <Button
          className="Global-Button4"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRole(null);
            setShowCreateRole(true);
          }}
        >
          Add Role
        </Button>
      </Box>

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
    </Box>
  );
};

export default RoleList;


