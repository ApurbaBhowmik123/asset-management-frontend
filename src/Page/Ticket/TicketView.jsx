
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
} from "@mui/material";
import { baseUrl } from "../Api";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { calculateSLAStatus } from "../../Helper/CalculateSLA";
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

const TicketView = () => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priority, setPriority] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { ticketId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) return;
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/tickets/find-by-ticket-id/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("Response",response);


        if (response.data.status) {
          setTicketData(response.data.data);
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

        {/* STATUS & META INFO */}
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

        {/* USER INFO */}
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
              value={
                ticketData?.category?.subcategories.find(
                  (sub) => sub.id === ticketData?.subcategoryId
                )?.name || "N/A"
              }
              disabled
              sx={disabledInputStyle}
            />
          </Box>
        </Box>

        {/* DESCRIPTION */}
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

        {/* ASSETS */}
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

        {/* ATTACHMENT */}
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

        {/* LOGS */}
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

        <Box display="flex" justifyContent="flex-end">
          <Button onClick={handleBack} className="Global-Button3">
            Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TicketView;
