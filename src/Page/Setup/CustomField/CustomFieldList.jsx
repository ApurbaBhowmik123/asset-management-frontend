// // import React, { useState, useEffect } from "react";
// // import {
// //   MaterialReactTable,
// //   useMaterialReactTable,
// //   createMRTColumnHelper,
// // } from "material-react-table";
// // import {
// //   Box,
// //   Button,
// //   IconButton,
// //   Typography,
// //   Chip,
// //   TextField,
// //   CircularProgress,
// // } from "@mui/material";
// // import FileDownloadIcon from "@mui/icons-material/FileDownload";
// // import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
// // import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
// // import AddIcon from "@mui/icons-material/Add";
// // import { mkConfig, generateCsv, download } from "export-to-csv";
// // import AddCustomField from "./AddCustomField";
// // import axios from "axios";
// // import { baseUrl } from "../../Api";

// // const csvConfig = mkConfig({
// //   fieldSeparator: ",",
// //   decimalSeparator: ".",
// //   useKeysAsHeaders: true,
// // });

// // const CustomFieldList = () => {
// //   const [globalFilter, setGlobalFilter] = useState("");
// //   const [showAddVendor, setshowAddVendor] = useState(false);
// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const columnHelper = createMRTColumnHelper();

// //   const columns = [

// //     columnHelper.accessor("name", {
// //       header: "Name",
// //       size: 80,
// //     }),
// //     columnHelper.accessor("fieldType", {
// //       header: "Field Type",
// //       size: 100,
// //     }),
// //     // columnHelper.accessor("unit", {
// //     //   header: "Unit",
// //     //   size: 80,
// //     //   Cell: ({ cell }) => cell.getValue() || "-",
// //     // }),
// //     columnHelper.accessor("createdUser.name", {
// //   header: "Created By",
// //   size: 60,

// // }),
// //     columnHelper.accessor("isRequired", {
// //       header: "Required",
// //       size: 100,
// //       Cell: ({ cell }) => (
// //         <Chip
// //           label={cell.getValue() ? "Yes" : "No"}
// //           size="small"
// //           sx={{
// //             borderRadius: 2,
// //             backgroundColor: cell.getValue()
// //               ? "rgba(40, 167, 69, 0.1)"
// //               : "rgba(220, 53, 69, 0.1)",
// //             color: cell.getValue() ? "#28A745" : "#DC3545",
// //             fontSize: "12px",
// //           }}
// //         />
// //       ),
// //     }),
// //     columnHelper.accessor("description", {
// //       header: "Description",
// //       size: 100,
// //       Cell: ({ cell }) => cell.getValue() || "-",
// //     }),
// //     columnHelper.accessor("status", {
// //       header: "Status",
// //       size: 80,
// //       Cell: ({ cell }) => {
// //         const status = cell.getValue() ? "Active" : "Inactive";
// //         const isActive = cell.getValue();

// //         return (
// //           <Chip
// //             label={status}
// //             size="small"
// //             sx={{
// //               borderRadius: 2,
// //               backgroundColor: isActive
// //                 ? "rgba(40, 167, 69, 0.1)"
// //                 : "rgba(220, 53, 69, 0.1)",
// //               color: isActive ? "#28A745" : "#DC3545",
// //               fontSize: "12px",
// //             }}
// //           />
// //         );
// //       },
// //     }),
// //     columnHelper.accessor("options", {
// //       header: "Options",
// //       size: 80,
// //       Cell: ({ cell }) => {
// //         const options = cell.getValue();
// //         if (!options || options.length === 0) return "-";
// //         return (
// //           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
// //             {options.slice(0, 2).map((option) => (
// //               <Chip
// //                 key={option.id}
// //                 label={option.value}
// //                 size="small"
// //                 sx={{ fontSize: "10px" }}
// //               />
// //             ))}
// //             {options.length > 2 && (
// //               <Chip
// //                 label={`+${options.length - 2}`}
// //                 size="small"
// //                 sx={{ fontSize: "10px" }}
// //               />
// //             )}
// //           </Box>
// //         );
// //       },
// //     }),
// //     columnHelper.display({
// //       id: "actions",
// //       header: "Actions",
// //       size: 50,
// //       Cell: () => (
// //         <Box>
// //           <IconButton color="primary" size="small">
// //             <img src={Editicon1} alt="edit" width={16} height={16} />
// //           </IconButton>
// //           <IconButton color="error" size="small">
// //             <img src={Deleteicon1} alt="delete" width={16} height={16} />
// //           </IconButton>
// //         </Box>
// //       ),
// //     }),
// //   ];

// // useEffect(() => {
// //   const fetchData = async () => {
// //     // Get token from localStorage - fixed the key name (should be string)
// //     const token = localStorage.getItem('token'); // or whatever your token key is

// //     // Check if token exists
// //     if (!token) {
// //       setError('Authentication token not found');
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       const response = await axios.get(
// //         `${baseUrl}/catalog/specfields`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (response.data.status) {
// //         setData(response.data.data);
// //       } else {
// //         setError(response.data.message || "Failed to fetch data");
// //       }
// //     } catch (err) {
// //       // More detailed error handling
// //       if (err.response) {
// //         // The request was made and the server responded with a status code
// //         if (err.response.status === 401) {
// //           setError('Unauthorized - Please login again');
// //         } else if (err.response.status === 403) {
// //           setError('Forbidden - You don\'t have permission');
// //         } else {
// //           setError(err.response.data.message || `Server error: ${err.response.status}`);
// //         }
// //       } else if (err.request) {
// //         // The request was made but no response was received
// //         setError('Network error - No response from server');
// //       } else {
// //         // Something happened in setting up the request
// //         setError(err.message);
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   fetchData();
// // }, []); // Empty dependency array means this runs once on mount

// //   const handleExportRows = (rows) => {
// //     const rowData = rows.map((row) => row.original);
// //     const csv = generateCsv(csvConfig)(rowData);
// //     download(csvConfig)(csv);
// //   };

// //   const handleExportData = () => {
// //     const csv = generateCsv(csvConfig)(data);
// //     download(csvConfig)(csv);
// //   };

// //   const table = useMaterialReactTable({
// //     columns,
// //     data,
// //     state: {
// //       globalFilter,
// //     },
// //     onGlobalFilterChange: setGlobalFilter,
// //     enableGlobalFilter: true,
// //     enableRowSelection: true,
// //     enableMultiRowSelection: true,
// //     enableColumnResizing: false,
// //     columnResizeMode: "onChange",
// //     paginationDisplayMode: "pages",
// //     positionToolbarAlertBanner: "bottom",
// //     layoutMode: "grid",
// //     muiTablePaperProps: {
// //       elevation: 0,
// //       sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
// //     },
// //     muiTableHeadRowProps: {
// //       sx: {
// //         backgroundColor: "#FFE3E1",
// //       },
// //     },
// //     muiTableBodyCellProps: {
// //       sx: {
// //         fontSize: "12px",
// //         whiteSpace: "nowrap",
// //       },
// //     },
// //     muiTableBodyRowProps: {
// //       sx: {
// //         "&:nth-of-type(odd)": {
// //           backgroundColor: "#fafafa",
// //         },
// //       },
// //     },
// //     muiTableContainerProps: {
// //       sx: {
// //         width: "100%",
// //         overflowX: "hidden",
// //       },
// //     },
// //     renderTopToolbarCustomActions: ({ table }) => (
// //       <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
// //         <Button
// //           onClick={handleExportData}
// //           startIcon={<FileDownloadIcon />}
// //           className="Global-Button4"
// //         >
// //           Export All Data
// //         </Button>
// //         <Button
// //           onClick={() =>
// //             handleExportRows(table.getPrePaginationRowModel().rows)
// //           }
// //           startIcon={<FileDownloadIcon />}
// //           className="Global-Button4"
// //         >
// //           Export All Rows
// //         </Button>
// //         <Button
// //           onClick={() => handleExportRows(table.getRowModel().rows)}
// //           startIcon={<FileDownloadIcon />}
// //           className="Global-Button4"
// //         >
// //           Export Page Rows
// //         </Button>
// //         <Button
// //           disabled={
// //             !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
// //           }
// //           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
// //           startIcon={<FileDownloadIcon />}
// //           className="Global-Button5"
// //         >
// //           Export Selected Rows
// //         </Button>
// //       </Box>
// //     ),
// //   });

// //   const handlePage = () => {
// //     setshowAddVendor(true);
// //   };



// //   if (error) {
// //     return (
// //       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
// //         <Typography color="error">Error: {error}</Typography>
// //       </Box>
// //     );
// //   }

// //   return (
// //     <Box sx={{ width: "100%" }}>
// //       {/* Top Bar: Search + Add Button */}
// //       <Box
// //         sx={{
// //           display: "flex",
// //           justifyContent: "flex-end",
// //           alignItems: "center",
// //           mb: 2,
// //           flexWrap: "wrap",
// //           gap: 2,
// //         }}
// //       >
// //         {!showAddVendor && (
// //           <Button
// //             className="Global-Button4"
// //             startIcon={<AddIcon />}
// //             onClick={handlePage}
// //           >
// //             Add Custom Field
// //           </Button>
// //         )}
// //       </Box>

// //       {/* Table */}
// //       {showAddVendor ? (
// //         <AddCustomField onBack={() => setshowAddVendor(false)} />
// //       ) : (
// //         <MaterialReactTable table={table} />
// //       )}
// //     </Box>
// //   );
// // };

// // export default CustomFieldList;

// import React, { useState, useEffect } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   createMRTColumnHelper,
// } from "material-react-table";
// import {
//   Box,
//   Button,
//   IconButton,
//   Typography,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Snackbar,
//   Alert
// } from "@mui/material";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
// import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
// import AddIcon from "@mui/icons-material/Add";
// import { mkConfig, generateCsv, download } from "export-to-csv";
// import AddCustomField from "./AddCustomField";
// import axios from "axios";
// import { baseUrl } from "../../Api";

// const csvConfig = mkConfig({
//   fieldSeparator: ",",
//   decimalSeparator: ".",
//   useKeysAsHeaders: true,
// });

// const CustomFieldList = () => {
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
//   const [editFieldId, setEditFieldId] = useState(null);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [fieldToDelete, setFieldToDelete] = useState(null);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 5,
//   });
//    const [rowCount, setRowCount] = useState(0);
//   const columnHelper = createMRTColumnHelper();

//   const columns = [
//     columnHelper.accessor("name", {
//       header: "Name",
//       size: 80,
//     }),
//     columnHelper.accessor("fieldType", {
//       header: "Field Type",
//       size: 100,
//     }),
//     columnHelper.accessor("createdUser.name", {
//       header: "Created By",
//       size: 60,
//     }),
//     columnHelper.accessor("isRequired", {
//       header: "Required",
//       size: 100,
//       Cell: ({ cell }) => (
//         <Chip
//           label={cell.getValue() ? "Yes" : "No"}
//           size="small"
//           sx={{
//             borderRadius: 2,
//             backgroundColor: cell.getValue()
//               ? "rgba(40, 167, 69, 0.1)"
//               : "rgba(220, 53, 69, 0.1)",
//             color: cell.getValue() ? "#28A745" : "#DC3545",
//             fontSize: "12px",
//           }}
//         />
//       ),
//     }),
//     columnHelper.accessor("description", {
//       header: "Description",
//       size: 100,
//       Cell: ({ cell }) => cell.getValue() || "-",
//     }),
//     columnHelper.accessor("status", {
//       header: "Status",
//       size: 80,
//       Cell: ({ cell }) => {
//         const status = cell.getValue() ? "Active" : "Inactive";
//         const isActive = cell.getValue();

//         return (
//           <Chip
//             label={status}
//             size="small"
//             sx={{
//               borderRadius: 2,
//               backgroundColor: isActive
//                 ? "rgba(40, 167, 69, 0.1)"
//                 : "rgba(220, 53, 69, 0.1)",
//               color: isActive ? "#28A745" : "#DC3545",
//               fontSize: "12px",
//             }}
//           />
//         );
//       },
//     }),
//     columnHelper.accessor("options", {
//       header: "Options",
//       size: 80,
//       Cell: ({ cell }) => {
//         const options = cell.getValue();
//         if (!options || options.length === 0) return "-";
//         return (
//           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//             {options.slice(0, 2).map((option) => (
//               <Chip
//                 key={option.id}
//                 label={option.value}
//                 size="small"
//                 sx={{ fontSize: "10px" }}
//               />
//             ))}
//             {options.length > 2 && (
//               <Chip
//                 label={`+${options.length - 2}`}
//                 size="small"
//                 sx={{ fontSize: "10px" }}
//               />
//             )}
//           </Box>
//         );
//       },
//     }),
//     columnHelper.display({
//       id: "actions",
//       header: "Actions",
//       size: 50,
//       Cell: ({ row }) => (
//         <Box>
//           <IconButton 
//             color="primary" 
//             size="small"
//             onClick={() => handleEditClick(row.original)}
//           >
//             <img src={Editicon1} alt="edit" width={16} height={16} />
//           </IconButton>
//           <IconButton 
//             color="error" 
//             size="small"
//             onClick={() => handleDeleteClick(row.original)}
//           >
//             <img src={Deleteicon1} alt="delete" width={16} height={16} />
//           </IconButton>
//         </Box>
//       ),
//     }),
//   ];

//   useEffect(() => {
//     fetchData();
//   }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

//   const fetchData = async () => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       setError('Authentication token not found');
//       setLoading(false);
//       return;
//     }

//       try {
//         const response = await axios.get(`${baseUrl}/catalog/specfields`, {
//            params: {
//             page: pagination.pageIndex + 1,
//             limit: pagination.pageSize,
//             sortBy: 'name',
//             sortOrder: 'asc',
//             search: globalFilter,
//           },
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.data.status) {
//           setData(response.data.data);
//                setRowCount(response.data.data.total);
//         } else {
//           setError(response.data.message || "Failed to fetch data");
//         }
//       } catch (err) {
//         // More detailed error handling
//         if (err.response) {
//           // The request was made and the server responded with a status code
//           if (err.response.status === 401) {
//             setError("Unauthorized - Please login again");
//           } else if (err.response.status === 403) {
//             setError("Forbidden - You don't have permission");
//           } else {
//             setError(
//               err.response.data.message ||
//                 `Server error: ${err.response.status}`
//             );
//           }
//         } else if (err.request) {

//           setError("Network error - No response from server");
//         } else {

//           setError(err.message);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };


//   const handleExportRows = (rows) => {
//     const rowData = rows.map((row) => row.original);
//     const csv = generateCsv(csvConfig)(rowData);
//     download(csvConfig)(csv);
//   };

//   const handleExportData = () => {
//     const csv = generateCsv(csvConfig)(data);
//     download(csvConfig)(csv);
//   };

//   const handleCreateClick = () => {
//     setFormMode('create');
//     setEditFieldId(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (field) => {
//     setFormMode('edit');
//     setEditFieldId(field.id);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (field) => {
//     setFieldToDelete(field);
//     setDeleteConfirmOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!fieldToDelete) return;

//     const token = localStorage.getItem('token');
//     if (!token) {
//       setSnackbar({
//         open: true,
//         message: "Authentication token not found",
//         severity: "error"
//       });
//       return;
//     }

//     try {
//       const response = await axios.delete(
//         `${baseUrl}/catalog/specfields/${fieldToDelete.id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.status) {
//         setSnackbar({
//           open: true,
//           message: "Custom field deleted successfully",
//           severity: "success"
//         });
//         // Refresh data
//         fetchData();
//       } else {
//         setSnackbar({
//           open: true,
//           message: response.data.message || "Failed to delete field",
//           severity: "error"
//         });
//       }
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: error.response?.data?.message || "Error deleting field",
//         severity: "error"
//       });
//     } finally {
//       setDeleteConfirmOpen(false);
//       setFieldToDelete(null);
//     }
//   };

//   const handleFormClose = (refresh = false) => {
//     setShowForm(false);
//     if (refresh) {
//       fetchData();
//     }
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const table = useMaterialReactTable({
//     columns,
//     data,
//     rowCount,
//     state: {
//       globalFilter,
//        pagination,
//     },
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//      manualPagination: true,
//     manualFiltering: true,
//     enableGlobalFilter: true,
//     enableRowSelection: true,
//     enableMultiRowSelection: true,
//     enableColumnResizing: false,
//     columnResizeMode: "onChange",
//     paginationDisplayMode: "pages",
//     positionToolbarAlertBanner: "bottom",
//     layoutMode: "grid",
//     muiTablePaperProps: {
//       elevation: 0,
//       sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
//     },
//     muiTableHeadRowProps: {
//       sx: {
//         backgroundColor: "#FFE3E1",
//       },
//     },
//     muiTableBodyCellProps: {
//       sx: {
//         fontSize: "12px",
//         whiteSpace: "nowrap",
//       },
//     },
//     muiTableBodyRowProps: {
//       sx: {
//         "&:nth-of-type(odd)": {
//           backgroundColor: "#fafafa",
//         },
//       },
//     },
//     muiTableContainerProps: {
//       sx: {
//         width: "100%",
//         overflowX: "hidden",
//       },
//     },
//     renderTopToolbarCustomActions: ({ table }) => (
//       <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//         <Button
//           onClick={handleExportData}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//         >
//           Export All Data
//         </Button>
//         <Button
//           onClick={() =>
//             handleExportRows(table.getPrePaginationRowModel().rows)
//           }
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
//           disabled={
//             !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
//           }
//           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button5"
//         >
//           Export Selected Rows
//         </Button>
//       </Box>
//     ),
//   });

//   if (error) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <Typography color="error">Error: {error}</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ width: "100%" }}>
//       {/* Top Bar: Search + Add Button */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "flex-end",
//           alignItems: "center",
//           mb: 2,
//           flexWrap: "wrap",
//           gap: 2,
//         }}
//       >
//         {!showForm && (
//           <Button
//             className="Global-Button4"
//             startIcon={<AddIcon />}
//             onClick={handleCreateClick}
//           >
//             Add Custom Field
//           </Button>
//         )}
//       </Box>

//       {/* Table */}
//       {showForm ? (
//         <AddCustomField 
//           onBack={handleFormClose} 
//           fieldId={editFieldId}
//           mode={formMode}
//         />
//       ) : (
//         <MaterialReactTable table={table} />
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteConfirmOpen}
//         onClose={() => setDeleteConfirmOpen(false)}
//       >
//         <DialogTitle>Delete Custom Field</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete the field "{fieldToDelete?.name}"?
//             This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button 
//             onClick={() => setDeleteConfirmOpen(false)}
//             className="Global-Button3"
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleDeleteConfirm} 
//             className="Global-Button6"
//             autoFocus
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert 
//           onClose={handleCloseSnackbar} 
//           severity={snackbar.severity} 
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default CustomFieldList;

import React, { useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AddCustomField from "./AddCustomField";
import axios from "axios";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename: 'custom_fields_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
});

const CustomFieldList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editFieldId, setEditFieldId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [rowCount, setRowCount] = useState(0);

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
    }),
    columnHelper.accessor("fieldType", {
      header: "Field Type",
      size: 120,
    }),
    columnHelper.accessor("createdUser.name", {
      header: "Created By",
      size: 120,
    }),
    columnHelper.accessor("isRequired", {
      header: "Required",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Yes" : "No"}
          size="small"
          sx={{
            borderRadius: 2,
            backgroundColor: cell.getValue()
              ? "rgba(40, 167, 69, 0.1)"
              : "rgba(220, 53, 69, 0.1)",
            color: cell.getValue() ? "#28A745" : "#DC3545",
            fontSize: "12px",
          }}
        />
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 120,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {cell.getValue() || "-"}
        </div>
      ),
    }),

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
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const isActive = cell.getValue();
        return (
          <Chip
            label={isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              borderRadius: 2,
              backgroundColor: isActive
                ? "rgba(40, 167, 69, 0.1)"
                : "rgba(220, 53, 69, 0.1)",
              color: isActive ? "#28A745" : "#DC3545",
              fontSize: "12px",
            }}
          />
        );
      },
    }),
    columnHelper.accessor("options", {
      header: "Options",
      size: 120,
      Cell: ({ cell }) => {
        const options = cell.getValue();
        if (!options || options.length === 0) return "-";
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {options.slice(0, 2).map((option) => (
              <Chip
                key={option.id}
                label={option.value}
                size="small"
                sx={{ fontSize: "10px" }}
              />
            ))}
            {options.length > 2 && (
              <Chip
                label={`+${options.length - 2}`}
                size="small"
                sx={{ fontSize: "10px" }}
              />
            )}
          </Box>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClick(row.original)}
          >
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteClick(row.original)}
          >
            {/* <img src={Deleteicon1} alt="delete" width={16} height={16} /> */}
          </IconButton>
        </Box>
      ),
    }),
  ];

  useEffect(() => {
    fetchData();
  }, [pagination, globalFilter, columnFilters, sorting]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      const sortBy = sorting[0]?.id || "name";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const filters = columnFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {});

      const response = await axios.get(`${baseUrl}/catalog/specfields`, {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          sortBy,
          sortOrder,
          ...filters,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setData(response.data.data.data);
        setRowCount(response.data.data.total);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch data");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Server error");
      } else if (err.request) {
        setError("Network error - No response from server");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const flattenFieldData = (field) => {
    return {
      name: field.name,
      fieldType: field.fieldType,
      createdBy: field.createdUser?.name || '-',
      isRequired: field.isRequired ? 'Yes' : 'No',
      description: field.description || '-',
      createdAt: dateTimeHelper.formatDate(field.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(field.updatedAt, "DD/MM/YYYY"),
      status: field.status ? 'Active' : 'Inactive',
      options: field.options?.map(opt => opt.value).join(', ') || '-'
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map(row => flattenFieldData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error"
      });
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map(field => flattenFieldData(field));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error"
      });
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setEditFieldId(null);
    setShowForm(true);
  };

  const handleEditClick = (field) => {
    setFormMode("edit");
    setEditFieldId(field.id);
    setShowForm(true);
  };

  const handleDeleteClick = (field) => {
    setFieldToDelete(field);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!fieldToDelete || !token) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/catalog/specfields/${fieldToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Custom field deleted successfully",
          severity: "success",
        });
        fetchData();
      } else {
        throw new Error(response.data.message || "Failed to delete field");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error deleting field",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setFieldToDelete(null);
    }
  };

  const handleFormClose = (refresh = false) => {
    setShowForm(false);
    if (refresh) fetchData();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    state: {
      globalFilter,
      columnFilters,
      pagination,
      sorting,
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableColumnFilters: false,   // 👈 disables filter by column
    enableSorting: true,
    enableRowSelection: true,
    layoutMode: "grid",
    paginationDisplayMode: "pages",
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
        <Button onClick={handleExportData} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export All Data
        </Button>
        <Button onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export All Rows
        </Button>
        <Button onClick={() => handleExportRows(table.getRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
          Export Page Rows
        </Button>
        <Button disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => handleExportRows(table.getSelectedRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button5">
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {rowCount}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {!showForm && (
          <Button className="Global-Button4" sx={{ marginRight: "16px" }} startIcon={<AddIcon />} onClick={handleCreateClick}>
            Add Custom Field
          </Button>
        )}
      </Box>

      {showForm ? (
        <AddCustomField onBack={handleFormClose} fieldId={editFieldId} mode={formMode} />
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
          <MaterialReactTable table={table} isLoading={loading} />

        </Box>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Custom Field</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fieldToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} className="Global-Button3">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} className="Global-Button6" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomFieldList;
