import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  MenuItem,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Checkbox,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";

const token = localStorage.getItem("token");

const AddSub = ({ onBack, onSuccess, editingSubcategory, onUpdate }) => {
  const [formData, setFormData] = useState({
    category: "",
    subcategoryName: "",
    isActive: true,
    specifications: [],
    maintainanceFrequency: "",
    abbriviatedName: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [specFields, setSpecFields] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/catalog/categories?page=1&sortBy=name&sortOrder=asc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data?.status && Array.isArray(res.data.data?.data)) {
          setFetchedCategories(res.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSpecFields = async () => {
      try {
        const res = await axios.get(`${baseUrl}/catalog/specfields`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        

        if (res?.data?.status && Array.isArray(res?.data?.data?.data)) {
          setSpecFields(res?.data?.data?.data);
        }
      } catch (error) {
        console.error("Error fetching spec fields:", error);
      }
    };
    fetchSpecFields();
  }, []);

  useEffect(() => {
    if (editingSubcategory) {
      setFormData({
        category: editingSubcategory.category?.name || "",
        subcategoryName: editingSubcategory.name || "",
        abbriviatedName: editingSubcategory.abbriviatedName || "",
        isActive: editingSubcategory.status ?? true,
        specifications: editingSubcategory.specFieldIds || [],
        maintainanceFrequency: editingSubcategory.maintainanceFrequency || "",
      });
    } else {
      setFormData({
        category: "",
        subcategoryName: "",
        isActive: true,
        specifications: [],
        maintainanceFrequency: "",
        abbriviatedName: ""
      });
    }
  }, [editingSubcategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSpecChange = (uuid) => {
    setFormData((prev) => {
      const exists = prev.specifications.includes(uuid);
      const updated = exists
        ? prev.specifications.filter((id) => id !== uuid)
        : [...prev.specifications, uuid];
      return { ...prev, specifications: updated };
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.subcategoryName.trim()) {
      errors.subcategoryName = "Subcategory name is required";
    }
    if (!formData.category) {
      errors.category = "Category is required";
    }
    // NEW: Validation for maintenance frequency
    if (
      formData.maintainanceFrequency &&
      isNaN(formData.maintainanceFrequency)
    ) {
      errors.maintainanceFrequency = "Must be a number";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }

    const selectedCategory = fetchedCategories.find(
      (cat) => cat.name === formData.category
    );

    if (!selectedCategory) {
      setSnackbar({
        open: true,
        message: "Please select a valid category.",
        severity: "warning",
      });
      return;
    }

    const payload = {
      categoryId: selectedCategory.id,
      name: formData.subcategoryName,
      abbriviatedName: formData.abbriviatedName,
      status: formData.isActive,
      specFieldIds: formData.specifications,
      maintainanceFrequency: formData.maintainanceFrequency
        ? parseInt(formData.maintainanceFrequency)
        : null, // NEW: Add to payload
      // abbrivatedName: formData.abbrivatedName,
    };

    try {
      if (editingSubcategory) {
        const result = await onUpdate(payload);
        if (result?.success) {
          setSnackbar({
            open: true,
            message: "Subcategory updated successfully!",
            severity: "success",
          });
          setTimeout(() => {
            onSuccess();
            onBack();
          }, 1000);
        }
      } else {
        const res = await axios.post(
          `${baseUrl}/catalog/subcategories`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res?.data?.status || res?.data?.status === "validation_error") {
          setSnackbar({
            open: true,
            message: res?.data?.message,
            severity: "error",
          });
          return;
        } else if (res.data?.status) {
          setSnackbar({
            open: true,
            message: res?.data?.message || "Subcategory created successfully!",
            severity: "success",
          });

          setFormData({
            category: "",
            subcategoryName: "",
            isActive: true,
            specifications: [],
            maintainanceFrequency: "", // NEW: Reset
          });

          setTimeout(() => {
            onSuccess();
            onBack();
          }, 1000);
        }
      }
    } catch (error) {
      if (
        error.response?.status === 422 &&
        error.response.data?.data?.name?.length > 0
      ) {
        setFormErrors({ subcategoryName: error.response.data.data.name[0] });
        setSnackbar({
          open: true,
          message: error.response.data.data.name[0],
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Something went wrong.",
          severity: "error",
        });
      }
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
        fontSize={16}
        fontWeight={600}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={() => onBack && onBack()}
      >
        <ArrowLeft />
        {/* {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"} */}
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        {/* <Typography fontSize={15} className="line" fontWeight={600} mb={2}>
          {editingSubcategory ? "Edit Subcategory" : "Create Subcategory"}
        </Typography> */}

        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>
                Select Category <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                select
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!formErrors.category}
              >
                <MenuItem value="" disabled>
                  Select Category
                </MenuItem>
                {fetchedCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </CustomTextField>
              {formErrors.category && (
                <Typography variant="caption" color="error">
                  {formErrors.category}
                </Typography>
              )}
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>
                Subcategory Name <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="subcategoryName"
                placeholder="Enter subcategory name"
                value={formData.subcategoryName}
                onChange={handleChange}
                error={!!formErrors.subcategoryName}
              />
              {formErrors.subcategoryName && (
                <Typography variant="caption" color="error">
                  {formErrors.subcategoryName}
                </Typography>
              )}
            </div>
          </div>

          {/* NEW: Maintenance Frequency Row */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>
                Maintenance Frequency (Months){" "}
                <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="maintainanceFrequency"
                placeholder="Enter months"
                value={formData.maintainanceFrequency}
                onChange={handleChange}
                error={!!formErrors.maintainanceFrequency}
                type="number"
                inputProps={{ min: 0 }}
              />
              {formErrors.maintainanceFrequency && (
                <Typography variant="caption" color="error">
                  {formErrors.maintainanceFrequency}
                </Typography>
              )}
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>
                Abbriviated Name <span className="reuired_field">*</span>
              </Typography>
              <CustomTextField
                name="abbriviatedName"
                placeholder="Enter abbriviated name"
                value={formData.abbriviatedName}
                onChange={handleChange}
              // error={!!formErrors.abbrivatedName}
              />
              {/* {formErrors.abbrivatedName && (
                <Typography variant="caption" color="error">
                  {formErrors.abbrivatedName}
                </Typography>
              )} */}
            </div>

            <div style={columnStyle}>
              <Box display="flex" alignItems="center">
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitch}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#4caf50",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#4caf50",
                    },
                  }}
                />
                <Typography>
                  {formData.isActive ? "Active" : "Inactive"}
                </Typography>
              </Box>
            </div>
          </div>

          <Box mb={2}>
            <Typography mb={1} fontWeight={600}>
              Specifications <span className="reuired_field">*</span>
            </Typography>
            <Grid container spacing={2}>
              {specFields.map((field) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={field.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.specifications.includes(field.id)}
                        onChange={() => handleSpecChange(field.id)}
                      />
                    }
                    label={field.name}
                    sx={{
                      ml: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mt={4} display="flex" justifyContent="center">
            <Button type="submit" className="Global-Button2">
              {editingSubcategory ? "Update Subcategory" : "Save Subcategory"}
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

export default AddSub;
