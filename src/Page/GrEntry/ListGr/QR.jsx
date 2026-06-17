import React, { useEffect, useState, useRef } from "react";
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
  Grid,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { ArrowDown, ArrowDownToLine, Printer } from "lucide-react";
import QRCODE from "../../../assets/GR/QRCODE.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../../Api";

const columnHelper = createMRTColumnHelper();

const columns = [
  columnHelper.accessor("assetId", {
    header: "Asset Id",
    size: 100,
  }),
  columnHelper.accessor("serialNo", {
    header: "Serial No",
    size: 150,
  }),
  columnHelper.accessor("product", {
    header: "Product",
    size: 100,
  }),
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const QR = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddProduct, setshowAddProduct] = useState(false);
  const [showQrDetails, setShowQrDetails] = useState();
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const user = localStorage.getItem("token");
  const qrRef = useRef();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleFetchGRDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/gr/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`,
        },
      });
      const data = await res?.json();
      if (!data?.status) {
        setSnackbar({
          open: true,
          message: data?.message,
          severity: "error",
        });
        return;
      }
      setShowQrDetails(data?.data);

      if (data?.data?.inventoryProducts) {
        const mappedData = [];
        data.data.inventoryProducts.forEach((inventoryProduct) => {
          if (inventoryProduct.inventoryDetails) {
            inventoryProduct.inventoryDetails.forEach((detail) => {
              mappedData.push({
                assetId: detail.uuid,
                serialNo: detail.serialNo1 || detail.serialNo2 || "N/A",
                product: inventoryProduct.category?.name || "N/A",
              });
            });
          }
        });
        setTableData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching GR details:", error);
      setSnackbar({
        open: true,
        message: "Error fetching data",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    handleFetchGRDetails();
  }, []);

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(tableData);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: "#FFE3E1",
      },
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
      },
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
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
  // Alternative approach using CSS print media queries
  const handlePrintQR = () => {
    try {
      // Create a hidden div for printing
      const printDiv = document.createElement("div");
      printDiv.id = "print-qr-content";
      printDiv.style.display = "none";

      // Create a grid container for all QR codes
      let printContent = `
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px; justify-items: center;">
`;


      // Add each QR code to the grid
      qrItems.forEach((item) => {
        printContent += `
        <div style="display: flex; flex-direction: column; align-items: center; page-break-inside: avoid;">
          <img src="${item.qrCodeUrl}" alt="QR Code" style="width: 500px; height: auto;" />
<div style="font-size: 18px; text-align: center; margin-top: 4px;">
  ${item.uuid}
</div>

        </div>
      `;
      });

      printContent += `</div>`;
      printDiv.innerHTML = printContent;
      document.body.appendChild(printDiv);

      // Add print styles
      const printStyles = document.createElement("style");
      printStyles.id = "print-qr-styles";
      printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-qr-content, #print-qr-content * {
          visibility: visible;
        }
        #print-qr-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          display: block !important;
        }
      }
    `;
      document.head.appendChild(printStyles);

      // Print the page
      window.print();

      // Clean up after printing
      const cleanup = () => {
        if (document.getElementById("print-qr-content")) {
          document.body.removeChild(printDiv);
        }
        if (document.getElementById("print-qr-styles")) {
          document.head.removeChild(printStyles);
        }
      };

      // Cleanup after print dialog closes
      setTimeout(cleanup, 1000);
    } catch (error) {
      console.error("Error in handlePrintQR:", error);
      setSnackbar({
        open: true,
        message: "Error occurred while preparing print",
        severity: "error",
      });
    }
  };

  // Or, if you want to keep the popup approach but with better error handling:
  const handlePrintQRPopup = async () => {
    try {
      // First, let's make sure all QR images are loaded
      const imagePromises = qrItems.map((item) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = item.qrCodeUrl;
        });
      });

      await Promise.all(imagePromises);

      const qrGroups = qrItems.reduce((groups, item) => {
        const group = item.productName || "Unknown Product";
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
      }, {});

      const printContent = Object.entries(qrGroups)
        .map(
          ([group, items]) => `
      <div style="margin-bottom: 2rem;">
        <h3>${group}</h3>
        <div class="qr-grid">
          ${items
              .map(
                (item) => `
            <div class="qr-box">
             <img src="${item.qrCodeUrl}" alt="QR Code" style="width: 5rem; height: 5rem; object-fit: contain;" />
              <div class="qr-title">${item.serialNo}</div>
            </div>
          `
              )
              .join("")}
        </div>
      </div>
    `
        )
        .join("");

      const newWindow = window.open(
        "",
        "_blank",
        "width=800,height=600,scrollbars=yes"
      );

      if (!newWindow) {
        throw new Error("Could not open print window");
      }

      newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes</title>
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
            .qr-box { display: flex; flex-direction: column; align-items: center; margin-bottom: 1rem; page-break-inside: avoid; }
            .qr-title { font-weight: bold; text-align: center; font-size: 12px; margin-top: 5px; }
            h3 { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 1rem; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);

      newWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      setSnackbar({
        open: true,
        message: "Failed to print QR codes",
        severity: "error",
      });
    }
  };

  // Generate QR code items from inventory details
  const generateQRItems = () => {
    if (!showQrDetails?.inventoryProducts) return [];

    const qrItems = [];
    showQrDetails.inventoryProducts.forEach((inventoryProduct) => {
      if (inventoryProduct.inventoryDetails) {
        inventoryProduct.inventoryDetails.forEach((detail) => {
          qrItems.push({
            productName: inventoryProduct.product?.name || "Unknown Product",
            serialNo:
              detail.serialNo1 || detail.serialNo2 || detail.uuid.slice(-12),
            uuid: detail.uuid,
            qrCodeUrl: detail.qrCode?.qrCodeUrl,
          });
        });
      }
    });
    return qrItems;
  };

  const qrItems = generateQRItems();

  return (
    <Box sx={{ width: "100%" }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Link to={"/grentry/listgr"}>
        <ArrowBackIcon />
      </Link>
      <Grid container spacing={2}>
        <Grid item size={{ md: 6 }}>
          <MaterialReactTable table={table} />
        </Grid>
        <Grid item size={{ md: 6 }}>
          <Box>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1">QR Code</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#808080",
                    }}
                  >
                    {/* <ArrowDownToLine size={15} />
                    <Box
                      sx={{ fontSize: "small", cursor: "pointer" }}
                    >
                      Download
                    </Box> */}
                  </Box>
                  <Button
                    onClick={handlePrintQR}
                    className="Global-Button"
                    startIcon={<Printer size={14} />}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }} ref={qrRef}>
                <Grid container >
                  {qrItems?.map((item, index) => (
                    <Grid key={item.uuid} size={{ md: 6 }}>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        // size={{ md: 3 }} 
                        >
                          <a
                            href={`http://143.244.156.175/product-detail/${item.uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              style={{ width: "230px", height: "auto", }}
                              src={item?.qrCodeUrl}
                              alt="QR Code"
                            />
                          </a>

                        </Box>
                        <Box >
                          {/* <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontWeight: "600",
                              fontSize: "12px",
                              textAlign: "center"
                            }}
                            variant="caption"
                          >
                            {item.productName}
                          </Typography> */}
                          {/* <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "12px",
                              textAlign: "center"
                            }}
                          >
                            {item.serialNo}
                          </Typography> */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: "12px",
                              textAlign: "center"
                            }}
                          >
                            {item.uuid}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QR;
