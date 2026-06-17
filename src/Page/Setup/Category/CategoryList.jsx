import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import { mkConfig, generateCsv, download } from "export-to-csv";
import CategoryAdd from "./CategoryAdd";
import axios from "axios";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const token = localStorage.getItem("token");

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename:
    "categories_export_" +
    new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
});

const CategoryList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("uuid", {
        header: "ID",
        size: 50,
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        size: 120,
      }),
      columnHelper.accessor("assetType", {
        header: "Asset Type",
        size: 100,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              label={val === "DIGITAL" ? "Digital" : "Physical"}
              size="small"
              sx={{
                borderRadius: 2,
                backgroundColor: val === "DIGITAL" ? "rgba(103, 58, 183, 0.1)" : "rgba(33, 150, 243, 0.1)",
                color: val === "DIGITAL" ? "#673AB7" : "#2196F3",
                fontSize: "12px",
              }}
            />
          );
        },
      }),
      columnHelper.accessor("trackingType", {
        header: "Tracking",
        size: 110,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              label={val === "TRACKABLE" ? "Trackable" : "Non-Trackable"}
              size="small"
              sx={{
                borderRadius: 2,
                backgroundColor: val === "TRACKABLE" ? "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
                color: val === "TRACKABLE" ? "#4CAF50" : "#FF9800",
                fontSize: "12px",
              }}
            />
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
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
        size: 80,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          const isActive = status === true;
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
              onClick={() => handleEditCategory(row.original)}
            >
              <img src={Editicon1} alt="edit" width={16} height={16} />
            </IconButton>
            <IconButton
              color="error"
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

  const fetchData = useCallback(
    async ({ pageIndex, pageSize, sorting, globalFilter }) => {
      try {
        const response = await axios.get(`${baseUrl}/catalog/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageIndex + 1,
            limit: pageSize,
            sortBy: sorting?.[0]?.id || "name",
            sortOrder: sorting?.[0]?.desc ? "desc" : "asc",
            search: globalFilter || "",
          },
        });

        if (response.data.status) {
          setData(response.data.data.data);
          setTotalCount(response.data.data.total);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch categories",
          severity: "error",
        });
        setData([]);
        setTotalCount(0);
      }
    },
    []
  );

  useEffect(() => {
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  }, [fetchData, pagination, sorting, globalFilter]);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowAddCategory(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || !categoryToDelete.id) {
      setSnackbar({
        open: true,
        message: "Invalid category selected. Cannot delete.",
        severity: "error",
      });
      setDeleteDialogOpen(false);
      return;
    }

    try {
      const response = await axios.delete(
        `${baseUrl}/catalog/categories/${categoryToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Category deleted successfully!",
          severity: "success",
        });
        fetchData({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          globalFilter,
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to delete category",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting category",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      const response = await axios.put(
        `${baseUrl}/catalog/categories/${editingCategory.id}`,
        {
          name: categoryData.brandName,
          status: categoryData.status,
          description: categoryData.description || "",
          assetType: categoryData.assetType,
          trackingType: categoryData.trackingType,
          abbriviatedName: categoryData.abbriviatedName,
          maintainanceFrequency: categoryData.maintainanceFrequency,
          specFieldIds: categoryData.specFieldIds || [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: response.data.message || "Category updated successfully!",
          severity: "success",
        });
        return { success: true };
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to update category",
          severity: "error",
        });
        return { success: false };
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating category",
        severity: "error",
      });
      return { success: false };
    }
  };

  const flattenCategoryData = (category) => {
    return {
      id: category.uuid,
      name: category.name,
      createdAt: dateTimeHelper.formatDate(category.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(category.updatedAt, "DD/MM/YYYY"),
      createdBy: category.createdUser?.name || "-",
      status: category.status ? "Active" : "Inactive",
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => flattenCategoryData(row.original));
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
      const rowData = data.map((category) => flattenCategoryData(category));
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

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalCount,
    manualPagination: true,
    manualSorting: true,
    state: { globalFilter, pagination, sorting },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);
      fetchData({
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
        sorting,
        globalFilter,
      });
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      fetchData({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting: newSorting,
        globalFilter,
      });
    },
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false, // 👈 disables filter by column
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
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
        Total Rows: {totalCount}
      </Typography>
    ),
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowAddCategory(true);
  };

  const handleBackFromAdd = useCallback(() => {
    setShowAddCategory(false);
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  }, [fetchData, pagination, sorting, globalFilter]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"? This action cannot be undone.
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
            onClick={handleDeleteCategory}
            className="Global-Button6"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

      {showAddCategory ? (
        <CategoryAdd
          onBack={handleBackFromAdd}
          editingCategory={editingCategory}
          onUpdate={handleUpdateCategory}
        />
      ) : (
        <>
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
            <Button
              className="Global-Button4"
              startIcon={<AddIcon />}
              onClick={handleAddCategory}
            >
              Add Asset Reference
            </Button>
          </Box>
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
        </>
      )}
    </Box>
  );
};

export default CategoryList;
