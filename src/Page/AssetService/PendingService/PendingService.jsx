import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const PendingService = () => {
  const [data, setData] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const { pageIndex, pageSize } = pagination;
        const page = pageIndex + 1; // MRT uses 0-based index, API uses 1-based

        // Build sorting params
        let sortBy = "";
        let sortOrder = "";
        if (sorting.length > 0) {
          sortBy = sorting[0].id;
          sortOrder = sorting[0].desc ? "desc" : "asc";
        }

        // Build API URL
        let url = `${baseUrl}/asset-service/pending-service/list?page=${page}&limit=${pageSize}`;
        if (sortBy) {
          url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        }
        if (globalFilter) {
          url += `&search=${globalFilter}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        if (result.status) {
          // Transform the data to match the table structure
          const transformedData = result.data.data.map((item) => ({
            id: item.id,
            uuid: item.uuid,
            serialNo1: item.serialNo1,
            assignedStatus: item.assignedStatus,
            createdAt: item.createdAt,
            maintenanceDueDate: item.maintenanceDueDate,
            productName: item.grInventoryProduct?.product?.name || "N/A",
            brand: item.grInventoryProduct?.product?.brand?.name || "N/A",
            // category: item.grInventoryProduct?.product?.category?.name || "N/A",
            // subcategory: item.grInventoryProduct?.product?.subcategory?.name || "N/A",

          }));

          setData(transformedData);
          setTotalRows(result.data.total);
          setTotalPages(result.data.totalPages);
        } else {
          console.error("API error:", result.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 120,
      enableSorting: true,
    }),
    columnHelper.accessor("assignedStatus", {
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        // const color = status === "PendingService" ? "#D97706" : "#28A745";
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);

        return (
          <Chip
            // label={status}
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: "#FFF7E6",
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor("serialNo1", {
      header: "Serial Number",
      size: 140,
      enableSorting: true,
    }),
    columnHelper.accessor("productName", {
      header: "Product Name",
      size: 150,
      enableSorting: true,
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      size: 100,
      enableSorting: true,
    }),
    // columnHelper.accessor("category", { 
    //   header: "Category", 
    //   size: 120,
    //   enableSorting: true,
    // }),
    // columnHelper.accessor("subcategory", { 
    //   header: "Subcategory", 
    //   size: 120,
    //   enableSorting: true,
    // }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      enableSorting: true,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("maintenanceDueDate", {
      header: "Maintenance Due",
      size: 160,
      enableSorting: true,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),

    // columnHelper.display({
    //   id: "actions",
    //   header: "Actions",
    //   size: 100,
    //   Cell: () => (
    //     <Box>
    //       <IconButton size="small" color="primary">
    //         <img src={ViewIcon} alt="view" />
    //       </IconButton>
    //     </Box>
    //   ),
    // }),
  ];

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
    enableColumnFilters: false,   // 👈 disables filter by column
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
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
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
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),

  });

  return (
    <Box mt={3}>
   
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

export default PendingService;