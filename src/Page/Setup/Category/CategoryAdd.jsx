import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  IconButton,
  Snackbar,
  Alert,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";

const CategoryAdd = ({ onBack, editingCategory, onUpdate }) => {
  const token = localStorage.getItem("token");
  const [categories, setCategories] = useState([
    {
      name: "",
      assetType: "PHYSICAL",
      trackingType: "TRACKABLE",
      abbriviatedName: "",
      maintainanceFrequency: "",
      description: "",
      status: true,
      specFieldIds: [],
    },
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [specFields, setSpecFields] = useState([]);

  useEffect(() => {
    const fetchSpecFields = async () => {
      try {
        const res = await axios.get(`${baseUrl}/catalog/specfields?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.status && Array.isArray(res.data.data?.data)) {
          setSpecFields(res.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching spec fields:", error);
      }
    };
    fetchSpecFields();
  }, [token]);

  useEffect(() => {
    if (editingCategory) {
      setCategories([
        {
          name: editingCategory.name,
          assetType: editingCategory.assetType || "PHYSICAL",
          trackingType: editingCategory.trackingType || "TRACKABLE",
          abbriviatedName: editingCategory.abbriviatedName || "",
          maintainanceFrequency: editingCategory.maintainanceFrequency || "",
          description: editingCategory.description || "",
          status: editingCategory.status,
          specFieldIds: editingCategory.categorySpecFields?.map(csf => csf.specFieldId) || [],
        },
      ]);
    } else {
      setCategories([
        {
          name: "",
          assetType: "PHYSICAL",
          trackingType: "TRACKABLE",
          abbriviatedName: "",
          maintainanceFrequency: "",
          description: "",
          status: true,
          specFieldIds: [],
        },
      ]);
    }
  }, [editingCategory]);

  const handleAddRow = () => {
    setCategories([
      ...categories,
      {
        name: "",
        assetType: "PHYSICAL",
        trackingType: "TRACKABLE",
        abbriviatedName: "",
        maintainanceFrequency: "",
        description: "",
        status: true,
        specFieldIds: [],
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    // If asset type changed to DIGITAL, auto-set tracking to NON_TRACKABLE
    if (field === "assetType" && value === "DIGITAL") {
      updated[index].trackingType = "NON_TRACKABLE";
    }
    setCategories(updated);
  };

  const handleSave = async () => {
    const invalid = categories.find((c) => !c.name.trim());
    if (invalid) {
      setSnackbar({
        open: true,
        message: "All Category Names are required",
        severity: "error",
      });
      return;
    }

    if (editingCategory) {
      const cat = categories[0];
      const result = await onUpdate({
        brandName: cat.name,
        assetType: cat.assetType,
        trackingType: cat.trackingType,
        abbriviatedName: cat.abbriviatedName,
        maintainanceFrequency: cat.maintainanceFrequency,
        description: cat.description,
        status: cat.status,
        specFieldIds: cat.specFieldIds || [],
      });
      if (result?.success) {
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } else {
      try {
        for (const category of categories) {
          const payload = {
            name: category.name,
            assetType: category.assetType,
            trackingType: category.trackingType,
            abbriviatedName: category.abbriviatedName || null,
            maintainanceFrequency: category.maintainanceFrequency
              ? parseInt(category.maintainanceFrequency)
              : null,
            description: category.description,
            status: category.status,
            specFieldIds: category.specFieldIds || [],
          };

          await axios.post(`${baseUrl}/catalog/categories`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        setSnackbar({
          open: true,
          message: "All categories added successfully!",
          severity: "success",
        });

        setCategories([
          {
            name: "",
            assetType: "PHYSICAL",
            trackingType: "TRACKABLE",
            abbriviatedName: "",
            maintainanceFrequency: "",
            description: "",
            status: true,
          },
        ]);

        setTimeout(() => {
          onBack();
        }, 1000);
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

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#f1f1ff",
      borderRadius: 1,
      "& fieldset": { border: "none" },
    },
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <Typography fontSize={16} fontWeight={600} variant="subtitle1">
            {editingCategory ? "Edit Category" : "Add Category"}
          </Typography>
        </Box>

        {!editingCategory && (
          <Button
            className="Global-Button"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Category Row
          </Button>
        )}
      </Box>

      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          p: 3,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {categories.map((category, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #dee2e6",
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            {/* Row header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography fontWeight={600}>{`Category #${index + 1
                }`}</Typography>
              {categories.length > 1 && !editingCategory && (
                <IconButton
                  onClick={() => handleRemoveRow(index)}
                  color="error"
                  sx={{ p: 1 }}
                >
                  <img
                    src={Deleteicon1}
                    alt="delete"
                    width={16}
                    height={16}
                  />
                </IconButton>
              )}
            </Box>

            {/* Asset Type: Physical or Digital */}
            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ fontWeight: 500, fontSize: 13, color: "#333" }}
                >
                  Asset Type
                </FormLabel>
                <RadioGroup
                  row
                  value={category.assetType}
                  onChange={(e) =>
                    handleChange(index, "assetType", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="PHYSICAL"
                    control={<Radio size="small" />}
                    label="Physical"
                  />
                  <FormControlLabel
                    value="DIGITAL"
                    control={<Radio size="small" />}
                    label="Digital"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Tracking Type: only for Physical */}
            {category.assetType === "PHYSICAL" && (
              <Box sx={{ mb: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    sx={{ fontWeight: 500, fontSize: 13, color: "#333" }}
                  >
                    Tracking Type
                  </FormLabel>
                  <RadioGroup
                    row
                    value={category.trackingType}
                    onChange={(e) =>
                      handleChange(index, "trackingType", e.target.value)
                    }
                  >
                    <FormControlLabel
                      value="TRACKABLE"
                      control={<Radio size="small" />}
                      label="Trackable"
                    />
                    <FormControlLabel
                      value="NON_TRACKABLE"
                      control={<Radio size="small" />}
                      label="Non-Trackable"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {/* Category Name + Abbreviated Name */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: "2 1 250px" }}>
                <Typography fontWeight={500} fontSize={13} mb={0.5}>
                  Category Name *
                </Typography>
                <CustomTextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Laptop, Desktop, Mouse"
                  value={category.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                />
              </Box>

              <Box sx={{ flex: "1 1 150px" }}>
                <Typography fontWeight={500} fontSize={13} mb={0.5}>
                  Abbreviated Name
                </Typography>
                <CustomTextField
                  fullWidth
                  size="small"
                  placeholder="e.g. LPT, DSK"
                  value={category.abbriviatedName}
                  onChange={(e) =>
                    handleChange(index, "abbriviatedName", e.target.value)
                  }
                />
              </Box>

              <Box sx={{ flex: "1 1 150px" }}>
                <Typography fontWeight={500} fontSize={13} mb={0.5}>
                  Maintenance Freq. (months)
                </Typography>
                <CustomTextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 6"
                  value={category.maintainanceFrequency}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "maintainanceFrequency",
                      e.target.value
                    )
                  }
                />
              </Box>
            </Box>

            {/* Status */}
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <Typography fontWeight={500} fontSize={13} mr={1}>
                Status
              </Typography>
              <Checkbox
                checked={category.status}
                color="success"
                onChange={(e) =>
                  handleChange(index, "status", e.target.checked)
                }
              />
              <Typography fontWeight={500}>Active</Typography>
            </Box>

            {/* Specifications / Dynamic Attributes Checkboxes */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography fontWeight={600} fontSize={13} mb={1}>
                Specifications / Attributes
              </Typography>
              <Grid container spacing={1}>
                {specFields.map((field) => {
                  const isChecked = (category.specFieldIds || []).includes(field.id);
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={field.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isChecked}
                            size="small"
                            onChange={(e) => {
                              const currentIds = category.specFieldIds || [];
                              const newIds = e.target.checked
                                ? [...currentIds, field.id]
                                : currentIds.filter((id) => id !== field.id);
                              handleChange(index, "specFieldIds", newIds);
                            }}
                          />
                        }
                        label={field.name}
                        sx={{
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                          ml: 0,
                          width: "100%",
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        ))}

        <Box mt={3} display="flex" justifyContent="center">
          <Button className="Global-Button2" onClick={handleSave}>
            {editingCategory ? "Update Category" : "Save All"}
          </Button>
        </Box>
      </Box>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryAdd;