import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  useTheme,
  IconButton
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import Icon1 from "../../assets/DashboardImages/Group 223.png"
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RecentTickets from './RecentTickets';
import ProductUsageCharts from './ProductUsageChart';
import SummaryCards from './SummaryCards';
import { useNavigate } from "react-router-dom";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";

import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from '../Api';
import { TotalProducts } from './TotalProducts';
import { LastMonthTickets } from './LastMonthTickets';



const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Dashboard = () => {
  const theme = useTheme();

  const profile = JSON.parse(localStorage.getItem("profile"));
  const role = profile?.data?.role;

  const [employeesData, setEmployeesData] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesGlobalFilter, setEmployeesGlobalFilter] = useState("");
  const [employeesPagination, setEmployeesPagination] = useState({ pageIndex: 0, pageSize: 5});
  const [employeesSorting, setEmployeesSorting] = useState([]);
  const [employeesTotalRows, setEmployeesTotalRows] = useState(0);
  const [employeesTotalPages, setEmployeesTotalPages] = useState(0);
  const [employeesSelectedRows, setEmployeesSelectedRows] = useState([]);
  const navigate = useNavigate();
  const handleViewAllClick = () => {
    navigate("/setup/employee/activeemp");
  };


  const fetchEmployees = async () => {
    setEmployeesLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const params = new URLSearchParams();

      params.append('page', employeesPagination.pageIndex + 1);
      params.append('limit', employeesPagination.pageSize);

      if (employeesSorting.length > 0) {
        const sort = employeesSorting[0];
        params.append('sortBy', sort.id);
        params.append('sortOrder', sort.desc ? 'desc' : 'asc');
      }


      if (employeesGlobalFilter) {
        params.append('search', employeesGlobalFilter);
      }

      const response = await fetch(`${baseUrl}/super-admin/acl/user?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();


      const transformedData = data.data.data.map(employee => ({
        name: employee.name || 'N/A',
        email: employee.email || 'N/A',
        phone: employee.mobile ? `${employee.mobile_prefix || ''} ${employee.mobile}` : 'N/A',
        designation: employee.designation || 'N/A',
        status: employee.status ? 'Active' : 'Inactive'
      }));

      setEmployeesData(transformedData);
      setEmployeesTotalRows(data.data.total || 0);
      setEmployeesTotalPages(data.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeesData([]);
      setEmployeesTotalRows(0);
      setEmployeesTotalPages(0);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [employeesPagination, employeesSorting, employeesGlobalFilter]);



  const employeesColumnHelper = createMRTColumnHelper();



  const employeesColumns = [
    employeesColumnHelper.accessor("name", { header: "Name", size: 110 }),
    employeesColumnHelper.accessor("email", { header: "Email", size: 120 }),
    employeesColumnHelper.accessor("phone", { header: "Phone", size: 100 }),
    employeesColumnHelper.accessor("designation", { header: "Designation", size: 100 }),
    employeesColumnHelper.accessor("status", {
      header: "Status",
      size: 80,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        return (
          <Chip
            label={status}
            color={status === 'Active' ? 'success' : 'error'}
            size="small"
            sx={{
              backgroundColor: status === 'Active' ? '#d4edda' : '#f8d7da',
              color: status === 'Active' ? '#155724' : '#721c24',
              fontWeight: 500,
              borderRadius: 2
            }}
          />
        );
      },
    }),
  ];

  // Export functions

  const handleExportEmployeesData = () => {
    const csv = generateCsv(csvConfig)(employeesData);
    download(csvConfig)(csv);
  };


  const handleExportEmployeesRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };



  const employeesTable = useMaterialReactTable({
    columns: employeesColumns,
    data: employeesData,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: employeesTotalRows,
    pageCount: employeesTotalPages,
    state: {
      globalFilter: employeesGlobalFilter,
      pagination: employeesPagination,
      sorting: employeesSorting,
      isLoading: employeesLoading,
      rowSelection: employeesSelectedRows,
    },
    onGlobalFilterChange: setEmployeesGlobalFilter,
    onPaginationChange: setEmployeesPagination,
    onSortingChange: setEmployeesSorting,
    onRowSelectionChange: setEmployeesSelectedRows,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSelectAll: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20],
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
    renderBottomToolbarCustomActions: () => (
    <Typography
      variant="body2"
      sx={{ ml: 2, fontWeight: 500 }}
    >
      Total Rows: {employeesTotalRows}
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
            onClick={handleExportEmployeesData}
            startIcon={<FileDownloadIcon />}
            className="Global-Button4"
            size="small"
          >
            Export All Data
          </Button>
          <Button
            onClick={() =>
              handleExportEmployeesRows(table.getPrePaginationRowModel().rows)
            }
            startIcon={<FileDownloadIcon />}
            className="Global-Button4"
            size="small"
          >
            Export All Rows
          </Button>
          <Button
            onClick={() => handleExportEmployeesRows(table.getRowModel().rows)}
            startIcon={<FileDownloadIcon />}
            className="Global-Button4"
            size="small"
          >
            Export Page Rows
          </Button>
          {selectedRows.length > 0 && (
            <Button
              onClick={() => handleExportEmployeesRows(selectedRows)}
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

  // return (
  //   <Box sx={{ minHeight: '100vh' }}>

  //     <SummaryCards />

  //     <TotalProducts />
  //     <ProductUsageCharts />

  //     <RecentTickets />
  //     {/* {role === "Support Engineer" && <RecentTickets />} */}


  //     <Card sx={{ mt: 4 }}>
  //       <CardContent>
  //         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
  //           <Typography variant="h6" display="flex" alignItems="center">
  //             <img src={Icon1} alt="icon" style={{ width: 20, height: 20, marginRight: 8, marginLeft: 20 }} />
  //             Employees
  //           </Typography>
  //           <Button
  //             sx={{ marginRight: 3 }}
  //             variant="contained"
  //             className="Global-Button"
  //             size="small"
  //             onClick={handleViewAllClick}
  //           >
  //             View All
  //           </Button>
  //         </Box>

  //         <Box sx={{
  //           width: {
  //             xs: "100%",
  //             sm: "100%",
  //             md: "100%",
  //             lg: "1010px",
  //             xl: "1400px"
  //           },
  //           overflow: "auto",
  //           mx: "auto",
  //           px: { xs: 1, sm: 2 }
  //         }}>
  //           <MaterialReactTable table={employeesTable} />
  //         </Box>
  //       </CardContent>
  //     </Card>


  //   </Box>
  // );
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {role === "Support Engineer" || role === "Support Admin" ? (
        // Support Engineer dashboard
        <>
          <LastMonthTickets />
          {/* <RecentTickets /> */}
        </>
      ) : (
        // Everyone else (Super Admin, etc.)
        <>
          <SummaryCards />
          <TotalProducts />
          <ProductUsageCharts />

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <img src={Icon1} alt="icon" style={{ width: 20, height: 20, marginRight: 8, marginLeft: 20 }} />
                  Employees
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
                width: { xs: "100%", sm: "100%", md: "100%", lg: "1010px", xl: "1400px" },
                overflow: "auto",
                mx: "auto",
                px: { xs: 1, sm: 2 }
              }}>
                <MaterialReactTable table={employeesTable} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* RecentTickets visible to all (or you can customize) */}

      <RecentTickets />
    </Box>
  );

};

export default Dashboard;