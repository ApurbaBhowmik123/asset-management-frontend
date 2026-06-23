import React, { useState, useEffect, useRef } from "react";
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import megathermLogo from "../../../assets/Sidebarimages/Layer 1 1.png";
import { baseUrl } from '../../Api';
// import { megathermLogoBase64 } from "../../../assets/Sidebarimages/Layer 1 1.png";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const Handover = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowData, setRowData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const printRef = useRef();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const profileStr = localStorage.getItem("profile");
  const userData = profileStr ? JSON.parse(profileStr)?.data : null;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/asset-mng/asset-helper/asset-assignable-details-single/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        if (result.status) {
          setRowData(result.data.data);
          setData([{
            serialId: result.data.data.assignedId,
            serialNumber: result.data.data.products.map(p => p.serialNo1 || p.serialNo2 || 'N/A').join(', '),
            productName: result.data.data.products.map(p => p.grInventoryProduct?.product?.name || p.name || 'N/A').join(', '),
            category: result.data.data.products.map(p => p.grInventoryProduct?.product?.category?.name || p.category?.name || 'N/A').join(', '),
            subCategory: result.data.data.products.map(p => p.grInventoryProduct?.product?.subcategory?.name || p.subcategory?.name || 'N/A').join(', '),
            location: result.data.data.products.map(p => p.grDetails?.unit?.name || 'N/A').join(', '),
            inventorProductId: result.data.data.products.map(p => p.inventorProductId).join(', ')
          }]);
        } else {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("serialId", { header: "Serial ID", size: 80 }),
    columnHelper.accessor("serialNumber", { header: "Serial Number", size: 120 }),
    columnHelper.accessor("productName", { header: "Product Name", size: 150 }),
    columnHelper.accessor("category", { header: "Category", size: 120 }),
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  }

  const handleDownloadPdf = async () => {
    const input = printRef.current;
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Asset_Allocation_Form_${rowData.assignedTo.user.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleCompleteHandover = async () => {
    if (!uploadedFile) {
      setSnackbar({
        open: true,
        message: 'Please upload the signed agreement file before completing handover.',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Get all inventory product IDs
      const inventoryIds = rowData.products.map(product => product.inventorProductId);
      formData.append('inventoryIds', JSON.stringify(inventoryIds));
      formData.append('signaturedFile', uploadedFile);
      formData.append('assignmentId', id);

      const response = await fetch(`${baseUrl}/asset-mng/asset-handover/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.status) {
        setSnackbar({
          open: true,
          message: 'Asset handover completed successfully for all products!',
          severity: 'success'
        });

        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        throw new Error(result.message || 'Handover failed');
      }
    } catch (error) {
      console.error('Error completing handover:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete handover. Please try again.',
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

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Typography color="error">Error loading data. Please try again.</Typography>
      </Box>
    );
  }

  if (!rowData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: "100vh" }}>
      <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} mb={2} onClick={() => navigate(-1)} className="line">
        <ArrowBackIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" >
          Handover
        </Typography>
      </Box>
      <Box width={100} />

      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 3 }}>
        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>Employee Details</Typography>
          <Box sx={{ display: "flex", gap: 13 }}>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div><strong>Employee Name:</strong> {rowData.assignedTo.user.name}</div>
              <div><strong>Designation:</strong> {rowData.assignedTo.user.designation}</div>
              <div><strong>Department:</strong> {rowData.assignedTo?.user?.department?.name}</div>
              <div><strong>Email ID:</strong> {rowData.assignedTo.user.email}</div>
            </Box>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div><strong>Assignment ID:</strong> {rowData.assignedId?.slice(0, 6)}</div>
              <div><strong>Start Date:</strong> {new Date(rowData.startDate).toLocaleDateString()}</div>
              <div><strong>End Date:</strong> {new Date(rowData.endDate).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {rowData.status}</div>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>Assignment Details</Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: "1 1 250px" }}>
              <Box sx={{ fontSize: "12px", color: "#555", mb: 3 }}>
                <div><strong>Assign At:</strong> {new Date(rowData.createdAt).toLocaleDateString()}</div>
              </Box>
              <Typography fontSize={12} mb={2}>Asset Allocation Agreement</Typography>
              <Button className="Global-Button6" onClick={handleDownloadPdf} >Download Agreement Form</Button>
              <Typography mt={1} fontSize={12}>
                Print this form, have it signed, and upload the signed copy below
              </Typography>
            </Box>
            <Box>
              <Typography fontSize={12} mb={1}>Status:</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2} mb={2}>
                <Typography fontSize={12}>Signed Agreement</Typography>
                {uploadedFile ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CloseIcon color="error" fontSize="small" />
                )}
              </Box>

              {uploadedFile ? (
                <Box sx={{
                  border: "1px solid #e0e0e0",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#fff"
                }}>
                  <Typography fontSize={12}>{uploadedFile.name}</Typography>
                  <IconButton size="small" onClick={handleRemoveFile}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="upload-file"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="upload-file">
                    <Box sx={{
                      border: "2px dashed #646464",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "#fff"
                    }}>
                      <CloudUploadIcon fontSize="large" color="primary" />
                      <Typography fontSize={12} color="text.secondary">
                        <strong>Drag & Drop</strong> or <strong>Choose File</strong> to upload<br />Signed Agreement
                      </Typography>
                    </Box>
                  </label>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography fontWeight={600} mb={2}>Assigned Products</Typography>
        <MaterialReactTable table={table} />
      </Box>

      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        <Button className="Global-Button3" onClick={() => navigate(-1)}>Cancel</Button>
        {(!rowData?.approver || (userData && String(rowData.approver.id) === String(userData.id))) && (
          <Button
            className="Global-Button2"
            onClick={handleCompleteHandover}
            disabled={isSubmitting || !uploadedFile || !table.getIsSomeRowsSelected()}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Complete Handover'
            )}
          </Button>
        )}
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

      {/* PDF Template - Hidden but used for PDF generation */}
      <div ref={printRef} style={{ width: "800px", padding: "20px", position: "absolute", left: "-9999px" }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          border: "1px solid #000",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "10px",
            borderBottom: "1px solid #000"
          }}>
            <div style={{ fontSize: "10px", lineHeight: "1.2" }}>
              Megatherm <br />
              Version 1.0
            </div>
            <div style={{ textAlign: "center", flexGrow: "1", margin: "0 20px" }}>
              <h1 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>Asset Allocation Form</h1>
            </div>
            <div style={{
              width: "60px",
              height: "60px",
              border: "1px solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0"
            }}>
              <div style={{ fontSize: "8px", textAlign: "center", color: "#666" }}><img src={megathermLogo} alt="Company Logo" style={{ maxWidth: "100%", maxHeight: "100%" }} /></div>
            </div>
          </div>

          {/* Main Form Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8", width: "25%" }}>Form No:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", width: "75%" }}>{rowData.assignedId}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Employee Name:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.assignedTo.user.name}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Employee Code:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.assignedTo.user.uuid}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Company:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>Aditya Birla</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Department:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.assignedTo?.user?.department?.name}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Designation:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.assignedTo.user.designation}</td>
              </tr>
              {/* <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Location:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>Mumbai</td>
              </tr> */}
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }} colSpan="2">Contact Details</td>
              </tr>
              <tr style={{ height: "60px" }}>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }} colSpan="2">
                  <table style={{ width: "100%", border: "none" }}>
                    <tbody>
                      <tr>
                        {/* <td style={{ border: "none", width: "33.33%", fontSize: "10px" }}>Telephone Number (Landline)</td> */}
                        <td style={{ border: "none", width: "33.33%", fontSize: "10px" }}>Contact Number (Mobile)</td>
                        <td style={{ border: "none", width: "33.33%", fontSize: "10px" }}>E-mail ID</td>
                      </tr>
                      <tr>
                        {/* <td style={{ border: "none" }}>N/A</td> */}
                        <td style={{ border: "none" }}>{rowData.assignedTo.user.mobile}</td>
                        <td style={{ border: "none" }}>{rowData.assignedTo.user.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }} colSpan="2">Asset Details</td>
              </tr>
              <tr>
                <td colspan="2" style={{ border: "1px solid #000", padding: "3px 5px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#e8e8e8" }}>
                        <th style={{ border: "1px solid #000", padding: "3px 5px" }}>Asset ID</th>
                        <th style={{ border: "1px solid #000", padding: "3px 5px" }}>Description</th>
                        <th style={{ border: "1px solid #000", padding: "3px 5px" }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData.products.map((product, index) => (
                        <tr key={index}>
                          <td style={{ border: "1px solid #000", padding: "3px 5px" }}>{product.AssetID || 'N/A'}</td>
                          <td style={{ border: "1px solid #000", padding: "3px 5px" }}>{product.name} ({product.brand?.name})</td>
                          <td style={{ border: "1px solid #000", padding: "3px 5px" }}>{product.category?.name || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Reasons for Asset Allocation:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", height: "40px" }}>{rowData.notes || 'Standard company equipment allocation'}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Peripheral devices (if any):</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", height: "30px" }}>{rowData.products[0]?.name} ({rowData.products[0]?.brand?.name})</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Asset Policy provided to user (Yes/ No) (if applicable):</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", height: "20px" }}>Yes</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#e8e8e8" }}>Asset Database updated by (Name & Signature):</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>___________________</td>
              </tr>
            </tbody>
          </table>

          {/* Signature Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "11px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }}></td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }}>Name</td>
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }}>Designation</td> */}
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }}>Date</td> */}
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold", textAlign: "center" }}>Signature</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", height: "25px" }}></td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td>
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td> */}
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td> */}
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold" }}>Issuer:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.issuer?.name || 'N/A'}</td>
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td> */}
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{new Date(rowData.createdAt).toLocaleDateString()}</td> */}
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold" }}>Approver:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}>{rowData.approver?.name || 'Pending'}</td>
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td> */}
                {/* <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td> */}
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }}></td>
              </tr>
              {/* Add Start Date and End Date rows here */}
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold" }}>Start Date:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }} colSpan="3">{new Date(rowData.startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top", backgroundColor: "#d3d3d3", fontWeight: "bold" }}>End Date:</td>
                <td style={{ border: "1px solid #000", padding: "3px 5px", verticalAlign: "top" }} colSpan="3">{new Date(rowData.endDate).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>

          {/* User Declaration Section */}
          <div style={{
            padding: "10px",
            borderTop: "1px solid #000",
            fontSize: "10px",
            lineHeight: "1.3"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>User Declaration</div>
            <div style={{ marginBottom: "8px" }}>
              • I am aware that I am fully accountable for this asset and all the information it shall contain while in my custody. I shall exercise utmost care to prevent any physical damage / misuse of this asset and the information it shall contain.
            </div>
            <div style={{ marginBottom: "8px" }}>
              • I will not download, install or run any unauthorized programs or utilities.
            </div>
            <div style={{ marginBottom: "8px" }}>
              • I will not corrupt, alter or misuse the Information Systems, Hardware and Software Usage Policy and I have agreed to the same.
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              fontSize: "10px"
            }}>
              <span>Place:</span>
              <div style={{ borderBottom: "1px solid #000", width: "200px", height: "20px", margin: "0 10px" }}></div>
              <span>Date:</span>
              <div style={{ borderBottom: "1px solid #000", width: "200px", height: "20px", margin: "0 10px" }}></div>
              <span>Employee Signature:</span>
              <div style={{ borderBottom: "1px solid #000", width: "200px", height: "20px", margin: "0 10px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default Handover;