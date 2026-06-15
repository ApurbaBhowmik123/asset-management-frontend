import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Button,
    Divider,
    Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

const notification = {
    id: 2,
    type: "warning",
    title: "Maintenance Due",
    message:
        "The Air Conditioner requires preventive maintenance. Please schedule a service request before 31st Aug 2025 to avoid downtime.",
    time: "1 hour ago",
};

const getIcon = (type) => {
    if (type === "success") {
        return <CheckCircleIcon color="success" fontSize="large" />;
    } else if (type === "warning") {
        return <ErrorIcon color="warning" fontSize="large" />;
    } else {
        return <InfoIcon color="primary" fontSize="large" />;
    }
};

const NotificationDetails = () => {
    const navigate = useNavigate();
    return (
        <>         <Box
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
        >
            <ArrowBackIcon />
        </Box>
            <Box
                sx={{
                    maxWidth: "950px",
                    mx: "auto",
                    mt: 4,
                    p: 3,
                }}
            >
                {/* Back Button */}


                {/* Notification Card */}
                <Card sx={{ borderRadius: "16px", boxShadow: 3, }}>
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: "transparent" }}>
                                {getIcon(notification.type)}
                            </Avatar>
                        }
                        title={
                            <Typography variant="h6" fontWeight="bold">
                                {notification.title}
                            </Typography>
                        }
                        subheader={notification.time}
                    />
                    <Divider />
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {notification.message}
                                </Typography>
                            </Grid>
                            {/* <Grid item xs={12}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                            >
                                Notification Type: {notification.type.toUpperCase()}
                            </Typography>
                        </Grid> */}
                        </Grid>
                    </CardContent>
                </Card>
            </Box></>
    );
};

export default NotificationDetails;
