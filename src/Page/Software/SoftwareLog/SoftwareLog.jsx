import React, { useState, useEffect, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const SoftwareLog = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  //  Fetch data from backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const sortField = sorting[0]?.id || "createdAt";
        const sortOrder = sorting[0]?.desc ? "desc" : "asc";

        const response = await axios.get(
          `${baseUrl}/software/logs?page=${pagination.pageIndex + 1
          }&limit=${pagination.pageSize}&sortOrder=${sortOrder}&sortField=${sortField}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.status) {
          const logs = response.data.data.data || [];
          setData(logs);
          setAllData(logs); //  fix: store only array, not whole response
          setTotalRows(response.data.data.total || 0);
          setTotalPages(response.data.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching software logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [pagination, sorting]);

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("uuid", { header: "UUID", size: 120 }),
    columnHelper.accessor("action", { header: "Action", size: 120 }),
    columnHelper.accessor("actionDetails", {
      header: "Action Details",
      size: 200,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("user.name", {
      header: "User Name",
      size: 120,
      cell: (info) => info.row.original.user?.name || "N/A",
    }),
    columnHelper.accessor("software.name", {
      header: "Software Name",
      size: 150,
      cell: (info) => info.row.original.software?.name || "N/A",
    }),
    columnHelper.accessor("software.LicenseType", {
      header: "License Type",
      size: 150,
      Cell: ({ row }) =>
        row.original.software?.LicenseType
          ? row.original.software.LicenseType
          : "N/A",
    }),
    columnHelper.accessor("software.IssueDate", {
      header: "Issue Date",
      size: 150,
      Cell: ({ row }) =>
        row.original.software?.IssueDate
          ? dateTimeHelper.formatDate(row.original.software.IssueDate, "DD/MM/YYYY")
          : "N/A",
    }),

    columnHelper.accessor("software.ExpiryDate", {
      header: "Expiry Date",
      size: 150,
      Cell: ({ row }) =>
        row.original.software?.ExpiryDate
          ? dateTimeHelper.formatDate(row.original.software.ExpiryDate, "DD/MM/YYYY")
          : "N/A",
    }),
  ];

  //  client-side global filter
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter((item) =>
      Object.values(item).some((value) => {
        if (value === null || value === undefined) return false;

        if (typeof value === "number") {
          return value.toString().includes(globalFilter);
        }

        if (typeof value === "string") {
          return (
            value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter)
          );
        }

        return false;
      })
    );
  }, [allData, globalFilter]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(filteredData); //  export filtered data
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredData, //  use filtered data
    manualFiltering: false, //  client-side filtering only
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
    enableColumnResizing: false,
    enableColumnFilters: false,
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
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

  return (
    <Box>
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

export default SoftwareLog;
