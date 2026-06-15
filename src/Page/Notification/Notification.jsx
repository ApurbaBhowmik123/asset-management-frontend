import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../Api";

const getIcon = (isRead) => {
    // Since there's no type field, we can use isRead status or default to info
    if (isRead) {
        return <CheckCircleIcon color="success" />;
    } else {
        return <InfoIcon color="primary" />;
    }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // convert to 12-hour format
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};


const Notification = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token"); // get token from local storage
                const response = await fetch(
                    `${baseUrl}/ntf/notification/notification-get?page=1&limit=10`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch notifications");
                }

                const data = await response.json();
                // Adjust if API response has nested structure
                setNotifications(data?.data || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <>
            {/* Back Button */}
            <Box onClick={() => navigate(-1)} sx={{ cursor: "pointer" }}>
                <ArrowBackIcon />
            </Box>

            <Box
                sx={{
                    maxWidth: "900px",
                    mx: "auto",
                    mt: 2,
                    p: 3,
                    borderRadius: "16px",
                    boxShadow: 3,
                    backgroundColor: "#fff",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        borderBottom: "1px solid #eee",
                        pb: 1,
                    }}
                >
                    <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Notifications
                    </Typography>
                </Box>

                {/* Notification List */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                        No notifications found.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            maxHeight: "350px",
                            overflowY: "auto",
                            pr: 1,
                        }}
                    >
                        <List disablePadding>
                            {notifications.map((note, index) => (
                                <React.Fragment key={note.uuid || note.id || index}>
                                    <ListItem
                                        sx={{
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                            "&:hover": {
                                                backgroundColor: "#f5f5f5",
                                            },
                                            // Add visual indicator for unread notifications
                                            backgroundColor: note.isRead ? "transparent" : "#f0f7ff",
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: "transparent" }}>
                                                {getIcon(note.isRead)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography 
                                                    variant="subtitle1" 
                                                    fontWeight={note.isRead ? "normal" : "bold"}
                                                >
                                                    {/* Using text as title since there's no separate title field */}
                                                    {note.text}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    {/* Show UUID if needed for reference */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {note.uuid}
                                                    </Typography>
                                                    <br />
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {formatDate(note.createdAt)}
                                                    </Typography>
                                                    {/* Show transaction link if available */}
                                                    {note.transactionLink && (
                                                        <>
                                                            <br />
                                                            {/* <Typography
                                                                variant="caption"
                                                                color="primary"
                                                                sx={{ textDecoration: "underline", cursor: "pointer" }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(note.transactionLink, '_blank');
                                                                }}
                                                            >
                                                                View Details
                                                            </Typography> */}
                                                        </>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </>
    );
};

export default Notification;