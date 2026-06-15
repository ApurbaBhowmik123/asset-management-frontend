// AddUnit.jsx

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";
import { styled } from "@mui/system";
import { Country, State, City } from "country-state-city";

const AddUnit = ({ onBack, unitId }) => {
  const [formData, setFormData] = useState({
    name: "",
    identificationNumber: "",
    abbriviatedName: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    nearbyLandmark: "",
    locationId: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [locations, setLocations] = useState([]);

  const token = localStorage.getItem("token");

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
            border: "1px solid #444", // default border (dark gray)
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #222", // darker gray on hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #000", // pure black on focus
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


  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });

  const [locationOptions, setLocationOptions] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  useEffect(() => {
    const countries = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setLocationOptions((prev) => ({
      ...prev,
      countries,
    }));
  }, []);

  useEffect(() => {
    if (location.country) {
      const states = State.getStatesOfCountry(location.country).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));
      setLocationOptions((prev) => ({
        ...prev,
        states,
        cities: [],
      }));
    } else {
      setLocationOptions((prev) => ({
        ...prev,
        states: [],
        cities: [],
      }));
    }
  }, [location.country]);

  useEffect(() => {
    if (location.country && location.state) {
      const cities = City.getCitiesOfState(location.country, location.state).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setLocationOptions((prev) => ({
        ...prev,
        cities,
      }));
    } else {
      setLocationOptions((prev) => ({
        ...prev,
        cities: [],
      }));
    }
  }, [location.country, location.state]);

  // Sync location to formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      country: location.country,
      state: location.state,
      city: location.city,
    }));
  }, [location]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    setLocation((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "country") {
        updated.state = "";
        updated.city = "";
      } else if (name === "state") {
        updated.city = "";
      }
      return updated;
    });

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  useEffect(() => {
    fetchLocations();
    if (unitId) fetchUnitDetails();
  }, [unitId]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/super-admin/locations/location-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  const fetchUnitDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/super-admin/units/find/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        const unit = response.data.data;
        setFormData({
          name: unit.name,
          identificationNumber: unit.identificationNumber,
          abbriviatedName: unit.abbriviatedName,
          description: unit.description,
          addressLine1: unit.address.addressLine1,
          addressLine2: unit.address.addressLine2,
          city: unit.address.city,
          state: unit.address.state,
          country: unit.address.country,
          postalCode: unit.address.postalCode,
          nearbyLandmark: unit.address.landmark,
          locationId: unit.locationId || "",
        });

        // Pre-fill dropdowns
        setLocation({
          country: unit.address.country,
          state: unit.address.state,
          city: unit.address.city,
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to fetch unit details",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGoBack = () => {
    onBack();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      identificationNumber: formData.identificationNumber,
      abbriviatedName: formData.abbriviatedName,
      description: formData.description,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      postalCode: formData.postalCode,
      nearbyLandmark: formData.nearbyLandmark,
      locationId: formData.locationId,
    };

    console.log('payloaddd', payload)

    try {
      setIsLoading(true);
      const url = unitId
        ? `${baseUrl}/super-admin/units/update/${unitId}`
        : `${baseUrl}/super-admin/units/create`;

      const method = unitId ? axios.put : axios.post;

      const response = await method(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status || response.data.success) {
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
        message: error.message || "Error saving unit",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
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
        <ArrowLeft style={{ cursor: "pointer" }} onClick={handleGoBack} size={20} />
        {/* {unitId ? "Edit Unit" : "Create Unit"} */}
      </Typography>
      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <form onSubmit={handleSubmit}>
          {/* Name and ID */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Name <span className="reuired_field">*</span></Typography>
              <CustomTextField
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter unit name"
                error={!!errors.name}
                helperText={errors.name}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Identification Number</Typography>
              <CustomTextField
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                placeholder="E.g. UNIT-001"
              />
            </div>
          </div>

          {/* Address Lines */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Abbriviated Name</Typography>
              <CustomTextField
                name="abbriviatedName"
                value={formData.abbriviatedName}
                onChange={handleChange}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Address Line 1 <span className="reuired_field">*</span></Typography>
              <CustomTextField
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
              />
            </div>

          </div>

          {/* Country / State / City */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Address Line 2</Typography>
              <CustomTextField
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>Country </Typography>
              <CustomSelect
                name="country"
                value={location.country}
                onChange={handleLocationChange}
                options={locationOptions.countries}
                placeholder="Select Country"
              />
            </div>
            <div style={columnStyle}>
              <Typography mb={1}>State </Typography>
              <CustomSelect
                name="state"
                value={location.state}
                onChange={handleLocationChange}
                options={locationOptions.states}
                placeholder="Select State"
                disabled={!location.country}
              />
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>City </Typography>
              <CustomSelect
                name="city"
                value={location.city}
                onChange={handleLocationChange}
                options={locationOptions.cities}
                placeholder="Select City"
                disabled={!location.state}
              />
            </div>
          </div>

          {/* Zip and Landmark */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Zip Code <span className="reuired_field">*</span></Typography>
              <CustomTextField
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                error={!!errors.postalCode}
                helperText={errors.postalCode}
              />
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>Nearby Landmark</Typography>
              <CustomTextField
                name="nearbyLandmark"
                value={formData.nearbyLandmark}
                onChange={handleChange}
              />
            </div>

            {/* <div style={columnStyle}>
              <Typography mb={1}>Location</Typography>
              <StyledTextField
                select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>Select a location</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            </div> */}

          </div>

          {/* Description */}
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Description</Typography>
              <CustomTextField
                multiline
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button className="Global-Button3" onClick={handleGoBack} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="Global-Button2" disabled={isLoading}>
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

export default AddUnit;
