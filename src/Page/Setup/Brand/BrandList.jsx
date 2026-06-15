import React, { useState, useEffect, useCallback } from "react";
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
import axios from "axios";
import { mkConfig, generateCsv, download } from "export-to-csv";
import BrandAdd from "./BrandAdd";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem("token");

  const columns = [
    columnHelper.accessor("uuid", {
      header: "ID",
      size: 60,
    }),
    columnHelper.accessor("name", {
      header: "Brand",
      size: 80,
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
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Active" : "Inactive"}
          color="success"
          size="small"
          sx={{
            borderRadius: 2,
            background: "rgba(40, 167, 69, 0.1)",
            color: "#28A745",
            fontSize: "12px",
          }}
        />
      ),
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
            onClick={() => handleEditBrand(row.original)}
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
    filename:
      "brands_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const fetchBrands = useCallback(async () => {
    try {
      const sortBy = sorting.length > 0 ? sorting[0].id : "name";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const searchQuery = globalFilter || "";

      const response = await axios.get(`${baseUrl}/super-admin/brands`, {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sortBy,
          sortOrder,
          search: searchQuery,
          // You can extend this to pass specific columnFilters if needed
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = response.data.data;
      setBrands(resData.data);
      setTotalCount(resData.total);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setShowAddBrand(true);
  };

  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/super-admin/brands/delete/${brandToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Brand deleted successfully!",
          severity: "success",
        });
        fetchBrands();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to delete brand",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error deleting brand",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateBrand = async (brandData) => {
    try {
      const response = await axios.put(
        `${baseUrl}/super-admin/brands/update/${editingBrand.id}`,
        {
          name: brandData.brandName,
          status: brandData.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        fetchBrands();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: "Failed to update brand" };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error updating brand",
      };
    }
  };

  const flattenBrandData = (brand) => {
    return {
      id: brand.uuid,
      name: brand.name,
      createdAt: dateTimeHelper.formatDate(brand.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(brand.updatedAt, "DD/MM/YYYY"),
      createdBy: brand.createdUser?.name || "-",
      status: brand.status ? "Active" : "Inactive",
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => flattenBrandData(row.original));
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
      const rowData = brands.map((brand) => flattenBrandData(brand));
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const table = useMaterialReactTable({
    columns,
    data: brands,
    rowCount: totalCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    manualGlobalFilter: true,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false, // 👈 disables filter by column
    paginationDisplayMode: "pages",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: "#FFE3E1",
      },
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
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {totalCount}
      </Typography>
    ),
  });

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowAddBrand(true);
  };

  const handleBackFromAdd = () => {
    setShowAddBrand(false);
    setEditingBrand(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the brand "{brandToDelete?.name}"?
            This action cannot be undone.
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
            onClick={handleDeleteBrand}
            className="Global-Button6"
            autoFocus
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
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {!showAddBrand && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            onClick={handleAddBrand}
          >
            Add Brands
          </Button>
        )}
      </Box>

      {showAddBrand ? (
        <BrandAdd
          onBack={handleBackFromAdd}
          onSuccess={fetchBrands}
          editingBrand={editingBrand}
          onUpdate={handleUpdateBrand}
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

export default BrandList;
