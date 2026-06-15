import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Divider,
  Grid,
  Paper,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";

const FIELD_TYPE_MAP = {
  TEXT: "Text",
  DROPDOWN: "Dropdown",
  CHECKBOX: "Checkbox",
  RADIO: "Radio"
};

const REVERSE_FIELD_TYPE_MAP = {
  Text: "TEXT",
  Dropdown: "DROPDOWN",
  Checkbox: "CHECKBOX",
  Radio: "RADIO"
};

const CustomFieldAdd = ({ onBack, fieldId, mode }) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text");
  const [isRequired, setIsRequired] = useState(false);
  const [description, setDescription] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [defaultOptionId, setDefaultOptionId] = useState(null); 
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && fieldId) {
      fetchFieldDetails();
    }
  }, [fieldId, mode]);

  const fetchFieldDetails = async () => {
    setInitialLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/catalog/specfields/${fieldId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        const field = response.data.data;
        const mappedFieldType = FIELD_TYPE_MAP[field.fieldType] || "Text";

        setFieldName(field.name);
        setFieldType(mappedFieldType);
        setIsRequired(field.isRequired);
        setDescription(field.description || "");
        setStatus(field.status);

        if (mappedFieldType === "Text") {
          // Store both value and ID for text field option
          if (field.options && field.options.length > 0) {
            setDefaultValue(field.options[0].value.trim());
            setDefaultOptionId(field.options[0].id);
          }
        } else {
          setOptions(field.options.map(opt => ({
            id: opt.id,
            value: opt.value.trim()
          })) || []);
        }
      }
    } catch (error) {
      console.error("Error fetching field details:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to fetch field details",
        severity: "error",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.some(opt => opt.value === newOption.trim())) {
      const updatedOptions = [
        ...options, 
        { value: newOption.trim() } 
      ];
      setOptions(updatedOptions);
      setNewOption("");
      setShowAddForm(false);
    }
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleFieldTypeChange = (e) => {
    const type = e.target.value;
    setFieldType(type);
    setOptions([]);
    setDefaultValue("");
    setDefaultOptionId(null);
  };

  const handleSubmit = async () => {
    if (!fieldName.trim()) {
      setSnackbar({
        open: true,
        message: "Field name is required",
        severity: "error",
      });
      return;
    }

    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: "Description is required",
        severity: "error",
      });
      return;
    }

    if (fieldType !== "Text" && options.length === 0) {
      setSnackbar({
        open: true,
        message: `At least one option is required for ${fieldType}`,
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const apiFieldType = REVERSE_FIELD_TYPE_MAP[fieldType] || "TEXT";
      let payload = {
        name: fieldName,
        fieldType: apiFieldType,
        isRequired,
        description: description || null,
        status,
      };

      // Prepare options payload
      if (fieldType === "Text") {
        // For text fields, include ID if it exists (edit mode)
        payload.options = defaultValue ? [ 
          defaultOptionId 
            ? { id: defaultOptionId, value: defaultValue } 
            : { value: defaultValue } 
        ] : [];
      } else {
        // For other field types, include IDs for existing options
        payload.options = options.map(opt => 
          opt.id 
            ? { id: opt.id, value: opt.value }
            : { value: opt.value }            
        );
      }

      const token = localStorage.getItem("token");
      let response;

      if (mode === 'edit') {
        response = await axios.put(
          `${baseUrl}/catalog/specfields/${fieldId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
      } else {
        response = await axios.post(
          `${baseUrl}/catalog/specfields`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
      }

      if (response.data.status || response.data.success) {
        setSnackbar({
          open: true,
          message: mode === 'edit'
            ? "Custom field updated successfully!"
            : "Custom field created successfully!",
          severity: "success",
        });
        
        setTimeout(() => onBack(true), 1000);
      } else {
        const errorResponse = response.data.errorResponse;
        const message = errorResponse?.message || "Operation failed";
        
        setSnackbar({
          open: true,
          message,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving custom field:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message ||
          (mode === 'edit'
            ? "Failed to update custom field"
            : "Failed to create custom field"),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (initialLoading && mode === 'edit') {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3}>
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ArrowBackIcon
              sx={{ mr: 1, cursor: "pointer" }}
              onClick={() => onBack()}
            />
            <Typography variant="h5">
              <b>{mode === 'edit' ? 'Edit' : 'Create'} Custom Field</b>
            </Typography>
          </Box>
        </Box>
        <Divider />

        <Grid container>
          <Grid item xs={12} sm={12} md={7}>
            <Box sx={{ px: 4, py: 2 }}>
              <Typography variant="subtitle1">
                <b>Core Information</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mode === 'edit' 
                  ? 'Update key details for this custom field' 
                  : 'Enter key details for custom field creation'}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid sx={{ width: "500px" }} item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography sx={{ minWidth: 100, color: "grey", fontWeight: "medium" }}>
                      Field Name
                      <Typography component="span" sx={{ color: "error.main", fontSize: "1rem", ml: 0.5 }}>
                        *
                      </Typography>
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <CustomTextField
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography sx={{ minWidth: 100, color: "grey", fontWeight: "medium" }}>
                      Field Type
                      <Typography component="span" sx={{ color: "error.main", fontSize: "1rem", ml: 0.5 }}>
                        *
                      </Typography>
                    </Typography>
                    <Select
                      value={fieldType}
                      onChange={handleFieldTypeChange}
                      size="small"
                      fullWidth
                      disabled={mode === 'edit'}
                    >
                      <MenuItem value="Text">Text</MenuItem>
                      <MenuItem value="Dropdown">Dropdown</MenuItem>
                      <MenuItem value="Checkbox">Checkbox</MenuItem>
                      <MenuItem value="Radio">Radio</MenuItem>
                    </Select>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography sx={{ minWidth: 100, color: "grey", fontWeight: "medium" }}>
                      Required
                    </Typography>
                    <Select
                      value={isRequired}
                      onChange={(e) => setIsRequired(e.target.value)}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value={false}>No</MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                    </Select>
                  </Box>

                  {mode === 'edit' && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Typography sx={{ minWidth: 100, color: "grey", fontWeight: "medium" }}>
                        Status
                      </Typography>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value={true}>Active</MenuItem>
                        <MenuItem value={false}>Inactive</MenuItem>
                      </Select>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography sx={{ minWidth: 100, color: "grey", fontWeight: "medium" }}>
                     Description
                      <Typography component="span" sx={{ color: "error.main", fontSize: "1rem", ml: 0.5 }}>
                        *
                      </Typography>
                    </Typography>
                    <CustomTextField
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Box>
                </Grid>
              </Grid>

              {fieldType === "Text" && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mt: 2 }}>
                  <Typography sx={{ minWidth: 100, color: "grey" }}>
                    Default Value
                  </Typography>
                  <CustomTextField
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Enter default value"
                  />
                </Box>
              )}

              {(fieldType === "Radio" || fieldType === "Dropdown" || fieldType === "Checkbox") && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Options
                  </Typography>
                  {options.map((option, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <CustomTextField
                        value={option.value}
                        size="small"
                        fullWidth
                        disabled
                      />
                      <img
                        src={Deleteicon1}
                        alt="delete"
                        width={16}
                        height={16}
                        onClick={() => handleRemoveOption(index)}
                        style={{ cursor: "pointer" }}
                      />
                    </Box>
                  ))}
                  {showAddForm && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <CustomTextField
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={handleKeyDown}
                        size="small"
                        fullWidth
                        autoFocus
                        placeholder="Enter option value"
                      />
                      <Button className="Global-Button2" onClick={handleAddOption}>
                        Add
                      </Button>
                    </Box>
                  )}
                  {!showAddForm && (
                    <Button
                      startIcon={<AddIcon />}
                      className="Global-Button12"
                      size="small"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add Option
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={12} md={12} sx={{ p: 2 }}>
            <Paper elevation={3} sx={{ height: "90%", width: "400px", padding: 2, backgroundColor: "#FAFAFA" }}>
              <b>Preview</b>
              <InputLabel sx={{ mt: 2 }}>{fieldName}</InputLabel>
              {fieldType === "Text" ? (
                <TextField
                  size="small"
                  fullWidth
                  value={defaultValue || ""}
                  placeholder="Enter text"
                  sx={{ mt: 1 }}
                />
              ) : fieldType === "Dropdown" ? (
                <FormControl sx={{ mt: 2, minWidth: 120, width: "100%" }} size="small">
                  <InputLabel>Select</InputLabel>
                  <Select value={options[0]?.value || ""} label="Select" >
                    {options.map((option, index) => (
                      <MenuItem key={index} value={option.value}>
                        {option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : fieldType === "Checkbox" ? (
                <FormControl sx={{ mt: 2, width: "100%" }} component="fieldset">
                  {options.map((option, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox" id={`checkbox-${index}`} checked={false} disabled />
                      <label htmlFor={`checkbox-${index}`} style={{ marginLeft: 8 }}>
                        {option.value}
                      </label>
                    </Box>
                  ))}
                </FormControl>
              ) : fieldType === "Radio" ? (
                <FormControl sx={{ mt: 2, width: "100%" }} component="fieldset">
                  {options.map((option, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                      <input type="radio" id={`radio-${index}`} name="radio-preview" checked={false} disabled />
                      <label htmlFor={`radio-${index}`} style={{ marginLeft: 8 }}>
                        {option.value}
                      </label>
                    </Box>
                  ))}
                </FormControl>
              ) : null}
            </Paper>
          </Grid>
        </Grid>

        <Divider />
        <Box
          sx={{
            px: 4,
            py: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button className="Global-Button3" onClick={() => onBack()}>
            Cancel
          </Button>
          <Button 
            className="Global-Button2" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : mode === 'edit' ? "Update" : "Create"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomFieldAdd;