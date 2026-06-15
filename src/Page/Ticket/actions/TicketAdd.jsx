import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { baseUrl } from "../../Api";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const commonInputStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: 1,
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
};

const disabledInputStyle = {
  ...commonInputStyle,
  "& .MuiInputBase-input": { color: "rgba(0, 0, 0, 0.87)" },
  "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "rgba(0, 0, 0, 0.87)" },
};

const TicketAdd = (props) => {
  const [employeeData, setEmployeeData] = useState({
    name: "",
    uuid: "",
    id: null,
    issueDate: dateTimeHelper.formatDate(new Date())
  });

  const [assignedProducts, setAssignedProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [subjectLine, setSubjectLine] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // New state for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [type, setType] = useState(""); // Incident or Service Request

  const token = localStorage.getItem("token");

  useEffect(() => {
    const userData = localStorage.getItem("profile");
    if (userData) {
      const parseData = JSON.parse(userData);
      setEmployeeData({
        ...parseData?.data,
        issueDate: dateTimeHelper.formatDate(new Date()),
      });
    }
  }, []);

  // Fetch categories based on type
  useEffect(() => {
    const fetchCategories = async () => {
      if (!type) {
        setCategories([]);
        return;
      }

      try {
        setLoadingCategories(true);
        const response = await fetch(`${baseUrl}/tickets/master/category?type=${type}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.status) {
          setCategories(data.data.data || []);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [type, token]);

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const response = await fetch(
          `${baseUrl}/tickets/master/subcategories?categoryId=${selectedCategory}&type=${type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.status) {
          setSubcategories(data.data || []);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
        setSnack({ open: true, message: "Failed to fetch subcategories", severity: "error" });
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, type, token]);

  useEffect(() => {
    const fetchAssignedProducts = async () => {
      if (!employeeData?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/asset-mng/asset-unassign/${employeeData?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const assetList = Array.isArray(data.data?.data) ? data.data.data : [];
        setAssignedProducts(assetList);
        setError(null);
      } catch (err) {
        setError("Failed to fetch assigned products");
        setAssignedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProducts();
  }, [employeeData?.id, token]);

  const handleProductSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setSnack({ open: true, message: "File exceeds 10MB limit", severity: "error" });
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    setSelectedProducts([]);
    setFile(null);
    setPreviewUrl(null);
    setSubjectLine("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateTicket = async () => {


    if (!subjectLine.trim()) {
      setSnack({ open: true, message: "Subject line is required", severity: "error" });
      return;
    }
      if (!type.trim()) {
      setSnack({ open: true, message: "Type is required", severity: "error" });
      return;
    }
      if (!selectedCategory) {
      setSnack({ open: true, message: "Category is required", severity: "error" });
      return;
    }
      if (!selectedSubcategory) {
      setSnack({ open: true, message: "Subcategory is required", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("subjectLine", subjectLine);

      if (type) {
        formData.append("type", type);
      }
      
      if (selectedCategory) {
        formData.append("categoryId", selectedCategory);
      }

      if (selectedSubcategory) {
        formData.append("subcategoryId", selectedSubcategory);
      }

      selectedProducts.forEach((id) => formData.append("assetIds[]", id));
      if (file) formData.append("attachment", file);

      const response = await axios.post(`${baseUrl}/tickets/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setSnack({ open: true, message: "Ticket created successfully!", severity: "success" });
        handleReset();
        props.onSuccess?.();
        props.onBack?.();
      } else {
        throw new Error(response.data.message || "Failed to create ticket");
      }
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>

      <Box border="1px solid #ddd" borderRadius={2} p={2} sx={{ backgroundColor: "#fff" }}>
        <Box display="flex" alignItems="center" mb={1}>
          <ArrowBackIcon sx={{ mr: 1, cursor: "pointer" }} onClick={props.onBack} />
          <Typography variant="subtitle2" fontSize="1.1rem">Support Ticket</Typography>
        </Box>

        <Box display="flex" gap={2} mb={1} p={1}>
          <Box flex={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>Employee Name <span style={{ color: "red" }}>*</span></Typography>
            <TextField fullWidth size="small" value={employeeData?.name || ""} disabled sx={disabledInputStyle} />
          </Box>
          <Box flex={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>Employee Code <span style={{ color: "red" }}>*</span></Typography>
            <TextField fullWidth size="small" value={employeeData?.uuid || ""} disabled sx={disabledInputStyle} />
          </Box>
        </Box>

        <Box p={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>Issue Date <span style={{ color: "red" }}>*</span></Typography>
          <TextField fullWidth size="small" value={employeeData?.issueDate} disabled sx={disabledInputStyle} />
        </Box>

        {/* Type Selection */}
        <Box p={1} mb={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Type <span style={{ color:"red" }}>*</span>
          </Typography>
          <FormControl fullWidth size="small" sx={commonInputStyle}>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSelectedCategory("");
                setSelectedSubcategory("");
              }}
              displayEmpty
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              <MenuItem value="Incident">Incident</MenuItem>
              <MenuItem value="Service Request">Service Request</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Category Selection (only shown when type is selected) */}
        {type && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Category  <span style={{ color:"red" }}>*</span>
            </Typography>
            {loadingCategories ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("");
                  }}
                  displayEmpty
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  <MenuItem value="" disabled>
                    Select Category
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Subcategory Selection (only shown when category is selected) */}
        {selectedCategory && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Subcategory   <span style={{ color:"red" }}>*</span>
            </Typography>
            {loadingSubcategories ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <Select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  displayEmpty
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  <MenuItem value="" disabled>
                    Select Subcategory
                  </MenuItem>
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        <Box p={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>Description <span style={{ color: "red" }}>*</span></Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Brief summary of the issue..."
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
            sx={commonInputStyle}
          />
        </Box>

        <Box p={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>Assign Product</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
          ) : error ? (
            <Typography color="error" variant="body2">{error}</Typography>
          ) : assignedProducts.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              {assignedProducts.map((product) => {
                const detail = product.inventoryProductDetail;
                const info = detail?.grInventoryProduct?.product;
                const subcategory = info?.subcategory?.name || "N/A";

                return (
                  <Box
                    key={product.id}
                    sx={{
                      border: "1px solid #eee",
                      borderRadius: 1,
                      p: 1.5,
                      flex: "0 0 calc(33.333% - 12px)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        size="small"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                      />
                      <Box flexGrow={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {info?.name || "Unnamed Product"}
                        </Typography>
                        <Box display="flex" mt={0.5}>
                          <Chip
                            label={`Subcategory: ${subcategory}`}
                            size="small"
                            sx={{ fontSize: "0.7rem", backgroundColor: "#e0f7fa" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2">No assigned products found</Typography>
          )}
        </Box>

        <Box mb={2} p={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>Attachment</Typography>
          {file ? (
            <Box sx={{ border: "1px solid #ddd", borderRadius: 1, p: 1.5, position: "relative", display: "inline-block" }}>
              <IconButton size="small" onClick={handleRemoveFile} sx={{ position: "absolute", top: 4, right: 4 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              {previewUrl ? (
                <Box>
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px" }} />
                  <Typography variant="caption" mt={0.5}>{file.name}</Typography>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <InsertDriveFileIcon color="primary" />
                  <Typography variant="body2">{file.name}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Button variant="outlined" size="small" component="label" className="Global-Button3" startIcon={<ImageIcon />}>
              Browse files
              <input type="file" hidden onChange={handleFileChange} ref={fileInputRef} accept="image/*,application/pdf" />
            </Button>
          )}
          <Typography variant="caption" display="block" mt={1}>
            File must be 10MB or smaller. <br />
            Please do not include any personal or sensitive information.
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={props.onBack} className="Global-Button3">
            Back
          </Button>
          <Button className="Global-Button2" disabled={submitting} onClick={handleCreateTicket}>
            {submitting ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TicketAdd;

