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
  ListItemText,
  InputLabel,
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

const TicketAddAdmin = (props) => {
  const [adminData, setAdminData] = useState({
    name: "",
    uuid: "",
    id: null,
    issueDate: dateTimeHelper.formatDate(new Date()),
    role: "",
    unitId: null
  });

  const [selectionType, setSelectionType] = useState(""); 
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [subjectLine, setSubjectLine] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [supportEngineers, setSupportEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [priority, setPriority] = useState("");
  const [loadingEngineers, setLoadingEngineers] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [ticketType, setTicketType] = useState(""); // Incident or Service Request

  const token = localStorage.getItem("token");

  useEffect(() => {
    const userData = localStorage.getItem("profile");
    if (userData) {
      const parseData = JSON.parse(userData);
      const user = parseData?.data;
      
      setAdminData({
        ...user,
        issueDate: dateTimeHelper.formatDate(new Date()),
        role: user?.role || "",
        unitId: user?.unitId || null
      });
    }
  }, []);

  // Fetch categories based on ticket type
  useEffect(() => {
    const fetchCategories = async () => {
      if (!ticketType) {
        setCategories([]);
        return;
      }

      try {
        setLoadingCategories(true);
        const response = await fetch(`${baseUrl}/tickets/master/category?type=${ticketType}`, {
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
  }, [ticketType, token]);

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory || !ticketType) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const response = await fetch(
          `${baseUrl}/tickets/master/subcategories?categoryId=${selectedCategory}&type=${ticketType}`,
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
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, ticketType, token]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (selectionType !== "person") return;

      try {
        setLoadingEmployees(true);
        const response = await fetch(`${baseUrl}/super-admin/acl/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const employeeList = data?.data?.data || [];
        setEmployees(employeeList);
      } catch (err) {
        setSnack({ open: true, message: "Failed to fetch employees", severity: "error" });
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [selectionType, token]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (selectionType !== "place") return;

      try {
        setLoadingLocations(true);
        let endpoint = `${baseUrl}/super-admin/locations`;
        
        if (adminData.unitId && (adminData.role === "Unit Admin" || adminData.role === "Support Admin")) {
          endpoint = `${baseUrl}/super-admin/locations/by-unit/${adminData.unitId}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        let locationList = [];

        if (Array.isArray(data.data)) {
          locationList = data.data;
        } else if (data.data && Array.isArray(data.data.data)) {
          locationList = data.data.data;
        } else if (Array.isArray(data)) {
          locationList = data;
        }

        if (adminData.unitId && (adminData.role === "Unit Admin" || adminData.role === "Support Admin")) {
          locationList = locationList.map(item => ({
            id: item.location?.id || item.id,
            uuid: item.location?.uuid,
            name: item.location?.name || item.name
          }));
        }

        setLocations(locationList);
      } catch (err) {
        setSnack({ open: true, message: "Failed to fetch locations", severity: "error" });
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    if (selectionType === "place") {
      fetchLocations();
    }
  }, [selectionType, token, adminData.role, adminData.unitId]);

  useEffect(() => {
    const fetchAssignedProducts = async () => {
      if (!selectedEmployee || selectionType !== "person") return;

      try {
        setLoadingProducts(true);
        const response = await fetch(`${baseUrl}/asset-mng/asset-unassign/${selectedEmployee}`, {
          headers: {
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
        setLoadingProducts(false);
      }
    };

    fetchAssignedProducts();
  }, [selectedEmployee, selectionType, token]);

  useEffect(() => {
    const fetchLocationProducts = async () => {
      if (!selectedLocation || selectionType !== "place") return;

      try {
        setLoadingProducts(true);
        const response = await fetch(`${baseUrl}/asset-mng/asset-unassign/location/${selectedLocation}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const assetList = Array.isArray(data.data?.data) ? data.data.data : [];
        setAssignedProducts(assetList);
        setError(null);
      } catch (err) {
        setError("Failed to fetch location products");
        setAssignedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchLocationProducts();
  }, [selectedLocation, selectionType, token]);

  useEffect(() => {
    const fetchSupportEngineers = async () => {
      try {
        setLoadingEngineers(true);

        const endpoint = adminData?.unitId
          ? `${baseUrl}/tickets/support-lists/${adminData.unitId}`
          : `${baseUrl}/tickets/support-lists/all`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.status) {
          setSupportEngineers(data.data || []);
        } else {
          setSupportEngineers([]);
        }
      } catch (err) {
        console.error("Failed to fetch support engineers:", err);
        setSupportEngineers([]);
      } finally {
        setLoadingEngineers(false);
      }
    };

    fetchSupportEngineers();
  }, [adminData, token]);

  const handleSelectionTypeChange = (event) => {
    const newType = event.target.value;
    setSelectionType(newType);
    setSelectedEmployee("");
    setSelectedLocation("");
    setSelectedEmployeeData(null);
    setAssignedProducts([]);
    setSelectedProducts([]);
    setSelectedEngineer("");
    setError(null);
  };

  const handleEmployeeChange = (event) => {
    const employeeId = event.target.value;
    setSelectedEmployee(employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployeeData(employee);
    setSelectedProducts([]);
  };

  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    setSelectedLocation(locationId);
    setSelectedProducts([]);
  };

  const handleProductSelect = (event) => {
    setSelectedProducts(event.target.value);
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

  const handleCreateTicket = async () => {
    if (!ticketType) {
      setSnack({ open: true, message: "Please select a ticket type", severity: "error" });
      return;
    }

    if (!subjectLine.trim()) {
      setSnack({ open: true, message: "Subject line is required", severity: "error" });
      return;
    }

    if (!selectionType) {
      setSnack({ open: true, message: "Please select person or place", severity: "error" });
      return;
    }

    if (selectionType === "person" && !selectedEmployee) {
      setSnack({ open: true, message: "Please select an employee", severity: "error" });
      return;
    }

    if (selectionType === "place" && !selectedLocation) {
      setSnack({ open: true, message: "Please select a location", severity: "error" });
      return;
    }

    if (!selectedEngineer) {
      setSnack({ open: true, message: "Please select a support engineer", severity: "error" });
      return;
    }

    if (!priority) {
      setSnack({ open: true, message: "Please select a priority", severity: "error" });
      return;
    }

    if (!selectedCategory) {
      setSnack({ open: true, message: "Please select a category", severity: "error" });
      return;
    }

    if (!selectedSubcategory) {
      setSnack({ open: true, message: "Please select a subcategory", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", ticketType);
      formData.append("subjectLine", subjectLine);
      formData.append("selectionType", selectionType);
      formData.append("supportEngineerId", selectedEngineer);
      formData.append("priority", priority);
      formData.append("categoryId", selectedCategory);
      formData.append("subcategoryId", selectedSubcategory);
      
      if (selectionType === "person" && selectedEmployee) {
        formData.append("employeeId", selectedEmployee);
      }
      
      if (selectionType === "place" && selectedLocation) {
        formData.append("locationId", selectedLocation);
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

  const handleReset = () => {
    setSelectionType("");
    setSelectedEmployee("");
    setSelectedLocation("");
    setSelectedEmployeeData(null);
    setAssignedProducts([]);
    setSelectedProducts([]);
    setFile(null);
    setPreviewUrl(null);
    setSubjectLine("");
    setError(null);
    setSelectedEngineer("");
    setPriority("");
    setSupportEngineers([]);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setTicketType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getProductDisplayName = (product) => {
    const detail = product.inventoryProductDetail;
    const info = detail?.grInventoryProduct?.product;
    return info?.name || "Unnamed Product";
  };

  const getProductSubcategory = (product) => {
    const detail = product.inventoryProductDetail;
    const info = detail?.grInventoryProduct?.product;
    return info?.subcategory?.name || "N/A";
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
          <Typography variant="subtitle2" fontSize="1.1rem">Support Ticket </Typography>
        </Box>
    <Box p={1} mb={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Select Type <span style={{ color: "red" }}>*</span>
          </Typography>
          <FormControl fullWidth size="small" sx={commonInputStyle}>
            <Select
              value={selectionType}
              onChange={handleSelectionTypeChange}
              displayEmpty
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            >
              <MenuItem value="" disabled>
                Choose Person or Place
              </MenuItem>
              <MenuItem value="person">Person</MenuItem>
              <MenuItem value="place">Place</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Ticket Type Selection */}
        <Box p={1} mb={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Ticket Type <span style={{ color: "red" }}>*</span>
          </Typography>
          <FormControl fullWidth size="small" sx={commonInputStyle}>
            <Select
              value={ticketType}
              onChange={(e) => {
                setTicketType(e.target.value);
                setSelectedCategory("");
                setSelectedSubcategory("");
              }}
              displayEmpty
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            >
              <MenuItem value="" disabled>
                Select Ticket Type
              </MenuItem>
              <MenuItem value="Incident">Incident</MenuItem>
              <MenuItem value="Service Request">Service Request</MenuItem>
            </Select>
          </FormControl>
        </Box>

    
        {ticketType && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Category <span style={{ color: "red" }}>*</span>
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
                    setSelectedSubcategory(""); // Reset subcategory when category changes
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
  
        {selectedCategory && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Subcategory <span style={{ color: "red" }}>*</span>
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
        {selectionType === "person" && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Select Employee <span style={{ color: "red" }}>*</span>
            </Typography>
            {loadingEmployees ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <Select
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                  displayEmpty
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  <MenuItem value="" disabled>
                    Choose an employee
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.uuid})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {selectionType === "place" && (
          <Box p={1} mb={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Select Location <span style={{ color: "red" }}>*</span>
            </Typography>
            {loadingLocations ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <Select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  displayEmpty
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  <MenuItem value="" disabled>
                    Choose a location
                  </MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name} ({location.uuid})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Support Engineer Dropdown */}
        <Box p={1} mb={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Support Engineer <span style={{ color: "red" }}>*</span>
          </Typography>
          {loadingEngineers ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth size="small" sx={commonInputStyle}>
              <Select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                displayEmpty
                sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
              >
                <MenuItem value="" disabled>
                  Select Support Engineer
                </MenuItem>
                {supportEngineers.map((engineer) => (
                  <MenuItem key={engineer.id} value={engineer.id}>
                    {engineer?.name} ({engineer?.unit?.name|| "N/A"})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box p={1} mb={1}>
          <Typography variant="body2" fontWeight={500} mb={0.5}>
            Priority <span style={{ color: "red" }}>*</span>
          </Typography>
          <FormControl fullWidth size="small" sx={commonInputStyle}>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              displayEmpty
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            >
              <MenuItem value="" disabled>
                Select Priority
              </MenuItem>
              <MenuItem value="High">
                <Chip label="High" size="small" sx={{ backgroundColor: "#ffebee", color: "#c62828" }} />
              </MenuItem>
              <MenuItem value="Medium">
                <Chip label="Medium" size="small" sx={{ backgroundColor: "#fff8e1", color: "#f57f17" }} />
              </MenuItem>
              <MenuItem value="Low">
                <Chip label="Low" size="small" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} />
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

   

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

        {((selectionType === "person" && selectedEmployee) || (selectionType === "place" && selectedLocation)) && (
          <Box p={1}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              {selectionType === "person" ? "Assigned Products" : "Location Products"}
            </Typography>
            {loadingProducts ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Typography color="error" variant="body2">{error}</Typography>
            ) : assignedProducts.length > 0 ? (
              <FormControl fullWidth size="small" sx={commonInputStyle}>
                <InputLabel id="products-label">Select Products</InputLabel>
                <Select
                  labelId="products-label"
                  multiple
                  value={selectedProducts}
                  onChange={handleProductSelect}
                  renderValue={(selected) => `${selected.length} product(s) selected`}
                  sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
                >
                  {assignedProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Checkbox checked={selectedProducts.indexOf(product.id) > -1} />
                      <ListItemText 
                        primary={getProductDisplayName(product)} 
                        secondary={`Subcategory: ${getProductSubcategory(product)}`} 
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2">
                No {selectionType === "person" ? "assigned products" : "location products"} found
              </Typography>
            )}
          </Box>
        )}

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
          <Button onClick={handleReset} className="Global-Button3">
            Reset
          </Button>
          <Button className="Global-Button2" disabled={submitting} onClick={handleCreateTicket}>
            {submitting ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TicketAddAdmin;