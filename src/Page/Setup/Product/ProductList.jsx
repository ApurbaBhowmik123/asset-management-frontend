import React, { useState, useEffect } from "react";
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
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AddProduct from "./AddProduct";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const token = localStorage.getItem("token");

const apiService = {
  fetchProducts: async (
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortOrder: sortOrder,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
      });

      const response = await fetch(`${baseUrl}/catalog/products?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await fetch(`${baseUrl}/catalog/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

const columnHelper = createMRTColumnHelper();

const ProductList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const transformApiData = (apiData) => {
    // Add null check for apiData
    if (!apiData || !Array.isArray(apiData)) {
      console.warn("Invalid API data received:", apiData);
      return [];
    }

    return apiData
      .map((item) => {
        // Add null check for each item
        if (!item) {
          console.warn("Null item found in API data");
          return null;
        }

        return {
          id: item.id || "",
          uuid: item.uuid || "",
          productName: item.name || "N/A",
          brand: item.brand?.name || "N/A",
          category: item.category?.name || "N/A",
          subcategory: item.subcategory?.name || "N/A",
          sku: item.sku || "N/A",
          serialNo: item.serialNo || "N/A",
          costPrice: parseFloat(item.costPrice || 0),
          description: item.description || "N/A",
          purchaseDate: item.purchaseDate || "N/A",
          warrantyTill: item.warrantyTill || "N/A",
          status: item.status || "N/A",
          createdAt: item.createdAt || "N/A",
          updatedAt: item.updatedAt || null,
          createdBy: item.createdUser?.name || "System",
          originalData: item,
        };
      })
      .filter((item) => item !== null); // Remove any null items
  };

  const fetchData = async (
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.fetchProducts(
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );

      // Enhanced response validation
      if (!response) {
        throw new Error("No response received from API");
      }

      if (!response.status) {
        throw new Error("API response indicates failure");
      }

      // Multiple checks for data structure
      let productsData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          // Case 1: response.data is directly an array
          productsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Case 2: response.data.data is an array
          productsData = response.data.data;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          // Case 3: response.data.products is an array
          productsData = response.data.products;
        } else {
          console.warn("Unexpected data structure:", response.data);
          productsData = [];
        }
      }

      const transformedData = transformApiData(productsData);
      setData(transformedData);

      // Set pagination info with fallbacks
      setTotalRows(
        response.data?.total || response.total || transformedData.length || 0
      );
      setTotalPages(
        response.data?.totalPages ||
        response.totalPages ||
        Math.ceil((response.data?.total || transformedData.length) / limit) ||
        1
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch products");
      setData([]);
      setTotalRows(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      await apiService.deleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });

      // Get current sort parameters
      const sortBy =
        sorting.length > 0 ? getBackendFieldName(sorting[0].id) : "";
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "asc";

      await fetchData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        globalFilter,
        sortBy,
        sortOrder
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete product",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleEditProduct = (productId) => {
    setEditingProductId(productId);
    setShowProductForm(true);
  };

  // Map frontend column names to backend field names
  const getBackendFieldName = (columnId) => {
    const fieldMapping = {
      uuid: "uuid",
      productName: "name", // Map productName to name field in backend
      brand: "brand.name",
      category: "category.name",
      subcategory: "subcategory.name",
      createdBy: "createdUser.name",
      costPrice: "costPrice",
      sku: "sku",
      serialNo: "serialNo",
      status: "status",
      createdAt: "createdAt",
      purchaseDate: "purchaseDate",
      warrantyTill: "warrantyTill",
    };
    return fieldMapping[columnId] || columnId;
  };

  // Effect for handling pagination, search, and sorting changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const sortBy =
        sorting.length > 0 ? getBackendFieldName(sorting[0].id) : "";
      const sortOrder =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "asc";

      fetchData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        globalFilter,
        sortBy,
        sortOrder
      );
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  const columns = [
    columnHelper.accessor("uuid", {
      header: "ID",
      size: 60,
      enableSorting: true,
    }),
    columnHelper.accessor("productName", {
      header: "Product Name",
      size: 120,
      enableSorting: true,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      size: 120,
      enableSorting: true,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 120,
      enableSorting: true,
    }),
    columnHelper.accessor("subcategory", {
      header: "Subcategory",
      size: 150,
      enableSorting: true,
    }),
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
    columnHelper.accessor("createdBy", {
      header: "Created By",
      size: 120,
      enableSorting: true,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 80,
      enableSorting: false,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditProduct(row.original.id)}
            disabled={loading}
          >
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(row.original.id)}
            disabled={loading}
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
      "products_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const flattenProductData = (product) => {
    return {
      ID: product.uuid || "",
      Name: product.productName || "N/A",
      Brand: product.brand || "N/A",
      Category: product.category || "N/A",
      Subcategory: product.subcategory || "N/A",
      Description: product.description || "N/A",
      "Created At": dateTimeHelper.formatDate(product.createdAt, "DD/MM/YYYY"),
      "Updated At": product.updatedAt
        ? dateTimeHelper.formatDate(product.updatedAt, "DD/MM/YYYY")
        : "N/A",
      "Created By": product.createdBy || "System",
    };
  };

  const handleExportRows = (rows) => {
    try {
      if (!rows || !Array.isArray(rows)) {
        throw new Error("Invalid rows data for export");
      }

      const rowData = rows.map((row) => flattenProductData(row.original));
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

  const handleExportData = async () => {
    try {
      // Fetch all data for complete export
      const response = await apiService.fetchProducts(
        1, // First page
        totalRows, // All rows
        globalFilter, // Current search filter
        sorting.length > 0 ? getBackendFieldName(sorting[0].id) : "", // Current sort field
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "asc" // Current sort order
      );

      if (!response?.status) {
        throw new Error("Failed to fetch data for export");
      }

      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.data) {
        productsData = response.data.data;
      }

      const rowData = transformApiData(productsData).map(flattenProductData);
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to export all data",
        severity: "error",
      });
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data || [], // Ensure data is never undefined
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableSorting: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false, // 👈 disables filter by column
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalRows,
    pageCount: totalPages,
    // Enable backend sorting
    sortDescFirst: false,
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
          disabled={loading || !data || data.length === 0}
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={loading || !data || data.length === 0}
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={loading || !data || data.length === 0}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            loading ||
            (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected())
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

  const handleAddProduct = () => {
    setEditingProductId(null);
    setShowProductForm(true);
  };

  const handleBackFromForm = (message, severity = "success") => {
    setShowProductForm(false);
    setEditingProductId(null);

    if (message) {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    }

    // Refresh data with current filters and sorting
    const sortBy = sorting.length > 0 ? getBackendFieldName(sorting[0].id) : "";
    const sortOrder =
      sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "asc";
    fetchData(
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      sortBy,
      sortOrder
    );
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        {!showProductForm && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            disabled={loading}
            sx={{ marginRight: "16px" }}
          >
            Add Asset Reference
          </Button>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Product Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {showProductForm ? (
        <AddProduct onBack={handleBackFromForm} productId={editingProductId} />
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

export default ProductList;
