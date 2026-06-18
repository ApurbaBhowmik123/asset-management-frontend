import {
  Box,
  InputLabel,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import { createMRTColumnHelper, MaterialReactTable } from "material-react-table";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";
import { CustomTextField } from "../../utils/CustomTextField";
import axios from "axios";

const columnHelper = createMRTColumnHelper();
const columns = [
  columnHelper.accessor("categoryName", { header: "Asset Reference", size: 150 }),
  columnHelper.accessor("assetType", { header: "Asset Type", size: 100 }),
  columnHelper.accessor("trackingType", { header: "Tracking", size: 100 }),
  columnHelper.accessor("brandName", { header: "Brand", size: 120 }),
  columnHelper.accessor("quantity", { header: "Quantity", size: 80 }),
  columnHelper.accessor("rate", { header: "Rate", size: 80 }),
  columnHelper.accessor("gross", { header: "Gross", size: 100 }),
  columnHelper.accessor("tax", { header: "Tax (%)", size: 80 }),
  columnHelper.accessor("taxAmt", { header: "Tax Amt", size: 100 }),
  columnHelper.accessor("net", { header: "Net Amount", size: 100 }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 80,
    Cell: ({ row, table }) => (
      <IconButton color="error" size="small" onClick={() => table.options.meta?.handleDeleteRow(row.index)}>
        <img src={Deleteicon1} alt="delete" width={16} height={16} />
      </IconButton>
    ),
  }),
];

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#D9D9D9", borderRadius: "4px" },
    "&:hover fieldset": { borderColor: "#D9D9D9" },
    "&.Mui-focused fieldset": { borderColor: "#D9D9D9" },
  },
  "& .MuiInputBase-input": { padding: "8px 12px" },
  backgroundColor: "#f9fafb",
};

const extractArray = (res) => {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.data?.data)) return res.data.data.data;
  if (Array.isArray(res?.data?.data?.vendors)) return res.data.data.vendors;
  if (Array.isArray(res?.data?.data?.locations)) return res.data.data.locations;
  if (Array.isArray(res?.data?.data?.units)) return res.data.data.units;
  if (Array.isArray(res?.data?.data?.brands)) return res.data.data.brands;
  if (Array.isArray(res?.data?.data?.categories)) return res.data.data.categories;
  return [];
};

const CreateGr = () => {
  const [formData, setFormData] = useState({
    sapId: "", sapDate: null, invoiceNumber: "", invoiceDate: null, grId: "", grDate: null,
    vendor: "", unit: "", location: "", description: "",
  });
  const [currentItem, setCurrentItem] = useState({
    assetType: "", trackingType: "", categoryId: "", brandId: "", quantity: "", rate: "", tax: 18,
  });
  const [addedItems, setAddedItems] = useState([]);
  
  const [vendors, setVendors] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [venRes, unitRes, locRes, catRes, brandRes] = await Promise.all([
        axios.get(`${baseUrl}/super-admin/vendors`, { headers }),
        axios.get(`${baseUrl}/super-admin/units`, { headers }),
        axios.get(`${baseUrl}/super-admin/locations`, { headers }),
        axios.get(`${baseUrl}/catalog/categories`, { headers }),
        axios.get(`${baseUrl}/super-admin/brands`, { headers }),
      ]);
      
      setVendors(extractArray(venRes));
      setUnits(extractArray(unitRes));
      setLocations(extractArray(locRes));
      setCategories(extractArray(catRes));
      setBrands(extractArray(brandRes));
    } catch (error) {
      console.error("Error fetching dropdowns", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleCurrentItemChange = (field, value) => {
    setCurrentItem({ ...currentItem, [field]: value });
  };

  const filteredCategories = categories.filter(c => {
    if (currentItem.assetType && c.assetType !== currentItem.assetType) return false;
    if (currentItem.trackingType && c.trackingType !== currentItem.trackingType) return false;
    return true;
  });

  const selectedCategoryObj = categories.find(c => c.id === currentItem.categoryId);
  
  const calcGross = parseFloat(currentItem.quantity || 0) * parseFloat(currentItem.rate || 0);
  const calcTaxAmt = (calcGross * parseFloat(currentItem.tax || 0)) / 100;
  const calcNet = calcGross + calcTaxAmt;

  const handleAddItem = () => {
    if (!currentItem.categoryId || !currentItem.brandId || !currentItem.quantity || !currentItem.rate) {
      setSnackbar({ open: true, message: "Please fill all required item fields", severity: "error" });
      return;
    }
    
    const catObj = categories.find(c => c.id === currentItem.categoryId);
    const brandObj = brands.find(b => b.id === currentItem.brandId);

    const newItem = {
      categoryId: currentItem.categoryId,
      categoryName: catObj?.name,
      assetType: catObj?.assetType,
      trackingType: catObj?.trackingType,
      brandId: currentItem.brandId,
      brandName: brandObj?.name,
      quantity: currentItem.quantity,
      rate: currentItem.rate,
      gross: calcGross.toFixed(2),
      tax: currentItem.tax,
      taxAmt: calcTaxAmt.toFixed(2),
      net: calcNet.toFixed(2),
    };

    setAddedItems([...addedItems, newItem]);
    setCurrentItem({ assetType: "", trackingType: "", categoryId: "", brandId: "", quantity: "", rate: "", tax: 18 });
  };

  const handleDeleteRow = (index) => {
    setAddedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const required = ["invoiceNumber", "invoiceDate", "grId", "grDate", "vendor", "unit", "location"];
    const newErrors = {};
    required.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      return;
    }
    if (addedItems.length === 0) {
      setSnackbar({ open: true, message: "Please add at least one item", severity: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sapId: formData.sapId || null,
        sapDate: formData.sapDate ? formData.sapDate.toISOString() : null,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate.toISOString(),
        grId: formData.grId,
        grDate: formData.grDate.toISOString(),
        vendorId: formData.vendor,
        unitId: formData.unit,
        locationId: formData.location,
        description: formData.description,
        products: addedItems.map(item => ({
          categoryId: item.categoryId,
          brandId: item.brandId,
          quantity: Number(item.quantity),
          ratePerPiece: Number(item.rate),
          grossAmount: Number(item.gross),
          taxPercent: Number(item.tax),
          taxAmount: Number(item.taxAmt),
          netAmount: Number(item.net)
        }))
      };

      const token = localStorage.getItem("token");
      await axios.post(`${baseUrl}/gr`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({ open: true, message: "GR Created Successfully!", severity: "success" });
      setFormData({
        sapId: "", sapDate: null, invoiceNumber: "", invoiceDate: null, grId: "", grDate: null,
        vendor: "", unit: "", location: "", description: "",
      });
      setAddedItems([]);
      setIsSubmitting(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Failed to create GR", severity: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>Add New GR</Typography>
      
      {/* General Details */}
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>General Details</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Box>
            <InputLabel sx={{ color: "black" }}>Vendor <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={formData.vendor} onChange={e => handleInputChange("vendor", e.target.value)} sx={textFieldStyles}>
                {vendors.map(v => <MenuItem key={v.id} value={v.id}>{v.vendorName || v.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Business Unit <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={formData.unit} onChange={e => handleInputChange("unit", e.target.value)} sx={textFieldStyles}>
                {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Location <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={formData.location} onChange={e => handleInputChange("location", e.target.value)} sx={textFieldStyles}>
                {locations.filter(l => !formData.unit || l.units?.some(u => u.id === formData.unit)).map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* SAP & Invoice */}
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>SAP & Invoice Details</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            <Box>
              <InputLabel sx={{ color: "black" }}>SAP ID</InputLabel>
              <CustomTextField fullWidth size="small" value={formData.sapId} onChange={e => handleInputChange("sapId", e.target.value)} sx={textFieldStyles} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black" }}>SAP Date</InputLabel>
              <DatePicker value={formData.sapDate} onChange={date => handleInputChange("sapDate", date)} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={textFieldStyles} />} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black" }}>Invoice Number <span style={{ color: "red" }}>*</span></InputLabel>
              <CustomTextField fullWidth size="small" value={formData.invoiceNumber} onChange={e => handleInputChange("invoiceNumber", e.target.value)} sx={textFieldStyles} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black" }}>Invoice Date <span style={{ color: "red" }}>*</span></InputLabel>
              <DatePicker value={formData.invoiceDate} onChange={date => handleInputChange("invoiceDate", date)} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={textFieldStyles} />} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black" }}>GR ID <span style={{ color: "red" }}>*</span></InputLabel>
              <CustomTextField fullWidth size="small" value={formData.grId} onChange={e => handleInputChange("grId", e.target.value)} sx={textFieldStyles} />
            </Box>
            <Box>
              <InputLabel sx={{ color: "black" }}>GR Date <span style={{ color: "red" }}>*</span></InputLabel>
              <DatePicker value={formData.grDate} onChange={date => handleInputChange("grDate", date)} renderInput={(params) => <TextField {...params} fullWidth size="small" sx={textFieldStyles} />} />
            </Box>
          </Box>
        </LocalizationProvider>
      </Box>

      {/* Add Item */}
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Add Item</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          <Box>
            <InputLabel sx={{ color: "black" }}>Asset Type <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={currentItem.assetType} onChange={e => handleCurrentItemChange("assetType", e.target.value)} sx={textFieldStyles}>
                <MenuItem value="PHYSICAL">Physical</MenuItem>
                <MenuItem value="DIGITAL">Digital</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Tracking Type <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={currentItem.trackingType} onChange={e => handleCurrentItemChange("trackingType", e.target.value)} sx={textFieldStyles}>
                <MenuItem value="TRACKABLE">Trackable</MenuItem>
                <MenuItem value="NON_TRACKABLE">Non-Trackable</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Asset Reference <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={currentItem.categoryId} onChange={e => handleCurrentItemChange("categoryId", e.target.value)} sx={textFieldStyles} disabled={!currentItem.assetType || !currentItem.trackingType}>
                {filteredCategories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Brand <span style={{ color: "red" }}>*</span></InputLabel>
            <FormControl fullWidth size="small">
              <Select value={currentItem.brandId} onChange={e => handleCurrentItemChange("brandId", e.target.value)} sx={textFieldStyles}>
                {brands.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Quantity <span style={{ color: "red" }}>*</span></InputLabel>
            <CustomTextField type="number" fullWidth size="small" value={currentItem.quantity} onChange={e => handleCurrentItemChange("quantity", e.target.value)} sx={textFieldStyles} />
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Rate <span style={{ color: "red" }}>*</span></InputLabel>
            <CustomTextField type="number" fullWidth size="small" value={currentItem.rate} onChange={e => handleCurrentItemChange("rate", e.target.value)} sx={textFieldStyles} />
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Gross Amount</InputLabel>
            <CustomTextField fullWidth size="small" value={calcGross.toFixed(2)} disabled sx={textFieldStyles} />
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Tax (%)</InputLabel>
            <CustomTextField type="number" fullWidth size="small" value={currentItem.tax} onChange={e => handleCurrentItemChange("tax", e.target.value)} sx={textFieldStyles} />
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Tax Amount</InputLabel>
            <CustomTextField fullWidth size="small" value={calcTaxAmt.toFixed(2)} disabled sx={textFieldStyles} />
          </Box>
          <Box>
            <InputLabel sx={{ color: "black" }}>Net Amount</InputLabel>
            <CustomTextField fullWidth size="small" value={calcNet.toFixed(2)} disabled sx={textFieldStyles} />
          </Box>
        </Box>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="contained" sx={{ bgcolor: "#DB3027" }} onClick={handleAddItem}>+ Add Item</Button>
        </Box>
      </Box>

      {/* Added Items Table */}
      {addedItems.length > 0 && (
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, mb: 3, width: "100%", boxSizing: "border-box" }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Added Items</Typography>
          <MaterialReactTable 
            columns={columns} 
            data={addedItems} 
            enablePagination={false}
            layoutMode="grid"
            muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden" } }}
            muiTableContainerProps={{ sx: { maxHeight: "400px", maxWidth: "100%", overflowX: "auto", overflowY: "auto" } }}
            meta={{ handleDeleteRow }}
          />
        </Box>
      )}

      {/* Submit */}
      <Box display="flex" justifyContent="center">
        <Button variant="contained" sx={{ bgcolor: "#DB3027", px: 5 }} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit GR"}
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateGr;
