import React, { useEffect, useState, useCallback, useRef } from "react";
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
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { ArrowDown, ArrowDownToLine, Printer } from "lucide-react";
import QRCODE from "../../assets/GR/QRCODE.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const columns = [
  columnHelper.accessor(row => row.unit?.uuid ?? "-", {
    id: "unitUuid",
    header: "CoCd",
    size: 100,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.unit?.name ?? "-", {
    id: "unitName",
    header: "Company Name",
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.uuid ?? "-", {
    id: "assetUuid",
    header: "Asset",
    size: 100,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.grInventoryProduct?.product?.subcategory?.name ?? "-", {
    id: "assetDesc",
    header: "Asset Description",
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.grInventoryProduct?.grDetails?.invoiceDate ?? null, {
    id: "capDate",
    header: "Cap Date",
    size: 150,
    Cell: ({ cell }) => {
      const dateValue = cell.getValue();
      return (
        <Typography variant="body2">
          {dateValue
            ? dateTimeHelper.formatDate(dateValue, "DD/MM/YYYY")
            : "-"}
        </Typography>
      );
    },
  }),
  columnHelper.accessor(row => row.grInventoryProduct?.product?.name ?? "-", {
    id: "modelName",
    header: "Model Name",
    size: 150,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.serialNo1 || row.serialNo2 || "-", {
    id: "serialNumber",
    header: "Serial Number",
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
  columnHelper.accessor(row => row.location?.name ?? "-", {
    id: "location",
    header: "Location",
    size: 120,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  }),
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const QRList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setshowAddProduct] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const user = localStorage.getItem("token");
  const qrRef = useRef();

  // Memoize the API call function to prevent unnecessary re-renders
  // const handleFetchAllQRList = useCallback(async () => {
  //   const { pageIndex, pageSize } = pagination;
  //   setLoading(true);

  //   try {
  //     const response = await fetch(
  //       `${baseUrl}/gr/qr/qr-list?limit=${pageSize}&search=${globalFilter}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${user}`,
  //         },
  //       }
  //     );

  //     const result = await response.json();

  //     if (result.status && result.data) {
  //       setData(result.data.data || []);
  //       setTotalCount(result.data.total || 0);
  //     } else {
  //       setData([]);
  //       setTotalCount(0);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching QR list: ", error);
  //     setData([]);
  //     setTotalCount(0);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [pagination.pageIndex, pagination.pageSize, globalFilter, user]);
  const handleFetchAllQRList = useCallback(async () => {
    const { pageIndex, pageSize } = pagination;
    setLoading(true);

    try {
      const response = await fetch(
        `${baseUrl}/gr/qr/qr-list?page=${pageIndex + 1}&limit=${pageSize}&search=${globalFilter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user}`,
          },
        }
      );

      const result = await response.json();

      if (result.status && result.data) {
        setData(result.data.data || []);
        setTotalCount(result.data.total || 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching QR list: ", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, user]);

  // Use useEffect with proper dependencies
  useEffect(() => {
    handleFetchAllQRList();
  }, [handleFetchAllQRList]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  // Custom pagination handler to prevent unnecessary API calls
  const handlePaginationChange = useCallback((updater) => {
    setPagination((prev) => {
      const newPagination =
        typeof updater === "function" ? updater(prev) : updater;
      return newPagination;
    });
  }, []);

  // Custom global filter handler with debouncing
  const handleGlobalFilterChange = useCallback((value) => {
    setGlobalFilter(value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalCount, // Total count for server-side pagination
    manualPagination: true, // Enable server-side pagination
    manualFiltering: true, // Enable server-side filtering
    state: {
      globalFilter,
      pagination,
      isLoading: loading,
    },
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      rowsPerPageOptions: [5, 10, 20, 50, 100, 120, 150], // ✅ FIX rows per page dropdown
    },
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

    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalCount}
      </Typography>
    ),
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

  const handlePrintQR = () => {
    try {
      // Create a hidden div for printing
      const printDiv = document.createElement("div");
      printDiv.id = "print-qr-content";
      printDiv.style.display = "none";

      // Generate print content with 4 QR codes per row
      let printContent = '<div class="print-qr-grid">';

      data.forEach((item, index) => {
        // Only include serial number in the title
        const serialNumber = item.serialNo1 || item.serialNo2 || "-";

        printContent += `
        <div class="print-qr-box">
          <img src="${item.qrCode?.qrCodeUrl || ""}" alt="QR Code" />
          <div class="print-qr-title">${item?.uuid}</div>
        </div>
      `;

        // Close and open new row every 4 items
        if ((index + 1) % 4 === 0) {
          printContent += '</div><div class="print-qr-grid">';
        }
      });

      printContent += "</div>";
      printDiv.innerHTML = printContent;

      // Add print styles
      const printStyles = document.createElement("style");
      printStyles.id = "print-qr-styles";
      printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden;
          margin: 0 !important;
          padding: 0 !important;
        }
        #print-qr-content, #print-qr-content * {
          visibility: visible;
        }
        #print-qr-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: block !important;
          padding: 5mm;
          box-sizing: border-box;
        }
        .print-qr-grid {
          display: grid;
        grid-template-columns: repeat(2, 1fr);
          gap: 5mm;
          margin-bottom: 5mm;
        }
        .print-qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          page-break-inside: avoid;
          padding: 2mm;
          box-sizing: border-box;
        }
        .print-qr-box img {
           width: 500px;   
           max-width: 700px;   
           height: auto;
        }
        .print-qr-title {
          font-weight: bold;
          text-align: center;
          font-size: 23px;
          margin-top: 1mm;
          word-break: break-word;
          padding: 0 1mm;
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      }
    `;

      document.head.appendChild(printStyles);
      document.body.appendChild(printDiv);

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

  return (
    // <Box sx={{ width: "100%" }}>
    //   <Link to={"/grentry/listgr"}>
    //     <ArrowBackIcon />
    //   </Link>
    //   <Grid container spacing={2}>
    //     <Grid item size={{ md: 6 }}>
    //       <Box
    //         sx={{
    //           width: {
    //             xs: "100%",
    //             sm: "100%",
    //             md: "100%",
    //             lg: "500px",
    //             xl: "500px",
    //           },
    //           overflow: "auto",
    //           mx: "auto",
    //           px: { xs: 1, sm: 2 },
    //         }}
    //       >
    //         <MaterialReactTable table={table} />
    //       </Box>
    //     </Grid>
    //     <Grid item size={{ md: 6 }}>
    //       <Box>
    //         <Paper sx={{ p: 2, height: "100%" }}>
    //           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    //             <Box sx={{ display: "flex", alignItems: "center" }}>
    //               <Typography variant="body1">QR Code</Typography>
    //             </Box>
    //             <Box sx={{ display: "flex", gap: 2 }}>
    //               <Box
    //                 sx={{
    //                   display: "flex",
    //                   alignItems: "center",
    //                   color: "#808080",
    //                 }}
    //               >
    //                 {/* <ArrowDownToLine size={15} />
    //                 <Box sx={{ fontSize: "small", cursor: "pointer" }}>
    //                   Download
    //                 </Box> */}
    //               </Box>
    //               <Button
    //                 onClick={handlePrintQR}
    //                 className="Global-Button"
    //                 startIcon={<Printer size={14} />}
    //                 sx={{
    //                   display: "flex",
    //                   alignItems: "center",
    //                 }}
    //               >
    //                 Print
    //               </Button>
    //             </Box>
    //           </Box>
    //           <Box sx={{ mt: 2 }} ref={qrRef}>
    //             <Grid spacing={2} container>
    //               {data?.map((item, index) => (
    //                 <Grid item xs={12} md={6} key={index}>
    //                   <Box>
    //                     <Box
    //                       sx={{
    //                         display: "flex",
    //                         justifyContent: "center",
    //                         alignItems: "center",
    //                       }}
    //                       size={{ md: 3 }}
    //                     >
    //                       <a
    //                         href={`http://143.244.156.175/product-detail/${item.uuid}`}
    //                         target="_blank"
    //                         rel="noopener noreferrer"
    //                       >
    //                         <img
    //                           style={{ width: "230px", height: "auto", }}
    //                           src={item?.qrCode?.qrCodeUrl}
    //                           alt="QR Code"
    //                         />
    //                       </a>
    //                     </Box>
    //                     <Box sx={{ mt: 1 }}>
    //                       <Typography
    //                         sx={{
    //                           display: "flex",
    //                           justifyContent: "center",
    //                           alignItems: "center",
    //                           fontWeight: "600",
    //                           fontSize: "12px",
    //                           textAlign: "center"
    //                         }}
    //                         variant="caption"
    //                       >
    //                         {String(item.grInventoryProduct?.product?.name || "-")}
    //                       </Typography>
    //                       <Typography
    //                         variant="caption"
    //                         sx={{
    //                           display: "flex",
    //                           justifyContent: "center",
    //                           alignItems: "center",
    //                           fontSize: "12px",
    //                           textAlign: "center"
    //                         }}
    //                       >
    //                         {String(item?.serialNo1 || item?.serialNo2 || "-")}
    //                       </Typography>
    //                       <Typography
    //                         variant="caption"
    //                         sx={{
    //                           display: "flex",
    //                           justifyContent: "center",
    //                           alignItems: "center",
    //                           fontSize: "12px",
    //                           textAlign: "center"
    //                         }}
    //                       >
    //                         {String(item?.uuid || "-")}
    //                       </Typography>
    //                     </Box>
    //                   </Box>
    //                 </Grid>
    //               ))}
    //             </Grid>
    //           </Box>
    //         </Paper>
    //       </Box>
    //     </Grid>
    //   </Grid>

    //   <Snackbar
    //     open={snackbar.open}
    //     autoHideDuration={6000}
    //     onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
    //     message={snackbar.message}
    //   />
    // </Box>
    <Box sx={{ width: "100%" }}>
      <Link to="/grentry/listgr">
        <ArrowBackIcon />
      </Link>

      <Grid container spacing={1} sx={{ mt: 2 }}>
        {/* Left Side: Table */}
        <Grid size={{ md: 6, xs: 12, sm: 6 }}>
          <Box sx={{ maxWidth: 500, mx: "auto" }}>
            <MaterialReactTable table={table} />
          </Box>
        </Grid>

        {/* Right Side: QR Codes */}
        <Grid size={{ md: 6, xs: 12, sm: 6 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            {/* QR Code Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body1">QR Code</Typography>
              <Button
                onClick={handlePrintQR}
                className="Global-Button"
                startIcon={<Printer size={14} />}
              >
                Print
              </Button>
            </Box>

            {/* QR List */}
            <Box ref={qrRef}>
              <Grid container >
                {data?.map((item, index) => (
                  <Grid size={{ md: 6, xs: 12, sm: 6 }} key={index}>
                    <Box sx={{ textAlign: "center" }}>
                      <a
                        href={`http://143.244.156.175/product-detail/${item.uuid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={item?.qrCode?.qrCodeUrl}
                          alt="QR Code"
                          style={{ width: "100%", maxWidth: "230px", height: "auto" }}
                        />
                      </a>
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
                        {String(item?.uuid || "-")}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default QRList;