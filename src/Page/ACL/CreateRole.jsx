import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../Api";
import { useNavigate, useParams } from "react-router-dom"
import { CustomTextField } from "../../utils/CustomTextField";


const CreateRole = ({ onBack, onSuccess, editingRole, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissions: [],
    });

    const [permissionsList, setPermissionsList] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { id } = useParams();

    const handleGoBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate("/role-list");
        }


    };

    // fetch permissions list
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(
                    `${baseUrl}/super-admin/acl/permission/perm/list`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data?.data) {
                    setPermissionsList(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };

        fetchPermissions();
    }, [token]);

    const handleGetRoleById = async () => {
        if (!id) return;

        try {
            const response = await fetch(`${baseUrl}/super-admin/acl/role/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage?.getItem("token")}`
                }
            });

            const data = await response?.json();

            if (data?.data) {
                setFormData({
                    name: data.data.name || "",
                    description: data.data.description || "",
                    permissions: Array.isArray(data.data.permissions) ? data.data.permissions : [],
                });
            }
        } catch (error) {
            console.error("Error fetching role:", error);
            setSnackbar({
                open: true,
                message: "Error fetching role data",
                severity: "error",
            });
        }
    };

    useEffect(() => {
        handleGetRoleById();
    }, [id]);

    useEffect(() => {
        if (editingRole) {
            setFormData({
                name: editingRole.name || "",
                description: editingRole.description || "",
                permissions: Array.isArray(editingRole.permissions) ? editingRole.permissions : [],
            });
        } else if (!id) {
            setFormData({
                name: "",
                description: "",
                permissions: [],
            });
        }
    }, [editingRole, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (permissionId) => {
        setFormData((prev) => {

            const currentPermissions = Array.isArray(prev.permissions) ? prev.permissions : [];
            const permissionIds = currentPermissions.map(perm =>
                typeof perm === 'object' ? perm.id : perm
            );

            const isSelected = permissionIds.includes(permissionId);

            return {
                ...prev,
                permissions: isSelected
                    ? permissionIds.filter(id => id !== permissionId)
                    : [...permissionIds, permissionId],
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

        if (formData.permissions.length === 0) {
            setSnackbar({
                open: true,
                message: "Please select at least one permission",
                severity: "error",
            });
            return;
        }

        // Prepare the payload with the correct format
        const payload = {
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
        };

        if (editingRole || id) {
            // update role
            try {
                const response = await axios.put(
                    `${baseUrl}/super-admin/acl/role/${id || editingRole.id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.status) {
                    setSnackbar({
                        open: true,
                        message: response.data.message,
                        severity: "success",
                    });

                    setTimeout(() => {
                        // onSuccess();
                        // onBack();
                        navigate("/role-list")
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
        } else {
            // create role
            try {
                const response = await axios.post(
                    `${baseUrl}/super-admin/acl/role`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.status) {
                    setSnackbar({
                        open: true,
                        message: response.data.message,
                        severity: "success",
                    });
                    setFormData({ name: "", description: "", permissions: [] });

                    setTimeout(() => {
                        onSuccess();
                        onBack();
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
                onClick={handleGoBack}
            >
                <ArrowLeft />
            </Typography>

            <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
                <form onSubmit={handleSubmit}>
                    {/* Role Name */}
                    <Box mb={2}>
                        <Typography mb={1}>
                            Name <span className="reuired_field">*</span>
                        </Typography>
                        <CustomTextField
                            name="name"
                            placeholder="Enter role name"
                            value={formData?.name || ""}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Description */}
                    <Box mb={2}>
                        <Typography mb={1}>Description <span className="reuired_field">*</span></Typography>
                        <CustomTextField
                            multiline
                            rows={1}
                            name="description"
                            placeholder="Enter description"
                            value={formData?.description || ""}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Permissions Checkboxes */}
                    <Box mb={2}>
                        <Typography mb={1}>Permissions</Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)", // 4 per row
                                gap: 1,
                            }}
                        >
                            {permissionsList.map((perm) => {

                                const currentPermissions = Array.isArray(formData?.permissions) ? formData.permissions : [];
                                const isChecked = currentPermissions.some(formDataPerm => {
                                    if (typeof formDataPerm === 'number') {
                                        return formDataPerm === perm.id;
                                    } else if (typeof formDataPerm === 'object') {
                                        return formDataPerm.id === perm.id;
                                    }
                                    return false;
                                });

                                return (
                                    <FormControlLabel
                                        key={perm.id}
                                        control={
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(perm.id)}
                                            />
                                        }
                                        label={perm.name}
                                    />
                                );
                            })}
                        </Box>
                    </Box>

                    <Box mt={4} display="flex" justifyContent="center">
                        <Button type="submit" className="Global-Button2" variant="contained">
                            {editingRole || id ? "Update Role" : "Save Role"}
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

export default CreateRole;