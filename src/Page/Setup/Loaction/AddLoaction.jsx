import { useState, useEffect, useRef } from "react";
import {
  Box,
  InputLabel,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { CustomTextField } from "../../../utils/CustomTextField";


const AddLocation = ({ onBack, unitId }) => {
  const [formData, setFormData] = useState({
    abbriviatedName: "",
    identificationNumber: "",
    unitId: "",
    name: "",
    address: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const invoiceInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const inputLabelStyle = {
    fontWeight: "medium",
    marginBottom: "8px",
    display: "block",
    fontSize: "14px",
    color: "#333",
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch all units
        const unitRes = await axios.get(`${baseUrl}/super-admin/units`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnits(unitRes.data.data.data || []);

        // If editing, fetch existing location data
        if (unitId) {
          const res = await axios.get(
            `${baseUrl}/super-admin/locations/find/${unitId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const loc = res.data.data;
          console.log("Fetched location data:", loc);

          setFormData({
            identificationNumber: loc.identificationNumber || "",
            unitId:
              loc.unitlocation && loc.unitlocation.length > 0
                ? loc.unitlocation[0].unitId.toString()
                : "",
            name: loc.name || "",
            abbriviatedName: loc.abbriviatedName || "",
            address: loc.address || "",
          });

          if (loc.image) {
            setPreviewUrl(
              loc.image.startsWith("http") ? loc.image : `${baseUrl}/${loc.image}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load data. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [unitId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleIconClick = () => {
    invoiceInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const url = unitId
        ? `${baseUrl}/super-admin/locations/update/${unitId}`
        : `${baseUrl}/super-admin/locations/create`;

      const method = "post";
      const data = new FormData();
      data.append("identificationNumber", formData.identificationNumber);
      data.append("name", formData.name);
      data.append("unitId", formData.unitId);
      data.append("abbriviatedName", formData.abbriviatedName);
      data.append("address", formData.address);
      if (imageFile instanceof File) {
        data.append("image", imageFile);
      }
      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: `Location ${unitId ? "updated" : "created"} successfully!`,
          severity: "success",
        });

        if (!unitId) {
          setFormData({
            identificationNumber: "",
            unitId: "",
            name: "",
            abbriviatedName: "",
            address: "",
          });
          onBack();
        } else {
          onBack();
        }
      } else {
        throw new Error(
          response.data.errorResponse?.message || "Failed to submit"
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Typography
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <ArrowLeft style={{ cursor: "pointer" }} onClick={onBack} />
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Unit Field */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Typography mb={0.5}>Unit</Typography>
                <CustomTextField
                  select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  size="small"
                  required
                  disabled={submitting}
                >
                  <MenuItem value="">
                    <em>Select a unit</em>
                  </MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>

              {/* Identification Number Field */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Typography mb={0.5}>Identification Number</Typography>
                <CustomTextField
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  size="small"
                  disabled={submitting}
                />
              </Grid>

              {/* Abbriviated Name Field */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Typography mb={0.5}>Abbriviated Name</Typography>
                <CustomTextField
                  name="abbriviatedName"
                  value={formData.abbriviatedName}
                  onChange={handleChange}
                  size="small"
                  disabled={submitting}
                />
              </Grid>

              {/* Location Field */}
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Typography mb={0.5}>Location</Typography>
                <CustomTextField
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  size="small"
                  required
                  disabled={submitting}
                  inputProps={{ maxLength: 255 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Typography mb={0.5}>Address</Typography>
                <CustomTextField
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  size="small"
                  required
                  disabled={submitting}
                />
              </Grid>

              {/* Image Upload */}
              <div style={{ flex: "1 1 300px" }}>
                <InputLabel sx={inputLabelStyle}>Image</InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={
                    imageFile
                      ? imageFile.name
                      : previewUrl
                        ? "Uploaded Image"
                        : ""
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleIconClick}
                          size="small"
                          sx={{ color: "#9e9e9e" }}
                        >
                          <AttachmentIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { backgroundColor: "#f9f9f9", borderRadius: "4px" },
                  }}
                />
                <input
                  type="file"
                  ref={invoiceInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <Box mt={1}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxHeight: "100px", borderRadius: "4px" }}
                    />
                  </Box>
                )}
              </div>
            </Grid>

            <Box mt={2} display="flex" justifyContent="center">
              <Button
                className="Global-Button2"
                variant="contained"
                type="submit"
                sx={{ height: 33, textTransform: "none" }}
                disabled={submitting || !formData.unitId || !formData.name}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : unitId ? (
                  "Update Location"
                ) : (
                  "Add Location"
                )}
              </Button>
            </Box>
          </form>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddLocation;
