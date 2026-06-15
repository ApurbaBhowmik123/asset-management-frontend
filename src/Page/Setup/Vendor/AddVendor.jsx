import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import { Country, State, City } from "country-state-city";
import { CustomTextField } from "../../../utils/CustomTextField";
// import { TextField } from "@mui/material";

const CustomSelect = ({ value, onChange, options, placeholder, name, ...props }) => (
  <FormControl fullWidth>
    <Select
      value={value || ""}
      onChange={onChange}
      displayEmpty
      name={name}
      sx={{
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        height: "33px",
        "& .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #444", // 👈 dark grey-black border
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #222", // 👈 darker on hover
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #000", // 👈 pure black when focused
        },
        "& .MuiSelect-select": {
          padding: "6px 14px",
          height: "21px",
          display: "flex",
          alignItems: "center",
        },
      }}
      {...props}
    >
      <MenuItem value="" disabled>
        <em>{placeholder}</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);


const vendorTypes = ["Manufacturer", "Supplier", "Distributor", "Other"];

const VALIDATION_RULES = {
  mobile: /^[6-9]\d{9}$/,
  gstNumber: /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})$/,
  panNumber: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
  postalCode: /^\d{6}$/,
  bankAccountNumber: /^\d{9,18}$/,
  bankIfscCode: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

const AddVendor = ({ onBack, vendorId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gstNumber: "",
    vendorType: "",
    mobile: "",
    addressLine1: "",
    contactPerson: "",
    contactNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    panNumber: "",
    postalCode: "",
    identificationNumber: "",
  });

  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: ""
  });

  // Location options
  const [locationOptions, setLocationOptions] = useState({
    countries: [],
    states: [],
    cities: []
  });
  
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem('token');

  // Initialize location options
  useEffect(() => {
    const countries = Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name,
      ...country
    }));
    
    setLocationOptions(prev => ({
      ...prev,
      countries: countries
    }));
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (location.country) {
      const states = State.getStatesOfCountry(location.country).map(state => ({
        value: state.isoCode,
        label: state.name,
        ...state
      }));
      
      setLocationOptions(prev => ({
        ...prev,
        states: states,
        cities: [] // Reset cities when country changes
      }));
      
      // Reset state and city if country changed
      if (location.state && !states.find(s => s.value === location.state)) {
        setLocation(prev => ({
          ...prev,
          state: "",
          city: ""
        }));
      }
    } else {
      setLocationOptions(prev => ({
        ...prev,
        states: [],
        cities: []
      }));
    }
  }, [location.country]);

  // Load cities when state changes
  useEffect(() => {
    if (location.country && location.state) {
      const cities = City.getCitiesOfState(location.country, location.state).map(city => ({
        value: city.name,
        label: city.name,
        ...city
      }));
      
      setLocationOptions(prev => ({
        ...prev,
        cities: cities
      }));
      
      // Reset city if state changed
      if (location.city && !cities.find(c => c.value === location.city)) {
        setLocation(prev => ({
          ...prev,
          city: ""
        }));
      }
    } else {
      setLocationOptions(prev => ({
        ...prev,
        cities: []
      }));
    }
  }, [location.country, location.state]);

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/super-admin/vendors/find/${vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        const vendor = response.data.data;
        
        // Set form data
        setFormData({
          name: vendor.name || "",
          email: vendor.email || "",
          gstNumber: vendor.gstNumber || "",
          vendorType: vendor.vendorType || "",
          mobile: vendor.mobile || "",
          addressLine1: vendor.address?.addressLine1 || "",
          contactPerson: vendor.contactPerson || "",
          contactNumber: vendor.contactNumber || "",
          bankName: vendor.bankName || "",
          bankAccountNumber: vendor.bankAccountNumber || "",
          bankIfscCode: vendor.bankIfscCode || "",
          panNumber: vendor.panNumber || "",
          postalCode: vendor.address?.postalCode || "",
          identificationNumber: vendor.identificationNumber || "",
        });
        
        // Set location data - find the correct codes
        const countryName = vendor.address?.country;
        const stateName = vendor.address?.state;
        const cityName = vendor.address?.city;

        if (countryName) {
          // Find country by name and get its isoCode
          const countries = Country.getAllCountries();
          const foundCountry = countries.find(
            country => country.name.toLowerCase() === countryName.toLowerCase()
          );
          
          if (foundCountry) {
            setLocation(prev => ({
              ...prev,
              country: foundCountry.isoCode
            }));

            // Find state if exists
            if (stateName) {
              const states = State.getStatesOfCountry(foundCountry.isoCode);
              const foundState = states.find(
                state => state.name.toLowerCase() === stateName.toLowerCase()
              );
              
              if (foundState) {
                setLocation(prev => ({
                  ...prev,
                  state: foundState.isoCode
                }));

                // Find city if exists
                if (cityName) {
                  setTimeout(() => {
                    setLocation(prev => ({
                      ...prev,
                      city: cityName
                    }));
                  }, 100);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch vendor details",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return !value.trim() ? "Name is required" : "";
      case "email":
        if (value && !VALIDATION_RULES.email.test(value)) 
          return "Invalid email";
        return "";
      case "mobile":
        if (value && !VALIDATION_RULES.mobile.test(value))
          return "Invalid mobile number (must be 10 digits starting with 6-9)";
        return "";
      case "contactNumber":
        if (value && !VALIDATION_RULES.mobile.test(value))
          return "Invalid contact number (must be 10 digits starting with 6-9)";
        return "";
      case "gstNumber":
        if (value && !VALIDATION_RULES.gstNumber.test(value))
          return "Invalid GST number";
        return "";
      case "panNumber":
        if (value && !VALIDATION_RULES.panNumber.test(value))
          return "Invalid PAN number";
        return "";
      case "postalCode":
        if (value && !VALIDATION_RULES.postalCode.test(value))
          return "Invalid postal code (must be 6 digits)";
        return "";
      case "bankAccountNumber":
        if (value && !VALIDATION_RULES.bankAccountNumber.test(value))
          return "Invalid account number (9-18 digits)";
        return "";
      case "bankIfscCode":
        if (value && !VALIDATION_RULES.bankIfscCode.test(value))
          return "Invalid IFSC code";
        return "";
      case "vendorType":
        return !value ? "Vendor Type is required" : "";
      case "addressLine1":
        return !value ? "Address is required" : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (apiErrors.name && name === "name") {
      setApiErrors({});
    }
    
    if (errors[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    
    setLocation(prev => {
      const newLocation = { ...prev, [name]: value };
      
      // Reset dependent fields
      if (name === "country") {
        newLocation.state = "";
        newLocation.city = "";
      } else if (name === "state") {
        newLocation.city = "";
      }
      
      return newLocation;
    });
  };
    
  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiErrors({});
    
    if (!validateForm()) return;

    // Get location names for submission
    const countryName = locationOptions.countries.find(c => c.value === location.country)?.label || "";
    const stateName = locationOptions.states.find(s => s.value === location.state)?.label || "";
    const cityName = location.city || "";

    const payload = {
      ...formData,
      addressLine1: formData.addressLine1,
      city: cityName,
      state: stateName,
      country: countryName,
      postalCode: formData.postalCode,
    };

    try {
      setIsLoading(true);
      let response;

      if (vendorId) {
        response = await axios.put(
          `${baseUrl}/super-admin/vendors/update/${vendorId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${baseUrl}/super-admin/vendors/create`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.status || response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: "success",
        });

        setTimeout(() => {
          onBack(true);
        }, 1000);
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
      const errorResponse = error?.response?.data?.errorResponse;
      const message = errorResponse?.message || "An unknown error occurred";
      const status = error?.response?.status;

      if (status === 409) {
        setApiErrors({ name: message });
      }

      setSnackbar({
        open: true,
        message,
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

  // if (isLoading && vendorId && !formData.name) {
  //   return (
  //     <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
  //       <Typography>Loading vendor details...</Typography>
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Typography
        fontSize={16}
        fontWeight={600}
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mb: 1 }}
        onClick={() => onBack()}
      >
        <ArrowLeft />
      </Typography>

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Vendor Name <span className="reuired_field">*</span></Typography>
              <CustomTextField
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name || !!apiErrors.name}
                helperText={errors.name || apiErrors.name}
              />
            </div>
             <div style={columnStyle}>
              <Typography mb={1}>Identification Number </Typography>
              <CustomTextField
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                placeholder="E.g. Vendor-001"
              />
            </div>
           
          </div>

          <div style={rowStyle}>
             <div style={columnStyle}>
              <Typography mb={1}>Email</Typography>
              <CustomTextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>GST Number</Typography>
              <CustomTextField
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
              />
            </div>
           
          </div>

          <div style={rowStyle}>
             <div style={columnStyle}>
              <Typography mb={1}>Vendor Type <span className="reuired_field">*</span></Typography>
              <CustomTextField
                select
                name="vendorType"
                value={formData.vendorType}
                onChange={handleChange}
                error={!!errors.vendorType}
                helperText={errors.vendorType}
              >
                {vendorTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </CustomTextField>
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Mobile</Typography>
              <CustomTextField
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                error={!!errors.mobile}
                helperText={errors.mobile}
              />
            </div>
            
          </div>

          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Contact Person</Typography>
              <CustomTextField
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Contact Number</Typography>
              <CustomTextField
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                error={!!errors.contactNumber}
                helperText={errors.contactNumber}
              />
            </div>
           
          </div>

          <div style={rowStyle}>
             <div style={columnStyle}>
              <Typography mb={1}>PAN Number</Typography>
              <CustomTextField
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                error={!!errors.panNumber}
                helperText={errors.panNumber}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Bank Name</Typography>
              <CustomTextField
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>
           
          </div>

          <div style={rowStyle}>
             <div style={columnStyle}>
              <Typography mb={1}>Bank Account Number</Typography>
              <CustomTextField
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                error={!!errors.bankAccountNumber}
                helperText={errors.bankAccountNumber}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>IFSC Code</Typography>
              <CustomTextField
                name="bankIfscCode"
                value={formData.bankIfscCode}
                onChange={handleChange}
                error={!!errors.bankIfscCode}
                helperText={errors.bankIfscCode}
              />
            </div>
          </div>

          <Box mt={2}>
            <Typography variant="subtitle1" mb={1}>Location</Typography>
            <div style={rowStyle}>
              <div style={columnStyle}>
                <Typography mb={1}>Country</Typography>
                <CustomSelect
                  name="country"
                  value={location.country}
                  onChange={handleLocationChange}
                  options={locationOptions.countries}
                  placeholder="Select Country"
                />
              </div>
              <div style={columnStyle}>
                <Typography mb={1}>State</Typography>
                <CustomSelect
                  name="state"
                  value={location.state}
                  onChange={handleLocationChange}
                  options={locationOptions.states}
                  placeholder="Select State"
                  disabled={!location.country}
                />
              </div>
            </div>
            <div style={rowStyle}>
              <div style={columnStyle}>
                <Typography mb={1}>City</Typography>
                <CustomSelect
                  name="city"
                  value={location.city}
                  onChange={handleLocationChange}
                  options={locationOptions.cities}
                  placeholder="Select City"
                  disabled={!location.state}
                />
              </div>
              <div style={columnStyle}>
                <Typography mb={1}>Postal Code</Typography>
                <CustomTextField
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode}
                />
              </div>
            </div>
          </Box>

          <Box mt={1}>
            <Typography mb={1}>Address <span className="reuired_field">*</span></Typography>
            <CustomTextField
              multiline
              rows={2}
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              error={!!errors.addressLine1}
              helperText={errors.addressLine1}
            />
          </Box>

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
              {isLoading ? "Processing..." : "Save All"}
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

export default AddVendor;