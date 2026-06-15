import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { StyledSelect } from "./AdvancedFilters.styles";
import { CustomTextField } from "../../../utils/CustomTextField";

const AdvancedFilters = ({
  advancedFilters,
  handleAdvancedFilterChange,
  handleClearAllFilters,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleApplyDateFilter,
  handleClearDateFilter,
  statusFilter,
  setStatusFilter,
  usedStatusFilter,
  setUsedStatusFilter,
  installationStatusFilter,
  setInstallationStatusFilter,
  statusOptions,
  usedStatusOptions,
  installationStatusOptions,
  assetTypeOptions,
  departmentOptions,
  unitOptions,
  locationOptions,
  makeOptions,
  modelOptions,
  specFieldOptions,
  softwareOptions,
  productStatusHelper,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Advanced Filters</Typography>
        <Button
          className="Global-Button12"
          onClick={handleClearAllFilters}
          size="small"
        >
          Clear All Filters
        </Button>
      </Box>
      
      {/* Date Range Filters */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
          Date Range
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Start Date</InputLabel>
            <CustomTextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>End Date</InputLabel>
            <CustomTextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3} sx={{ mt: 2.5 }}>
            <Button
              variant="contained"
              onClick={handleApplyDateFilter}
              className="Global-Button2"
              sx={{ mr: 1 }}
              fullWidth
            >
              Apply Date Filter
            </Button>
          </Grid>
          <Grid item xs={12} sm={3} sx={{ mt: 2.5 }}>
            <Button
              variant="outlined"
              onClick={handleClearDateFilter}
              className="Global-Button3"
              fullWidth
            >
              Clear Dates
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Status Filters */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
          Status Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Status</InputLabel>
             <FormControl fullWidth variant="outlined" size="small">
                      <StyledSelect
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="all">All Statuses</MenuItem>
                        {Array.from(new Set(statusOptions.map(status =>
                          productStatusHelper.getLabel(status) || status
                        ))).map((displayLabel, index) => (
                          <MenuItem
                            key={index}
                            value={statusOptions.find(opt =>
                              productStatusHelper.getLabel(opt) === displayLabel || opt === displayLabel
                            )}
                          >
                            {displayLabel}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Used Status</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={usedStatusFilter}
                onChange={(e) => setUsedStatusFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Used Statuses</MenuItem>
                {usedStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Installation Status</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={installationStatusFilter}
                onChange={(e) => setInstallationStatusFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Installation Statuses</MenuItem>
                {installationStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === "true" ? "Installed" : "Not Installed"}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Asset Details Filters */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
          Asset Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Asset ID</InputLabel>
            <CustomTextField
              value={advancedFilters.uuid}
              onChange={(e) => handleAdvancedFilterChange("uuid", e.target.value)}
              placeholder="Enter Asset ID"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Asset Type</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.assetType}
                onChange={(e) => handleAdvancedFilterChange("assetType", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Asset Types</MenuItem>
                {assetTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Serial Number</InputLabel>
            <CustomTextField
              value={advancedFilters.serialNumber}
              onChange={(e) => handleAdvancedFilterChange("serialNumber", e.target.value)}
              placeholder="Enter Serial Number"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Description</InputLabel>
            <CustomTextField
              value={advancedFilters.description}
              onChange={(e) => handleAdvancedFilterChange("description", e.target.value)}
              placeholder="Enter Description"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Asset Tag</InputLabel>
            <CustomTextField
              value={advancedFilters.assetTag}
              onChange={(e) => handleAdvancedFilterChange("assetTag", e.target.value)}
              placeholder="Enter Asset Tag"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>SAP Code</InputLabel>
            <CustomTextField
              value={advancedFilters.sapCode}
              onChange={(e) => handleAdvancedFilterChange("sapCode", e.target.value)}
              placeholder="Enter SAP Code"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Used By Email</InputLabel>
            <CustomTextField
              value={advancedFilters.usedByEmail}
              onChange={(e) => handleAdvancedFilterChange("usedByEmail", e.target.value)}
              placeholder="Enter Email"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Department</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.department}
                onChange={(e) => handleAdvancedFilterChange("department", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Departments</MenuItem>
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Unit</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.unit}
                onChange={(e) => handleAdvancedFilterChange("unit", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Units</MenuItem>
                {unitOptions.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Location</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.location}
                onChange={(e) => handleAdvancedFilterChange("location", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Locations</MenuItem>
                {locationOptions.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Make</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.make}
                onChange={(e) => handleAdvancedFilterChange("make", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Makes</MenuItem>
                {makeOptions.map((make) => (
                  <MenuItem key={make} value={make}>
                    {make}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Model</InputLabel>
            <FormControl fullWidth variant="outlined" size="small">
              <StyledSelect
                value={advancedFilters.model}
                onChange={(e) => handleAdvancedFilterChange("model", e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Models</MenuItem>
                {modelOptions.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Document Filters */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
          Document Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>GR No</InputLabel>
            <CustomTextField
              value={advancedFilters.grNo}
              onChange={(e) => handleAdvancedFilterChange("grNo", e.target.value)}
              placeholder="Enter GR No"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>PO No</InputLabel>
            <CustomTextField
              value={advancedFilters.poNo}
              onChange={(e) => handleAdvancedFilterChange("poNo", e.target.value)}
              placeholder="Enter PO No"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Invoice No</InputLabel>
            <CustomTextField
              value={advancedFilters.invoiceNo}
              onChange={(e) => handleAdvancedFilterChange("invoiceNo", e.target.value)}
              placeholder="Enter Invoice No"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      {/* Financial Filters */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
          Financial Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>PO Value</InputLabel>
            <CustomTextField
              value={advancedFilters.poValue}
              onChange={(e) => handleAdvancedFilterChange("poValue", e.target.value)}
              placeholder="Enter PO Value"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Total Cost</InputLabel>
            <CustomTextField
              value={advancedFilters.totalCost}
              onChange={(e) => handleAdvancedFilterChange("totalCost", e.target.value)}
              placeholder="Enter Total Cost"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Rate Per Piece</InputLabel>
            <CustomTextField
              value={advancedFilters.ratePerPiece}
              onChange={(e) => handleAdvancedFilterChange("ratePerPiece", e.target.value)}
              placeholder="Enter Rate Per Piece"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Quantity</InputLabel>
            <CustomTextField
              value={advancedFilters.quantity}
              onChange={(e) => handleAdvancedFilterChange("quantity", e.target.value)}
              placeholder="Enter Quantity"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>Free Quantity</InputLabel>
            <CustomTextField
              value={advancedFilters.freeQty}
              onChange={(e) => handleAdvancedFilterChange("freeQty", e.target.value)}
              placeholder="Enter Free Quantity"
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      {/* Dynamic Spec Fields Filters */}
      {Object.keys(specFieldOptions).length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
            Specification Fields
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(specFieldOptions).map(([fieldName, options]) => (
              <Grid item xs={12} sm={3} key={fieldName}>
                <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>{fieldName}</InputLabel>
                <FormControl fullWidth variant="outlined" size="small">
                  <StyledSelect
                    value={advancedFilters[fieldName] || ""}
                    onChange={(e) => handleAdvancedFilterChange(fieldName, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All {fieldName}</MenuItem>
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dynamic Software Fields Filters */}
      {Object.keys(softwareOptions).length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
            Software Fields
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(softwareOptions).map(([softwareName, options]) => (
              <Grid item xs={12} sm={3} key={softwareName}>
                <InputLabel sx={{ mb: 1, color: 'black', fontWeight: 'bold' }}>{softwareName}</InputLabel>
                <FormControl fullWidth variant="outlined" size="small">
                  <StyledSelect
                    value={advancedFilters[softwareName] || ""}
                    onChange={(e) => handleAdvancedFilterChange(softwareName, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All {softwareName}</MenuItem>
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdvancedFilters;