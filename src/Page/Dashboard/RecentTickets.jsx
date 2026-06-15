import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import Icon4 from "../../assets/DashboardImages/Group 225.png";
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { baseUrl } from '../Api';
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable
} from 'material-react-table';
import { mkConfig, generateCsv, download } from "export-to-csv";

// CSV export configuration
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const RecentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate("/ticketservice/ticketlist");
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Status Chip Component
  const StatusChip = ({ status }) => {
    switch (status) {
      case 'Support Assigned':
        return <Chip label={status} color="success" variant="outlined" sx={{ borderRadius: 2 }} />;
      case 'Product In Repair':
      case 'Product Replaced':
        return <Chip label={status} color="primary" variant="outlined" sx={{ borderRadius: 2 }} />;
      case 'Open':
        return <Chip label={status} color="error" variant="outlined" sx={{ borderRadius: 2 }} />;
      default:
        return <Chip label={status} />;
    }
  };

  // Priority Chip Component
  const PriorityChip = ({ priority }) => {
    switch (priority) {
      case 'High':
        return <Chip label="High" color="error" variant="outlined" sx={{ borderRadius: 2 }} />;
      case 'Medium':
        return <Chip label="Medium" sx={{ backgroundColor: '#ffe0b2', color: '#ef6c00', borderRadius: 2 }} />;
      case 'Low':
        return <Chip label="Low" color="success" variant="outlined" sx={{ borderRadius: 2 }} />;
      default:
        return <Chip label={priority} />;
    }
  };

  // Fetch tickets from API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const params = new URLSearchParams();
      params.append('page', pagination.pageIndex + 1);
      params.append('limit', pagination.pageSize);

      if (sorting.length > 0) {
        const sort = sorting[0];
        params.append('sortBy', sort.id);
        params.append('sortOrder', sort.desc ? 'desc' : 'asc');
      }

      if (globalFilter) {
        params.append('search', globalFilter);
      }

      const response = await fetch(
        `${baseUrl}/tickets?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();

      const transformedData = data.data.data.map(ticket => ({
        id: ticket.uuid,
        subject: ticket.subjectLine,
        status: ticket.status,
        priority: ticket.priority || 'N/A',
        created: formatDate(ticket.createdAt),
        raisedBy: ticket.createdBy?.name || 'N/A'
      }));

      setTickets(transformedData);
      setTotalTickets(data.data.total || 0);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
      setTotalTickets(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [pagination, sorting, globalFilter]);

  // Export functions
  const handleExportAllData = () => {
    const csv = generateCsv(csvConfig)(tickets);
    download(csvConfig)(csv);
  };

  const handleExportRows = (rows) => {
    const rowData = rows.map(row => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  // Define columns
  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.display({
      id: 'index',
      header: 'Ticket Id',
      size: 50,
      Cell: ({ row }) => (pagination.pageIndex * pagination.pageSize) + row.index + 1,
    }),
    columnHelper.accessor("subject", {
      header: "Subject",
      size: 200,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => <StatusChip status={cell.getValue()} />,
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      size: 100,
      Cell: ({ cell }) => <PriorityChip priority={cell.getValue()} />,
    }),
    columnHelper.accessor("created", {
      header: "Created",
      size: 150
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 80,
      Cell: ({ row }) => (
        <IconButton color="error" size="small">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    }),
  ];

  // Create table instance
const table = useMaterialReactTable({
  columns,
  data: tickets,
  manualFiltering: true,
  manualPagination: true,
  manualSorting: true,
  rowCount: totalTickets,
  pageCount: Math.ceil(totalTickets / pagination.pageSize),
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
  enableRowSelection: true,
  enableMultiRowSelection: true,
  enableColumnActions: false,
  enableColumnFilters: false,
  enableDensityToggle: false,
  enableFullScreenToggle: false,
  enableHiding: false,
  enableGlobalFilter: true,
  paginationDisplayMode: 'pages',
  muiPaginationProps: {
    rowsPerPageOptions: [3, 5, 10],
    showFirstButton: true,
    showLastButton: true,
  },
  muiTablePaperProps: {
    elevation: 0,
    sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
  },
  muiTableHeadRowProps: {
    sx: { backgroundColor: "#fdeaea" },
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
    sx: { width: "100%", overflowX: "auto" },
  },
   muiBottomToolbarProps: {
    sx: {
      display: 'flex',
      justifyContent: 'space-between', // This will push items to both ends
      alignItems: 'center',
      '& .MuiTablePagination-toolbar': {
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }
    }
  },
  // Add this section for total rows display
  renderBottomToolbarCustomActions: () => (
    <Typography
      variant="body2"
      sx={{ ml: 2, fontWeight: 500 }}
    >
      Total Rows: {totalTickets}
    </Typography>
  ),
  renderTopToolbarCustomActions: ({ table }) => {
    const selectedRows = table.getSelectedRowModel().rows;
    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        {selectedRows.length > 0 && (
          <Typography variant="body2" color="primary" sx={{ mr: 2 }}>
            {selectedRows.length} row(s) selected
          </Typography>
        )}
        <Button
          onClick={handleExportAllData}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          size="small"
        >
          Export All Data
        </Button>
        <Button
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          size="small"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          size="small"
        >
          Export Page Rows
        </Button>
        {selectedRows.length > 0 && (
          <Button
            onClick={() => handleExportRows(selectedRows)}
            startIcon={<FileDownloadIcon />}
            className="Global-Button4"
            size="small"
            variant="contained"
            color="secondary"
          >
            Export Selected ({selectedRows.length})
          </Button>
        )}
      </Box>
    );
  },
});

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center">
            <img src={Icon4} alt="icon" style={{ width: 20, height: 20, marginRight: 8, marginLeft: 20 }} />
            Recent Tickets
          </Typography>
          <Button
            sx={{ marginRight: 3 }}
            variant="contained"
            className="Global-Button"
            size="small"
            onClick={handleViewAllClick}
          >
            View All
          </Button>
        </Box>

        <Box sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1010px",
            xl: "1400px"
          },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 }
        }}>
          <MaterialReactTable table={table} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentTickets;