import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  MenuItem,
  Avatar,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import { styled } from "@mui/system";
import { ArrowLeft } from "lucide-react";
import { baseUrl } from "../Api";
import axios from "axios";
import { CustomTextField } from "../../utils/CustomTextField";

const RequiredLabel = ({ label, required }) => (
  <Typography variant="subtitle2" fontWeight={500} mb={0.5}>
    {label}
    {required && <span style={{ color: "red" }}> *</span>}
  </Typography>
);

const StyledTextField = styled(TextField)(() => ({
  backgroundColor: "#f9f9f9",
  borderRadius: 4,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: "33px",
    padding: "0 10px",
    "& fieldset": { border: "none" },
    "& input": { height: "15px", padding: 0 },
    "& select": { height: "15px", padding: 0 },
  },
}));

const StyledTextField1 = styled(TextField)(() => ({
  backgroundColor: "#f9f9f9",
  borderRadius: 4,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    padding: "0 10px",
    "& fieldset": { border: "none" },
    "& input": { height: "15px", padding: 0 },
  },
}));

export default function AddEmp({
  onBackClick,
  onEmployeeAdded,
  unitId,
  onBack,
}) {
  const token = localStorage.getItem("token");
  const [tabIndex, setTabIndex] = useState(0);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    unit: "",
    location: "",
    phone: "",
    department: "",
    designation: "",
    about: "",
    email: "",
    password: "",
    joiningDate: dayjs(),
    fileName: "",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Fetch roles
  useEffect(() => {
    setLoadingRoles(true);
    fetch(`${baseUrl}/super-admin/acl/role`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRoles(data?.data?.data || []))
      .finally(() => setLoadingRoles(false));
  }, [token]);

  // Fetch departments
  useEffect(() => {
    setLoadingDepartments(true);
    fetch(`${baseUrl}/super-admin/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data?.data?.data || []))
      .finally(() => setLoadingDepartments(false));
  }, [token]);

  // Fetch units
  useEffect(() => {
    setLoadingUnits(true);
    fetch(`${baseUrl}/gr/units/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUnits(data?.data || []))
      .finally(() => setLoadingUnits(false));
  }, [token]);

  // Fetch locations when unit changes
  useEffect(() => {
    if (!formData.unit) {
      setLocations([]);
      setFormData((prev) => ({ ...prev, location: "" }));
      return;
    }
    setLoadingLocations(true);
    fetch(`${baseUrl}/super-admin/locations/by-unit/${formData.unit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLocations(data?.data || []);
      })
      .finally(() => setLoadingLocations(false));
  }, [formData.unit, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fileName" && files?.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, fileName: file.name }));
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.role ||
      !formData.department ||
      !formData.unit ||
      !formData.location
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      // password: formData.password || "Access on branch only",
      roles: [parseInt(formData.role)],
      designation: formData.designation,
      departmentID: parseInt(formData.department),
      unitId: parseInt(formData.unit),
      locationId: parseInt(formData.location),
      phone: formData.phone,
      about: formData.about,
    };

    if (formData.password?.trim()) {
      payload.password = formData.password.trim();
    } //conditionally sending password now. if there is changes in password only then sending the password field.


    try {
      if (unitId) {
        await axios.put(`${baseUrl}/super-admin/acl/user/${unitId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Employee updated successfully!",
          severity: "success",
        });
      } else {
        await axios.post(`${baseUrl}/super-admin/acl/user`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Employee added successfully!",
          severity: "success",
        });
      }
      setTimeout(() => onBack(true), 1000);
      if (onEmployeeAdded) onEmployeeAdded();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to save employee.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch employee details for edit
  useEffect(() => {
    if (unitId) fetchEmpDetails();
  }, [unitId]);

  const fetchEmpDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/super-admin/acl/user/${unitId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        const emp = response.data.data;
        const nameParts = emp.name?.trim().split(" ") || [];
        const firstName =
          nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
        const lastName = nameParts.slice(-1).join(" ") || "";

        setFormData({
          firstName,
          lastName,
          email: emp.email,
          // password: "Access on branch only",
          password: "", //Changes password from showing hashed password to empty string
          role: emp.roles?.[0]?.id || "",
          designation: emp.designation || "",
          department: emp.departmentId || "",
          unit: emp.unitId || "",
          location: emp.locationId || emp.location?.id || "", // FIX: store id instead of name
          phone: emp.mobile || "",
          about: emp.about || "",
          fileName: "",
          joiningDate: dayjs(emp.createdAt),
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to fetch employee details",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    onBack();
  };

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton>
            <ArrowLeft onClick={handleGoBack} />
          </IconButton>
          <Typography variant="h6">
            {unitId ? "Edit Employee" : "Add Employee"}
          </Typography>
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="Basic Information" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          {/* Profile upload */}
          {/* <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{
              border: "1px dashed #ccc",
              borderRadius: 2,
              p: 2,
              mb: 3,
              backgroundColor: "#fafafa",
            }}
          >
            <Avatar sx={{ width: 56, height: 56 }} src={profileImage} />
            <Box>
              <Typography>Upload Profile Image</Typography>
              <Box display="flex" gap={1} mt={1}>
                <input
                  accept="image/*"
                  type="file"
                  id="upload-button"
                  name="fileName"
                  style={{ display: "none" }}
                  onChange={handleChange}
                />
                <label htmlFor="upload-button">
                  <Button className="Global-Button4" size="small" component="span">
                    Upload
                  </Button>
                </label>
                <Button
                  sx={{ color: "#9D9D9D" }}
                  variant="text"
                  size="small"
                  onClick={() => {
                    setProfileImage(null);
                    setFormData((prev) => ({ ...prev, fileName: "" }));
                  }}
                >
                  Cancel
                </Button>
              </Box>
              {formData.fileName && (
                <Typography variant="body2" mt={1} color="text.secondary">
                  Selected file: {formData.fileName}
                </Typography>
              )}
            </Box>
          </Box> */}

          {/* Fields */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="First Name" required />
              <CustomTextField
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Box>
            <Box flex={1}>
              <RequiredLabel label="Last Name" required />
              <CustomTextField
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Box>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="Email" />
              <CustomTextField
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Box>
            <Box flex={1}>
              <RequiredLabel label="Password" required />
              <CustomTextField
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Box>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="Phone No" required />
              <CustomTextField
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </Box>
            <Box flex={1}>
              <RequiredLabel label="Role" required />
              {loadingRoles ? (
                <CircularProgress size={20} />
              ) : (
                <CustomTextField
                  select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select a role
                  </MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            </Box>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="Department" required />
              {loadingDepartments ? (
                <CircularProgress size={20} />
              ) : (
                <CustomTextField
                  select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select a department
                  </MenuItem>
                  {departments.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            </Box>
            <Box flex={1}>
              <RequiredLabel label="Designation" />
              <CustomTextField
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </Box>
          </Box>

          {/* Unit & Location */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="Unit" required />
              {loadingUnits ? (
                <CircularProgress size={20} />
              ) : (
                <CustomTextField
                  select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select a unit
                  </MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            </Box>
            <Box flex={1}>
              <RequiredLabel label="Location" required />
              {loadingLocations ? (
                <CircularProgress size={20} />
              ) : (
                <CustomTextField
                  select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!formData.unit}
                >
                  <MenuItem value="" disabled>
                    {formData.unit ? "Select a location" : "Select unit first"}
                  </MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.location.id} value={loc.location.id}>
                      {loc.location.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            </Box>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <RequiredLabel label="About" />
              <CustomTextField
                multiline
                rows={4}
                name="about"
                value={formData.about}
                onChange={handleChange}
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              className="Global-Button2"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Save All"}
            </Button>
            <Button
              className="Global-Button3"
              color="inherit"
              onClick={handleGoBack}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
