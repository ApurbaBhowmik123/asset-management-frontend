import React, { useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../Api";

const AssignProductList = ({ onBack, unitId }) => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  const columnHelper = createMRTColumnHelper();

  // ---- Unassign API Call ----
  const unassignAssets = async (inventoryProductIds, assignmentIds) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/asset-mng/asset-unassign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryProductIds,
          assignmentIds,
        }),
      });
      if (!res.ok) throw new Error("Failed to unassign asset(s)");
      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Single Row Unassign ----
  const handleUnassign = (row) => {
    const inventoryProductId = row.inventoryProductDetail?.id;
    const assignmentId = row.assignedId;
    if (!inventoryProductId || !assignmentId) {
      console.error("Missing inventoryProductId or assignmentId for unassign.");
      return;
    }
    unassignAssets([inventoryProductId], [assignmentId]);
  };

  // ---- Bulk Unassign ----
  const handleBulkUnassign = (selectedRows) => {
    if (selectedRows.length === 0) return;
    // if (!window.confirm("Are you sure you want to unassign selected assets?"))
    // return;

    const inventoryProductIds = selectedRows
      .map((row) => row.original.inventoryProductDetail?.id)
      .filter(Boolean);

    const assignmentIds = selectedRows
      .map((row) => row.original.assignedId)
      .filter(Boolean);

    if (inventoryProductIds.length === 0 || assignmentIds.length === 0) {
      console.error("Missing IDs for bulk unassign.");
      return;
    }

    unassignAssets(inventoryProductIds, assignmentIds);
  };

  // ---- Table Columns ----
  const columns = [
    columnHelper.accessor("inventoryProductDetail.uuid", {
      header: "Asset Code",
      size: 120,
    }),
    columnHelper.accessor("inventoryProductDetail.serialNo1", {
      header: "Serial No",
      size: 120,
    }),
    columnHelper.accessor(
      "inventoryProductDetail.grInventoryProduct.product.name",
      {
        header: "Product Name",
        size: 200,
      }
    ),
    columnHelper.accessor(
      "inventoryProductDetail.grInventoryProduct.product.brand.name",
      {
        header: "Brand",
        size: 120,
      }
    ),
    columnHelper.accessor(
      "inventoryProductDetail.grInventoryProduct.product.category.name",
      {
        header: "Category",
        size: 120,
      }
    ),
    columnHelper.accessor(
      "inventoryProductDetail.grInventoryProduct.product.subcategory.name",
      {
        header: "Subcategory",
        size: 140,
      }
    ),
    columnHelper.accessor("assignedToUser.name", {
      header: "Assigned To",
      size: 140,
    }),
    columnHelper.accessor("assignedToUser.email", {
      header: "Email",
      size: 150,
    }),
    columnHelper.accessor("assignedToUser.designation", {
      header: "Designation",
      size: 140,
    }),
    columnHelper.accessor("assignedToUser.status", {
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue() ? "Active" : "Inactive";
        return (
          <Chip
            label={status}
            size="small"
            sx={{
              borderRadius: 2,
              backgroundColor:
                status === "Active"
                  ? "rgba(40, 167, 69, 0.1)"
                  : "rgba(220, 53, 69, 0.1)",
              color: status === "Active" ? "#28A745" : "#DC3545",
            }}
          />
        );
      },
    }),
    // columnHelper.display({
    //   id: "actions",
    //   header: "Actions",
    //   size: 100,
    //   Cell: ({ row }) => (
    //     <Button
    //       size="small"
    //       color="error"
    //       variant="outlined"
    //       onClick={() => handleUnassign(row.original)}
    //     >
    //       Unassign
    //     </Button>
    //   ),
    // }),
  ];

  // ---- CSV Config ----
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

  // ---- Fetch Data with Pagination, Sorting, Search ----
  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    const page = pagination.pageIndex + 1;
    const limit = pagination.pageSize;
    const sortBy = sorting[0]?.id || "name";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";
    const search = globalFilter || "";

    const url = `${baseUrl}/asset-mng/asset-unassign/${unitId}?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&search=${encodeURIComponent(
      search
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch asset list");
      const json = await res.json();
      setData(json.data?.data || []);
      setRowCount(json.data?.total || 0);
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [unitId, pagination, sorting, globalFilter]);

  // ---- Table Config ----
  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    manualPagination: true, // now server-side pagination
    manualSorting: true, // now server-side sorting
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

    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      return (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            onClick={() =>
              handleExportRows(table.getPrePaginationRowModel().rows)
            }
            className="Global-Button4"
          >
            Export All Rows
          </Button>
          <Button
            onClick={() => handleExportRows(table.getRowModel().rows)}
            className="Global-Button4"
          >
            Export Page Rows
          </Button>
          <Button
            disabled={!table.getIsSomeRowsSelected()}
            onClick={() => handleExportRows(selectedRows)}
            className="Global-Button5"
          >
            Export Selected Rows
          </Button>
          {selectedRows.length > 0 && (
            <Button
              color="error"
              variant="contained"
              onClick={() => handleBulkUnassign(selectedRows)}
            >
              Unassign Selected
            </Button>
          )}
        </Box>
      );
    },
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Back Button */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={onBack}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h6">Assigned Product List</Typography>
      </Box>

      {/* Table */}
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
    </Box>
  );
};

export default AssignProductList;
