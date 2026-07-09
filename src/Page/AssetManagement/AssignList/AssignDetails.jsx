import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from '../../Api';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
const csvConfig = mkConfig({ useKeysAsHeaders: true });

const AssignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowData, setRowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${baseUrl}/asset-mng/asset/details/${id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const json = await response.json();
        if (json.status) {
          if (json.data.data === null) {
            setNoDataFound(true);
            setSnackbar({
              open: true,
              message: json.message,
              severity: 'info'
            });
          } else {
            setRowData(json.data.data);
            setData(json.data.data.products.map(product => ({
              serialId: json.data.data.assignedId?.slice(0,6),
              serialNumber: product?.serialNo1 || 'N/A',
              productName: product?.name || 'N/A',
              category: product?.category?.name || 'N/A',
              attributes: product?.specValues?.map(s => `${s.specField?.name}: ${s.value}`).join(', ') || 'N/A',
              location: product?.location?.name || product?.unit?.name || 'N/A',
              inventorProductId: product.inventorProductId
            })));
          }
        } else {
          setNoDataFound(true);
          setSnackbar({
            open: true,
            message: json.message || 'Failed to fetch assignment details',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching assignment details:', error);
        setNoDataFound(true);
        setSnackbar({
          open: true,
          message: 'Error fetching assignment details',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [id, location.state]);

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("serialId", { header: "Serial ID", size: 100 }),
    columnHelper.accessor("serialNumber", { header: "Serial Number", size: 120 }),
    columnHelper.accessor("productName", { header: "Product Name", size: 150 }),
    columnHelper.accessor("category", { header: "Category", size: 120 }),
    columnHelper.accessor("attributes", { header: "Attributes", size: 200 }),
    columnHelper.accessor("location", { header: "Location", size: 150 }),
  ];

  const handleExport = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    layoutMode: "grid",
    muiTablePaperProps: { elevation: 0, sx: { border: "1px solid #e0e0e0", borderRadius: 2 } },
    muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px", whiteSpace: "nowrap", padding: "8px 16px" },
    },
    muiTableBodyRowProps: {
      sx: {
        height: "36px",
        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
      },
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => handleExport(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          onClick={() => handleExport(table.getPrePaginationRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExport(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          disabled={!table.getIsSomeRowsSelected()}
          className="Global-Button4"
        >
          Export Selected
        </Button>
      </Box>
    ),
  });

  const handleDownloadAgreement = () => {
    if (!rowData?.handover?.signatureFile) {
      setSnackbar({
        open: true,
        message: 'No agreement file available for download',
        severity: 'warning'
      });
      return;
    }

    try {
      let fileUrl = rowData.handover.signatureFile;
      if (fileUrl.startsWith('/')) {
        const base = baseUrl.replace(/\/api$/, '');
        fileUrl = `${base}${fileUrl}`;
      }

      // Open tab synchronously to prevent popup blocker interference
      window.open(fileUrl, '_blank');
      
      setSnackbar({
        open: true,
        message: 'Agreement document opened successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error opening agreement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to open agreement.',
        severity: 'error'
      });
    }
  };


  const handleCompleteHandover = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSnackbar({
        open: true,
        message: 'Asset handover completed successfully for all products!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Error completing handover:', error);
      setSnackbar({
        open: true,
        message: 'Failed to complete handover. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (noDataFound) {
    return (
      <Paper elevation={3} sx={{ p: 2, minHeight: "100vh" }}>
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} mb={2} onClick={() => navigate(-1)} className="line">
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            AssignDetails
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography variant="h6" color="textSecondary">
            No data found for this assignment
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: "100vh" }}>
      <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} mb={2} onClick={() => navigate(-1)} className="line">
        <ArrowBackIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          AssignDetails
        </Typography>
      </Box>
      <Box width={100} />

      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 3 }}>
        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>Employee Details</Typography>
          <Box sx={{ display: "flex", gap: 13 }}>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div><strong>Employee Name:</strong> {rowData.assignedTo?.user?.name || 'N/A'}</div>
              <div><strong>Designation:</strong> {rowData.assignedTo?.user?.designation || 'N/A'}</div>
              <div><strong>Department:</strong> {rowData.assignedTo?.user?.department?.name || 'N/A'}</div>
              <div><strong>Email ID:</strong> {rowData.assignedTo?.user?.email || 'N/A'}</div>
            </Box>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div><strong>Assignment ID:</strong> {rowData.assignedId?.slice(0, 6) || 'N/A'}</div>
              <div><strong>Start Date:</strong> {rowData.startDate ? new Date(rowData.startDate).toLocaleDateString() : 'N/A'}</div>
              <div><strong>End Date:</strong> {rowData.endDate ? new Date(rowData.endDate).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Status:</strong> {rowData.status === 'Active' ? 'Pending Handover' : rowData.status === 'Handovered' ? 'Assigned' : rowData.status || 'N/A'}</div>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>Assignment Details</Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: "1 1 250px" }}>
              <Box sx={{ fontSize: "12px", color: "#555", mb: 3 }}>
                <div><strong>Assign At:</strong> {rowData.createdAt ? new Date(rowData.createdAt).toLocaleDateString() : 'N/A'}</div>
              </Box>
              <Typography fontSize={12} mb={2}>Asset Allocation Agreement</Typography>
              <Typography mt={1} fontSize={12}>
                Click the button below to download the signed agreement form
              </Typography>
            </Box>
            <Box>
              <Typography fontSize={12} mb={1}>Status:</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2} mb={2}>
                <Typography fontSize={12}>Signed Agreement</Typography>
                {rowData?.handover?.signatureFile ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CloseIcon color="error" fontSize="small" />
                )}
              </Box>

              <Button
                className="Global-Button4"
                startIcon={<FileDownloadIcon />}
                onClick={handleDownloadAgreement}
                // sx={{ mt: 2 }}
              >
                Download Agreement
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography fontWeight={600} mb={2}>Assigned Products</Typography>
        <MaterialReactTable table={table} />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AssignDetails;