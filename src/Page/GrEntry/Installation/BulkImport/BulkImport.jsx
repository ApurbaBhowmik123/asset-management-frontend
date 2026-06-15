// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Stepper,
//   Step,
//   StepLabel,
//   Button,
//   Paper,
//   Stack,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import CancelIcon from "@mui/icons-material/Cancel";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   createMRTColumnHelper,
// } from "material-react-table";
// import { mkConfig, generateCsv, download } from "export-to-csv";
// import { useNavigate } from "react-router-dom";
// import { baseUrl } from "../../../Api";

// const csvConfig = mkConfig({
//   fieldSeparator: ",",
//   decimalSeparator: ".",
//   useKeysAsHeaders: true,
// });

// const steps = ["UPLOAD", "PREVIEW", "IMPORT"];

// const BulkImport = () => {
//   // Step management
//   const [activeStep, setActiveStep] = useState(0);

//   // Upload step state
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("No File Chosen");
//   const [loading, setLoading] = useState(false);

//   // Preview step state
//   const [data, setData] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 5,
//   });
//   const [sorting, setSorting] = useState([]);
//   const [totalRows, setTotalRows] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [columns, setColumns] = useState([]);

//   // Upload response data
//   const [uploadResponse, setUploadResponse] = useState(null);

//   // Snackbar state
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success", 
//   });

//   const navigate = useNavigate();

//   // Upload step functions
//   const handleFileChange = (event) => {
//     if (event.target.files.length > 0) {
//       setFile(event.target.files[0]);
//       setFileName(event.target.files[0].name);
//     } else {
//       setFile(null);
//       setFileName("No File Chosen");
//     }
//   };

//   const handleCancel = () => {
//     setFile(null);
//     setFileName("No File Chosen");
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch(`${baseUrl}/gr/bulk-installation/upload`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("File upload failed");
//       }

//       const responseData = await response.json();

//       // Store the upload response in state
//       setUploadResponse(responseData);

//       setSnackbar({
//         open: true,
//         message: "File uploaded successfully!",
//         severity: "success",
//       });

//       // Move to preview step
//       setTimeout(() => {
//         setActiveStep(1);
//         loadUploadedData(responseData);
//       }, 300);
//     } catch (error) {
//       console.error("Upload error:", error);

//       setSnackbar({
//         open: true,
//         message: error.message || "Upload failed. Please try again.",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Download Excel Template
//   const handleDownloadTemplate = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${baseUrl}/gr/bulk-installation/download/sample`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to download template");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "bulk_import_sample.xlsx";
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Download error:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to download template",
//         severity: "error",
//       });
//     }
//   };

//   // Preview step functions
//   const loadUploadedData = (responseData) => {
//     try {
//       // Extract data from the response
//       const extractedData = responseData.data || responseData.records || responseData;

//       if (Array.isArray(extractedData) && extractedData.length > 0) {
//         setData(extractedData);
//         setTotalRows(extractedData.length);
//         setTotalPages(Math.ceil(extractedData.length / pagination.pageSize));

//         // Generate columns dynamically based on data keys
//         generateColumns(extractedData[0]);
//       } else {
//         setSnackbar({
//           open: true,
//           message: "No data found in uploaded file.",
//           severity: "warning",
//         });
//       }
//     } catch (error) {
//       console.error("Error loading upload data:", error);
//       setSnackbar({
//         open: true,
//         message: "Error processing uploaded data.",
//         severity: "error",
//       });
//     }
//   };

//   const generateColumns = (sampleRow) => {
//     const columnHelper = createMRTColumnHelper();
//     const dynamicColumns = Object.keys(sampleRow).map(key => 
//       columnHelper.accessor(key, {
//         header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//         size: 150,
//         Cell: ({ cell }) => (
//           <span style={{ fontSize: '12px' }}>
//             {cell.getValue()}
//           </span>
//         ),
//       })
//     );
//     setColumns(dynamicColumns);
//   };

//   const handleExportRows = (rows) => {
//     const rowData = rows.map((row) => row.original);
//     const csv = generateCsv(csvConfig)(rowData);
//     download(csvConfig)(csv);
//   };

//   const handleExportData = () => {
//     const csv = generateCsv(csvConfig)(data);
//     download(csvConfig)(csv);
//   };

//   const handleImport = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       // Make API call to actually import the data
//       const response = await fetch(`${baseUrl}/gr/bulk-installation/import`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           data: data // Send the preview data for import
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Import failed");
//       }

//       const result = await response.json();

//       setSnackbar({
//         open: true,
//         message: "Data imported successfully!",
//         severity: "success",
//       });

//       setTimeout(() => {
//         setActiveStep(2); 
//         navigate('/grentry/import-success');
//       }, 1000);
//     } catch (error) {
//       console.error("Import error:", error);
//       setSnackbar({
//         open: true,
//         message: error.message || "Import failed. Please try again.",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep(0);
//     // Reset preview data
//     setData([]);
//     setColumns([]);
//     setSelectedRows([]);
//     setUploadResponse(null);
//   };

//   // Material React Table configuration
//   const table = useMaterialReactTable({
//     columns,
//     data,
//     manualFiltering: false,
//     manualPagination: false,
//     manualSorting: false,
//     rowCount: totalRows,
//     pageCount: totalPages,
//     state: {
//       globalFilter,
//       pagination,
//       sorting,
//       isLoading: loading && activeStep === 1,
//       rowSelection: selectedRows,
//     },
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     onSortingChange: setSorting,
//     onRowSelectionChange: setSelectedRows,
//     enableGlobalFilter: true,
//     enableRowSelection: true,
//     enableMultiRowSelection: true,
//     enableColumnResizing: false,
//     paginationDisplayMode: "pages",
//     columnResizeMode: "onChange",
//     layoutMode: "grid",
//     positionToolbarAlertBanner: "bottom",
//     muiPaginationProps: {
//       rowsPerPageOptions: [5, 10, 20, 50],
//     },
//     muiTablePaperProps: {
//       elevation: 0,
//       sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
//     },
//     muiTableHeadRowProps: {
//       sx: { backgroundColor: "#FFE3E1" },
//     },
//     muiTableBodyCellProps: {
//       sx: { fontSize: "12px", whiteSpace: "nowrap" },
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
//         overflowX: "auto",
//         maxWidth: "100%",
//       },
//     },
//     renderTopToolbarCustomActions: ({ table }) => (
//       <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//         <Button
//           onClick={handleExportData}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//           disabled={data.length === 0}
//         >
//           Export All Data
//         </Button>
//         <Button
//           onClick={() =>
//             handleExportRows(table.getPrePaginationRowModel().rows)
//           }
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//           disabled={data.length === 0}
//         >
//           Export All Rows
//         </Button>
//         <Button
//           onClick={() => handleExportRows(table.getRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           className="Global-Button4"
//           disabled={data.length === 0}
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

//   // Render Upload Step
//   const renderUploadStep = () => (
//     <Paper
//       elevation={0}
//       sx={{
//         mt: 4,
//         p: { xs: 2, md: 3 },
//         backgroundColor: "#eef6fd",
//         borderRadius: 2,
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",
//       }}
//     >
//       <Box>
//         <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//           Step 1: Upload
//         </Typography>
//         <Typography variant="body2" color="text.secondary" gutterBottom>
//           Specify the primary description for Member
//         </Typography>

//         {/* Upload Section */}
//         <Paper
//           variant="outlined"
//           sx={{
//             mt: 3,
//             p: 4,
//             borderStyle: "dashed",
//             textAlign: "center",
//             borderColor: "#ccc",
//             borderRadius: 2,
//             backgroundColor: "#fafafa",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <CloudUploadIcon sx={{ fontSize: 50, color: "gray", mb: 1 }} />

//           {/* File Upload & Cancel */}
//           <Stack direction="row" spacing={2} alignItems="center" mb={1}>
//             <Button
//               variant="contained"
//               component="label"
//               className="Global-Button3"
//             >
//               Choose File
//               <input type="file" hidden onChange={handleFileChange} />
//             </Button>

//             {fileName !== "No File Chosen" && (
//               <Button
//                 variant="outlined"
//                 onClick={handleCancel}
//                 startIcon={<CancelIcon />}
//                 sx={{
//                   textTransform: "none",
//                   borderRadius: 1,
//                   px: 2,
//                   fontWeight: "bold",
//                   borderColor: "#DB3027",
//                   color: "#DB3027",
//                   "&:hover": {
//                     borderColor: "#b2241c",
//                     backgroundColor: "#ffeaea",
//                   },
//                 }}
//               >
//                 Cancel
//               </Button>
//             )}
//           </Stack>

//           {/* File Name */}
//           <Typography variant="body2" color="text.secondary">
//             {fileName}
//           </Typography>

//           {/* Info */}
//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{ mt: 1, maxWidth: 400, mx: "auto" }}
//           >
//             A maximum of 1000 records can be imported at a time.{" "}
//             <Typography
//               component="a"
//               href="#"
//               onClick={handleDownloadTemplate}
//               color="primary"
//               sx={{
//                 textDecoration: "none",
//                 fontWeight: "bold",
//                 cursor: "pointer",
//               }}
//             >
//               Click here 
//             </Typography>
//               to download the import template.
//           </Typography>
//         </Paper>
//       </Box>

//       {/* Next Button at Bottom */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "flex-end",
//           mt: 3,
//         }}
//       >
//         <Button
//           variant="contained"
//           onClick={handleUpload}
//           className="Global-Button6"
//           disabled={!file || loading}
//         >
//           {loading ? "Uploading..." : "Next"}
//         </Button>
//       </Box>
//     </Paper>
//   );

//   // Render Preview Step
//   const renderPreviewStep = () => (
//     <Paper
//       elevation={0}
//       sx={{
//         mt: 4,
//         p: { xs: 2, md: 1 },
//         backgroundColor: "#eef6fd",
//         borderRadius: 2,
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",
//       }}
//     >
//       <Box>
//         <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//           Step 2: Preview
//         </Typography>
//         <Typography variant="body2" color="text.secondary" gutterBottom>
//           Review the data before importing ({data.length} records found)
//         </Typography>

//         {/* Table Section */}
//         <Box sx={{
//           width: {
//             xs: "100%",
//             sm: "100%",
//             md: "100%",
//             lg: "1020px",
//             xl: "1400px"
//           },
//           overflow: "auto",
//           mx: "auto",
//           px: { xs: 1, sm: 2 }
//         }}>
//           <MaterialReactTable table={table} />
//         </Box>
//       </Box>

//       {/* Navigation Buttons at Bottom */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           mt: 3,
//         }}
//       >
//         <Button
//           variant="outlined"
//           onClick={handleBack}
//           startIcon={<ArrowBackIcon />}
//           className="Global-Button2"
//         >
//           Back
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleImport}
//           className="Global-Button6"
//           disabled={data.length === 0 || loading}
//         >
//           {loading ? "Importing..." : "Import"}
//         </Button>
//       </Box>
//     </Paper>
//   );

//   return (
//     <Box sx={{ width: "100%", height: "100%" }}>
//       {/* Header */}
//       <Typography
//         variant="h5"
//         fontWeight="bold"
//         sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}
//       >
//         Bulk Import
//       </Typography>

//       {/* Stepper */}
//       <Stepper activeStep={activeStep} alternativeLabel>
//         {steps.map((label, index) => (
//           <Step key={index}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {/* Step Content */}
//       {activeStep === 0 && renderUploadStep()}
//       {activeStep === 1 && renderPreviewStep()}

//       {/* Snackbar Notification */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default BulkImport;

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Paper,
    Stack,
    Snackbar,
    Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../Api";

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

const steps = ["UPLOAD", "PREVIEW", "IMPORT"];

const BulkImport = () => {
    // Step management
    const [activeStep, setActiveStep] = useState(0);

    // Upload step state
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("No File Chosen");
    const [loading, setLoading] = useState(false);

    // Preview step state
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [sorting, setSorting] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [columns, setColumns] = useState([]);

    // Upload response data
    const [uploadResponse, setUploadResponse] = useState(null);

    // Import success state
    const [importResult, setImportResult] = useState(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const navigate = useNavigate();

    // Upload step functions
    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setFile(event.target.files[0]);
            setFileName(event.target.files[0].name);
        } else {
            setFile(null);
            setFileName("No File Chosen");
        }
    };

    const handleCancel = () => {
        setFile(null);
        setFileName("No File Chosen");
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${baseUrl}/gr/bulk-installation/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("File upload failed");
            }

            const responseData = await response.json();

            // Store the upload response in state
            setUploadResponse(responseData);

            setSnackbar({
                open: true,
                message: "File uploaded successfully!",
                severity: "success",
            });

            // Move to preview step
            setTimeout(() => {
                setActiveStep(1);
                loadUploadedData(responseData);
            }, 300);
        } catch (error) {
            console.error("Upload error:", error);

            setSnackbar({
                open: true,
                message: error.message || "Upload failed. Please try again.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Download Excel Template
    const handleDownloadTemplate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${baseUrl}/gr/bulk-installation/download/sample`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download template");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "bulk_import_sample.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            setSnackbar({
                open: true,
                message: "Failed to download template",
                severity: "error",
            });
        }
    };

    // Preview step functions
    const loadUploadedData = (responseData) => {
        try {
            // Extract data from the response
            const extractedData = responseData.data || responseData.records || responseData;

            if (Array.isArray(extractedData) && extractedData.length > 0) {
                setData(extractedData);
                setTotalRows(extractedData.length);
                setTotalPages(Math.ceil(extractedData.length / pagination.pageSize));

                // Generate columns dynamically based on data keys
                generateColumns(extractedData[0]);
            } else {
                setSnackbar({
                    open: true,
                    message: "No data found in uploaded file.",
                    severity: "warning",
                });
            }
        } catch (error) {
            console.error("Error loading upload data:", error);
            setSnackbar({
                open: true,
                message: "Error processing uploaded data.",
                severity: "error",
            });
        }
    };

    const generateColumns = (sampleRow) => {
        const columnHelper = createMRTColumnHelper();
        const dynamicColumns = Object.keys(sampleRow).map(key =>
            columnHelper.accessor(key, {
                header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                size: 150,
                Cell: ({ cell }) => (
                    <span style={{ fontSize: '12px' }}>
                        {cell.getValue()}
                    </span>
                ),
            })
        );
        setColumns(dynamicColumns);
    };

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const handleImport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Get selected rows data
            const selectedRowsData = Object.keys(selectedRows).length > 0
                ? data.filter((_, index) => selectedRows[index])
                : data;

            if (selectedRowsData.length === 0) {
                throw new Error("No rows selected for import");
            }

            // Make API call to import only selected data
            const response = await fetch(`${baseUrl}/gr/bulk-installation/install`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: selectedRowsData // Send only selected data for import
                }),
            });

            if (!response.ok) {
                throw new Error("Import failed");
            }

            const result = await response.json();

            // Store import result for success page
            setImportResult({
                processedRecords: selectedRowsData.length,
                successfulRecords: selectedRowsData.length,
                ...result
            });

            setSnackbar({
                open: true,
                message: "Data imported successfully!",
                severity: "success",
            });

            setTimeout(() => {
                setActiveStep(2); // Move to success step
            }, 1000);
        } catch (error) {
            console.error("Import error:", error);
            setSnackbar({
                open: true,
                message: error.message || "Import failed. Please try again.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };
    const handleBack = () => {
        setActiveStep(0);
        // Reset preview data
        setData([]);
        setColumns([]);
        setSelectedRows([]);
        setUploadResponse(null);
    };

    const handleBackToImport = () => {
        navigate('/grentry/installation-list');
    };

    const handleNewImport = () => {
        // Reset all state to start new import
        setActiveStep(0);
        setFile(null);
        setFileName("No File Chosen");
        setData([]);
        setColumns([]);
        setSelectedRows([]);
        setUploadResponse(null);
        setImportResult(null);
        setGlobalFilter("");
        setPagination({ pageIndex: 0, pageSize: 5 });
        setSorting([]);
        setTotalRows(0);
        setTotalPages(1);
    };

    // Material React Table configuration
    const table = useMaterialReactTable({
        columns,
        data,
        manualFiltering: false,
        manualPagination: false,
        manualSorting: false,
        rowCount: totalRows,
        pageCount: totalPages,
        state: {
            globalFilter,
            pagination,
            sorting,
            isLoading: loading && activeStep === 1,
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
                    disabled={data.length === 0}
                >
                    Export All Data
                </Button>
                <Button
                    onClick={() =>
                        handleExportRows(table.getPrePaginationRowModel().rows)
                    }
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button4"
                    disabled={data.length === 0}
                >
                    Export All Rows
                </Button>
                <Button
                    onClick={() => handleExportRows(table.getRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button4"
                    disabled={data.length === 0}
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
    });

    // Render Upload Step
    const renderUploadStep = () => (
        <Paper
            elevation={0}
            sx={{
                mt: 4,
                p: { xs: 2, md: 3 },
                backgroundColor: "#eef6fd",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Step 1: Upload
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Specify the primary description for Member
                </Typography>

                {/* Upload Section */}
                <Paper
                    variant="outlined"
                    sx={{
                        mt: 3,
                        p: 4,
                        borderStyle: "dashed",
                        textAlign: "center",
                        borderColor: "#ccc",
                        borderRadius: 2,
                        backgroundColor: "#fafafa",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 50, color: "gray", mb: 1 }} />

                    {/* File Upload & Cancel */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Button
                            variant="contained"
                            component="label"
                            className="Global-Button3"
                        >
                            Choose File
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>

                        {fileName !== "No File Chosen" && (
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<CancelIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 1,
                                    px: 2,
                                    fontWeight: "bold",
                                    borderColor: "#DB3027",
                                    color: "#DB3027",
                                    "&:hover": {
                                        borderColor: "#b2241c",
                                        backgroundColor: "#ffeaea",
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </Stack>

                    {/* File Name */}
                    <Typography variant="body2" color="text.secondary">
                        {fileName}
                    </Typography>

                    {/* Info */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, maxWidth: 400, mx: "auto" }}
                    >
                        A maximum of 1000 records can be imported at a time.{" "}
                        <Typography
                            component="a"
                            href="#"
                            onClick={handleDownloadTemplate}
                            color="primary"
                            sx={{
                                textDecoration: "none",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                        >
                            Click here
                        </Typography>
                        to download the import template.
                    </Typography>
                </Paper>
            </Box>

            {/* Next Button at Bottom */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 3,
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    className="Global-Button6"
                    disabled={!file || loading}
                >
                    {loading ? "Uploading..." : "Next"}
                </Button>
            </Box>
        </Paper>
    );

    // Render Preview Step
    const renderPreviewStep = () => (
        <Paper
            elevation={0}
            sx={{
                mt: 4,
                p: { xs: 2, md: 1 },
                backgroundColor: "#eef6fd",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Step 2: Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Review the data before importing ({data.length} records found)
                </Typography>

                {/* Table Section */}
                <Box sx={{
                    width: {
                        xs: "100%",
                        sm: "100%",
                        md: "100%",
                        lg: "1020px",
                        xl: "1400px"
                    },
                    overflow: "auto",
                    mx: "auto",
                    px: { xs: 1, sm: 2 }
                }}>
                    <MaterialReactTable table={table} />
                </Box>
            </Box>

            {/* Navigation Buttons at Bottom */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    className="Global-Button2"
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleImport}
                    className="Global-Button6"
                    disabled={data.length === 0 || loading || Object.keys(selectedRows).length === 0}
                >
                    {loading ? "Importing..." :
                        Object.keys(selectedRows).length === 0 ? "Select rows to import" : "Import"}
                </Button>
            </Box>
        </Paper>
    );

    // Render Import Success Step
    const renderImportSuccessStep = () => (
        <Paper
            elevation={0}
            sx={{
                mt: 4,
                p: { xs: 2, md: 3 },
                backgroundColor: "#eef6fd",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: 500,
                    mx: "auto",
                    my: 4,
                }}
            >
                <CheckCircleOutlineIcon
                    sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Import Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Your data has been successfully imported into the system.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {importResult?.processedRecords || Object.keys(selectedRows).length} records were processed and imported without any errors.
                </Typography>

                <Stack direction="row" spacing={2}>

                    <Button
                        variant="contained"
                        onClick={handleBackToImport}
                        className="Global-Button6"
                    >
                        Close
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ width: "100%", height: "100%" }}>
            {/* Header */}
            <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}
            >
                Bulk Import
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                    <Step key={index}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Step Content */}
            {activeStep === 0 && renderUploadStep()}
            {activeStep === 1 && renderPreviewStep()}
            {activeStep === 2 && renderImportSuccessStep()}

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BulkImport;