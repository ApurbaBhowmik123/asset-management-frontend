import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import UpdateIcon from "../../../assets/EmployeeImages/update.png";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";

const ProductRequestStatus = {
  UNBLOCK: "UNBLOCK",
  BLOCK: "BLOCK",
  WRITE_OFF: "WRITE-OFF",
};

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Initiate = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [reason, setReason] = useState("");

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [statusValue, setStatusValue] = useState(ProductRequestStatus.BLOCK);
  // Notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [productId, setProductId] = useState("");
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;

      // Build sort parameters
      let sortBy = "name";
      let sortOrder = "desc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      const response = await fetch(
        `${baseUrl}/gr/inventory/all-assets?page=${pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pageSize}&search=${globalFilter}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        // First pass to collect all unique spec field names
        const specFieldNames = new Set();
        const softwareNames = new Set();
        setProductId(result.data.id);
        result.data.data.forEach((item) => {
          // Collect spec field names
          item.specValues?.forEach((spec) => {
            if (spec.specField?.name) {
              specFieldNames.add(spec.specField.name);
            }
          });

          // Collect software names
          item.softwareInstalls?.forEach((software) => {
            if (software.softwares?.name) {
              softwareNames.add(software.softwares.name);
            }
          });
        });

        // Transform data with dynamic spec fields
        const transformedData = result.data.data.map((item) => {
          // Create an object to hold all spec field values
          const specFields = {};
          specFieldNames.forEach((name) => {
            const spec = item.specValues?.find(
              (s) => s.specField?.name === name
            );
            specFields[name] = spec?.value || "NA";
          });

          // Create an object to hold all software values
          const softwareFields = {};
          softwareNames.forEach((name) => {
            const software = item.softwareInstalls?.find(
              (s) => s.softwares?.name === name
            );
            softwareFields[name] = software?.value || "NA";
          });

          // Get asset type
          const assetType =
            item.grInventoryProduct?.product?.category?.name || "NA";
          const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;

          // Get assigned status
          const assignedStatus = item.assignedStatus || "NA";

          // // Determine display status based on asset type and assigned status
          // let displayStatus = assignedStatus;
          // if (
          //   assetType === "IT Assets" &&
          //   assignedStatus.toLowerCase() === "instock"
          // ) {
          //   displayStatus = "Awaiting for Installation";
          // }

          return {
            id: item.id,
            uuid: item.uuid,
            username: assignedUser?.name || "NA",
            assetType,
            serialNumber: item.serialNo1 || "NA",
            description: item.grInventoryProduct?.description || "NA",
            assetTag: item.grInventoryProduct?.product?.uuid || "NA",
            usedByEmail: assignedUser?.email || "NA",
            sapCode: item.grInventoryProduct?.product?.serialNo || "NA",
            acquisitionDate: item.grInventoryProduct?.createdAt || "NA",
            department: assignedUser?.department?.name || "NA",
            // location: assignedUser?.location?.name || "NA",
            location: item.location?.name || "NA",
            assignedOn: item.createdAt || "NA",
            make: item.grInventoryProduct?.product?.brand?.name || "NA",
            model: item.grInventoryProduct?.product?.name || "NA",
            serialNumberAlt: item.serialNo2 || "NA",
            assetState: item.assignedStatus || "NA",
            unit: item?.unit?.name || "NA",
            grNo: item?.grInventoryProduct?.grDetails?.grId || "NA",
            poNo: item?.grInventoryProduct?.grDetails?.sapId || "NA",
            poDate: item?.grInventoryProduct?.grDetails?.sapDate ? dateTimeHelper.formatDate(
              item?.grInventoryProduct?.grDetails?.sapDate
            ) : "NA",
            // poDate:
            //   dateTimeHelper.formatDate(
            //     item?.grInventoryProduct?.grDetails?.sapDate
            //   ) || "NA",
            invoiceNo:
              item?.grInventoryProduct?.grDetails?.invoiceNumber || "NA",
            invoiceDate:
              dateTimeHelper.formatDate(
                item?.grInventoryProduct?.grDetails?.invoiceDate
              ) || "NA",
            grDate: item?.grInventoryProduct?.grDetails?.grDate ? dateTimeHelper.formatDate(
              item?.grInventoryProduct?.grDetails?.grDate) : "NA",
            // grDate:
            //   dateTimeHelper.formatDate(
            //     item?.grInventoryProduct?.grDetails?.grDate
            //   ) || "NA",
            poValue: item.grInventoryProduct?.totalAmount || "NA",
            poNumber: "NA",
            warrantyAmc: item.grInventoryProduct?.warrantyTill || "NA",
            warrantyExpiryDate: item.grInventoryProduct?.warrantyTill || "NA",
            lastAuditDate: item.updatedAt || "NA",
            status: assignedStatus,
            isFree: item.isFree ? "Yes" : "No",
            maintenanceFrequency:
              item.grInventoryProduct?.maintenanceFrequency || "NA",
            maintenanceDueDate:
              item.grInventoryProduct?.maintenanceDueDate || "NA",
            lifecycleExDate: item.grInventoryProduct?.lifecycleExDate || "NA",
            grInventoryProductId: item.grInventoryProductId || "NA",
            isUsed: item.isUsed ? "Yes" : "No",
            createdBy: item.createdBy || "NA",
            updatedBy: item.updatedBy || "NA",
            createdAt: item.createdAt || "NA",
            updatedAt: item.updatedAt || "NA",
            productBrand: item.grInventoryProduct?.product?.brand?.name || "NA",
            productCategory:
              item.grInventoryProduct?.product?.category?.name || "NA",
            ratePerPiece: item.grInventoryProduct?.ratePerPiece || "NA",
            freeQty: item.grInventoryProduct?.freeQty || "NA",
            quantity: item.grInventoryProduct?.quantity || "NA",
            grDetailsId: item.grInventoryProduct?.grDetailsId || "NA",
            // Add all spec fields dynamically
            ...Object.fromEntries(
              Array.from(specFieldNames).map((name) => [name, specFields[name]])
            ),
            // Add all software fields dynamically
            ...Object.fromEntries(
              Array.from(softwareNames).map((name) => [
                name,
                softwareFields[name],
              ])
            ),
          };
        });

        setData(transformedData);
        setTotalRows(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);

        // Generate dynamic columns for spec fields
        const specColumns = Array.from(specFieldNames).map((name) => ({
          accessorKey: name,
          header: name,
          size: 150,
        }));

        // Generate dynamic columns for software fields
        const softwareColumns = Array.from(softwareNames).map((name) => ({
          accessorKey: name,
          header: name,
          size: 150,
        }));

        setDynamicColumns([...specColumns, ...softwareColumns]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (asset) => {
    // setSelectedAsset(asset);
    setSelectedAsset({
      ...asset,
      id: asset.id, // Ensure id is included
    });
    setStatusValue(asset.status || ProductRequestStatus.BLOCK);
    setReason(asset.reason || ""); // Pre-fill if available
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAsset(null);
  };

  const handleSubmitModal = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${baseUrl}/request/request-product/request-product-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            InventoryProductDetailsId: selectedAsset.id,
            RequestStatus: statusValue,
            Reason: reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        setSnackbarMessage("Asset status updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchData(); // Refresh the data
        handleCloseModal();
      } else {
        throw new Error(result.errorResponse.message || "Failed to update asset status");
      }
    } catch (error) {
      console.error("Error updating asset status:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to update asset status");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, [pagination, sorting, globalFilter]);

  const columnHelper = createMRTColumnHelper();
  const baseColumns = [
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        // let color = "#28A745"; // Default green color
        // let backgroundColor = "#DAF2FF"; // Default background

        // // Set colors based on status
        // if (status === "InstallationCompleted") {
        //   color = "#345481";
        // } else if (status === "Awaiting for Installation") {
        //   color = "#FF8C00"; // Orange color for awaiting installation
        //   backgroundColor = "#FFF4E6"; // Light orange background
        // }
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);

        return (
          <Chip
            // label={status}
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: bg,
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
    }),

    // columnHelper.display({
    //   id: "actions",
    //   header: "Actions",
    //   size: 100,
    //   Cell: ({ row }) => (
    //     <Box>
    //       <IconButton
    //         onClick={() => handleOpenModal(row.original)}
    //         size="small"
    //         color="primary"
    //       >
    //         <img src={UpdateIcon} alt="view" />
    //       </IconButton>
    //     </Box>
    //   ),
    // }),


    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => {
        const status = row.original.status;
        // Don't show icon for WRITE-OFF and E-WASTE statuses
        if (status === ProductRequestStatus.WRITE_OFF || status === ProductRequestStatus.E_WASTE) {
          return null;
        }

        return (
          <Box>
            <IconButton
              onClick={() => handleOpenModal(row.original)}
              size="small"
              color="primary"
            >
              <img src={UpdateIcon} alt="view" />
            </IconButton>
          </Box>
        );
      },
    }),

    columnHelper.accessor("uuid", { header: "Asset ID", size: 150 }),
    columnHelper.accessor("username", { header: "Username", size: 120 }),
    columnHelper.accessor("assetType", { header: "Asset Type", size: 120 }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 160,
    }),
    columnHelper.accessor("description", { header: "Description", size: 200 }),
    columnHelper.accessor("usedByEmail", {
      header: "Used By (Email)",
      size: 150,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("acquisitionDate", {
      header: "Acquisition Date (PO)",
      size: 200,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("department", { header: "Department", size: 120 }),
    columnHelper.accessor("location", { header: "Location", size: 100 }),
    columnHelper.accessor("assignedOn", {
      header: "Assigned On",
      size: 140,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("make", { header: "Make", size: 100 }),
    columnHelper.accessor("model", { header: "Model", size: 120 }),
    columnHelper.accessor("poValue", { header: "PO Value", size: 110 }),
    columnHelper.accessor("warrantyAmc", {
      header: "Warranty/AMC",
      size: 140,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("warrantyExpiryDate", {
      header: "Warranty Expiry Date",
      size: 180,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lastAuditDate", {
      header: "Last Audit Date",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("maintenanceDueDate", {
      header: "Maintenance Due Date",
      size: 200,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lifecycleExDate", {
      header: "Lifecycle Expiry Date",
      size: 180,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      size: 120,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("productBrand", {
      header: "Product Brand",
      size: 120,
    }),
    columnHelper.accessor("productCategory", {
      header: "Product Category",
      size: 120,
    }),
    columnHelper.accessor("invoiceNo", { header: "Invoice No", size: 150 }),
    columnHelper.accessor("invoiceDate", { header: "Invoice Date", size: 150 }),
    columnHelper.accessor("grDate", { header: "Gr Date", size: 150 }),
    columnHelper.accessor("grNo", { header: "Gr No", size: 150 }),
    columnHelper.accessor("poNo", { header: "PO No", size: 150 }),
    columnHelper.accessor("poDate", { header: "PO Date", size: 150 }),
    columnHelper.accessor("unit", { header: "Unit", size: 150 }),
  ];

  // Combine base columns with dynamic columns
  const columns = [...baseColumns, ...dynamicColumns];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
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
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      ></Box>
      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1050px",
            xl: "1300px",
          },
          overflow: "auto",
          mx: "auto",
          px: { xs: 1, sm: 2 },
        }}
      >
        <MaterialReactTable table={table} />
      </Box>

      {/* Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" mb={2}>
            Update Asset Status
          </Typography>

          {/* Status Dropdown */}
          {/* <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Status
            </Typography>
            <Select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              sx={{
                height: "40px",
                backgroundColor: "#f1f1ff",
                borderRadius: 1,
                "& fieldset": { border: "none" },
              }}
            >
              {Object.values(ProductRequestStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Status
            </Typography>

            <Select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              sx={{
                height: "40px",
                backgroundColor: "#f1f1ff",
                borderRadius: 1,
                "& fieldset": { border: "1px solid black" },
              }}
            >
              {Object.values(ProductRequestStatus)
                .filter((status) => {
                  const currentStatus = selectedAsset?.status;

                  // Don't show UNBLOCK if current status is "InStock" (case-insensitive)
                  if (currentStatus?.toLowerCase() === "instock" && status === ProductRequestStatus.UNBLOCK) {
                    return false;
                  }

                  // Don't show BLOCK if current status is already "blocked"
                  if (currentStatus?.toLowerCase() === "blocked" && status === ProductRequestStatus.BLOCK) {
                    return false;
                  }

                  return true;
                })
                .map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Reason Textarea */}
          <FormControl fullWidth>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Reason
            </Typography>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid black",
                backgroundColor: "#f1f1ff",
                resize: "none",
                fontSize: "14px",
                outline: "none",
              }}
              placeholder="Enter reason..."
            />
          </FormControl>

          {/* Action Buttons */}
          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button className="Global-Button3" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button className="Global-Button2" onClick={handleSubmitModal}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Initiate;
