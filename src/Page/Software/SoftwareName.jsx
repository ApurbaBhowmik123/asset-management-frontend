import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowLeft } from "lucide-react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { baseUrl } from "../Api";
import { CustomTextField } from "../../utils/CustomTextField";

//  Styled TextField
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

// Helper to format date for input[type=date]
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // yyyy-MM-dd
};

const SoftwareName = ({ onBack, softwareId }) => {
  const [formData, setFormData] = useState({
    softwareName: "",
    softwareQuantity: "",
    activationKey:"",
    licenseType: "",
    issueDate: "",
    expiryDate: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (softwareId) {
      fetchSoftwareData();
    }
  }, [softwareId]);

  const fetchSoftwareData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/software/detail/${softwareId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        const software = response.data.data;
        setFormData({
          softwareName: software?.name || "",
          softwareQuantity: software?.addedQuantity || "",
          activationKey: software?.activationKey || "",
          licenseType: software?.LicenseType || "",
          issueDate: formatDateForInput(software?.IssueDate),
          expiryDate: formatDateForInput(software?.ExpiryDate),
        });
      }
    } catch (error) {
      console.error("Error fetching software data:", error);
      showSnackbar("Failed to fetch software data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.softwareName.trim()) {
      errors.softwareName = "Software name is required";
    }
    if (!formData.softwareQuantity) {
      errors.softwareQuantity = "Software quantity is required";
    } else if (isNaN(formData.softwareQuantity)) {
      errors.softwareQuantity = "Must be a number";
    }
    // if (!formData.licenseType) {
    //   errors.licenseType = "License type is required";
    // }
    if (!formData.issueDate) {
      errors.issueDate = "Issue date is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showSnackbar("Please fix the errors in the form", "error");
      return;
    }

    try {
      setLoading(true);

      const formatDateToISO = (date) => {
        if (!date) return null;
        return new Date(date).toISOString();
      };

      const payload = {
        name: formData.softwareName,
        quantity: Number(formData.softwareQuantity),
        activationKey: formData.activationKey,
        LicenseType: formData.licenseType,
        IssueDate: formatDateToISO(formData.issueDate),
        ExpiryDate: formatDateToISO(formData.expiryDate),
      };

      let response;
      if (softwareId) {
        response = await axios.put(
          `${baseUrl}/software/update/${softwareId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(`${baseUrl}/software/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.data.status) {
        showSnackbar(
          softwareId
            ? "Software updated successfully!"
            : "Software created successfully!",
          "success"
        );

        setTimeout(() => {
          onBack(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving software:", error);
      showSnackbar(
        error?.response?.data?.message ||
        "Failed to save software. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
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
        fontSize={16}
        fontWeight={600}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          mb: 2,
        }}
        onClick={() => onBack(false)}
      >
        <ArrowLeft />
        {/* {softwareId ? "Edit Software" : "Add Software"} */}
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        {/* <Typography fontSize={15} fontWeight={600} mb={2}>
          {softwareId ? "Edit Software" : "Create Software"}
        </Typography> */}

        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>
                Software Name <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="softwareName"
                placeholder="Enter software name"
                value={formData.softwareName}
                onChange={handleChange}
                error={!!formErrors.softwareName}
                helperText={formErrors.softwareName}
                disabled={loading}
              />
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>
                Software Quantity <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="softwareQuantity"
                placeholder="Enter quantity"
                value={formData.softwareQuantity}
                onChange={handleChange}
                error={!!formErrors.softwareQuantity}
                helperText={formErrors.softwareQuantity}
                type="number"
                inputProps={{ min: 1 }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>
                License Type
              </Typography>
              <CustomTextField
                select
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                error={!!formErrors.licenseType}
                helperText={formErrors.licenseType}
                disabled={loading}
              >
                <MenuItem value="Perpetual License">Perpetual License</MenuItem>
                <MenuItem value="Subscription License">
                  Subscription License
                </MenuItem>
                <MenuItem value="Free Version">Free Version</MenuItem>
              </CustomTextField>
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>
               Activation Key 
              </Typography>
              <CustomTextField
                 name="activationKey" 
                value={formData.activationKey}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.activationkey}
                helperText={formErrors.activationkey}
              />
            </div>

          </div>

          {/* Row 3 */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>
                Issue Date <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.issueDate}
                helperText={formErrors.issueDate}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>
                Expiry Date
              </Typography>
              <CustomTextField
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>

          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              type="button"
              className="Global-Button3"
              onClick={() => onBack(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="Global-Button2" disabled={loading}>
              {loading ? "Saving..." : "Save Software"}
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
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SoftwareName;
