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
  Snackbar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import megathermLogo from "../../assets/Sidebarimages/Layer 1 1.jpeg";
import { baseUrl } from "../Api";
import { megathermLogoBase64 } from "../../assets/Sidebarimages/logoBase64";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const Transfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [rowData, setRowData] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);
  const printRef = useRef();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [approverId, setApproverId] = useState("");
  const [issuerId, setIssuerId] = useState("");

  // Default empty row data structure
  const getDefaultRowData = () => ({
    transferId: "N/A",
    id: "N/A",
    remarks: "N/A",
    status: "N/A",
    transferDate: null,
    issuer: "N/A",
    approver: "N/A",
    createdAt: null,
    sourceUnit: { name: "N/A" },
    destinationUnit: { name: "N/A" },
    sourceUnitLocation: { location: { name: "N/A" } },
    destinationUnitLocation: { location: { name: "N/A" } },
    createdBy: "N/A",
    assignedTo: {
      user: {
        name: "N/A",
        designation: "N/A",
        email: "N/A",
        id: null,
        department: { name: "N/A" },
      },
    },
    products: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      setNoDataFound(false);

      try {
        const token = localStorage.getItem("token");

        const tryTransfer = await fetch(
          `${baseUrl}/asset-transfer/accept/details/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!tryTransfer.ok) {
          throw new Error("Network response was not ok for transfer endpoint");
        }

        const transferResult = await tryTransfer.json();
        if (
          transferResult.status &&
          Array.isArray(transferResult.data?.data) &&
          transferResult.data.data.length > 0
        ) {
          normalizeTransferResponse(transferResult.data.data);
          // Set approverId and issuerId from the response if available
          if (transferResult.data.data[0]?.approverId) {
            setApproverId(transferResult.data.data[0].approverId);
          }
          if (transferResult.data.data[0]?.issuerId) {
            setIssuerId(transferResult.data.data[0].issuerId);
          }
        } else {
          // Set default data when no data found
          setRowData(getDefaultRowData());
          setData([]);
          setNoDataFound(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default data even on error
        setRowData(getDefaultRowData());
        setData([]);
        setIsError(true);
        setNoDataFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const normalizeTransferResponse = (transferItems) => {
    if (!transferItems || transferItems.length === 0) {
      setRowData(getDefaultRowData());
      setData([]);
      setNoDataFound(true);
      return;
    }

    const synthetic = {
      transferId: transferItems[0]?.transferId,
      id: transferItems[0]?.id,
      remarks: transferItems[0]?.remarks,
      status: transferItems[0]?.status,
      transferDate: transferItems[0]?.transferDate,
      issuer: transferItems[0]?.issuer,
      approver: transferItems[0]?.approver,
      createdAt: transferItems[0]?.createdAt,
      sourceUnit: transferItems[0]?.sourceUnit,
      destinationUnit: transferItems[0]?.destinationUnit,
      sourceUnitLocation: transferItems[0]?.sourceUnitLocation,
      destinationUnitLocation: transferItems[0]?.destinationUnitLocation,
      createdBy: transferItems[0]?.createdBy,
      assignedTo: {
        user: {
          name: transferItems[0]?.createdByUser?.name || "N/A",
          designation: transferItems[0]?.createdByUser?.designation || "N/A",
          email: transferItems[0]?.createdByUser?.email || "N/A",
          id: transferItems[0]?.createdByUser?.id || null,
          department: transferItems[0]?.createdByUser?.departmentId
            ? { name: `Dept-${transferItems[0].createdByUser.departmentId}` }
            : { name: "N/A" },
        },
      },
      products: [],
    };

    transferItems.forEach((transferItem) => {
      if (transferItem.inventoryProductDetails) {
        const ipd = transferItem.inventoryProductDetails;
        const grInv = ipd.grInventoryProduct || {};
        const product = grInv.product || {};

        synthetic.products.push({
          serialNo1: ipd.serialNo1 || ipd.serialNo || product.serialNo || "N/A",
          name: product.name || grInv.description || "N/A",
          brand: product.brand || grInv.brand || null,
          category: product.category || null,
          subcategory: product.subcategory || null,
          inventorProductId: ipd.id || ipd.inventoryProductDetailId || null,
          grDetails: {
            unit: transferItem.sourceUnit || transferItem.sourceUnit,
          },
          productUuid: ipd.uuid,
          sourceUnit: transferItem.sourceUnit?.name || "N/A",
          destinationUnit: transferItem.destinationUnit?.name || "N/A",
          sourceLocation: transferItem.sourceUnitLocation?.name || "N/A",
          destinationLocation:
            transferItem.destinationUnitLocation?.name || "N/A",
        });
      }
    });

    setRowData(synthetic);

    const rows = synthetic.products.map((product) => ({
      serialId: synthetic.transferId || synthetic.id || "N/A",
      serialNumber: product.serialNo1 || "N/A",
      productName: product.name || "N/A",
      category: product.category?.name || product.category || "N/A",
      subCategory: product.subcategory?.name || product.subcategory || "N/A",
      warehouse: product.grDetails?.unit?.name || "N/A",
      inventorProductId: product.inventorProductId,
      sourceUnit: product.sourceUnit,
      destinationUnit: product.destinationUnit,
      sourceLocation: product.sourceLocation,
      destinationLocation: product.destinationLocation,
      productUuid: product.productUuid || "N/A",
    }));

    setData(rows);
  };

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("productUuid", { header: "Asset ID", size: 200 }),
    columnHelper.accessor("serialId", { header: "Serial ID", size: 120 }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 140,
    }),
    columnHelper.accessor("productName", { header: "Product Name", size: 150 }),
    columnHelper.accessor("warehouse", { header: "Warehouse", size: 200,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
     }),
    columnHelper.accessor("sourceUnit", { header: "Source Unit", size: 120,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ), }),
    columnHelper.accessor("destinationUnit", {
      header: "Destination Unit",
      size: 150,
    }),
    columnHelper.accessor("sourceLocation", {
      header: "Source Location",
      size: 150,
    }),
    columnHelper.accessor("destinationLocation", {
      header: "Destination Location",
      size: 140,
    }),
    
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
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
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
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No Data Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No transfer products found for this request.
        </Typography>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => handleExport(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={data.length === 0}
        >
          Export Page Rows
        </Button>
        <Button
          onClick={() => handleExport(table.getPrePaginationRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={data.length === 0}
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExport(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          disabled={!table.getIsSomeRowsSelected() || data.length === 0}
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
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
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

    const nameForFile = (
      rowData?.transferId ||
      rowData?.assignedId ||
      rowData?.assignedTo?.user?.name ||
      "Asset"
    )
      .toString()
      .replace(/\s+/g, "_");

    pdf.save(`Asset_Transfer_Form_${nameForFile}.pdf`);
  };

  const handleAcceptTransfer = async () => {
    if (!id) {
      setSnackbar({
        open: true,
        message: "No transfer id found",
        severity: "error",
      });
      return;
    }

    if (noDataFound) {
      setSnackbar({
        open: true,
        message: "Cannot accept transfer - no data found for this request.",
        severity: "error",
      });
      return;
    }

    if (!approverId || !issuerId) {
      setSnackbar({
        open: true,
        message: "Approver ID and Issuer ID are required",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const requestBody = {
        approverId: approverId,
        issuerId: issuerId,
        approveDate: new Date().toISOString()
      };

      const response = await fetch(
        `${baseUrl}/asset-transfer/accept/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      if (result.status) {
        setSnackbar({
          open: true,
          message: "Transfer accepted successfully",
          severity: "success",
        });
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        throw new Error(result.message || "Accept failed");
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "Accept failed",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!rowData?.transferId && !rowData?.id) {
      setSnackbar({
        open: true,
        message: "No transfer id found",
        severity: "error",
      });
      return;
    }

    if (noDataFound) {
      setSnackbar({
        open: true,
        message: "Cannot reject transfer - no data found for this request.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const transferIdentifier = id || rowData.transferId || rowData.id;

      const response = await fetch(
        `${baseUrl}/asset-transfer/cancel/${transferIdentifier}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      if (result.status) {
        setSnackbar({
          open: true,
          message: "Transfer cancelled successfully",
          severity: "success",
        });
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        throw new Error(result.message || "Cancel failed");
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "Cancel failed",
        severity: "error",
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, minHeight: "100vh" }}>
      <Box
        display="flex"
        alignItems="center"
        sx={{ cursor: "pointer" }}
        mb={2}
        onClick={() => navigate(-1)}
        className="line"
      >
        <ArrowBackIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          {rowData?.transferId && rowData.transferId !== "N/A"
            ? `Transfer - ${rowData.transferId}`
            : "Transfer - No Data"}
        </Typography>
      </Box>

      {/* Show error alert if there's an error but still display the interface */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading transfer data. Please check the transfer ID and try again.
        </Alert>
      )}

      {/* Show no data alert */}
      {noDataFound && !isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No transfer data found for ID: {id}.
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 3,
        }}
      >
        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>
            Requester / Employee Details
          </Typography>
          <Box sx={{ display: "flex", gap: 13 }}>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div>
                <strong>Name:</strong>{" "}
                {rowData?.assignedTo?.user?.name ||
                  rowData?.createdByUser?.name ||
                  "N/A"}
              </div>
              <div>
                <strong>Designation:</strong>{" "}
                {rowData?.assignedTo?.user?.designation ||
                  rowData?.createdByUser?.designation ||
                  "N/A"}
              </div>
              <div>
                <strong>Department:</strong>{" "}
                {rowData?.assignedTo?.user?.department?.name ||
                  rowData?.assignedTo?.user?.department?.name ||
                  "N/A"}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {rowData?.assignedTo?.user?.email ||
                  rowData?.createdByUser?.email ||
                  "N/A"}
              </div>
            </Box>
            <Box sx={{ fontSize: "12px", color: "#555", lineHeight: 2.2 }}>
              <div>
                <strong>ID:</strong>{" "}
                {rowData?.assignedId || rowData?.transferId || rowData?.id || id || "N/A"}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {rowData?.transferDate
                  ? new Date(rowData.transferDate).toLocaleDateString()
                  : rowData?.createdAt
                    ? new Date(rowData.createdAt).toLocaleDateString()
                    : "N/A"}
              </div>
              <div>
                <strong>Status:</strong> {rowData?.status || "N/A"}
              </div>
              <div>
                <strong>Source Unit:</strong>{" "}
                {rowData?.sourceUnit?.name || "N/A"}
              </div>
              <div>
                <strong>Destination Unit:</strong>{" "}
                {rowData?.destinationUnit?.name || "N/A"}
              </div>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2, flex: 1, background: "#F8F8F8" }}>
          <Typography fontWeight="bold" fontSize={15} mb={2}>
            Action / Documents
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography fontSize={12} mb={1}>
                Signed Document Status:
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={2} mb={2}>
                <Typography fontSize={12}>Signed Agreement</Typography>
                {uploadedFile ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CloseIcon color="error" fontSize="small" />
                )}
              </Box>

              {uploadedFile ? (
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography fontSize={12}>{uploadedFile.name}</Typography>
                  <IconButton size="small" onClick={handleRemoveFile}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    id="upload-file"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="upload-file">
                    <Box
                      sx={{
                        border: "2px dashed #646464",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        cursor: "pointer",
                        bgcolor: "#fff",
                      }}
                    >
                      <CloudUploadIcon fontSize="large" color="primary" />
                      <Typography fontSize={12} color="text.secondary">
                        <strong>Drag & Drop</strong> or{" "}
                        <strong>Choose File</strong> to upload
                        <br />
                        Signed Agreement
                      </Typography>
                    </Box>
                  </label>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1020px",
            xl: "1300px",
          },
          mx: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography sx={{ fontSize: "15px", fontWeight: 500 }} gutterBottom>
          Transfer Product ({data.length})
        </Typography>
        <MaterialReactTable table={table} />
      </Box>

      {/* <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        <Button className="Global-Button3" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          className="Global-Button4"
          onClick={handleRejectTransfer}
          disabled={isSubmitting || noDataFound}
        >
          {isSubmitting ? <CircularProgress size={18} /> : "Reject Transfer"}
        </Button>
        <Button
          className="Global-Button2"
          onClick={handleAcceptTransfer}
          disabled={isSubmitting || noDataFound}
        >
          {isSubmitting ? <CircularProgress size={18} /> : "Accept Transfer"}
        </Button>
      </Box> */}

      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        <Button className="Global-Button3" onClick={() => navigate(-1)}>
          Cancel
        </Button>

        {/* Only show Reject and Accept buttons if status is not "approved" */}
        {rowData?.status !== "APPROVED" && (
          <>
            <Button
              className="Global-Button4"
              onClick={handleRejectTransfer}
              disabled={isSubmitting || noDataFound}
            >
              {isSubmitting ? <CircularProgress size={18} /> : "Reject Transfer"}
            </Button>
            <Button
              className="Global-Button2"
              onClick={handleAcceptTransfer}
              disabled={isSubmitting || noDataFound}
            >
              {isSubmitting ? <CircularProgress size={18} /> : "Accept Transfer"}
            </Button>
          </>
        )}
      </Box>



      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* PDF Template - Hidden but used for PDF generation */}
      <div
        ref={printRef}
        style={{
          width: "800px",
          padding: "20px",
          position: "absolute",
          left: "-9999px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "white",
            border: "1px solid #000",
            fontFamily: "Arial, sans-serif",
            fontSize: "11px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "10px",
              borderBottom: "1px solid #000",
            }}
          >
            <div style={{ fontSize: "10px", lineHeight: "1.2" }}>
              Megatherm
              <br />
              Version 1.0
            </div>
            <div
              style={{ textAlign: "center", flexGrow: "1", margin: "0 20px" }}
            >
              <h1
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                Asset Transfer Form
              </h1>
            </div>
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "1px solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <div
                style={{ fontSize: "8px", textAlign: "center", color: "#666" }}
              >
                <img
                  src={megathermLogoBase64}
                  alt="Company Logo"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Detail table + products */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "11px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#e8e8e8",
                    width: "25%",
                  }}
                >
                  Form No:
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    width: "75%",
                  }}
                >
                  {rowData?.transferId ||
                    rowData?.assignedId ||
                    (rowData?.id ? `ID-${rowData.id}` : id || "N/A")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#e8e8e8",
                  }}
                >
                  Name:
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                  }}
                >
                  {rowData?.assignedTo?.user?.name ||
                    rowData?.createdByUser?.name ||
                    "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#e8e8e8",
                  }}
                >
                  Email:
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                  }}
                >
                  {rowData?.assignedTo?.user?.email ||
                    rowData?.createdByUser?.email ||
                    "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#e8e8e8",
                  }}
                >
                  Source Unit:
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                  }}
                >
                  {rowData?.sourceUnit?.name || "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#e8e8e8",
                  }}
                >
                  Destination Unit:
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                  }}
                >
                  {rowData?.destinationUnit?.name || "N/A"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    verticalAlign: "top",
                    backgroundColor: "#d3d3d3",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  colSpan="2"
                >
                  Asset Details
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  style={{ border: "1px solid #000", padding: "3px 5px" }}
                >
                  {(rowData?.products || []).length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#e8e8e8" }}>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "3px 5px",
                            }}
                          >
                            Asset ID
                          </th>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "3px 5px",
                            }}
                          >
                            Description
                          </th>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "3px 5px",
                            }}
                          >
                            Category
                          </th>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "3px 5px",
                            }}
                          >
                            Subcategory
                          </th>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "3px 5px",
                            }}
                          >
                            Product UUID
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowData.products.map((product, idx) => (
                          <tr key={idx}>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "3px 5px",
                              }}
                            >
                              {product.serialNo1 || "N/A"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "3px 5px",
                              }}
                            >
                              {product.name || "N/A"}{" "}
                              {product.brand?.name
                                ? `(${product.brand.name})`
                                : ""}
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "3px 5px",
                              }}
                            >
                              {product.category?.name ||
                                product.category ||
                                "N/A"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "3px 5px",
                              }}
                            >
                              {product.subcategory?.name ||
                                product.subcategory ||
                                "N/A"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "3px 5px",
                              }}
                            >
                              {product.productUuid || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No products found for this transfer
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Paper>
  );
};

export default Transfer;