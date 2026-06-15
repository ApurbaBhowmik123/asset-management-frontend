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
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../assets/EmployeeImages/Vector.png";
import ViewIcon from "../../assets/TicketImages/Group.png";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import axios from "axios";
import { baseUrl } from "../Api";
import TicketAdd from "./actions/TicketAdd";
import TicketAssign from "./actions/TicketAssign";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  const fetchTickets = useCallback(async () => {
    try {
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
      size: 50,
    }),
    columnHelper.accessor("createdBy.name", {
      header: "Raised By",
      size: 50,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 50,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          size="small"
          sx={{
            borderRadius: 2,
            background: cell.getValue() != "Closed"
              ? "rgba(40, 167, 69, 0.1)"
              : "rgba(255, 0, 0, 0.1)",
            color: cell.getValue() != "Closed" ? "#28A745" : "#FF0000",
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
      id: "AssignSuport",
      size: 40,
      header: "Assign Suport",
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleViewTicket(row.original)}
          >
            <img src={ViewIcon} alt="Assign Support" />
          </IconButton>
        </Box>
      ),
    }),
  ];

  const handleViewTicket = (ticket) => {
    setEditingTicket(ticket);
    setShowEditForm(true);
  };



  const handleOperationSuccess = () => {
    fetchTickets();
    setSnackbar({
      open: true,
      message: "Operation completed successfully",
      severity: "success",
    });
  };

  // EXPORT csv functionality
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
    state: { pagination, globalFilter },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    	 enableColumnFilters: false,   // 👈 disables filter by column
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
        Total Rows: {totalCount}
      </Typography>
    ),
  });

  // Show Add Form
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

  // Show Assign Form
  if (showEditForm) {
    return (
      <TicketAssign
        ticketId={editingTicket?.id}
        onBack={() => {
          setShowEditForm(false);
          setEditingTicket(null);
        }}
        onSuccess={handleOperationSuccess}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>


      {/* Snackbar */}
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {/* <Button
          className="Global-Button4"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTicket(null);
            setShowAddForm(true);
          }}
        >
          Add Ticket
        </Button> */}
      </Box>

      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TicketList;