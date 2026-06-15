import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Modal,
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
import AcceptIcon from "../../../assets/EmployeeImages/accept.png";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

const RequestStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    IN_STOCK: "IN STOCK",
    BLOCK: "BLOCK",
    OUT_OF_SERVICE: "OUT OF SERVICE",
    WAVE_OF: "WAVE OF",
    E_WASTE: "E-WASTE",
};

const Approve = () => {
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
    const [selectedRows, setSelectedRows] = useState([]);

    // Modal and notification states
    const [openModal, setOpenModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Fetch data from API
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const { pageIndex, pageSize } = pagination;

            const response = await fetch(
                `${baseUrl}/request/request-product/request-product-get?page=${pageIndex + 1}&limit=${pageSize}`,
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
                const transformedData = result.data.data.map((request) => ({
                    id: request.id,
                    uuid: request.uuid,
                    requestId: request.uuid?.slice(0, 6),  // short version for table
                    assetId: request.InventoryProductDetails.uuid,
                    inventoryProductDetailsId: request.InventoryProductDetailsId,
                    requestStatus: request.RequestStatus,
                    approvalStatus: request.approvalStatus,
                    reason: request.Reason,
                    requestedBy: request.createdUser?.name || "Unknown",
                    requestedOn: request.createdAt,
                    assetName: request.InventoryProductDetails?.grInventoryProduct?.product?.name || "Unknown",
                    assetDescription: request.InventoryProductDetails?.grInventoryProduct?.description || "N/A",
                    serialNumber: request.InventoryProductDetails?.serialNo1 || "N/A",
                    currentStatus: request.InventoryProductDetails?.assignedStatus || "N/A",
                }));

                setData(transformedData);
                setTotalRows(result.data.total || 0);
                setTotalPages(result.data.totalPages || 0);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Failed to fetch requests");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRequest(null);
    };

    const handleApproveRequest = async () => {
        try {
            const token = localStorage.getItem("token");
            const requestId = selectedRequest.id;

            const response = await fetch(
                `${baseUrl}/request/request-product/request-approve/${requestId}`,
                {
                    method: "PUT",
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

            if (result.status) {
                setSnackbarMessage("Request approved successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                fetchData(); // Refresh the data
                handleCloseModal();
            } else {
                throw new Error(result.message || "Failed to approve request");
            }
        } catch (error) {
            console.error("Error approving request:", error);
            setSnackbarSeverity("error");
            setSnackbarMessage(error.message || "Failed to approve request");
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
    const columns = [
        columnHelper.accessor("requestId", { header: "Request ID", size: 120 }),
        columnHelper.accessor("assetId", { header: "Asset ID", size: 120 }),
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
                        <img src={AcceptIcon} alt="view" />
                    </IconButton>
                </Box>
            ),
        }),
        columnHelper.accessor("requestedBy", { header: "Requested By", size: 150 }),
        columnHelper.accessor("requestedOn", {
            header: "Requested On", size: 120,
            Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        }),
        columnHelper.accessor("assetName", { header: "Asset Name", size: 150 }),
        columnHelper.accessor("serialNumber", { header: "Serial Number", size: 120 }),
        columnHelper.accessor("currentStatus", { header: "Current Status", size: 120 }),
        columnHelper.accessor("approvalStatus", { header: "Approval Status", size: 120 }),
        columnHelper.accessor("requestStatus", {
            header: "Request Status",
            size: 150,
            Cell: ({ cell }) => {
                const status = cell.getValue();
                const color =
                    status === RequestStatus.PENDING
                        ? "#ff9900"
                        : status === RequestStatus.APPROVED
                            ? "#28A745"
                            : status === RequestStatus.REJECTED
                                ? "#ff0000"
                                : "#345481";
                return (
                    <Chip
                        label={status}
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
        // columnHelper.accessor("reason", { header: "Reason", size: 200 }),
        columnHelper.accessor("reason", {
            header: "Reason",
            size: 200,
            Cell: ({ cell }) => (
                <div
                    style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {cell.getValue() || "-"}
                </div>
            ),
        }),

    ];

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
            rowSelection: selectedRows,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setSelectedRows,
        enableGlobalFilter: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableColumnFilters: false,   // 👈 disables filter by column
        paginationDisplayMode: "pages",
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 20, 50],
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
                    onClick={() =>
                        handleExportRows(table.getSelectedRowModel().rows)
                    }
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
        <>
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

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="view-modal-title"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        width: 400,
                        textAlign: "center",
                    }}
                >
                    <Typography id="view-modal-title" variant="h6" gutterBottom>
                        Approve Request
                    </Typography>

                    {selectedRequest && (
                        <Box sx={{ mb: 2, textAlign: "left" }}>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Request ID:</strong> {selectedRequest.requestId}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Requested By:</strong> {selectedRequest.requestedBy}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Asset:</strong> {selectedRequest.assetName}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Serial Number:</strong> {selectedRequest.serialNumber}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Current Status:</strong> {selectedRequest.currentStatus}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                <strong>Requested Status:</strong>{" "}
                                <Chip
                                    label={selectedRequest.requestStatus}
                                    sx={{
                                        backgroundColor: "#DAF2FF",
                                        fontSize: "12px",
                                        color:
                                            selectedRequest.requestStatus === RequestStatus.PENDING
                                                ? "#ff9900"
                                                : selectedRequest.requestStatus === RequestStatus.APPROVED
                                                    ? "#28A745"
                                                    : selectedRequest.requestStatus === RequestStatus.REJECTED
                                                        ? "#ff0000"
                                                        : "#345481",
                                    }}
                                />
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 1,
                                    fontSize: "14px",
                                    fontStyle: "italic",
                                    color: "#555"
                                }}
                            >
                                <strong>Reason:</strong> {selectedRequest.reason}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                        <Button
                            className="Global-Button8"
                            onClick={handleApproveRequest}
                        >
                            Approve
                        </Button>
                        <Button
                            className="Global-Button4"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

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
        </>
    );
};

export default Approve;