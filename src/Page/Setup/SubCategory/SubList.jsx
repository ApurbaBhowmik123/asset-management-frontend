import React, { useEffect, useState, useCallback } from "react";
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
import AddSub from "./AddSub";
import { baseUrl } from "../../Api";
import axios from "axios";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const token = localStorage.getItem('token');

const columnHelper = createMRTColumnHelper();

const SubList = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = [
    columnHelper.accessor('uuid', {
      header: 'ID',
      size: 50,
    }),
    columnHelper.accessor("name", {
      header: "Subcategory Name",
      size: 80,
    }),
    columnHelper.accessor("abbriviatedName", { header: "Abbr Name", size: 120 }),
    columnHelper.accessor("category.name", {
      header: "Category Name",
      size: 80,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 60,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 60,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("createdUser.name", {
      header: "Created By",
      size: 100,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 40,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditSubcategory(row.original)}
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
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename: 'subcategories_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
  });

  const fetchData = useCallback(async ({ pageIndex, pageSize, sorting, globalFilter }) => {
    setLoading(true);
    const sort = sorting?.[0] || { id: "name", desc: false };
    const searchQuery = globalFilter ? `&search=${globalFilter}` : "";

    const url = `${baseUrl}/catalog/subcategories?page=${pageIndex + 1}&limit=${pageSize}&sortBy=${sort.id}&sortOrder=${sort.desc ? "desc" : "asc"}${searchQuery}`;



    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.status) {
        setData(result.data.data || []);
        setTotalRows(result.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch subcategories",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  }, [pagination, sorting, globalFilter, fetchData]);

  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory({
      ...subcategory,

      specFieldIds: subcategory.subcategorySpecFields?.map(
        (field) => field.specField.id
      ) || [],
    });
    setShowSubCategory(true);
  };

  const handleDeleteClick = (subcategory) => {
    setSubcategoryToDelete(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubcategory = async () => {
    if (!subcategoryToDelete) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/catalog/subcategories/${subcategoryToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        setSnackbar({
          open: true,
          message: "Subcategory deleted successfully!",
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
          message: response.data?.message || "Failed to delete subcategory",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting subcategory",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateSubcategory = async (subcategoryData) => {
    try {
      const response = await axios.put(
        `${baseUrl}/catalog/subcategories/${editingSubcategory.id}`,
        subcategoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.status) {
        setSnackbar({
          open: true,
          message: response.data.message || "Subcategory updated successfully!",
          severity: "success",
        });
        return { success: true };
      } else {
        setSnackbar({
          open: true,
          message: response.data?.message || "Failed to update subcategory",
          severity: "error",
        });
        return { success: false };
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating subcategory",
        severity: "error",
      });
      return { success: false };
    }
  };
  const flattenSubcategoryData = (subcategory) => {
    return {
      id: subcategory.uuid,
      name: subcategory.name,
      category: subcategory.category?.name || '-',
      createdAt: dateTimeHelper.formatDate(subcategory.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(subcategory.updatedAt, "DD/MM/YYYY"),
      createdBy: subcategory.createdUser?.name || '-'
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map(row => flattenSubcategoryData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error"
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch all data for export
      const response = await axios.get(`${baseUrl}/catalog/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: totalRows }
      });

      if (response.data?.status) {
        const rowData = response.data.data.data.map(flattenSubcategoryData);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
      }
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export all data",
        severity: "error"
      });
    }
  };

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    setShowSubCategory(true);
  };

  const handleBackFromAdd = () => {
    setShowSubCategory(false);
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalRows,
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    paginationDisplayMode: "pages",
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
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
        <Button onClick={handleExportData} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export All Data
        </Button>
        <Button onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export All Rows
        </Button>
        <Button onClick={() => handleExportRows(table.getRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export Page Rows
        </Button>
        <Button
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    loading,
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the subcategory "{subcategoryToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} className="Global-Button3">Cancel</Button>
          <Button
            onClick={handleDeleteSubcategory}
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
        {!showSubCategory && (
          <Button className="Global-Button4" sx={{ marginRight: "16px" }} startIcon={<AddIcon />} onClick={handleAddSubcategory}>
            Add Subcategory
          </Button>
        )}
      </Box>

      {showSubCategory ? (
        <AddSub
          onBack={handleBackFromAdd}
          onSuccess={() => {
            fetchData({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
              sorting,
              globalFilter,
            });
          }}
          editingSubcategory={editingSubcategory}
          onUpdate={handleUpdateSubcategory}
        />
      ) : (
        <Box sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1050px",
            xl: "1400px"
          },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 }
        }}>
          <MaterialReactTable table={table} />
        </Box>
      )}
    </Box>
  );
};

export default SubList;