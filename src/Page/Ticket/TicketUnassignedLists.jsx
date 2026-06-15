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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress, 
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewIcon from "../../assets/TicketImages/Group.png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const TicketUnAssignedLists = () => {
  const [tickets, setTickets] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [priority, setPriority] = useState("");
  const [assigning, setAssigning] = useState(false); 

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const page = pagination.pageIndex + 1;
      const res = await axios.get(`${baseUrl}/tickets/unassigned-tickets`, {
        params: { page, limit: pagination.pageSize, search: globalFilter },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.status) {
        setTickets(res.data.data.data);
        setTotalCount(res.data.data.total);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to fetch tickets", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [pagination, globalFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setPriority(ticket.priority || "Medium");
    setViewDialogOpen(true);
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleSelfAssign = async () => {
    if (!selectedTicket) return;
    try {
      setAssigning(true);
      await axios.put(
        `${baseUrl}/tickets/${selectedTicket.id}/self-assign`,
        { priority, remarks: "Self-assigned from UI" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSnackbar({
        open: true,
        message: "Ticket assigned to you successfully",
        severity: "success",
      });
      setViewDialogOpen(false);
      fetchTickets();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to self-assign ticket",
        severity: "error",
      });
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    columnHelper.accessor("uuid", { header: "Ticket Id", size: 50 }),
    columnHelper.accessor("subjectLine", {
      header: "Subject Line",
      size: 80,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("createdBy.name", { header: "Raised By", size: 50 }),
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
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.display({
      id: "views",
      size: 40,
      header: "View",
      Cell: ({ row }) => (
        <IconButton color="primary" size="small" onClick={() => handleViewTicket(row.original)}>
          <img src={ViewIcon} alt="view" />
        </IconButton>
      ),
    }),
  ];

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
    state: { pagination, globalFilter, isLoading },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
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
        <Button onClick={handleExportData} startIcon={<FileDownloadIcon />} className="Global-Button4">
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
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
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

  return (
    <Box sx={{ width: "100%" }}>
      {/* Ticket Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <>
              <Typography variant="body2"><strong>Ticket ID:</strong> {selectedTicket.uuid}</Typography>
              <Typography variant="body2"><strong>Subject:</strong> {selectedTicket.subjectLine}</Typography>
              <Typography variant="body2"><strong>Raised By:</strong> {selectedTicket.createdBy?.name}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}><strong>Status:</strong> {selectedTicket.status}</Typography>

              {/* Priority Dropdown */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={priority} label="Priority" onChange={handlePriorityChange}>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSelfAssign}
            className="Global-Button6"
            disabled={assigning}
            startIcon={assigning ? <CircularProgress size={18} color="inherit" /> : null} 
          >
            {assigning ? "Assigning..." : "Self Assign"}
          </Button>
          <Button onClick={() => setViewDialogOpen(false)} className="Global-Button3">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

export default TicketUnAssignedLists;
