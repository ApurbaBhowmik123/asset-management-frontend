import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button, Divider, IconButton } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { baseUrl } from "../Api";
import handIcon from "../../assets/DashboardImages/homework.png";
import { useNavigate } from "react-router-dom";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";
// ===== CSV Utilities =====
const csvConfig = {
  filename: "transfer_list.csv",
  delimiter: ",",
};

const generateCsv = (config) => (rows) => {
  if (!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(config.delimiter),
    ...rows.map((row) =>
      headers
        .map((field) => JSON.stringify(row[field] ?? ""))
        .join(config.delimiter)
    ),
  ];
  return csvRows.join("\n");
};

const download = (config) => (csv) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", config.filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ===== Main Component =====
const TransferList = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState({});
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role"); // "superadmin" | "unitadmin"
  const unitId = localStorage.getItem("unitId"); // for unitadmin
  const sourceId = localStorage.getItem("sourceUnitId");
  const destinationId = localStorage.getItem("destinationUnitId");

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("inventoryProductDetails.uuid", {
      header: "Asset ID",
      size: 120,
      cell: (info) => info.row.original?.inventoryProductDetails?.uuid || "-",
    }),
    columnHelper.accessor("transferId", {
      header: "Transfer ID",
      size: 120,
      cell: (info) => info.row.original?.transferId,
    }),
    columnHelper.accessor(
      "inventoryProductDetails.grInventoryProduct.product.name",
      {
        header: "Product Name",
        size: 150,
        cell: (info) =>
          info.row.original?.inventoryProductDetails?.grInventoryProduct
            ?.product?.name || "-",
      }
    ),
    columnHelper.accessor("status", { header: "Status", size: 100 }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() =>
              navigate(`/transfer/transfer/${row.original.transferId}`)
            }
          >
            <img
              src={handIcon}
              style={{ height: 20, width: 20 }}
              alt="Handover"
            />
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("sourceUnit.name", {
      header: "Source Unit",
      size: 100,
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("sourceUnitLocation.name", {
      header: "Source Location",
      size: 150,
      cell: (info) => info.row.original?.sourceUnitLocation?.name || "-",
    }),
    columnHelper.accessor("destinationUnit.name", {
      header: "Destination Unit",
      size: 150,
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("destinationUnitLocation.name", {
      header: "Destination Location",
      size: 150,
      cell: (info) => info.row.original?.destinationUnitLocation?.name || "-",
    }),
    columnHelper.accessor("createdByUser.name", {
      header: "Created By",
      size: 150,
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("approver.name", {
      header: "Approved By",
      size: 150,
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("transferDate", {
      header: "Transfer Date",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
  ];

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const sort = sorting[0] || { id: "createdAt", desc: true };

      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        // search: globalFilter,
        sortBy: sort.id,
        sortOrder: sort.desc ? "desc" : "asc",
      };

      // role-based filtering
      if (userRole !== "superadmin") {
        if (unitId) params.unitId = unitId;
        if (sourceId) params.sourceUnitId = sourceId;
        if (destinationId) params.destinationUnitId = destinationId;
      }

      const res = await axios.get(`${baseUrl}/asset-transfer/accept/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === true && Array.isArray(res.data.data.data)) {
        setData(res.data.data.data);
        setAllData(res.data.data.data); // Store all data for client-side filtering
        setTotalRows(res.data.data.total || 0);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        setData([]);
        setTotalRows(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching transfer list:", err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter((item) => {
      return Object.keys(item).some((key) => {
        const value = item[key];

        // Skip null/undefined values
        if (value === null || value === undefined) return false;

        // Handle number values
        if (typeof value === "number") {
          return value.toString().includes(globalFilter);
        }

        // Handle string values
        if (typeof value === "string") {
          return (
            value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter)
          );
        }

        // Handle nested object values
        if (typeof value === "object") {
          const stringValue = JSON.stringify(value).toLowerCase();
          return stringValue.includes(lowercasedFilter);
        }

        return false;
      });
    });
  }, [allData, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [pagination, sorting]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = (exportData) => {
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  const productListTable = useMaterialReactTable({
    columns,
    data: filteredData,
    manualFiltering: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
      rowSelection: selectedRows,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRows,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnFilters: false, // 👈 disables filter by column
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],
    },
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
          onClick={() => handleExportData(data)}
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

  return (
    <div>
      <Box mt={2}>
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "1040px",
              xl: "1300px",
            },
            mx: "auto",
            px: { xs: 1, sm: 2 },
          }}
        >
          <MaterialReactTable table={productListTable} />
        </Box>
      </Box>
    </div>
  );
};

export default TransferList;
