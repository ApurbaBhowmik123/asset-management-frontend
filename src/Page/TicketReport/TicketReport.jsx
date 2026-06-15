import React, { useEffect, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  Stack,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useNavigate } from "react-router-dom";
import useInputStyle from "../../CustomHooks/useInputStyle";
import { baseUrl } from "../Api";
import axios from "axios";
import { CustomTextField } from "../../utils/CustomTextField";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const TicketStatus = {
  Open: "Open",
  ReOpen: "ReOpen",
  "Support Engineer Assigned": "Support Engineer Assigned",
  Resolved: "Resolved",
  Closed: "Closed",

};


const Priority = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

const TicketReport = () => {
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unitId, setUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [cost, setCost] = useState(null);
  const navigate = useNavigate();

  const { textFieldStyles, inputLabelStyle, datePickerStyles } = useInputStyle();
  const costRanges = [
    "0-2000",
    "2000-4000",
    "4000-6000",
    "6000-8000",
    "8000-10000",
    "10000-12000",
    "12000-14000",
    "14000-16000",
    "16000-20000",
    "20000-30000",
    "30000-40000",
    "40000-50000",
  ];

  const columns = [
    columnHelper.accessor("uuid", { header: "Ticket ID", size: 120 }),
    columnHelper.accessor("subjectLine", { header: "Subject", size: 200 }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        return status || '-';
      }
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      size: 100,
      Cell: ({ cell }) => {
        const priorityValue = cell.getValue();
        return priorityValue || '-';
      }
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString()
    }),
    columnHelper.accessor("completedAt", {
      header: "Completed At",
      size: 120,
      Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : '-'
    }),
    columnHelper.accessor("ratings", {
      header: "Rating",
      size: 100,
      Cell: ({ cell }) => {
        const rating = cell.getValue();
        return rating ? `${rating}/5` : '-';
      }
    }),
    columnHelper.accessor("reviews", {
      header: "Review",
      size: 150,
      Cell: ({ cell }) => {
        const review = cell.getValue();
        return review || '-';
      }
    }),
    columnHelper.accessor("createdBy.name", {
      header: "Created By",
      size: 120
    }),
    columnHelper.accessor("supportEngineer.name", {
      header: "Support Engineer",
      size: 150,
      Cell: ({ cell }) => {
        const engineer = cell.getValue();
        return engineer || '-';
      }
    }),
    columnHelper.accessor("cost", {
      header: "Costs",
      size: 100,
      Cell: ({ cell }) => {
        const cost = cell.getValue();
        return cost || '-';
      }

    }),

  ];
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("profile"));
      if (userData?.data?.role) {
        setUserRole(userData.data.role);
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
    }
  }, []);

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
      isLoading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px" },
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
        <Button onClick={() => { const csv = generateCsv(csvConfig)(data); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export All Data
        </Button>
        <Button onClick={() => { const rowData = table.getPrePaginationRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export All Rows
        </Button>
        <Button onClick={() => { const rowData = table.getRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export Page Rows
        </Button>
        <Button disabled={!(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())} onClick={() => { const rowData = table.getSelectedRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button5">
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...(globalFilter && { search: globalFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(ticketStatus && { status: ticketStatus }),
        ...(priority && { priority }),
        ...(cost && { cost }),
        ...(unitId && { unitId }),
        ...(sorting.length > 0 && {
          sortBy: sorting[0].id,
          sortOrder: sorting[0].desc ? "desc" : "asc"
        }),
      };

      const response = await axios.get(`${baseUrl}/tickets/reports`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setData(response.data.data.data);
        setRowCount(response.data.data.total);
      } else {
        console.error("Failed to fetch tickets:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setTicketStatus("");
    setPriority("");
    setCost(null);
    setGlobalFilter("");
    setPagination({ pageIndex: 0, pageSize: 5 });
    setSorting([]);
    setData([]);
    setRowCount(0);
  };
  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/super-admin/units`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setUnits(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);



  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" mb={1}>Ticket Report</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 0, borderRadius: 2, boxShadow: "none", height: "calc(100vh - 150px)", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, pb: 2, position: "sticky", top: 0, backgroundColor: "white", zIndex: 2, borderBottom: "1px solid #e0e0e0" }}>
              <Grid container alignItems="center" justifyContent="space-between" >
                <Grid item>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#4A4A4A" }}>FILTER SECTION</Typography>
                </Grid>

              </Grid>
            </Box>
            <Box sx={{ p: 3, pt: 0, flex: 1, overflowY: "auto" }}>
              <Stack spacing={1}>
                <InputLabel variant="caption" sx={inputLabelStyle}>Start Date</InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>End Date</InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Ticket Status</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {Object.entries(TicketStatus).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>SLA</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {Object.entries(Priority).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                  ))}
                </CustomTextField>

                {userRole === "Super Admin" && (
                  <>
                    <InputLabel variant="caption" sx={inputLabelStyle}>
                      Unit
                    </InputLabel>
                    <CustomTextField
                      select
                      fullWidth
                      size="small"
                    
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                    >
                      <MenuItem value="">Select Unit</MenuItem>
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </>
                )}

                <InputLabel variant="caption">Cost</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                  sx={textFieldStyles}

                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                >
                  <MenuItem value="">Select Cost Range</MenuItem>
                  {costRanges.map((range, index) => (
                    <MenuItem key={index} value={range}>
                      {range}
                    </MenuItem>
                  ))}
                </CustomTextField>


              </Stack>
            </Box>
            <Box sx={{ p: 3, position: "sticky", bottom: 0, backgroundColor: "white", zIndex: 2, borderTop: "1px solid #e0e0e0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button className="Global-Button3" onClick={handleReset}>Cancel</Button>
                <Button className="Global-Button2" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Submit'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, md: 9 }}>
          <Box sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "790px",
              xl: "1400px"
            },
            overflow: "auto",
            mx: "auto",
            px: { xs: 1, sm: 2 }
          }}>
            <MaterialReactTable table={table} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketReport;