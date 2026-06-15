import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Log = () => {
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
  const navigate = useNavigate();
  const logDetails = useParams();
  const { id } = logDetails;

  const columnHelper = createMRTColumnHelper();
  const columns = [
    // columnHelper.accessor("transactionId", {
    //   header: "Transaction ID",
    //   size: 150,
    // }),
    columnHelper.accessor("transactionId", {
      header: "Transaction ID",
      size: 280,
      Cell: ({ row }) => {
        const transactionLink = row.original.transactionlink;
        return (
          <a
            href={transactionLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1976d2",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {row.original.transactionId?.slice(0, 12)}
          </a>
        );
      },
    }),

    columnHelper.accessor("transactionType", {
      header: "Action",
      size: 180,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {cell.getValue() || "-"}
        </div>
      ),
    }),

    columnHelper.accessor("transactionDate", {
      header: "Date",
      size: 150,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("createdByUser.name", {
      header: "User",
      size: 150,
    }),
    columnHelper.accessor("cost", {
      header: "Cost",
      size: 80,
    }),
    columnHelper.accessor("logReportDetails", {
      header: "Details",
      size: 250,
      Cell: ({ cell }) => (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {cell.getValue() || "-"}
        </div>
      ),
    }),
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

  const handleFetchLogDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/gr/logs/list/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const resData = await res?.json();

      if (!resData?.status) {
        setData([]);
        setLoading(false);
        return;
      }

      setData(resData.data || []);
      setTotalRows(resData.data?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error("error", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLogDetails();
  }, []);

  const handleGoBackAllAssetList = () => {
    navigate("/assetstatus/all-asset");
  };

  const calculateGrandTotal = () => {
    return data?.reduce((total, item) => {
      return total + (item.cost || 0);
    }, 0);
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
    renderBottomToolbar: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="body2" fontWeight={"bold"}>
          Grand Total : ₹{calculateGrandTotal()}
        </Typography>
      </Box>
    ),
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <Box onClick={handleGoBackAllAssetList}>
          <ArrowBackIcon />
        </Box>
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

export default Log;
