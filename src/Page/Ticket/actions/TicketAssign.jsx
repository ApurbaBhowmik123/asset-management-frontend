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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Grid,
    Rating,
} from "@mui/material";
import { baseUrl } from "../../Api";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import { calculateSLAStatus } from "../../../Helper/CalculateSLA";

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

const TicketAssign = ({ ticketId, onBack, onSuccess }) => {
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [supportEngineers, setSupportEngineers] = useState([]);
    const [selectedEngineer, setSelectedEngineer] = useState("");
    const [priority, setPriority] = useState("");
    const [remark, setRemark] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [numericTicketId, setNumericTicketId] = useState(null); // Store numeric ticket ID

    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const token = localStorage.getItem("token");

    // Fetch ticket details
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
                    // Store numeric ticket ID for backend
                    setNumericTicketId(response.data.data.id);
                    // Set initial priority if exists
                    if (response.data.data.priority) {
                        setPriority(response.data.data.priority);
                    }
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


    useEffect(() => {
        const fetchSupportEngineers = async () => {
            if (!ticketData?.unitId) return;

            try {
                const response = await axios.get(`${baseUrl}/tickets/support-lists/${ticketData.unitId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status) {
                    setSupportEngineers(response.data.data || []);
                }
            } catch (err) {
                console.error("Error fetching support engineers:", err);
            }
        };

        fetchSupportEngineers();
    }, [ticketData?.unitId, token]);

    const openDialog = (type) => {
        setDialogType(type);
        setDialogOpen(true);
        setRemark("");
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogType("");
        setSelectedEngineer("");
        setRemark("");
    };

    const handleAssignSupport = async () => {
        if (!selectedEngineer || !priority) {
            setSnack({
                open: true,
                message: "Please select a support engineer and priority",
                severity: "error",
            });
            return;
        }

        setSubmitting(true);
        try {

            const response = await axios.post(
                `${baseUrl}/tickets/assign`,
                {
                    id: numericTicketId,
                    supportEngineerId: selectedEngineer,
                    priority: priority,
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
                    message: "Support engineer assigned successfully!",
                    severity: "success",
                });


                const ticketResponse = await axios.get(`${baseUrl}/tickets/find/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (ticketResponse.data.status) {
                    setTicketData(ticketResponse.data.data);
                }
                onBack();
                onSuccess?.();

            } else {
                throw new Error(response.data.message || "Failed to assign support engineer");
            }
        } catch (err) {
            setSnack({
                open: true,
                message: err.response?.data?.message || err.message,
                severity: "error",
            });
        } finally {
            setSubmitting(false);
            handleDialogClose();
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

                <Box
                    borderRadius={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" alignItems="center">
                        <ArrowBackIcon sx={{ mr: 1, cursor: "pointer" }} onClick={onBack} />
                        <Typography variant="subtitle2" fontSize="1.1rem">
                            Support Ticket Assign - {ticketData?.uuid}
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


                <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                    {
                        (
                      (userRole === "Support Admin" || userRole === "Super Admin" ||  userRole === "Unit Admin" || !isEditing) &&
                            ticketData?.status !== "Closed" &&
                            ticketData?.status !== "Support Engineer Assigned"
                        )
                        &&
                         (
                            <Button
                                className="Global-Button4"
                                onClick={() => openDialog("assign")}
                            >
                                Assign Support
                            </Button>
                        )
                    }
                </Box>

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


                <Box display="flex" gap={2} mb={2} p={1}>
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight="500" mb={0.5}>
                            Raised By
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={ticketData?.createdBy?.name || ""}
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




                <Box p={1} mb={2}>
                    <Typography variant="body2" fontWeight="500" mb={1}>
                        Associated Assets
                    </Typography>

                    {ticketData?.ticketAssets?.length > 0 ? (
                        <Grid container spacing={2}>
                            {ticketData.ticketAssets.map((ticketAsset) => (
                                <Grid item xs={12} sm={6} md={4} key={ticketAsset.id}>
                                    <Box
                                        sx={{
                                            border: "1px solid #eee",
                                            borderRadius: 1,
                                            p: 1.5,
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={500}>
                                            {ticketAsset.asset.grInventoryProduct.product.name}
                                        </Typography>
                                        <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                                            <Chip
                                                label={`Asset ID: ${ticketAsset.asset.uuid}`}
                                                size="small"
                                                sx={{ fontSize: "0.7rem" }}
                                            />
                                            <Chip
                                                label={`Category: ${ticketAsset.asset.grInventoryProduct.product.category.name}`}
                                                size="small"
                                                sx={{ fontSize: "0.7rem", backgroundColor: "#e0f7fa" }}
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
                <Box display="flex" justifyContent="flex-end">
                    <Button
                        onClick={onBack}
                        className="Global-Button3"
                    >
                        Back
                    </Button>
                </Box>
            </Box>

            {/* Assign Support Engineer Dialog */}
            <Dialog
                open={dialogOpen && dialogType === "assign"}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    Assign Support Engineer
                    <IconButton
                        aria-label="close"
                        onClick={handleDialogClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {/* Support engineer selection */}
                        <div style={{ flex: "1 1 45%" }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Support Engineer *</InputLabel>
                                <Select
                                    value={selectedEngineer}
                                    onChange={(e) => setSelectedEngineer(e.target.value)}
                                    label="Support Engineer *"
                                >
                                    {supportEngineers.map((eng) => (
                                        <MenuItem key={eng.id} value={eng.id}>
                                            <Typography fontWeight={500}>
                                                {eng.name}&nbsp;
                                                <Typography variant="caption" component="span" color="textSecondary">
                                                    ({eng.email})
                                                </Typography>
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        {/* Priority selection */}
                        <div style={{ flex: "1 1 45%" }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Priority *</InputLabel>
                                <Select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    label="Priority *"
                                >
                                    <MenuItem value="High">
                                        <Chip label="High" size="small" sx={{ backgroundColor: "#ffebee", color: "#c62828" }} />
                                    </MenuItem>
                                    <MenuItem value="Medium">
                                        <Chip label="Medium" size="small" sx={{ backgroundColor: "#fff8e1", color: "#f57f17" }} />
                                    </MenuItem>
                                    <MenuItem value="Low">
                                        <Chip label="Low" size="small" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} />
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    {/* Remarks field */}
                    <div style={{ marginTop: "16px" }}>
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={4}
                            label="Remarks"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            helperText="Optional notes about this assignment"
                        />
                    </div>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleDialogClose} className="Global-Button3">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssignSupport}
                        disabled={submitting || !selectedEngineer || !priority}
                        className="Global-Button2"
                    >
                        {submitting ? <CircularProgress size={20} /> : "Assign"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketAssign;