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
  Grid,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { baseUrl } from "../../Api";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { calculateSLAStatus } from "../../../Helper/CalculateSLA";
import { useParams, useNavigate } from "react-router-dom";

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

const TicketEdit = () => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priority, setPriority] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decision, setDecision] = useState("approve");
  const [remark, setRemark] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [dialogType, setDialogType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supportEngineers, setSupportEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userRole, setUserRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const { ticketId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleBack = () => {
    navigate(-1);
  };
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("profile"));
      if (userData?.data?.role) {
        setUserRole(userData.data.role);
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
    }
  }, []);
  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    setRemark("");
    setReview("");
    setRating(0);
    setDecision("approve");
  };

  const handleDialogClose = () => {
    setDialogType("");
    setDialogOpen(false);
    setRemark("");
    setReview("");
    setRating(0);
  };

  const hasNAFields = () => {
    return (
      ticketData?.type === "N/A" ||
      ticketData?.category?.name === "N/A" ||
      (ticketData?.category?.subcategories.find(
        (sub) => sub.id === ticketData?.subcategoryId
      )?.name || "N/A") === "N/A"
    );
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditType(ticketData?.type || "");
    setEditCategory(ticketData?.category?.id || "");
    setEditSubcategory(ticketData?.subcategoryId || "");
    setEditDescription(ticketData?.subjectLine || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditType(ticketData?.type || "");
    setEditCategory(ticketData?.category?.id || "");
    setEditSubcategory(ticketData?.subcategoryId || "");
    setEditDescription(ticketData?.subjectLine || "");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      if (!editType) {
        setCategories([]);
        return;
      }

      try {
        setLoadingCategories(true);
        const response = await fetch(`${baseUrl}/tickets/master/category?type=${editType}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.status) {
          setCategories(data.data.data || []);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isEditing) {
      fetchCategories();
    }
  }, [editType, isEditing, token]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!editCategory || !editType) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const response = await fetch(
          `${baseUrl}/tickets/master/subcategories?categoryId=${editCategory}&type=${editType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.status) {
          setSubcategories(data.data || []);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    if (isEditing && editCategory) {
      fetchSubcategories();
    }
  }, [editCategory, editType, isEditing, token]);

  const handleUpdateTicket = async () => {
    if (!editType || !editCategory) {
      setSnack({
        open: true,
        message: "Please select type and category",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.put(
        `${baseUrl}/tickets/update-details`,
        {
          id: ticketData?.id,
          type: editType,
          categoryId: editCategory,
          subcategoryId: editSubcategory || null,
          subjectLine: editDescription,
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
          message: "Ticket details updated successfully!",
          severity: "success",
        });
        await fetchTicketDetails();
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || "Failed to update ticket");
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

  const handleDecision = async () => {
    if (decision === "reject" && !remark.trim()) {
      setSnack({
        open: true,
        message: "Please provide a reason for rejection",
        severity: "error",
      });
      return;
    }

    if (decision === "approve" && (!review.trim() || rating === 0)) {
      setSnack({
        open: true,
        message: "Please provide a review and rating for approval",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (decision === "approve") {
        const response = await axios.put(
          `${baseUrl}/tickets/close`,
          {
            id: ticketData?.id,
            status: "Closed",
            review: review,
            ratings: rating,
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
            message: "Ticket approved and closed successfully!",
            severity: "success",
          });
          navigate(-1);
        } else {
          throw new Error(response.data.message || "Failed to approve ticket");
        }
      } else {
        const response = await axios.post(
          `${baseUrl}/tickets/reject`,
          {
            id: ticketData?.id,
            remarks: remark
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
            message: "Ticket rejected successfully!",
            severity: "success",
          });
          navigate(-1);
        } else {
          throw new Error(response.data.message || "Failed to reject ticket");
        }
      }

      await fetchTicketDetails();
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
          id: ticketData?.id,
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
        navigate(-1);
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



  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/tickets/find-by-ticket-id/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setTicketData(response.data.data);
        if (response.data.data.priority) {
          setPriority(response.data.data.priority);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch ticket");
      }
      setError(null);
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

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId, token]);

  useEffect(() => {
    const fetchSupportEngineers = async () => {
      try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem("profile"));
        const unitId = userData?.data?.unitId || null;

        const endpoint = unitId
          ? `${baseUrl}/tickets/support-lists/${unitId}`
          : `${baseUrl}/tickets/support-lists/all`;

        const response = await axios.get(endpoint, {
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
  }, [token]);
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
        <Button onClick={handleBack} sx={{ mt: 2 }}>
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
            <ArrowBackIcon sx={{ mr: 1, cursor: "pointer" }} onClick={handleBack} />
            <Typography variant="subtitle2" fontSize="1.1rem">
              Support Ticket - {ticketData?.uuid}
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

        <div
          style={{
            width: "100%",
            height: "0px",
            border: "1px solid #ebe2e2ff",
            margin: "16px 0",
          }}
        ></div>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {ticketData?.status !== "Closed" && !isEditing && (
              <Button
                onClick={() => openDialog("approve-reject")}
                disabled={ticketData?.status === "Rejected"}
                className="Global-Button4"
              >
                Approve/Reject Ticket
              </Button>
            )}

            {
              (
                (userRole === "Support Admin" ||
                  userRole === "Super Admin" ||
                  userRole === "Unit Admin" ||
                  !isEditing) &&
                ticketData?.status !== "Closed" &&
                ticketData?.status !== "Support Engineer Assigned"
              ) && (
                <Button
                  className="Global-Button4"
                  onClick={() => openDialog("assign")}
                >
                  Assign Support
                </Button>
              )
            }

          </Box>

          <Box display="flex" gap={1}>
            {/* {hasNAFields() && !isEditing && ( */}
            {(userRole === "Support Admin" || userRole === 'Super Admin' || userRole === 'Unit Admin') && ticketData?.status != "Closed" && !isEditing && (


              <Button
                onClick={handleEditClick}
                className="Global-Button2"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  onClick={handleUpdateTicket}
                  className="Global-Button2"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={20} /> : "Save"}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  className="Global-Button3"
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
              </>
            )}

          </Box>
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
                    ? "rgba(255, 0, 0, 0.1)"
                    : "rgba(40, 167, 69, 0.1)",
                color:
                  ticketData?.status === "Rejected" || ticketData?.status === "Closed"
                    ? "#df1212e3"
                    : "#28A745",
                fontSize: "12px",
              }}
            />
          </Box>

          <Box flex={1}>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Created At
            </Typography>
            <Typography variant="body2">
              {ticketData?.createdAt ? new Date(ticketData.createdAt).toLocaleString() : "N/A"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Last Updated
            </Typography>
            <Typography variant="body2">
              {ticketData?.updatedAt ? new Date(ticketData.updatedAt).toLocaleString() : "N/A"}
            </Typography>
          </Box>

          {ticketData?.priority && (
            <Box flex={1}>
              <Typography variant="body2" fontWeight="500" mb={0.5}>
                Priority
              </Typography>
              <Typography variant="body2">{ticketData.priority}</Typography>
            </Box>
          )}

          {ticketData?.priority &&
            ticketData?.supportEngineerAssignedAt &&
            ticketData?.completedAt && (
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
                        color: slaStatus.onTime ? "#28A745" : "#df1212e3",
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
            {isEditing ? (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <Select
                  value={editType}
                  onChange={(e) => {
                    setEditType(e.target.value);
                    setEditCategory("");
                    setEditSubcategory("");
                  }}
                  displayEmpty
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  <MenuItem value="" disabled>
                    Select Type
                  </MenuItem>
                  <MenuItem value="Incident">Incident</MenuItem>
                  <MenuItem value="Service Request">Service Request</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                size="small"
                value={ticketData?.type || "N/A"}
                disabled
                sx={disabledInputStyle}
              />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Category
            </Typography>
            {isEditing ? (
              loadingCategories ? (
                <CircularProgress size={20} />
              ) : (
                <FormControl fullWidth size="small" sx={commonInputStyle}>
                  <Select
                    value={editCategory}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                      setEditSubcategory("");
                    }}
                    displayEmpty
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                  >
                    <MenuItem value="" disabled>
                      Select Category
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            ) : (
              <TextField
                fullWidth
                size="small"
                value={ticketData?.category?.name || "N/A"}
                disabled
                sx={disabledInputStyle}
              />
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="body2" fontWeight="500" mb={0.5}>
              Sub Category
            </Typography>
            {isEditing ? (
              loadingSubcategories ? (
                <CircularProgress size={20} />
              ) : (
                <FormControl fullWidth size="small" sx={commonInputStyle}>
                  <Select
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    displayEmpty
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                  >
                    <MenuItem value="">
                      No Subcategory
                    </MenuItem>
                    {subcategories.map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            ) : (
              <TextField
                fullWidth
                size="small"
                value={
                  ticketData?.category?.subcategories.find(
                    (sub) => sub.id === ticketData?.subcategoryId
                  )?.name || "N/A"
                }
                disabled
                sx={disabledInputStyle}
              />
            )}
          </Box>
        </Box>

        <Box p={1} mb={2}>
          <Typography variant="body2" fontWeight="500" mb={0.5}>
            Description
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              sx={commonInputStyle}
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={ticketData?.subjectLine || ""}
              disabled
              sx={disabledInputStyle}
            />
          )}
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
                  <Typography variant="body2">View Attachment</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

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
                {log?.details?.ratings && (
                  <Rating
                    name="read-only-rating"
                    value={Number(log?.details?.ratings)}
                    readOnly
                    precision={1}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  By: {log.createdUser?.name ?? "Unknown"} •{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Dialog
          open={dialogOpen && dialogType === "approve-reject"}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            Ticket Decision
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
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="decision"
                name="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="approve"
                  control={<Radio color="success" />}
                  label={
                    <Box>
                      <Typography fontWeight="bold">Approve & Close Ticket</Typography>
                      <Typography variant="caption">
                        User's issue has been resolved satisfactorily
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="reject"
                  control={<Radio color="error" />}
                  label={
                    <Box>
                      <Typography fontWeight="bold">Reject Resolution</Typography>
                      <Typography variant="caption">
                        User's issue has not been resolved satisfactorily
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {decision === "approve" ? (
              <>
                <Typography variant="body2" gutterBottom>
                  Please provide a review and rating for the resolution
                </Typography>
                <Typography variant="subtitle1">Review</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={review}
                  placeholder="Write your feedback..."
                  onChange={(e) => setReview(e.target.value)}
                  required
                  sx={{ mt: 1 }}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    name="ticket-rating"
                    value={rating}
                    precision={0.5}
                    onChange={(event, newValue) => {
                      setRating(newValue);
                    }}
                    size="large"
                  />
                  {rating > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Rating: {rating.toFixed(1)} stars
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Reason for Rejection
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Please explain why the resolution was unsatisfactory"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                  helperText="Please explain why the resolution was unsatisfactory"
                />
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose} className="Global-Button3">
              Cancel
            </Button>
            <Button
              onClick={handleDecision}
              disabled={submitting ||
                (decision === "reject" && !remark.trim()) ||
                (decision === "approve" && (!review.trim() || rating === 0))}
              variant="contained"
              color={decision === "approve" ? "success" : "error"}
              sx={{ minWidth: 100 }}
            >
              {submitting ? (
                <CircularProgress size={20} />
              ) : decision === "approve" ? (
                "Approve & Close"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogActions>
        </Dialog>

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
                            ({eng?.unit?.name || 'N/A'})
                          </Typography>
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

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
    </Box>
  );
};

export default TicketEdit;