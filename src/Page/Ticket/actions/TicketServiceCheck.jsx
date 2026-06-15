import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Chip,
    Snackbar,
    Alert,
    IconButton,
    Grid,
    Checkbox,
    FormControlLabel,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
} from "@mui/material";
import { baseUrl } from "../../Api";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import SaveIcon from '@mui/icons-material/Save';
import { calculateSLAStatus } from "../../../Helper/CalculateSLA";
import CloseIcon from "@mui/icons-material/Close";


const commonInputStyle = {
    backgroundColor: "#f9f9f9",
    borderRadius: 1,
    "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        border: "none",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none",
    },
};

const disabledInputStyle = {
    ...commonInputStyle,
    "& .MuiInputBase-input": {
        color: "rgba(0, 0, 0, 0.87)",
    },
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
    },
};

const TicketServiceCheck = ({ ticketId, onBack, onSuccess }) => {
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [remark, setRemark] = useState("");

    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const [assetServiceDetails, setAssetServiceDetails] = useState({});

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (ticketData?.ticketAssets) {
            const initialDetails = {};
            ticketData.ticketAssets.forEach(asset => {
                initialDetails[asset.assetId] = {
                    repairCost: asset.repairCost || "",
                    isEWaste: asset.status === "E-WASTE" || false,
                    remarks: asset.serviceRemarks || ""
                };
            });
            setAssetServiceDetails(initialDetails);
        }
    }, [ticketData]);

    useEffect(() => {
        const fetchTicketDetails = async () => {
            if (!ticketId) return;

            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/tickets/find/${ticketId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status) {
                    setTicketData(response.data.data);
                } else {
                    throw new Error(response.data.message || "Failed to fetch ticket");
                }
            } catch (err) {
                setError(err.message);
                setSnack({
                    open: true,
                    message: err.message,
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTicketDetails();
    }, [ticketId, token]);

    const handleAssetServiceChange = (assetId, field, value) => {
        setAssetServiceDetails(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                [field]: value
            }
        }));
    };

    const handleSubmitServiceCheck = async () => {
        setSubmitting(true);

        try {
            const serviceData = Object.entries(assetServiceDetails).map(([assetId, details]) => ({
                assetId: parseInt(assetId),
                repairCost: parseFloat(details.repairCost) || 0,
                isEWaste: details.isEWaste,
                remarks: details.remarks
            }));

            const response = await axios.post(
                `${baseUrl}/tickets/service-check`,
                {
                    ticketId: ticketData.id,
                    serviceDetails: serviceData
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                setSnack({
                    open: true,
                    message: "Service check completed successfully!",
                    severity: "success",
                });
                onBack();
                onSuccess?.();
            } else {
                throw new Error(response.data.message || "Failed to save service check");
            }
        } catch (err) {
            setSnack({
                open: true,
                message: err.response?.data?.message || err.message,
                severity: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
        setRemark("");
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogType("");
        setRemark("");
    };

    const handleRequestClose = async () => {
        setSubmitting(true);
        try {
            const response = await axios.put(
                `${baseUrl}/tickets/close`,
                {
                    id: ticketId,
                    status: "Closed",
                    remarks: remark,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                setSnack({
                    open: true,
                    message: "Ticket closed successfully!",
                    severity: "success",
                });

                setTicketData((prev) => ({
                    ...prev,
                    status: "Closed",
                    logs: [
                        ...prev.logs,
                        {
                            id: Date.now(),
                            remark: `Ticket closed: ${remark}`,
                            createdAt: new Date().toISOString(),
                            user: { id: 1, name: "Current User" },
                        },
                    ],
                }));

                onSuccess?.();
            } else {
                throw new Error(response.data.message || "Failed to close ticket");
            }
        } catch (err) {
            setSnack({
                open: true,
                message: err.message,
                severity: "error",
            });
        } finally {
            setSubmitting(false);
            handleDialogClose();
            setRemark("");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" py={4}>
                <Typography color="error">{error}</Typography>
                <Button onClick={onBack} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
            >
                <Alert severity={snack.severity}>{snack.message}</Alert>
            </Snackbar>

            <Box border="1px solid #ddd" borderRadius={2} p={2} sx={{ backgroundColor: "#fff" }}>

                <Box borderRadius={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <ArrowBackIcon sx={{ mr: 1, cursor: "pointer" }} onClick={onBack} />
                        <Typography variant="subtitle2" fontSize="1.1rem">
                            Support Ticket Service - {ticketData?.uuid}
                        </Typography>
                    </Box>

                    {ticketData?.ratings && (
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                            <Typography variant="body2" fontWeight="500" mb={0.5}>
                                Ratings
                            </Typography>
                            <Rating
                                name="read-only-rating"
                                value={Number(ticketData.ratings)}
                                readOnly
                                precision={1}
                            />
                        </Box>
                    )}
                </Box>

                <div style={{ width: "100%", height: "0px", border: "1px solid #ebe2e2ff", margin: "16px 0" }}></div>

                {/* <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                    <Button
                        onClick={() => openDialog("requestClose")}
                        disabled={ticketData?.status === "Closed" || ticketData?.status === "Approved" || ticketData?.status === "Rejected"}
                        className="Global-Button4"
                    >
                        Request For Close
                    </Button>
                </Box> */}

                <Box display="flex" gap={2} mb={2} p={1}>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Status
                        </Typography>
                        <Chip
                            label={ticketData?.status}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                background:
                                    ticketData?.status === "Rejected" || ticketData?.status === "Closed"
                                        ? "rgba(255, 0, 0, 0.1)" : "rgba(40, 167, 69, 0.1)",
                                color:
                                    ticketData?.status === "Rejected" || ticketData?.status === "Closed"
                                        ? "#df1212e3" : "#28A745",
                                fontSize: "12px",
                            }}
                        />
                    </Box>

                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Created At
                        </Typography>
                        <Typography variant="body2">
                            {ticketData?.createdAt
                                ? new Date(ticketData.createdAt).toLocaleString()
                                : "N/A"}
                        </Typography>
                    </Box>

                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Last Updated
                        </Typography>
                        <Typography variant="body2">
                            {ticketData?.updatedAt
                                ? new Date(ticketData.updatedAt).toLocaleString()
                                : "N/A"}
                        </Typography>
                    </Box>

                    {ticketData?.priority && (
                        <Box flex={1}>
                            <Typography variant="body2" fontWeight="500" mb={0.5}>
                                Priority
                            </Typography>
                            <Typography variant="body2">
                                {ticketData.priority}
                            </Typography>
                        </Box>
                    )}

                    {ticketData?.priority && ticketData?.supportEngineerAssignedAt && ticketData?.completedAt && (
                        <Box flex={1}>
                            <Typography variant="body2" fontWeight="500" mb={0.5}>
                                SLA Status
                            </Typography>
                            {(() => {
                                const slaStatus = calculateSLAStatus(ticketData);
                                if (!slaStatus) return <Typography variant="body2">N/A</Typography>;

                                return (
                                    <Chip
                                        label={slaStatus.onTime ? "On Time" : "Breached"}
                                        size="small"
                                        sx={{
                                            background: slaStatus.onTime
                                                ? "rgba(40, 167, 69, 0.1)"
                                                : "rgba(255, 0, 0, 0.1)",
                                            color: slaStatus.onTime
                                                ? "#28A745"
                                                : "#df1212e3",
                                            fontSize: "12px",
                                            borderRadius: 2,
                                        }}
                                    />
                                );
                            })()}
                        {ticketData?.priority === "High" && (
                                          <Typography variant="caption" display="block">
                                            {(() => {
                                              const slaStatus = calculateSLAStatus(ticketData);
                                            
                                              return `Took: ${slaStatus.timeTaken}h (Allowed: ${slaStatus.requiredSLA}h)`;
                                            })()}
                                          </Typography>
                                        )}
                                        {ticketData?.priority === "Medium" && (
                                          <Typography variant="caption" display="block">
                                            {(() => {
                                              const slaStatus = calculateSLAStatus(ticketData);
                                           
                                              return `Took: ${slaStatus.timeTaken}h (Allowed: ${slaStatus.requiredSLA}h)`;
                                            })()}
                                          </Typography>
                                        )}
                                        {ticketData?.priority === "Low" && (
                                          <Typography variant="caption" display="block">
                                            {(() => {
                                              const slaStatus = calculateSLAStatus(ticketData);
                                          
                                              return `Took: ${slaStatus.timeTaken}h (Allowed: ${slaStatus.requiredSLA}h)`;
                                            })()}
                                          </Typography>
                                        )}
                        </Box>
                    )}

                    {ticketData?.completedAt && (
                        <Box flex={1}>
                            <Typography variant="body2" fontWeight="500" mb={0.5}>
                                Completed At
                            </Typography>
                            <Typography variant="body2">
                                {new Date(ticketData.completedAt).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Employee Info */}
                <Box display="flex" gap={2} mb={2} p={1}>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Raised By
                        </Typography>
                           <TextField
                                    fullWidth
                                    size="small"
                                    value={`${ticketData?.createdBy?.name || "N/A"} - ${ticketData?.unit?.name || ""}`}
                                    disabled
                                    sx={disabledInputStyle}
                                  />
                      
                    </Box>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Support Engineer
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={ticketData?.supportEngineer?.name || "Not Assigned"}
                            disabled
                            sx={disabledInputStyle}
                        />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Type
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={ticketData?.type || "N/A"}
                            disabled
                            sx={disabledInputStyle}
                        />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Category
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={ticketData?.category?.name || "N/A"}
                            disabled
                            sx={disabledInputStyle}
                        />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Sub Category
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={ticketData?.category?.subcategories.find(
                                (sub) => sub.id === ticketData?.subcategoryId
                            )?.name || "N/A"}
                            disabled
                            sx={disabledInputStyle}
                        />
                    </Box>

                </Box>

                {/* Subject Line */}
                <Box p={1} mb={2}>
                    <Typography variant="body2" fontWeight="500" mb={0.5}>
                        Description
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        value={ticketData?.subjectLine || ""}
                        disabled
                        sx={disabledInputStyle}
                    />
                </Box>

                {/* Service Check Section */}
                <Box mb={2} p={1}>
                    <Typography variant="body2" fontWeight="600" mb={2} color="primary">
                        Service Check Details
                    </Typography>
                    <Divider sx={{ mb: 0 }} />

                    <Box sx={{ mt: 2 }} >
                        {ticketData?.ticketAssets?.length > 0 ? (
                            <Grid container spacing={3}>
                                {ticketData.ticketAssets.map((ticketAsset) => (
                                    <Grid item key={ticketAsset.assetId} xs={12} md={6} lg={4}>
                                        <Box
                                            sx={{
                                                border: "1px solid #eee",
                                                borderRadius: 2,
                                                p: 2,
                                                backgroundColor: "#fafafa"
                                            }}
                                        >
                                            {/* Asset Header */}
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {ticketAsset.asset.grInventoryProduct.product.name}
                                                </Typography>
                                                <Chip
                                                    label={`Asset ID: ${ticketAsset.asset.uuid}`}
                                                    size="small"
                                                    sx={{ backgroundColor: "#e3f2fd" }}
                                                />
                                            </Box>

                                            {/* Service Details Form */}
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Repair Cost (₹)"
                                                        type="number"
                                                        value={assetServiceDetails[ticketAsset.assetId]?.repairCost || ""}
                                                        onChange={(e) => handleAssetServiceChange(ticketAsset.assetId, "repairCost", e.target.value)}
                                                        InputProps={{ inputProps: { min: 0 } }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={4}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={assetServiceDetails[ticketAsset.assetId]?.isEWaste || false}
                                                                onChange={(e) => handleAssetServiceChange(ticketAsset.assetId, "isEWaste", e.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Mark as E-Waste"
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Service Remarks"
                                                        multiline
                                                        rows={2}
                                                        value={assetServiceDetails[ticketAsset.assetId]?.remarks || ""}
                                                        onChange={(e) => handleAssetServiceChange(ticketAsset.assetId, "remarks", e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>

                                            {/* Asset Metadata */}
                                            <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                                                <Chip
                                                    label={`Category: ${ticketAsset.asset.grInventoryProduct.product.category.name}`}
                                                    size="small"
                                                    sx={{ fontSize: "0.7rem", backgroundColor: "#e0f7fa" }}
                                                />
                                                <Chip
                                                    label={`Serial: ${ticketAsset.asset.serialNo1 || 'N/A'}`}
                                                    size="small"
                                                    sx={{ fontSize: "0.7rem" }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2">No assets associated</Typography>
                        )}
                    </Box>
                </Box>

                {/* Attachment */}
                {ticketData?.attachment && (
                    <Box p={1} mb={2}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Attachment
                        </Typography>
                        <Box
                            sx={{
                                border: "1px solid #ddd",
                                borderRadius: 1,
                                p: 1.5,
                                display: "inline-block",
                            }}
                        >
                            {ticketData.attachment ? (
                                <img
                                    src={`${ticketData.attachment}`}
                                    alt="Attachment"
                                    style={{ maxWidth: "200px", maxHeight: "200px", display: "block" }}
                                />
                            ) : (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <InsertDriveFileIcon color="primary" />
                                    <Typography variant="body2">
                                        View Attachment
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Request Close Dialog */}
                <Dialog open={dialogOpen && dialogType === "requestClose"} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Request Ticket Closure
                        <IconButton
                            aria-label="close"
                            onClick={handleDialogClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ py: 2 }}>
                        <Typography mb={2} fontWeight="500">
                            Please provide a reason for closing this ticket:
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Closing Remarks"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            variant="outlined"
                            placeholder="Explain why this ticket should be closed..."
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={handleDialogClose}
                            className="Global-Button3"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestClose}
                            disabled={submitting || !remark.trim()}
                            className="Global-Button2"
                        >
                            {submitting ? <CircularProgress size={20} /> : "Submit Request"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Activity log */}
                <Box p={1} mb={2}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                        Activity Log
                    </Typography>
                    <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>
                        {ticketData?.logs?.map((log) => (
                            <Box
                                key={log.id}
                                sx={{
                                    border: "1px solid #eee",
                                    borderRadius: 1,
                                    p: 1.5,
                                    mb: 1,
                                }}
                            >

                                <Typography variant="body2" fontWeight={500}>
                                    {log.details?.actions ?? "No action recorded"}
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {log?.details?.remarks ?? "No Remarks"}
                                </Typography>

                                {log?.details?.ratings && <Rating
                                    name="read-only-rating"
                                    value={Number(log?.details?.ratings)}
                                    readOnly
                                    precision={1} />
                                }

                                <Typography variant="caption" color="text.secondary">
                                    By: {log.createdUser?.name ?? "Unknown"} •{" "}
                                    {new Date(log.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Back button */}
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        onClick={onBack}
                        className="Global-Button3"
                    >
                        Back
                    </Button>
                    {ticketData?.status !== "Closed" && (
                    <Button
                        onClick={handleSubmitServiceCheck}
                        disabled={submitting || ticketData?.status === "Closed"}
                        // startIcon={<SaveIcon />}
                        className="Global-Button2"
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : "Resolved"}
                    </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default TicketServiceCheck;