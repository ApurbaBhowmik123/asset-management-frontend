import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Snackbar,
    Alert,
    MenuItem,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { CustomTextField } from "../../../utils/CustomTextField";
import axios from "axios";
import { baseUrl } from "../../Api";

// Action enum
export const MailActions = {
    ASSIGN_PRODUCT: "Assign Product",
    CREATE_GR: "Create Goods Receipt",
    SOFTWARE_INSTALLATION : "Software Installation",
    ASSIGNMENT_HANDOVERED: "Assignment Handovered",
    GR_CREATED: "Goods Receipt Created",
};

const AddEmail = ({ onBack, emailData }) => {
    const [formData, setFormData] = useState({
        unitId: "",
        unitAdminId: "",
        superAdminId: "",
        subject: "",
        action: "",
    });
    const isEditMode = Boolean(emailData && emailData.id);

    const [units, setUnits] = useState([]);
    const [unitAdmins, setUnitAdmins] = useState([]);
    const [superAdmins, setSuperAdmins] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchUnits();
        fetchSuperAdmins();

        // Prefill form if in edit mode
        if (isEditMode && emailData) {
            setFormData({
                unitId: emailData.unitId || "",
                unitAdminId: emailData.unitAdminId || "",
                superAdminId: emailData.superAdminId || "",
                subject: emailData.subject || "",
                action: emailData.action || "",
            });
        }
    }, [emailData, isEditMode]);


    // Fetch Units
    const fetchUnits = async () => {
        try {
            const response = await axios.get(`${baseUrl}/gr/units/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const unitOptions = response.data.data.map((unit) => ({
                value: unit.id,
                label: unit.name,
            }));

            setUnits(unitOptions);
        } catch (error) {
            console.error("Failed to fetch units:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch units",
                severity: "error",
            });
        }
    };

    // Fetch Super Admins
    const fetchSuperAdmins = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/super-admin/mail-config/super-admins`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const superAdminOptions = response.data.data.map((admin) => ({
                value: admin.id,
                label: admin.name,
            }));

            setSuperAdmins(superAdminOptions);
        } catch (error) {
            console.error("Failed to fetch super admins:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch super admins",
                severity: "error",
            });
        }
    };

    useEffect(() => {
        const fetchUnitAdmins = async (unitId) => {
            try {
                const response = await axios.get(
                    `${baseUrl}/super-admin/mail-config/unit-admins/${unitId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const unitAdminOptions = response.data.data.map((admin) => ({
                    value: admin.id,
                    label: admin.name,
                }));

                setUnitAdmins(unitAdminOptions);
            } catch (error) {
                console.error("Failed to fetch unit admins:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to fetch unit admins",
                    severity: "error",
                });
            }
        };

        if (formData.unitId) {
            fetchUnitAdmins(formData.unitId);

            // Only reset unitAdminId if we're not in edit mode or if the unit has changed
            if (!isEditMode || formData.unitId !== emailData.unitId) {
                setFormData((prev) => ({ ...prev, unitAdminId: "" }));
            }
        } else {
            setUnitAdmins([]);
        }
    }, [formData.unitId, isEditMode, emailData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.unitId) newErrors.unitId = "Unit is required";
        if (!formData.unitAdminId) newErrors.unitAdminId = "Unit Admin is required";
        if (!formData.superAdminId) newErrors.superAdminId = "Super Admin is required";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.action) newErrors.action = "Action is required"; // ✅ New validation

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsLoading(true);

            let response;
            if (isEditMode) {
                // Update existing email configuration
                response = await axios.put(
                    `${baseUrl}/super-admin/mail-config/update/${emailData.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Create new email configuration
                response = await axios.post(
                    `${baseUrl}/super-admin/mail-config/create`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (response.data.status) {
                setSnackbar({
                    open: true,
                    message: response.data.message,
                    severity: "success",
                });
                setTimeout(() => onBack(true), 1000);
            } else {
                throw new Error(response.data.message || "Something went wrong");
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || `Error ${isEditMode ? 'updating' : 'saving'} email configuration`,
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const rowStyle = {
        display: "flex",
        gap: "24px",
        marginBottom: "12px",
        flexWrap: "wrap",
    };

    const columnStyle = {
        flex: "1 1 45%",
        minWidth: "250px",
    };

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
                <ArrowLeft
                    style={{ cursor: "pointer" }}
                    onClick={() => onBack()}
                    size={20}
                />

            </Typography>

            <Paper elevation={1} sx={{ mx: "auto", p: 2 }}>
                <form onSubmit={handleSubmit}>
                    {/* Row 1 */}
                    <div style={rowStyle}>
                        <div style={columnStyle}>
                            <Typography mb={1}>
                                Select Unit <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                name="unitId"
                                placeholder="Select Unit"
                                select
                                value={formData.unitId}
                                onChange={handleChange}
                                error={!!errors.unitId}
                                helperText={errors.unitId}
                            >
                                {units.map((unit) => (
                                    <MenuItem key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>

                        <div style={columnStyle}>
                            <Typography mb={1}>
                                Select Unit Admin <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                name="unitAdminId"
                                placeholder="Select Unit Admin"
                                select
                                value={formData.unitAdminId}
                                onChange={handleChange}
                                error={!!errors.unitAdminId}
                                helperText={errors.unitAdminId}
                            >
                                {unitAdmins.map((admin) => (
                                    <MenuItem key={admin.value} value={admin.value}>
                                        {admin.label}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div style={rowStyle}>
                        <div style={columnStyle}>
                            <Typography mb={1}>
                                Select Super Admin <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                name="superAdminId"
                                placeholder="Select Super Admin"
                                select
                                value={formData.superAdminId}
                                onChange={handleChange}
                                error={!!errors.superAdminId}
                                helperText={errors.superAdminId}
                            >
                                {superAdmins.map((s) => (
                                    <MenuItem key={s.value} value={s.value}>
                                        {s.label}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>

                        <div style={columnStyle}>
                            <Typography mb={1}>
                                Subject <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Enter subject"
                                error={!!errors.subject}
                                helperText={errors.subject}
                            />
                        </div>
                    </div>

                    {/* Row 3 - NEW Action dropdown */}
                    <div style={rowStyle}>
                        <div style={columnStyle}>
                            <Typography mb={1}>
                                Select Action <span className="reuired_field">*</span>
                            </Typography>
                            <CustomTextField
                                name="action"
                                placeholder="Select Action"
                                select
                                value={formData.action}
                                onChange={handleChange}
                                error={!!errors.action}
                                helperText={errors.action}
                            >
                                {Object.entries(MailActions).map(([key, label]) => (
                                    <MenuItem key={key} value={label}>
                                        {label}
                                    </MenuItem>
                                ))}

                            </CustomTextField>
                        </div>
                        <div style={columnStyle}></div>
                    </div>

                    <Box mt={4} display="flex" justifyContent="center" gap={2}>
                        <Button
                            className="Global-Button3"
                            onClick={() => onBack()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="Global-Button2"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Save"}
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddEmail

