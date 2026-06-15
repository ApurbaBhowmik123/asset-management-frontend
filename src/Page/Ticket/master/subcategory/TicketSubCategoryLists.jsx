import React, { useState, useEffect, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  TextField,
  MenuItem,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Editicon1 from "../../../../assets/EmployeeImages/Vector.png";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../../../Api";
import { TicketSubcategoryForm } from "./TicketSubCategoryForm";

const columnHelper = createMRTColumnHelper();

export const TicketSubcategoryList = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchSubcategories = useCallback(async () => {
    try {
      const page = pagination.pageIndex + 1;
      const res = await axios.get(`${baseUrl}/tickets/master/subcategories`, {
        params: {
          page,
          limit: pagination.pageSize,
          search: globalFilter,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.status) {
        setSubcategories(res.data.data);
        setTotalCount(res.data.total);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch subcategories",
        severity: "error",
      });
    }
  }, [pagination, globalFilter]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${baseUrl}/tickets/master/category`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.status) {
        setCategories(res.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [fetchSubcategories]);

  const handleDeleteSubcategory = async () => {
    try {
      const response = await axios.delete(
        `${baseUrl}/tickets/master/subcategories/${subcategoryToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.status) {
        setSubcategories((prev) =>
          prev.filter((s) => s.id !== subcategoryToDelete.id)
        );
        setSnackbar({
          open: true,
          message: "Subcategory deleted successfully",
          severity: "success",
        });
      } else {
        throw new Error(
          response.data.message || "Failed to delete subcategory"
        );
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete subcategory",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubcategoryToDelete(null);
    }
  };

  const handleOperationSuccess = () => {
    fetchSubcategories();
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const columns = [
    columnHelper.accessor("category.name", {
      header: "Category",
      size: 80,
    }),
    columnHelper.accessor("name", {
      header: "Subcategory Name",
      size: 80,
    }),

    columnHelper.display({
      id: "actions",
      size: 40,
      header: "Actions",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setEditingSubcategory(row.original);
              setShowEditForm(true);
            }}
          >
            <img src={Editicon1} alt="edit" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setSubcategoryToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            {/* <DeleteIcon /> */}
          </IconButton>
        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(subcategories);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: subcategories,
    rowCount: totalCount,
    manualPagination: true,
    state: { pagination, globalFilter },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
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
      sx: { width: "100%", overflowX: "auto" },
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
    // renderBottomToolbarCustomActions: () => (
    //   <Typography
    //     variant="body2"
    //     sx={{ ml: 2, fontWeight: 500 }}
    //   >
    //     Total Rows: {totalCount}
    //   </Typography>
    // ),
  });

  if (showAddForm || showEditForm) {
    return (
      <TicketSubcategoryForm
        subcategory={editingSubcategory}
        categories={categories}
        onBack={() => {
          setShowAddForm(false);
          setShowEditForm(false);
          setEditingSubcategory(null);
        }}
        onSuccess={handleOperationSuccess}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete subcategory "
            {subcategoryToDelete?.name}"?
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
            onClick={handleDeleteSubcategory}
            className="Global-Button6"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          className="Global-Button4"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
        >
          Add Subcategory
        </Button>
      </Box>

      <MaterialReactTable table={table} />
    </Box>
  );
};
