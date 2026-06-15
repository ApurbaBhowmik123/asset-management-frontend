import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Snackbar,
    Alert,
    FormGroup,
    FormControlLabel,
    Checkbox,
    FormLabel,
    MenuItem,
    Select,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";


const PermissionCreate = ({ onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        type: "crud", // default type
        name: "",
        description: "",
        resource: [],
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleResourceChange = (res) => {
        setFormData((prev) => {
            const alreadySelected = prev.resource.includes(res);
            return {
                ...prev,
                resource: alreadySelected
                    ? prev.resource.filter((r) => r !== res)
                    : [...prev.resource, res],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setSnackbar({
                open: true,
                message: "Name is required",
                severity: "error",
            });
            return;
        }

        if (formData.type === "basic" && !formData.description.trim()) {
            setSnackbar({
                open: true,
                message: "Description is required for Basic type",
                severity: "error",
            });
            return;
        }

        if (formData.type === "crud" && formData.resource.length === 0) {
            setSnackbar({
                open: true,
                message: "Select at least one resource for CRUD type",
                severity: "error",
            });
            return;
        }

        try {
            const response = await axios.post(
                `${baseUrl}/super-admin/acl/permission`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status) {
                setSnackbar({
                    open: true,
                    message: response.data.message,
                    severity: "success",
                });

                setFormData({
                    type: "crud",
                    name: "",
                    description: "",
                    resource: [],
                });

                setTimeout(() => {
                    onSuccess && onSuccess();
                    onBack && onBack();
                }, 1000);
            } else {
                setSnackbar({
                    open: true,
                    message: response.data.errorResponse.message,
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("API Error:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Something went wrong.",
                severity: "error",
            });
        }
    };

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <Typography
                fontSize={16}
                fontWeight={600}
                gutterBottom
                mb={1}
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                onClick={() => onBack && onBack()}
            >
                <ArrowLeft />
            </Typography>

            <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
                <form onSubmit={handleSubmit}>
                    {/* Type Selector */}
                    <Box mb={2}>
                        <FormLabel sx={{ mb: 1 }}>Type</FormLabel> 
                        <Select
                            fullWidth
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            sx={{
                                "& .MuiOutlinedInput-notchedOutline": { border: "1px solid black"},
                                backgroundColor: "#f9fafb",
                                borderRadius: "6px",
                                height: "33px",
                                display: "flex",
                                alignItems: "center",
                                "& .MuiSelect-select": {
                                    height: "20px",
                                    padding: "10px 14px",
                                },
                            }}
                        >
                            <MenuItem value="crud">CRUD</MenuItem>
                            <MenuItem value="basic">Basic</MenuItem>
                        </Select>
                    </Box>


                    {/* Name */}
                    <Box mb={2}>
                        <Typography mb={1}>
                            Name <span className="reuired_field">*</span>
                        </Typography>
                        <CustomTextField
                            name="name"
                            placeholder="Enter permission name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Description (only for Basic) */}
                    {formData.type === "basic" && (
                        <Box mb={2}>
                            <Typography mb={1}>
                                Description <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                multiline
                                rows={1}
                                name="description"
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Box>
                    )}

                    {/* Resource (only for CRUD) */}
                    {formData.type === "crud" && (
                        <Box mb={2}>
                            <Typography mb={1}>Resources</Typography>
                            <FormGroup row>
                                {["create", "read", "update", "delete"].map((res) => (
                                    <FormControlLabel
                                        key={res}
                                        control={
                                            <Checkbox
                                                checked={formData.resource.includes(res)}
                                                onChange={() => handleResourceChange(res)}
                                            />
                                        }
                                        label={res}
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    )}

                    <Box mt={4} display="flex" justifyContent="center">
                        <Button type="submit" className="Global-Button2" variant="contained">
                            Save Permission
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PermissionCreate;
