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
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewIcon from "../../assets/TicketImages/Group.png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../Api";
import TicketAdd from "./actions/TicketAdd";
import TicketServiceCheck from "./actions/TicketServiceCheck";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const TicketServiceList = () => {
  const [tickets, setTickets] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); 
  const [isFiltering, setIsFiltering] = useState(false); 
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTickets = useCallback(async () => {
    try {
    
      if (globalFilter) {
        setIsFiltering(true);
      } else {
        setIsLoading(true);
      }

      const page = pagination.pageIndex + 1;
      const res = await axios.get(`${baseUrl}/tickets`, {
        params: {
          page,
          limit: pagination.pageSize,
          search: globalFilter,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.status) {
        setTickets(res.data.data.data);
        setTotalCount(res.data.data.total);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch tickets",
        severity: "error",
      });
    } finally {
      setIsFiltering(false);
      setIsLoading(false);
    }
  }, [pagination, globalFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const columns = [
    columnHelper.accessor("uuid", {
      header: "Ticket Id",
      size: 50,
    }),
    columnHelper.accessor("subjectLine", {
      header: "Subject Line",
      size: 80,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("createdBy.name", {
      header: "Raised By",
      size: 50,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 80,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          size="small"
          sx={{
            borderRadius: 2,
            background:
              cell.getValue() !== "Closed"
                ? "rgba(40, 167, 69, 0.1)"
                : "rgba(255, 0, 0, 0.1)",
            color: cell.getValue() !== "Closed" ? "#28A745" : "#FF0000",
            fontSize: "12px",
          }}
        />
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 50,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.display({
      id: "views",
      size: 40,
      header: "View",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleViewTicket(row.original)}
          >
            <img src={ViewIcon} alt="view" />
          </IconButton>
        </Box>
      ),
    }),
  ];

  const handleViewTicket = (ticket) => {
    setEditingTicket(ticket);
    setShowServiceForm(true);
  };

  const handleOperationSuccess = () => {
    fetchTickets();
  };


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
    const csv = generateCsv(csvConfig)(tickets);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: tickets,
    rowCount: totalCount,
    manualPagination: true,
    state: {
      pagination,
      globalFilter,
      isLoading: isLoading || isFiltering, 
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    globalFilterFn: "contains",
    initialState: { showGlobalFilter: true },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,
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
    renderBottomToolbarCustomActions: () => (
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {totalCount}
      </Typography>
    ),
  });


  if (showAddForm) {
    return (
      <TicketAdd
        onBack={() => {
          setShowAddForm(false);
          setEditingTicket(null);
        }}
        onSuccess={() => {
          handleOperationSuccess();
          setShowAddForm(false);
        }}
        editingTicket={editingTicket}
      />
    );
  }


  if (showServiceForm) {
    return (
      <TicketServiceCheck
        ticketId={editingTicket?.id}
        onBack={() => {
          setShowServiceForm(false);
          setEditingTicket(null);
        }}
        onSuccess={handleOperationSuccess}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>

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

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TicketServiceList;
