import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Modal,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AssignIcon from "../../../assets/EmployeeImages/assignment.png";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";
import { CustomTextField } from "../../../utils/CustomTextField";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const UnassignAsset = () => {
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
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    approvedBy: "",
    remark: ""
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch user list for Approved By dropdown
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/asset-mng/asset-helper/user-list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Failed to fetch users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;

      let sortBy = "name";
      let sortOrder = "desc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      const response = await fetch(
        `${baseUrl}/gr/inventory/filter/ASSIGNED?page=${pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pageSize}&search=${globalFilter}`,
        {
          method: "GET",
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
        const specFieldNames = new Set();
        const softwareNames = new Set();

        result.data.data.forEach((item) => {
          item.specValues?.forEach(spec => {
            if (spec.specField?.name) {
              specFieldNames.add(spec.specField.name);
            }
          });

          item.softwareInstalls?.forEach(software => {
            if (software.softwares?.name) {
              softwareNames.add(software.softwares.name);
            }
          });
        });

        const transformedData = result.data.data.map((item) => {
          const specValues = {};
          specFieldNames.forEach(name => {
            const spec = item.specValues?.find(
              s => s.specField?.name === name
            );
            specValues[name] = spec?.value || "NA";
          });

          const softwareValues = {};
          softwareNames.forEach(name => {
            const software = item.softwareInstalls?.find(
              s => s.softwares?.name === name
            );
            softwareValues[name] = software?.value || "NA";
          });

          const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;
          const assignmentId = item.AssignProductDetails?.[0]?.assignedId;

          return {
            id: item.id,
            uuid: item.uuid,
            assignmentId: assignmentId || null,
            username: assignedUser?.name || "Location",
            assetType: item.grInventoryProduct?.product?.category?.name || "NA",
            serialNumber: item.serialNo1 || "NA",
            description: item.grInventoryProduct?.description || "NA",
            assetTag: item.grInventoryProduct?.product?.uuid || "NA",
            usedByEmail: assignedUser?.email || "NA",
            sapCode: item.grInventoryProduct?.product?.serialNo || "NA",
            acquisitionDate: item.grInventoryProduct?.createdAt
              || "NA",
            department: assignedUser?.department?.name || "NA",
            location: assignedUser?.location?.name || "NA",
            assignedOn: item.createdAt
              || "NA",
            make: item.grInventoryProduct?.product?.brand?.name || "NA",
            model: item.grInventoryProduct?.product?.name || "NA",
            serialNumberAlt: item.serialNo2 || "NA",
            assetState: item.assignedStatus || "NA",
            poValue: item.grInventoryProduct?.totalAmount || "NA",
            poNumber: "NA",
            warrantyAmc: item.grInventoryProduct?.warrantyTill
              || "NA",
            warrantyExpiryDate: item.grInventoryProduct?.warrantyTill
              || "NA",
            lastAuditDate: item.updatedAt
              || "NA",
            av: "NA",
            proxy: "NA",
            status: item.assignedStatus || "NA",
            isFree: item.isFree ? "Yes" : "No",
            maintenanceFrequency: item.grInventoryProduct?.maintenanceFrequency || "NA",
            maintenanceDueDate: item.grInventoryProduct?.maintenanceDueDate
              || "NA",
            lifecycleExDate: item.grInventoryProduct?.lifecycleExDate
              || "NA",
            quantity: item.grInventoryProduct?.quantity || "NA",
            ratePerPiece: item.grInventoryProduct?.ratePerPiece || "NA",
            ...specValues,
            ...softwareValues
          };
        });

        setData(transformedData);
        setTotalRows(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);

        const specColumns = Array.from(specFieldNames).map(name => ({
          accessorKey: name,
          header: name,
          size: 150
        }));

        const softwareColumns = Array.from(softwareNames).map(name => ({
          accessorKey: name,
          header: name,
          size: 150
        }));

        setDynamicColumns([...specColumns, ...softwareColumns]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Failed to fetch assets", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers(); // Fetch users when component mounts
  }, [pagination, sorting, globalFilter]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenModal = (asset) => {
    setSelectedAsset(asset);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAsset(null);
    setFormData({
      date: "",
      approvedBy: "",
      remark: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedAsset) return;

    if (!formData.date || !formData.approvedBy) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const selectedUser = users.find(user => user.name === formData.approvedBy);

      if (!selectedUser) {
        showSnackbar("Selected approver not found", "error");
        return;
      }

      const payload = {
        inventoryProductIds: [selectedAsset.id],
        assignmentIds: [selectedAsset.assignmentId],
        approvedDate: new Date(formData.date).toISOString(),
        approvedBy: selectedUser.id.toString(),
        remarks: formData.remark || "No remarks"
      };

      const response = await fetch(`${baseUrl}/asset-mng/asset-unassign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        showSnackbar("Asset unassigned successfully", "success");
        fetchData(); // Refresh the data
        handleCloseModal();
      } else {
        showSnackbar(result.message || "Failed to unassign asset", "error");
      }
    } catch (error) {
      console.error("Error unassigning asset:", error);
      showSnackbar("Failed to unassign asset", "error");
    }
  };

  const columnHelper = createMRTColumnHelper();
  const baseColumns = [
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        // const color =
        //   status === "InstallationCompleted" ? "#345481" : "#28A745";
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);
        return (
          <Chip
            // label={status}
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: "#DAF2FF",
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
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
            size="small"
            color="primary"
            onClick={() => handleOpenModal(row.original)}
          >
            <img src={AssignIcon} sx={{ color: 'black' }} />
          </IconButton>
        </Box>

      ),
    }),
    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 120,
      Cell: ({ cell }) => (
        <Box
          sx={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.2,
          }}
        >
          {cell.getValue() || "N/A"}
        </Box>
      ),
    }),

    columnHelper.accessor("username", { header: "Username", size: 120 }),
    columnHelper.accessor("assetType", { header: "Asset Type", size: 120 }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 120,
    }),
    columnHelper.accessor("description", { header: "Description", size: 150 }),
    columnHelper.accessor("assetTag", { header: "Asset Tag", size: 120 }),
    columnHelper.accessor("usedByEmail", {
      header: "Used By (Email)",
      size: 150,
    }),
    columnHelper.accessor("sapCode", { header: "SAP Code", size: 120 }),
    columnHelper.accessor("acquisitionDate", {
      header: "Acquisition Date",
      size: 160,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("department", { header: "Department", size: 120 }),
    columnHelper.accessor("location", { header: "Location", size: 100 }),
    columnHelper.accessor("make", { header: "Make", size: 100 }),
    columnHelper.accessor("model", { header: "Model", size: 120 }),
    columnHelper.accessor("poValue", { header: "PO Value", size: 110 }),
    columnHelper.accessor("warrantyExpiryDate", {
      header: "Warranty Expiry",
      size: 150,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("maintenanceFrequency", {
      header: "Maintenance Frequency",
      size: 200,
    }),
    columnHelper.accessor("maintenanceDueDate", {
      header: "Maintenance Due",
      size: 200,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lifecycleExDate", {
      header: "Lifecycle Expiry",
      size: 150,
      Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
    }),
    columnHelper.accessor("ratePerPiece", {
      header: "Rate Per Piece",
      size: 160,
    }),
  ];

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
      >
      </Box>
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

      {/* Modal for viewing asset details */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="asset-modal-title"
        aria-describedby="asset-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="asset-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
            className="line"
          >
            Unassign Asset: {selectedAsset?.uuid}
          </Typography>

          {/* Date & Approved By Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', marginTop: "10px" }}>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Date
              </Typography>
              <CustomTextField
                fullWidth
                type="date"
                name="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={handleInputChange}
                InputProps={{
                  sx: {
                    backgroundColor: '#f1f1ff',
                    borderRadius: 1,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Approved By
              </Typography>
              <CustomTextField
                select
                fullWidth
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleInputChange}
                disabled={loadingUsers}
                InputProps={{
                  sx: {
                    backgroundColor: '#f1f1ff',
                    borderRadius: 1,
                    '& fieldset': { border: 'none' },
                  },
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>
          </div>

          {/* Remark Full Width */}
          <div style={{ marginBottom: '16px' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Remark
            </Typography>
            <CustomTextField
              fullWidth
              name="remark"
              multiline
              rows={4}
              value={formData.remark}
              onChange={handleInputChange}
              InputProps={{
                sx: {
                  backgroundColor: '#f1f1ff',
                  borderRadius: 1,
                  '& fieldset': { border: 'none' },
                },
              }}
            />
          </div>

          {/* Buttons */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              className="Global-Button3"
              onClick={handleCloseModal}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              className="Global-Button2"
              onClick={handleSubmit}
              sx={{ textTransform: 'none' }}
            >
              Unassign Asset
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UnassignAsset;