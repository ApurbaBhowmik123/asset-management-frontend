

import { useState, useEffect } from "react";
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
    Grid,
    Card,
    CardContent,
    Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../../Api";


const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

const steps = ["UPLOAD", "PREVIEW", "IMPORT"];

const BulkUpload = () => {
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
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [columns, setColumns] = useState([]);


    // Upload response data
    const [uploadResponse, setUploadResponse] = useState(null);
    const [validationSummary, setValidationSummary] = useState(null);
    const [uploadResult, setUploadResult] = useState([])



    const validationData = uploadResponse?.data?.validation || {}
    const successCount = uploadResult.filter(item => item.success).length;
    const failureCount = uploadResult.filter(item => !item.success).length;
    const totalCount = uploadResult.length;

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

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



    const handleDownloadTemplate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${baseUrl}/sync/download-sample-excel`,
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
            link.download = "bulk_upload_sample.xlsx";
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

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${baseUrl}/sync/old-data-sync`, {
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


    // Preview step functions
    const loadUploadedData = (responseData) => {
        try {
            // Extract formatted data from the response
            const formattedData = responseData.data?.formatted || [];

            // Extract validation summary
            const summary = {
                duplicateAssetSerialNumber: responseData.data?.duplicateAssetSerialNumber || 0,
                duplicateAssetTag: responseData.data?.duplicateAssetTag || 0,
                missingAcquisitionDate: responseData.data?.missingAcquisitionDate || 0,
                missingAssignedOn: responseData.data?.missingAssignedOn || 0,
                missingAssignedUserEmail: responseData.data?.missingAssignedUserEmail || 0,
                missingPONumber: responseData.data?.missingPONumber || 0,
                validation: responseData.data?.validation || {}
            };

            setValidationSummary(summary);

            if (Array.isArray(formattedData) && formattedData.length > 0) {
                setData(formattedData);
                setTotalRows(formattedData.length);
                setTotalPages(Math.ceil(formattedData.length / pagination.pageSize));

                // Generate columns dynamically based on data keys
                generateColumns(formattedData[0]);
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
            // Make API call to import only selected data
            const response = await fetch(`${baseUrl}/sync/old-data-import`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: uploadResponse?.data?.formatted
                }),
            });

            if (!response.ok) {
                throw new Error("Import failed");
            }

            const result = await response.json();
            console.log("resulttt", result)
            if (!result?.status) {
                return;
            }
            setUploadResult(result?.data)
            setSnackbar({
                open: true,
                message: "Data imported successfully!",
                severity: "success",
            });

            setTimeout(() => {
                setActiveStep(2);
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
        setValidationSummary(null);
    };

    const handleBackToImport = () => {
        setActiveStep(0);
        setFile(null);
        setFileName("No File Chosen");
    };

    // Render Validation Summary Component
    const renderValidationSummary = () => {
        if (!validationSummary) return null;

        return (
            <Card sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon color="primary" />
                        Data Validation Summary
                    </Typography>
                    <Grid container spacing={2}>
                        {Object.entries(validationData).map(([key, obj], index) => {
                            // Only show if count > 0
                            if (!obj?.count || obj.count === 0) return null;

                            return (
                                <Grid key={index} size={{ md: 4, sm: 4, xs: 12 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {/* Convert camelCase or snake_case to readable title */}
                                            {key
                                                .replace(/([A-Z])/g, " $1") // split camelCase
                                                .replace(/_/g, " ") // replace underscores
                                                .replace(/^./, (str) => str.toUpperCase())}
                                        </Typography>

                                        <Typography>
                                            <strong>Count:</strong> {obj.count}
                                        </Typography>

                                        {/* If data is present */}
                                        {obj.data && obj.data.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <strong>Data:</strong>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                                                    {obj.data.map((item, i) => (
                                                        <Typography key={i} sx={{ ml: 1 }}>
                                                            {item.value ?? JSON.stringify(item)}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* If rows is present */}
                                        {obj.rows && obj.rows.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <strong>Rows:</strong>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                                                    {obj.rows.map((row, i) => (
                                                        <Typography key={i} sx={{ ml: 1 }}>
                                                            Row {row}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    useEffect(() => {
        const validation = uploadResponse?.data?.validation;
        console.log("validationnn", validation)

        if (validation) {
            let hasErrors = false;

            // Check all validation properties to see if any has count > 0
            Object.values(validation).forEach((validationItem) => {
                console.log("validationItemmm", validationItem)
                if (validationItem?.count > 0) {
                    hasErrors = true;
                }
            });

            console.log("hasErrorsss", hasErrors)

            // Disable button if ANY validation errors exist (count > 0)
            setIsButtonDisabled(hasErrors);

            // Log for debugging
            console.log("Validation errors detected:", hasErrors);
        } else {
            // If no validation data, enable the button
            setIsButtonDisabled(false);
        }
    }, [uploadResponse]);

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
                            Click here {" "}
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
                {/* <Typography variant="body2" color="text.secondary" gutterBottom>
                    Review the data before importing ({data.length} records found)
                </Typography> */}

                {/* Validation Summary */}
                {renderValidationSummary()}

                {/* Table Section */}
                {/* <Box sx={{
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
                </Box> */}
                <Box sx={{
                    width: {
                        xs: "100%",
                        sm: "100%",
                        md: "100%",
                        lg: "100%",
                        xl: "100%"
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
                    disabled={loading || isButtonDisabled}
                >
                    {loading ? "Importing..." : "Import"}
                    {/* {loading ? "Importing..." :
                        Object.keys(selectedRows).length === 0 ? "Select rows to import" : "Import"} */}
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
                    {successCount} records were processed and imported without any errors.
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
            <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}
            >
                Bulk Upload
            </Typography>
            {/* Header */}


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
            {activeStep === 2 && !isButtonDisabled && renderImportSuccessStep()}

            {activeStep === 2 && <Box mt={4}>

                <Paper elevation={3} sx={{ p: 2, }}>
                    <Typography variant="h6" gutterBottom>
                        Upload Summary
                    </Typography>
                    <Box display="flex" gap={3}>
                        <Chip label={`Total: ${totalCount}`} color="primary" />
                        <Chip label={`Success: ${successCount}`} color="success" />
                        <Chip label={`Failed: ${failureCount}`} color="error" />
                    </Box>
                </Paper>

                <Box sx={{ p: 3 }}>
                    {uploadResult.map((result, index) => (
                        <Paper
                            key={index}
                            elevation={2}
                            sx={{
                                p: 2,
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderLeft: `6px solid ${result.success ? "green" : "red"}`,
                            }}
                        >
                            <Typography variant="body1">{result.message}</Typography>
                            <Chip
                                label={result.success ? "Imported" : "Failed"}
                                color={result.success ? "success" : "error"}
                                size="small"
                            />
                        </Paper>
                    ))}
                </Box>
            </Box>}

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

export default BulkUpload;
