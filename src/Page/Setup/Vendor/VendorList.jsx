// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   createMRTColumnHelper,
// } from 'material-react-table';
// import {
//   Box,
//   Button,
//   IconButton,
//   Typography,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import AddIcon from '@mui/icons-material/Add';
// import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
// import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
// import { mkConfig, generateCsv, download } from 'export-to-csv';
// import AddVendor from './AddVendor';
// import { baseUrl } from '../../Api';
// import axios from 'axios';

// const columnHelper = createMRTColumnHelper();

// const VendorList = () => {
//   const [vendors, setVendors] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [showAddVendor, setShowAddVendor] = useState(false);
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 5,
//   });
//   const [totalCount, setTotalCount] = useState(0);
//   const [selectedVendorId, setSelectedVendorId] = useState(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [vendorToDelete, setVendorToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const token = localStorage.getItem('token')? localStorage.getItem('token'): 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMSIsInJvbGUiOltudWxsXX0sImlhdCI6MTc1MzUzNTgyNywiZXhwIjoxNzU2MTI3ODI3fQ.PM9X6CPf3MaktAwu1fnZmX0gWxq5qAdLn0_4PjF-3Ng';

//   const columns = [
//     columnHelper.accessor('uuid', {
//       header: 'ID',
//       size: 10,
//     }),
//     columnHelper.accessor('name', {
//       header: 'Name',
//       size: 100,
//     }),
//     columnHelper.accessor("createdUser.name", {
//       header: "Created By",
//       size: 100,
//     }),
//     columnHelper.accessor('address.city', {
//       header: 'City',
//       size: 100,
//       Cell: ({ row }) => row.original.address?.city || 'N/A',
//     }),
//     columnHelper.accessor('address.state', {
//       header: 'State',
//       size: 100,
//       Cell: ({ row }) => row.original.address?.state || 'N/A',
//     }),
//     columnHelper.accessor('address.country', {
//       header: 'Country',
//       size: 100,
//       Cell: ({ row }) => row.original.address?.country || 'N/A',
//     }),
//     columnHelper.accessor('status', {
//       header: 'Status',
//       size: 70,
//       Cell: ({ cell }) => {
//         const status = cell.getValue();
//         const isActive = status === true;
//         return (
//           <Chip
//             label={isActive ? 'Active' : 'Inactive'}
//             size="small"
//             sx={{
//               borderRadius: 2,
//               backgroundColor: isActive ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
//               color: isActive ? '#28A745' : '#DC3545',
//               fontSize: '12px',
//             }}
//           />
//         );
//       },
//     }),
//     columnHelper.display({
//       id: 'actions',
//       header: 'Actions',
//       size: 50,
//       Cell: ({ row }) => (
//         <Box>
//           <IconButton 
//             color="primary" 
//             size="small"
//             onClick={() => {
//               setSelectedVendorId(row.original.id);
//               setShowAddVendor(true);
//             }}
//           >
//             <img src={Editicon1} alt="edit" width={16} height={16} />
//           </IconButton>
//           <IconButton 
//             color="error" 
//             size="small"
//             onClick={() => {
//               setVendorToDelete(row.original);
//               setDeleteDialogOpen(true);
//             }}
//           >
//             <img src={Deleteicon1} alt="delete" width={16} height={16} />
//           </IconButton>
//         </Box>
//       ),
//     }),
//   ];

//   const csvConfig = mkConfig({
//     fieldSeparator: ',',
//     decimalSeparator: '.',
//     useKeysAsHeaders: true,
//   });

//   const fetchVendors = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${baseUrl}/super-admin/vendors?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&sortBy=name&sortOrder=asc&search=${globalFilter}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const resData = response.data.data;
//       setVendors(resData.data || []);
//       setTotalCount(resData.total || 0);
//     } catch (error) {
//       console.error('Error fetching vendors:', error);
//       showSnackbar("Failed to fetch vendors", "error");
//     }
//   }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

//   useEffect(() => {
//     fetchVendors();
//   }, [fetchVendors]);

//   const handleExportRows = (rows) => {
//     const rowData = rows.map((row) => row.original);
//     const csv = generateCsv(csvConfig)(rowData);
//     download(csvConfig)(csv);
//   };

//   const handleExportData = () => {
//     const csv = generateCsv(csvConfig)(vendors);
//     download(csvConfig)(csv);
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({
//       open: true,
//       message,
//       severity,
//     });
//   };

//   const handleDeleteVendor = async () => {
//     if (!vendorToDelete) return;

//     try {
//       setIsDeleting(true);
//       const response = await axios.delete(
//         `${baseUrl}/super-admin/vendors/delete/${vendorToDelete.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.status) {
//         showSnackbar(response.data.message, "success");
//         fetchVendors();
//       }
//     } catch (error) {
//       console.error('Error deleting vendor:', error);
//       showSnackbar(
//         error?.response?.data?.message || "Failed to delete vendor. Please try again.",
//         "error"
//       );
//     } finally {
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//       setVendorToDelete(null);
//     }
//   };

//   const table = useMaterialReactTable({
//     columns,
//     data: vendors,
//     rowCount: totalCount,
//     manualPagination: true,
//     state: {
//       pagination,
//       globalFilter,
//     },
//     onPaginationChange: setPagination,
//     onGlobalFilterChange: setGlobalFilter,
//     enableGlobalFilter: true,
//     enableRowSelection: true,
//     enableMultiRowSelection: true,
//     paginationDisplayMode: 'pages',
//     positionToolbarAlertBanner: 'bottom',
//     layoutMode: 'grid',
//     muiTablePaperProps: {
//       elevation: 0,
//       sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
//     },
//     muiTableHeadRowProps: {
//       sx: {
//         backgroundColor: '#FFE3E1',
//       },
//     },
//     muiTableBodyCellProps: {
//       sx: {
//         fontSize: '12px',
//         whiteSpace: 'nowrap',
//       },
//     },
//     muiTableBodyRowProps: {
//       sx: {
//         '&:nth-of-type(odd)': {
//           backgroundColor: '#fafafa',
//         },
//       },
//     },
//     muiTableContainerProps: {
//       sx: {
//         width: '100%',
//         overflowX: 'hidden',
//       },
//     },
//     renderTopToolbarCustomActions: ({ table }) => (
//       <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//         <Button
//           onClick={handleExportData}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//         >
//           Export All Data
//         </Button>
//         <Button
//           onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//         >
//           Export All Rows
//         </Button>
//         <Button
//           onClick={() => handleExportRows(table.getRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//         >
//           Export Page Rows
//         </Button>
//         <Button
//           disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
//           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button5"
//         >
//           Export Selected Rows
//         </Button>
//       </Box>
//     ),
//   });

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'flex-end',
//           alignItems: 'center',
//           mb: 2,
//           flexWrap: 'wrap',
//           gap: 2,
//         }}
//       >
//         {!showAddVendor && (
//           <Button
//             className="Global-Button4"
//             startIcon={<AddIcon />}
//             onClick={() => {
//               setSelectedVendorId(null);
//               setShowAddVendor(true);
//             }}
//           >
//             Add Vendors
//           </Button>
//         )}
//       </Box>

//       {showAddVendor ? (
//         <AddVendor 
//           onBack={(refresh = false) => {
//             setShowAddVendor(false);
//             setSelectedVendorId(null);
//             if (refresh) {
//               fetchVendors();
//             }
//           }} 
//           vendorId={selectedVendorId} 
//         />
//       ) : (
//         <MaterialReactTable table={table} />
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">
//           Confirm Delete
//         </DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">
//             Are you sure you want to delete vendor <strong>{vendorToDelete?.name}</strong>? 
//             This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button 
//             onClick={() => setDeleteDialogOpen(false)} 
//             className="Global-Button3"
//             disabled={isDeleting}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleDeleteVendor} 
//             autoFocus
//             className="Global-Button6"
//             disabled={isDeleting}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert 
//           severity={snackbar.severity}
//           variant="filled"
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default VendorList;


import React, { useEffect, useState, useCallback } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from 'export-to-csv';
import AddVendor from './AddVendor';
import { baseUrl } from '../../Api';
import axios from 'axios';
import { dateTimeHelper } from '../../../Helper/DateTimeHelper/DateTimeHelper';

const columnHelper = createMRTColumnHelper();

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem('token') || 'your-hardcoded-fallback-token';

  const columns = [
    columnHelper.accessor('uuid', { header: 'ID', size: 10 }),
    columnHelper.accessor('identificationNumber', { header: 'Identification Number', size: 200 }),
    columnHelper.accessor('name', { header: 'Name', size: 160 }),
    columnHelper.accessor("createdUser.name", { header: "Created By", size: 120 }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 120,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor('address.city', {
      header: 'City',
      size: 100,
      Cell: ({ row }) => row.original.address?.city || 'N/A',
    }),
    columnHelper.accessor('address.state', {
      header: 'State',
      size: 100,
      Cell: ({ row }) => row.original.address?.state || 'N/A',
    }),
    columnHelper.accessor('address.country', {
      header: 'Country',
      size: 100,
      Cell: ({ row }) => row.original.address?.country || 'N/A',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const isActive = status === true;
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              borderRadius: 2,
              backgroundColor: isActive ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
              color: isActive ? '#28A745' : '#DC3545',
              fontSize: '12px',
            }}
          />
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 50,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setSelectedVendorId(row.original.id);
              setShowAddVendor(true);
            }}
          >
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              setVendorToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            {/* <img src={Deleteicon1} alt="delete" width={16} height={16} /> */}
          </IconButton>
        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename: 'vendors_export' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
  });

  const fetchVendors = useCallback(async () => {
    try {
      const sortBy = sorting[0]?.id || 'name';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

      const filters = columnFilters.map(filter => `${filter.id}:${filter.value}`).join(',');

      const response = await axios.get(
        `${baseUrl}/super-admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          sortBy,
          sortOrder,
          filters,
        }
      }
      );

      const resData = response.data.data;
      setVendors(resData.data || []);
      setTotalCount(resData.total || 0);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showSnackbar("Failed to fetch vendors", "error");
    }
  }, [pagination, globalFilter, sorting, columnFilters]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => {
      const original = row.original;
      return {
        uuid: original.uuid,
        identificationNumber: original.identificationNumber,
        name: original.name,
        createdBy: original.createdUser?.name || 'N/A',
        createdAt: dateTimeHelper.formatDate(original.createdAt, "DD/MM/YYYY"),
        updatedAt: dateTimeHelper.formatDate(original.updatedAt, "DD/MM/YYYY"),
        city: original.address?.city || 'N/A',
        state: original.address?.state || 'N/A',
        country: original.address?.country || 'N/A',
        status: original.status ? 'Active' : 'Inactive',
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const rowData = vendors.map(original => ({
      uuid: original.uuid,
      identificationNumber: original.identificationNumber,
      name: original.name,
      createdBy: original.createdUser?.name || 'N/A',
      createdAt: dateTimeHelper.formatDate(original.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(original.updatedAt, "DD/MM/YYYY"),
      city: original.address?.city || 'N/A',
      state: original.address?.state || 'N/A',
      country: original.address?.country || 'N/A',
      status: original.status ? 'Active' : 'Inactive',
    }));

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${baseUrl}/super-admin/vendors/delete/${vendorToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        showSnackbar(response.data.message, "success");
        fetchVendors();
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      showSnackbar(
        error?.response?.data?.message || "Failed to delete vendor. Please try again.",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: vendors,
    rowCount: totalCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    manualGlobalFilter: true,
    enableGlobalFilter: true,
    enableColumnFilters: false,   // 👈 disables filter by column
    enableRowSelection: true,
    enableMultiRowSelection: true,
    state: {
      pagination,
      globalFilter,
      columnFilters,
      sorting,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    layoutMode: 'grid',
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: '#FFE3E1',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: '12px',
        whiteSpace: 'nowrap',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        '&:nth-of-type(odd)': {
          backgroundColor: '#fafafa',
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
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={handleExportData} startIcon={<FileDownloadIcon />} className="Global-Button4">Export All Data</Button>
        <Button onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">Export All Rows</Button>
        <Button onClick={() => handleExportRows(table.getRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">Export Page Rows</Button>
        <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => handleExportRows(table.getSelectedRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button5">Export Selected Rows</Button>
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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        {!showAddVendor && (
          <Button className="Global-Button4" sx={{ marginRight: "16px" }} startIcon={<AddIcon />} onClick={() => { setSelectedVendorId(null); setShowAddVendor(true); }}>
            Add Vendors
          </Button>
        )}
      </Box>

      {showAddVendor ? (
        <AddVendor
          onBack={(refresh = false) => {
            setShowAddVendor(false);
            setSelectedVendorId(null);
            if (refresh) fetchVendors();
          }}
          vendorId={selectedVendorId}
        />
      ) : (
        <Box sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1050px",
            xl: "1400px"
          },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 }
        }}>
          <MaterialReactTable table={table} />
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete vendor <strong>{vendorToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} className="Global-Button3" disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDeleteVendor} autoFocus className="Global-Button6" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorList;
