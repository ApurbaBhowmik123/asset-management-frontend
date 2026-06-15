import {
  Box,
  InputLabel,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  styled,
  Switch,
  Button,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useRef, useState } from "react";
import AttachmentIcon from "@mui/icons-material/Attachment";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";

import {
  createMRTColumnHelper,
  MaterialReactTable,
} from "material-react-table";
import { baseUrl } from "../Api";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";
import { CustomTextField } from "../../utils/CustomTextField";

const columnHelper = createMRTColumnHelper();
const columns = [
  columnHelper.accessor("productName", {
    header: "Product",
    size: 200,
    Cell: ({ row }) => {
      const productName = row.original.productName;
      const productDetails = row.original.productDetails || {};
      const specs = Object.entries(productDetails)
        .filter(([_, val]) => val !== undefined && val !== null && val !== "")
        .map(([key, val]) => `${key}: ${val}`);

      return (
        <Box>
          <Typography sx={{ fontWeight: "600", fontSize: "0.875rem", color: "#333" }}>
            {productName}
          </Typography>
          {specs.length > 0 && (
            <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {specs.map((spec, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "500",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {spec}
                </span>
              ))}
            </Box>
          )}
        </Box>
      );
    },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    size: 100,
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
    size: 80,
    Cell: ({ cell }) => cell.getValue(),
  }),
  columnHelper.accessor("freeQuantity", {
    header: "Free Qty",
    size: 80,
    Cell: ({ cell }) => cell.getValue() || "0",
  }),
  columnHelper.accessor("unit", {
    header: "Unit",
    size: 60,
  }),
  columnHelper.accessor("rate", {
    header: "Price",
    size: 80,
    Cell: ({ cell }) => `${cell.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor("total", {
    header: "Total",
    size: 100,
    Cell: ({ cell }) => `${cell.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    size: 150,
    Cell: ({ cell }) => (
      <div
        style={{
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {cell.getValue() || "N/A"}
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 80,
    Cell: ({ row, table }) => (
      <Box>
        <IconButton
          color="error"
          size="small"
          onClick={() => {
            table.options.meta?.handleDeleteRow(row.original.id);
          }}
        >
          <img src={Deleteicon1} alt="delete" width={16} height={16} />
        </IconButton>
      </Box>
    ),
  }),
];

const CreateGr = () => {
  const [formData, setFormData] = useState({
    sapId: "",
    sapDate: null,
    invoiceNumber: "",
    invoiceDate: null,
    grId: "",
    grDate: null,
    vendor: "",
    unit: "",
    location: "",

    purchaseItems: [],
    currentItem: {
      category: "",
      subcategory: "",
      product: "",
      quantity: "",
      rate: "",
      description: "",
      freeProduct: false,
      freeQuantity: "",
      productDetails: {},
      assetMaintenance: {
        maintenanceFrequency: "",
        maintenanceDueDate: null,
        lifecycleExpiryDate: null,
        warrantyExpireDate: null,
        importantLink: "",
        warrantyUpload: null,
        invoice: "",
      },
      serialNumbers: {
        serialNo1: "",
        serialNo2: "",
        serialNo3: "",
        serialNo4: "",
      },
      freeSerialNumbers: {
        serialNo1: "",
        serialNo2: "",
        serialNo3: "",
      },
    },
  });

  const [errors, setErrors] = useState({
    poId: "",
    poDate: "",
    invoiceNumber: "",
    invoiceDate: "",
    grId: "",
    grDate: "",
    vendor: "",
    unit: "",
    location: "",
    category: "",
    subCategory: "",
    product: "",
    quantity: "",
    rate: "",
    // description: "",
    maintainanceFrequency: "",
    maintainanceDueDate: "",
    lifecycleExpiryDate: "",
    // warrantyExpiaryDate: "",
    warrantyUpload: "",
    padiSerialNo: "",
    freeSerialNo: "",
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const fileInputRef = useRef(null);
  const invoiceInputRef = useRef(null);
  const warrantyFileInputRef = useRef(null);
  const userDetails = localStorage.getItem("token");
  const [vendor, setVendor] = useState([]);
  const [unit, setUnit] = useState([]);
  const [location, setLocation] = useState([]);
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [grList, setGrList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [productSpecs, setProductSpecs] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [locationByUnitId, setLocationByUnitId] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [createGR, setCreateGR] = useState(false);
  const [brands, setBrands] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [productModalError, setProductModalError] = useState("");
  const [subcategorySpecFields, setSubcategorySpecFields] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [newProductFormData, setNewProductFormData] = useState({
    productName: "",
    specValues: {},
  });
  // Dynamic attribute rows for Create Product modal
  const [customAttrs, setCustomAttrs] = useState([{ name: "", value: "" }]);
  // Extra attribute rows added manually in the GR Product Details section
  const [productExtraAttrs, setProductExtraAttrs] = useState([]);

  const handleOpenCreateProductModal = async () => {
    if (!selectedCategoryId) return;
    
    setProductModalError("");
    setLoadingSpecs(true);
    setIsProductModalOpen(true);
    setCustomAttrs([{ name: "", value: "" }]);
    setNewProductFormData({
      productName: "",
      specValues: {},
    });

    try {
      const brandRes = await fetch(`${baseUrl}/super-admin/brands?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
      });
      const brandData = await brandRes.json();
      if (brandData?.status) {
        const brandList = brandData.data?.data || (Array.isArray(brandData.data) ? brandData.data : []);
        setBrands(brandList);
      }

      const specRes = await fetch(
        `${baseUrl}/catalog/additional/categories/${selectedCategoryId}/specfields`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userDetails}`,
          },
        }
      );
      const specData = await specRes.json();
      if (specData?.status) {
        const rawSpecs = specData.data?.data || (Array.isArray(specData.data) ? specData.data : []);
        const specFieldsData = rawSpecs
          .map((item) => (item.specField ? { ...item.specField } : null))
          .filter(Boolean);
        setSubcategorySpecFields(specFieldsData);
      } else {
        setSubcategorySpecFields([]);
      }
    } catch (error) {
      console.error("Error opening product modal:", error);
      setProductModalError("Failed to load required data. Please try again.");
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleCreateProductSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newProductFormData.productName.trim()) {
      setProductModalError("Product name is required");
      return;
    }

    setIsProductSubmitting(true);
    setProductModalError("");

    try {
      const defaultBrandId = brands[0]?.id ? parseInt(brands[0].id) : 1;
      // Build specValues array from the filled-in attribute fields
      const specValues = subcategorySpecFields
        .map((field) => ({
          specFieldId: field.id,
          value: newProductFormData.specValues[field.name] || "",
        }))
        .filter((sv) => sv.value !== "");

      const payload = {
        brandId: parseInt(newProductFormData.brandId) || defaultBrandId,
        categoryId: parseInt(selectedCategoryId),
        subcategoryId: null,
        name: newProductFormData.productName.trim(),
        lifeCycleAging: null,
        msq: null,
        description: null,
        specValues,
      };

      const res = await fetch(`${baseUrl}/catalog/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.status) {
        setSnackbar({
          open: true,
          message: "Product created successfully",
          severity: "success",
        });
        setIsProductModalOpen(false);

        await handleGetAllProducts(selectedCategoryId);

        const newProduct = data.data;
        if (newProduct) {
          handleCurrentItemChange("product", newProduct.name);

          // Spec fields from backend
          const specs = (newProduct.productSpecValue && newProduct.productSpecValue.length > 0)
            ? newProduct.productSpecValue.map((specValue) => ({
                ...specValue.specField,
                value: specValue.value,
              }))
            : subcategorySpecFields.map((field) => ({
                ...field,
                value: newProductFormData.specValues[field.name] || "",
              }));

          setProductSpecs(specs);

          const initialDetails = {};
          specs.forEach((spec) => {
            initialDetails[spec.name] = spec.value || "";
          });

          // Also add the user-entered custom attribute rows into productDetails
          const validCustomAttrs = customAttrs.filter((a) => a.name.trim() !== "");
          validCustomAttrs.forEach((a) => {
            initialDetails[a.name.trim()] = a.value;
          });
          // Pre-populate productExtraAttrs so they show as editable rows
          setProductExtraAttrs(validCustomAttrs.map((a) => ({ name: a.name.trim(), value: a.value })));

          let calculatedLifecycleDate = null;
          if (formData.invoiceDate && newProduct.lifeCycleAging) {
            const invoiceDate = new Date(formData.invoiceDate);
            calculatedLifecycleDate = new Date(invoiceDate);
            calculatedLifecycleDate.setMonth(
              calculatedLifecycleDate.getMonth() + newProduct.lifeCycleAging
            );
          }

          setFormData((prevFormData) => ({
            ...prevFormData,
            currentItem: {
              ...prevFormData.currentItem,
              product: newProduct.name,
              productDetails: initialDetails,
              assetMaintenance: {
                ...prevFormData.currentItem.assetMaintenance,
                lifecycleExpiryDate: calculatedLifecycleDate,
              },
            },
          }));
        }
      } else {
        setProductModalError(data?.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setProductModalError("An error occurred. Please try again.");
    } finally {
      setIsProductSubmitting(false);
    }
  };
  const grandTotal = addedItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  const [serialErrors, setSerialErrors] = useState({});
  const [freeSerialErrors, setFreeSerialErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleIconClick = (type) => {
    if (type === "invoice") {
      invoiceInputRef.current?.click();
    } else if (type === "warranty") {
      warrantyFileInputRef.current?.click();
    }
  };

  const handleInvoiceDateChange = (newInvoiceDate) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      invoiceDate: newInvoiceDate,
    }));

    if (newInvoiceDate) {
      const invoiceDate = new Date(newInvoiceDate);

      // Calculate maintenance due date if maintenance frequency exists
      let calculatedMaintenanceDueDate = null;
      const currentMaintenanceFreq =
        formData.currentItem.assetMaintenance.maintenanceFrequency;
      if (currentMaintenanceFreq && !isNaN(parseInt(currentMaintenanceFreq))) {
        calculatedMaintenanceDueDate = new Date(invoiceDate);
        calculatedMaintenanceDueDate.setMonth(
          calculatedMaintenanceDueDate.getMonth() +
          parseInt(currentMaintenanceFreq)
        );
      }

      // Calculate lifecycle expiry date if product is selected
      let calculatedLifecycleDate = null;
      if (formData.currentItem.product) {
        const selectedProduct = products.find(
          (prod) => prod.name === formData.currentItem.product
        );
        if (selectedProduct?.lifeCycleAging) {
          calculatedLifecycleDate = new Date(invoiceDate);
          calculatedLifecycleDate.setMonth(
            calculatedLifecycleDate.getMonth() + selectedProduct.lifeCycleAging
          );
        }
      }

      // Update the calculated dates
      if (calculatedMaintenanceDueDate || calculatedLifecycleDate) {
        setTimeout(() => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            currentItem: {
              ...prevFormData.currentItem,
              assetMaintenance: {
                ...prevFormData.currentItem.assetMaintenance,
                ...(calculatedMaintenanceDueDate && {
                  maintenanceDueDate: calculatedMaintenanceDueDate,
                }),
                ...(calculatedLifecycleDate && {
                  lifecycleExpiryDate: calculatedLifecycleDate,
                }),
              },
            },
          }));
        }, 100);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "grDate" && value) {
      setTimeout(() => {
        calculateDates();
      }, 0);
    }
  };

  const validateForm = () => {
    const newErrors = {
      // poId: !formData.sapId ? "PO ID is required" : "",
      // poDate: !formData.sapDate ? "PO Date is required" : "",
      invoiceNumber: !formData.invoiceNumber
        ? "Invoice Number is required"
        : "",
      invoiceDate: !formData.invoiceDate ? "Invoice Date is required" : "",
      // grId: !formData.grId ? "SAP GR ID is required" : "",
      // grDate: !formData.grDate ? "SAP GR Date is required" : "",
      vendor: !formData.vendor ? "Vendor is required" : "",
      unit: !formData.unit ? "Unit is required" : "",
      location: !formData.location ? "Location is required" : "",
      category: !formData.currentItem.category ? "Category is required" : "",
      product: !formData.currentItem.product ? "Product is required" : "",
      quantity: !formData.currentItem.quantity ? "Quantity is required" : "",
      rate: !formData.currentItem.rate ? "Rate is required" : "",
      maintainanceFrequency: !formData?.currentItem?.assetMaintenance
        ?.maintenanceFrequency
        ? "Maintanance Frequency is required"
        : "",
      maintainanceDueDate: !formData?.currentItem?.assetMaintenance
        ?.maintenanceDueDate
        ? "Maintanance Due Date is required"
        : "",
      lifecycleExpiryDate: !formData?.currentItem?.assetMaintenance
        ?.lifecycleExpiryDate
        ? "Lifecycle Expiary Date is required"
        : "",
    };

    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some((error) => error !== "");

    return isValid;
  };

  const handleCurrentItemChange = (field, value) => {
    setIsFree(value);
    setFormData((prev) => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        [field]: value,
      },
    }));
  };
  const handleAddItem = () => {
    const isValidForm = validateForm();
    const isValidSerialNumber = validateSerials();
    if (!isValidForm || !isValidSerialNumber) {
      return;
    }

    const selectedProduct = products.find(
      (prod) => prod.name === formData.currentItem.product
    );

    if (!selectedProduct) {
      console.error("Selected product not found");
      return;
    }

    // Validate quantity against product MSQ
    if (selectedProduct.msq) {
      const msqVal = parseInt(selectedProduct.msq);
      const qtyEntered = parseInt(formData.currentItem.quantity) || 0;
      if (!isNaN(msqVal) && qtyEntered > msqVal) {
        setSnackbar({
          open: true,
          message: `Quantity for product "${selectedProduct.name}" (${qtyEntered}) cannot exceed its Minimum Stock Quantity limit of ${msqVal}`,
          severity: "error",
        });
        return;
      }
    }

    const createSerialObjects = (isFree = false) => {
      const quantity = isFree
        ? Math.max(0, parseInt(formData.currentItem.freeQuantity) || 0)
        : Math.max(1, parseInt(formData.currentItem.quantity) || 1);

      const serialNumbers = isFree
        ? formData.currentItem.freeSerialNumbers
        : formData.currentItem.serialNumbers;

      const result = [];

      const keys = Object.keys(serialNumbers)
        .filter((key) => key.startsWith("serialNo"))
        .sort((a, b) => {
          const numA = parseInt(a.replace("serialNo", ""));
          const numB = parseInt(b.replace("serialNo", ""));
          return numA - numB;
        });

      for (let i = 0; i < quantity; i++) {
        const key = keys[i];
        const value = serialNumbers[key];
        if (value && value.trim() !== "") {
          result.push({
            serialNo1: value.trim(),
            isFree,
          });
        }
      }

      return result;
    };

    const serials = createSerialObjects(false);
    const freeSerials = formData.currentItem.freeProduct
      ? createSerialObjects(true)
      : [];

    // Merge productExtraAttrs into productDetails before building specs
    const mergedDetails = { ...formData.currentItem.productDetails };
    productExtraAttrs.forEach((a) => {
      if (a.name.trim()) mergedDetails[a.name.trim()] = a.value;
    });

    const productSpecsForBackend =
      productSpecs?.map((spec) => ({
        specFieldId: spec.id,
        name: spec.name,
        value: mergedDetails[spec.name] || "",
      })) || [];

    // Also append free-form extra attrs (no specFieldId) so they appear in GR details
    productExtraAttrs
      .filter((a) => a.name.trim() && !productSpecs.find((s) => s.name === a.name.trim()))
      .forEach((a) => {
        productSpecsForBackend.push({ specFieldId: null, name: a.name.trim(), value: a.value });
      });

    // FIX: Properly store the warranty file
    const warrantyFile = formData.currentItem.assetMaintenance.warrantyUpload;

    const newItem = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: formData.currentItem.product,
      brand: selectedProduct.brand || "N/A",
      category: formData.currentItem.category,
      quantity: parseInt(formData.currentItem.quantity) || 0,
      freeQuantity: formData.currentItem.freeProduct
        ? parseInt(formData.currentItem.freeQuantity) || 0
        : 0,
      unit: formData.unit,
      location: formData.location,
      rate: parseFloat(formData.currentItem.rate) || 0,
      total:
        (parseInt(formData.currentItem.quantity) || 0) *
        (parseFloat(formData.currentItem.rate) || 0),
      description: formData.currentItem.description,
      productDetails: mergedDetails,
      assetMaintenance: {
        ...formData.currentItem.assetMaintenance,
        warrantyUpload: warrantyFile,
      },
      serialNumbers: { ...formData.currentItem.serialNumbers },
      freeSerialNumbers: formData.currentItem.freeProduct
        ? { ...formData.currentItem.freeSerialNumbers }
        : null,
      backendData: {
        productId: selectedProduct.id,
        quantity: Math.max(1, parseInt(formData.currentItem.quantity) || 1),
        ratePerPiece: parseFloat(formData.currentItem.rate) || 0,
        freeQty: formData.currentItem.freeProduct
          ? parseInt(formData.currentItem.freeQuantity) || 0
          : 0,
        subcategoryId: null,
        description: formData.currentItem.description || "",
        maintenanceFrequency:
          formData.currentItem.assetMaintenance.maintenanceFrequency,
        maintenanceDueDate: formData.currentItem.assetMaintenance
          .maintenanceDueDate
          ? new Date(formData.currentItem.assetMaintenance.maintenanceDueDate)
            .toISOString()
            .split("T")[0]
          : null,
        lifecycleExDate: formData.currentItem.assetMaintenance
          .lifecycleExpiryDate
          ? new Date(formData.currentItem.assetMaintenance.lifecycleExpiryDate)
            .toISOString()
            .split("T")[0]
          : null,
        warrantyTill: formData.currentItem.assetMaintenance.warrantyExpireDate
          ? new Date(formData.currentItem.assetMaintenance.warrantyExpireDate)
            .toISOString()
            .split("T")[0]
          : null,
        // Store the warranty file here too for easy access
        warrantyFiles: warrantyFile,
        importantLink: formData.currentItem.assetMaintenance.importantLink,
        totalAmount:
          Math.max(1, parseInt(formData.currentItem.quantity) || 1) *
          parseFloat(formData.currentItem.rate || 0),
        specs: productSpecsForBackend,
        serials: serials,
        freeSerials: freeSerials,
      },
    };

    setAddedItems([...addedItems, newItem]);
    resetCurrentItem();
  };
  const resetCurrentItem = () => {
    setFormData((prev) => ({
      ...prev,
      location: "",
      currentItem: {
        ...prev.currentItem,
        category: "",
        subcategory: "",
        product: "",
        quantity: "",
        rate: "",
        description: "",
        freeProduct: false,
        freeQuantity: "",
        productDetails: {},
        assetMaintenance: {
          maintenanceFrequency: "",
          maintenanceDueDate: null,
          lifecycleExpiryDate: null,
          warrantyExpireDate: null,
          importantLink: "",
          warrantyUpload: null,
        },
        serialNumbers: {
          serialNo1: "",
          serialNo2: "",
          serialNo3: "",
          serialNo4: "",
        },
        freeSerialNumbers: {
          serialNo1: "",
          serialNo2: "",
          serialNo3: "",
        },
      },
    }));
    setProductSpecs([]);
    setProductExtraAttrs([]);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setIsFree(false);
    setErrors({});
    setSerialErrors({});
    setFreeSerialErrors({});
  };

  const handleProductChange = async (e) => {
    const selectedProductName = e.target.value;
    const selectedProduct = products.find(
      (prod) => prod.name === selectedProductName
    );

    if (selectedProduct) {
      handleCurrentItemChange("product", selectedProductName);

      let calculatedLifecycleDate = null;
      if (formData.invoiceDate && selectedProduct.lifeCycleAging) {
        const invoiceDate = new Date(formData.invoiceDate);
        calculatedLifecycleDate = new Date(invoiceDate);
        calculatedLifecycleDate.setMonth(
          calculatedLifecycleDate.getMonth() + selectedProduct.lifeCycleAging
        );
      }

      try {
        const res = await fetch(
          `${baseUrl}/catalog/additional/categories/${selectedCategoryId}/specfields`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userDetails}`,
            },
          }
        );
        const specData = await res.json();
        
        let catSpecs = [];
        if (specData?.status) {
          const rawSpecs = specData.data?.data || (Array.isArray(specData.data) ? specData.data : []);
          catSpecs = rawSpecs
            .map((item) => (item.specField ? { ...item.specField } : null))
            .filter(Boolean);
        }

        const specsWithValues = catSpecs.map((field) => {
          const matchingValue = selectedProduct.productSpecValue?.find(
            (psv) => psv.specFieldId === field.id
          );
          return {
            ...field,
            value: matchingValue ? matchingValue.value : "",
          };
        });

        const finalSpecs = specsWithValues.length > 0 ? specsWithValues : (
          selectedProduct.productSpecValue?.map((specValue) => ({
            ...specValue.specField,
            value: specValue.value,
          })) || []
        );

        setProductSpecs(finalSpecs);

        const initialDetails = {};
        finalSpecs.forEach((spec) => {
          initialDetails[spec.name] = spec.value || "";
        });

        setFormData((prevFormData) => ({
          ...prevFormData,
          currentItem: {
            ...prevFormData.currentItem,
            productDetails: initialDetails,
            assetMaintenance: {
              ...prevFormData.currentItem.assetMaintenance,
              lifecycleExpiryDate: calculatedLifecycleDate,
            },
          },
        }));
      } catch (error) {
        console.error("Error fetching subcategory specs:", error);
        
        const specs =
          selectedProduct.productSpecValue?.map((specValue) => ({
            ...specValue.specField,
            value: specValue.value,
          })) || [];

        setProductSpecs(specs);

        const initialDetails = {};
        specs.forEach((spec) => {
          initialDetails[spec.name] = spec.value;
        });

        setFormData((prevFormData) => ({
          ...prevFormData,
          currentItem: {
            ...prevFormData.currentItem,
            productDetails: initialDetails,
            assetMaintenance: {
              ...prevFormData.currentItem.assetMaintenance,
              lifecycleExpiryDate: calculatedLifecycleDate,
            },
          },
        }));
      }
    }
  };

  const handleProductDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        productDetails: {
          ...prev.currentItem.productDetails,
          [field]: value,
        },
      },
    }));
  };


  const handleGrDateChange = (newGrDate) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      grDate: newGrDate,
    }));
  };

  const handleAssetMaintenanceChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        currentItem: {
          ...prev.currentItem,
          assetMaintenance: {
            ...prev.currentItem.assetMaintenance,
            [field]: value,
          },
        },
      };

      // If maintenance frequency changes and INVOICE date exists, update due date
      if (field === "maintenanceFrequency" && prev.invoiceDate) {
        const invoiceDate = new Date(prev.invoiceDate);
        const newDueDate = new Date(invoiceDate);
        newDueDate.setMonth(newDueDate.getMonth() + parseInt(value));
        newData.currentItem.assetMaintenance.maintenanceDueDate = newDueDate;
      }

      return newData;
    });
  };

  const handleSerialNumbersChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        serialNumbers: {
          ...prev.currentItem.serialNumbers,
          [field]: value,
        },
      },
    }));
  };

  const handleFreeSerialNumbersChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      currentItem: {
        ...prev.currentItem,
        freeSerialNumbers: {
          ...prev.currentItem.freeSerialNumbers,
          [field]: value,
        },
      },
    }));
  };

  const handleShowFreeProduct = (e) => {
    handleCurrentItemChange("freeProduct", e.target.checked);
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];

    if (type === "invoice") {
      handleInputChange("invoice", file);
    } else if (type === "warranty") {
      handleAssetMaintenanceChange("warrantyUpload", file);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCat = category.find((cat) => cat.name === e.target.value);
    if (selectedCat) {
      setSelectedCategoryId(selectedCat.id);
      handleCurrentItemChange("category", e.target.value);
      
      // Fetch products directly by category
      handleGetAllProducts(selectedCat.id);

      // Fetch category spec fields
      handleGetCategorySpecFields(selectedCat.id);

      // Set maintenance frequency from category
      const maintenanceFrequency = selectedCat.maintainanceFrequency
        ? selectedCat.maintainanceFrequency.toString()
        : "";

      // Calculate maintenance due date if INVOICE date exists
      let calculatedMaintenanceDueDate = null;
      if (formData.invoiceDate && selectedCat.maintainanceFrequency) {
        const invoiceDate = new Date(formData.invoiceDate);
        calculatedMaintenanceDueDate = new Date(invoiceDate);
        calculatedMaintenanceDueDate.setMonth(
          calculatedMaintenanceDueDate.getMonth() +
          selectedCat.maintainanceFrequency
        );
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        currentItem: {
          ...prevFormData.currentItem,
          product: "",
          assetMaintenance: {
            ...prevFormData.currentItem.assetMaintenance,
            maintenanceFrequency: maintenanceFrequency,
            maintenanceDueDate: calculatedMaintenanceDueDate,
          },
        },
      }));
      setProductSpecs([]);
      setProductExtraAttrs([]);
    }
  };
  const handleCreateGR = async () => {
    if (addedItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Please add at least one item before creating GR",
        severity: "error",
      });
      return;
    }

    const selectedVendor = vendor.data?.find((v) => v.name === formData.vendor);
    const selectedUnit = unit?.find((u) => u.name === formData.unit);

    const formPayload = new FormData();

    // Append basic fields
    { formData.sapId && formPayload.append("sapId", formData.sapId); }
    {
      formData.sapDate && formPayload.append(
        "sapDate",
        dateTimeHelper.formatGivenDate(formData.sapDate)
      );
    }


    formPayload.append("invoiceNumber", formData.invoiceNumber);
    formPayload.append(
      "invoiceDate",
      dateTimeHelper.formatGivenDate(formData.invoiceDate)
    );
    { formData.grId && formPayload.append("grId", formData.grId) };
    {
      formData.grDate && formPayload.append(
        "grDate",
        dateTimeHelper.formatGivenDate(formData.grDate)
      );
    }

    formPayload.append("vendorId", selectedVendor?.id || "");
    formPayload.append("unitId", selectedUnit?.id || "");
    formPayload.append("locationId", selectedLocation || "");
    formPayload.append("description", formData.currentItem.description || "");

    // Invoice file
    if (formData.invoice && formData.invoice instanceof File) {
      formPayload.append("invoiceFile", formData.invoice);
    }

    const currentAddedItems = [...addedItems];

    // Collect warranty files and products data
    const productsWithFiles = currentAddedItems.map((item) => {
      const warrantyFile = item.assetMaintenance?.warrantyUpload || null;

      if (warrantyFile && warrantyFile instanceof File) {
        formPayload.append("warrantyFiles", warrantyFile); // same key for all warranty files
      }

      return {
        productId: item.backendData.productId,
        quantity: item.backendData.quantity,
        ratePerPiece: item.backendData.ratePerPiece,
        freeQty: item.backendData.freeQty,
        subcategoryId: item.backendData.subcategoryId,
        description: item.backendData.description || "",
        maintenanceFrequency: item.assetMaintenance?.maintenanceFrequency || "",
        maintenanceDueDate: dateTimeHelper.formatGivenDate(
          item.assetMaintenance?.maintenanceDueDate
        ),
        lifecycleExDate: dateTimeHelper.formatGivenDate(
          item.assetMaintenance?.lifecycleExpiryDate
        ),
        warrantyTill: dateTimeHelper.formatGivenDate(
          item.assetMaintenance?.warrantyExpireDate
        ),
        importantLink: item.assetMaintenance?.importantLink || "",
        totalAmount: item.backendData.totalAmount,
        specs: item.backendData.specs || [],
        serials: item.backendData.serials || [],
        freeSerials: item.backendData.freeSerials || [],
      };
    });

    formPayload.append("products", JSON.stringify(productsWithFiles));
    setCreateGR(true);

    try {
      const response = await fetch(`${baseUrl}/gr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userDetails}`,
        },
        body: formPayload,
      });

      const responseData = await response.json();

      if (
        !responseData?.status ||
        responseData?.status === "validation_error"
      ) {
        setSnackbar({
          open: true,
          message: responseData?.message,
          severity: "error",
        });
        setCreateGR(false)
        return;

      }

      setSnackbar({
        open: true,
        message: responseData?.message || "GR created successfully",
        severity: "success",
      });
      setCreateGR(false);

      setAddedItems([]);
      setFormData({
        sapId: "",
        sapDate: null,
        invoiceNumber: "",
        invoiceDate: null,
        grId: "",
        grDate: null,
        vendor: "",
        unit: "",
        location: "",
        invoice: null,
        purchaseItems: [],
        currentItem: {
          category: "",
          subcategory: "",
          product: "",
          quantity: "",
          rate: "",
          description: "",
          freeProduct: false,
          freeQuantity: "",
          productDetails: {},
          assetMaintenance: {
            maintenanceFrequency: "",
            maintenanceDueDate: null,
            lifecycleExpiryDate: null,
            warrantyExpireDate: null,
            importantLink: "",
            warrantyUpload: null,
          },
          serialNumbers: {
            serialNo1: "",
            serialNo2: "",
            serialNo3: "",
            serialNo4: "",
          },
          freeSerialNumbers: {
            serialNo1: "",
            serialNo2: "",
            serialNo3: "",
          },
        },
      });

      if (invoiceInputRef.current) invoiceInputRef.current.value = "";
      if (warrantyFileInputRef.current) warrantyFileInputRef.current.value = "";
    } catch (error) {
      console.error("Error creating GR:", error);
      setSnackbar({
        open: true,
        message: "Failed to create GR. Please try again.",
        severity: "error",
      });
      setCreateGR(false);
    }
  };

  const handleFetchGrList = async () => {
    try {
      const { pageIndex, pageSize } = pagination;
      const page = pageIndex + 1;

      // Get sorting parameters
      let sortBy = "createdAt";
      let sortOrder = "desc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      const url = new URL(`${baseUrl}/gr`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", pageSize);
      url.searchParams.append("sortBy", sortBy);
      url.searchParams.append("sortOrder", sortOrder);

      if (globalFilter) {
        url.searchParams.append("search", globalFilter);
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
      });

      const data = await res?.json();
      if (data?.status) {
        setGrList(data.data.data);
        setTotalCount(data.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching GR list:", error);
    }
  };
  const validateSerials = () => {
    const errors = {};
    const freeErrors = {};
    let hasErrors = false;

    // Check paid serial numbers
    for (
      let i = 1;
      i <= Math.max(1, parseInt(formData.currentItem.quantity) || 1);
      i++
    ) {
      const serial = formData.currentItem.serialNumbers[`serialNo${i}`];
      if (!serial || serial.trim() === "") {
        errors[`serialNo${i}`] = "Serial number is required";
        hasErrors = true;
      } else {
        // Check for duplicates in current form
        for (
          let j = 1;
          j <= Math.max(1, parseInt(formData.currentItem.quantity) || 1);
          j++
        ) {
          if (
            j !== i &&
            formData.currentItem.serialNumbers[`serialNo${j}`] === serial
          ) {
            errors[`serialNo${i}`] = "Duplicate serial number in current item";
            hasErrors = true;
            break;
          }
        }

        // Check against already added items
        if (!hasErrors) {
          const isDuplicateInAddedItems = addedItems.some(
            (item) =>
              Object.values(item.serialNumbers).includes(serial) ||
              (item.freeSerialNumbers &&
                Object.values(item.freeSerialNumbers).includes(serial))
          );

          if (isDuplicateInAddedItems) {
            errors[`serialNo${i}`] = "Serial number already exists in GR";
            hasErrors = true;
          }
        }
      }
    }

    // Check free serial numbers if enabled
    if (formData.currentItem.freeProduct && formData.currentItem.freeQuantity) {
      for (
        let i = 1;
        i <= Math.max(1, parseInt(formData.currentItem.freeQuantity) || 0);
        i++
      ) {
        const freeSerial =
          formData.currentItem.freeSerialNumbers[`serialNo${i}`];
        if (!freeSerial || freeSerial.trim() === "") {
          freeErrors[`serialNo${i}`] = "Serial number is required";
          hasErrors = true;
        } else {
          // Check for duplicates in current form's free serials
          for (
            let j = 1;
            j <= Math.max(1, parseInt(formData.currentItem.freeQuantity) || 0);
            j++
          ) {
            if (
              j !== i &&
              formData.currentItem.freeSerialNumbers[`serialNo${j}`] ===
              freeSerial
            ) {
              freeErrors[`serialNo${i}`] =
                "Duplicate serial number in current item";
              hasErrors = true;
              break;
            }
          }

          // Check against paid serials in current form
          if (!hasErrors) {
            for (
              let j = 1;
              j <= Math.max(1, parseInt(formData.currentItem.quantity) || 1);
              j++
            ) {
              if (
                formData.currentItem.serialNumbers[`serialNo${j}`] ===
                freeSerial
              ) {
                freeErrors[`serialNo${i}`] =
                  "Duplicate with paid serial number";
                hasErrors = true;
                break;
              }
            }
          }

          // Check against already added items
          if (!hasErrors) {
            const isDuplicateInAddedItems = addedItems.some(
              (item) =>
                Object.values(item.serialNumbers).includes(freeSerial) ||
                (item.freeSerialNumbers &&
                  Object.values(item.freeSerialNumbers).includes(freeSerial))
            );

            if (isDuplicateInAddedItems) {
              freeErrors[`serialNo${i}`] = "Serial number already exists in GR";
              hasErrors = true;
            }
          }
        }
      }
    }

    setSerialErrors(errors);
    setFreeSerialErrors(freeErrors);

    if (hasErrors) {
      return;
    }

    return !hasErrors;
  };
  useEffect(() => {
    handleFetchGrList();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  const grListColumns = [
    columnHelper.accessor("grId", {
      header: "GR ID",
      size: 80,
    }),
    columnHelper.accessor("sapId", {
      header: "SAP ID",
      size: 60,
    }),
    columnHelper.accessor("vendor.name", {
      header: "Vendor",
      size: 100,
      Cell: ({ row }) => row.original.vendor?.name || "N/A",
    }),
    columnHelper.accessor("invoiceNumber", {
      header: "Invoice Number",
      size: 80,
    }),
    columnHelper.accessor("invoiceDate", {
      header: "Invoice Date",
      size: 100,
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("grDate", {
      header: "GR Date",
      size: 100,
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 120,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 60,
      Cell: ({ row }) => (
        <Box>
          <IconButton color="error" size="small">
            <img src={Deleteicon1} alt="delete" width={16} height={16} />
          </IconButton>
        </Box>
      ),
    }),
  ];

  // Styles
  const textFieldStyles = {
    backgroundColor: "#f5f5f5",
    borderRadius: 1,
    "& .MuiInputBase-root": {
      height: "40px",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "8px 12px",
      height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #9e9e9e" },
  };

  const datePickerStyles = {
    ...textFieldStyles,
    width: "100%",
  };

  const inputLabelStyle = {
    fontWeight: "medium",
    marginBottom: "8px",
    display: "block",
    fontSize: "14px",
    color: "#333",
  };

  const selectStyles = {
    backgroundColor: "#f5f5f5",
    "& .MuiInputBase-root": { height: "40px" },
    "& .MuiSelect-select": {
      padding: "8px 12px",
      height: "100% !important",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #9e9e9e" },
    width: "100%",
  };

  const dateTextFieldStyles = {
    backgroundColor: "white",
    "& .MuiInputBase-root": { height: "40px" },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "8px 12px",
      height: "100%",
      boxSizing: "border-box",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #9e9e9e" },
  };

  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 35,
    height: 16,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": { width: 15 },
      "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(9px)" },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(18px)",
        color: "#fff",
        "& + .MuiSwitch-track": { opacity: 1, backgroundColor: "#0D6EFD" },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(["width"], { duration: 200 }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: "rgba(0,0,0,.25)",
      boxSizing: "border-box",
    },
  }));

  const handleGetAllCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/gr/products/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
      });
      const data = await res?.json();
      if (!data?.status) {
        return;
      }
      setCategory(data?.data);
    } catch (error) {
      console.error("errorr", error);
    }
  };

  useEffect(() => {
    handleGetAllCategories();
  }, []);

  const handleGetSubCategories = async (categoryId) => {
    try {
      const res = await fetch(
        `${baseUrl}/gr/products/categories/${categoryId}/subcategories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userDetails}`,
          },
        }
      );
      const data = await res?.json();
      if (data?.status) {
        setSubcategories(data.data);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("errorr", error);
      setSubcategories([]);
    }
  };

  const handleGetAllProducts = async (categoryId) => {
    try {
      const res = await fetch(
        `${baseUrl}/gr/products/categories/${categoryId}/products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userDetails}`,
          },
        }
      );
      const data = await res?.json();
      if (data?.status) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("error", error);
      setProducts([]);
    }
  };

  const handleGetCategorySpecFields = async (categoryId) => {
    try {
      const res = await fetch(
        `${baseUrl}/catalog/additional/categories/${categoryId}/specfields`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userDetails}`,
          },
        }
      );
      const specData = await res.json();
      if (specData?.status) {
        const rawSpecs = specData.data?.data || (Array.isArray(specData.data) ? specData.data : []);
        const specFieldsData = rawSpecs
          .map((item) => (item.specField ? { ...item.specField } : null))
          .filter(Boolean);
        setSubcategorySpecFields(specFieldsData);
      } else {
        setSubcategorySpecFields([]);
      }
    } catch (error) {
      console.error("Error fetching category specs:", error);
      setSubcategorySpecFields([]);
    }
  };

  // Products are loaded on-demand when category+subcategory are selected

  const handleGetAllUnits = async () => {
    try {
      const res = await fetch(`${baseUrl}/gr/units/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
      });
      const data = await res?.json();
      if (!data?.status) {
        return;
      }
      setUnit(data?.data);
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleGetLocationByUnit = async (unitName) => {
    const selectedLocation = unit?.find(
      (location) => location?.name === unitName
    );
    setLocation(selectedLocation?.unitlocation);
  };

  useEffect(() => {
    handleGetAllUnits();
  }, []);

  const handleGetAllVendor = async () => {
    try {
      const res = await fetch(`${baseUrl}/super-admin/vendors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetails}`,
        },
      });

      const data = await res?.json();
      if (!data?.status) {
        return;
      }
      setVendor(data?.data);
    } catch (error) {
      console.error("errror", error);
    }
  };
  useEffect(() => {
    handleGetAllVendor();
  }, []);

  console.log("formDataaaa", formData);
  console.log("selectedSubcategoryId", selectedSubcategoryId);

  return (
    <div style={{ backgroundColor: "#FFF", padding: "16px" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        {/* Top Form Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Sap Id */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              PO Id
            </InputLabel>
            <CustomTextField
              fullWidth
              size="small"
              sx={textFieldStyles}
              value={formData.sapId}
              onChange={(e) => handleInputChange("sapId", e.target.value)}
            />
            {/* <Typography color="error" variant="caption">
              {errors?.poId}
            </Typography> */}
          </div>

          {/* Sap Date */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              PO Date
            </InputLabel>
            <DatePicker
              value={formData.sapDate}
              format="dd/MM/yyyy"
              onChange={(newValue) => handleInputChange("sapDate", newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: datePickerStyles,
                },
              }}
            />
            {/* <Typography color="error" variant="caption">
              {errors?.poDate}
            </Typography> */}
          </div>

          {/* Invoice Number */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              Invoice Number <span style={{ color: "red" }}>*</span>
            </InputLabel>
            <CustomTextField
              fullWidth
              size="small"
              sx={textFieldStyles}
              value={formData.invoiceNumber}
              onChange={(e) =>
                handleInputChange("invoiceNumber", e.target.value)
              }
            />
            <Typography color="error" variant="caption">
              {errors?.invoiceNumber}
            </Typography>
          </div>

          {/* Invoice Date */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              Invoice Date <span style={{ color: "red" }}>*</span>
            </InputLabel>
            <DatePicker
              format="dd/MM/yyyy"
              value={formData.invoiceDate}
              onChange={handleInvoiceDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: datePickerStyles,
                },
              }}
            />
            <Typography color="error" variant="caption">
              {errors?.invoiceDate}
            </Typography>
          </div>

          {/* GR Id */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              SAP GR Id
            </InputLabel>
            <CustomTextField
              fullWidth
              size="small"
              sx={textFieldStyles}
              value={formData.grId}
              onChange={(e) => handleInputChange("grId", e.target.value)}
            />
            {/* <Typography color="error" variant="caption">
              {errors?.grId}
            </Typography> */}
          </div>

          {/* GR Date */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              SAP GR Date
            </InputLabel>

            <DatePicker
              format="dd/MM/yyyy"
              value={formData.grDate}
              onChange={handleGrDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: datePickerStyles,
                },
              }}
            />
            {/* <Typography color="error" variant="caption">
              {errors?.grDate}
            </Typography> */}
          </div>

          {/* Select Vendor */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              Select Vendor <span style={{ color: "red" }}>*</span>
            </InputLabel>
            <FormControl
              fullWidth
              size="small"
              sx={{ background: "#f5f5f5", borderRadius: 1 }}
            >
              <Select
                sx={selectStyles}
                displayEmpty
                value={formData.vendor}
                onChange={(e) => handleInputChange("vendor", e.target.value)}
                renderValue={(selected) => selected || "Select Vendor"}
              >
                <MenuItem value="" disabled>
                  Select Vendor
                </MenuItem>
                {vendor?.data?.length > 0
                  ? vendor?.data?.map((vendor) => (
                    <MenuItem value={vendor?.name}>{vendor?.name}</MenuItem>
                  ))
                  : "No vendor found"}
              </Select>
            </FormControl>
            <Typography color="error" variant="caption">
              {errors?.vendor}
            </Typography>
          </div>

          {/* Unit */}
          <div>
            <InputLabel sx={inputLabelStyle}>
              Business Unit <span style={{ color: "red" }}>*</span>
            </InputLabel>
            <FormControl
              fullWidth
              size="small"
              sx={{ background: "#f5f5f5", borderRadius: 1 }}
            >
              <Select
                sx={selectStyles}
                displayEmpty
                value={formData.unit}
                onChange={(e) => {
                  handleInputChange("unit", e?.target?.value),
                    handleGetLocationByUnit(e?.target?.value);
                }}
                renderValue={(selected) => selected || "Select Unit"}
              >
                <MenuItem value="" disabled>
                  Select Unit
                </MenuItem>
                {unit?.length > 0
                  ? unit?.map((unit) => (
                    <MenuItem value={unit?.name}>{unit?.name}</MenuItem>
                  ))
                  : "No unit found"}
              </Select>
            </FormControl>
            <Typography color="error" variant="caption">
              {errors?.unit}
            </Typography>
          </div>
          <div>
            <InputLabel sx={inputLabelStyle}>
              Location <span style={{ color: "red" }}>*</span>
            </InputLabel>
            <FormControl
              fullWidth
              size="small"
              sx={{ background: "#f5f5f5", borderRadius: 1 }}
            >
              <Select
                sx={selectStyles}
                displayEmpty
                value={formData?.location}
                onChange={(e) => {
                  handleInputChange("location", e.target.value);
                  setSelectedLocation(e.target.value);
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Location";
                  const selectedLocation = location?.find(
                    (loc) => loc?.location?.id === selected
                  );
                  return selectedLocation?.location?.name || "Select Location";
                }}
                disabled={!formData.unit}
              >
                <MenuItem value="" disabled>
                  Select Location
                </MenuItem>
                {location?.length > 0 ? (
                  location.map((loc) => (
                    <MenuItem key={loc?.location?.id} value={loc?.location?.id}>
                      {loc?.location?.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No location found</MenuItem>
                )}
              </Select>
            </FormControl>
            <Typography color="error" variant="caption">
              {errors?.location}
            </Typography>
          </div>

          {/**Invoice */}
          <div style={{ flex: "1 1 300px" }}>
            <InputLabel sx={inputLabelStyle}>Attachment</InputLabel>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={formData.invoice?.name || ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => handleIconClick("invoice")}
                      size="small"
                      sx={{ color: "#9e9e9e" }}
                    >
                      <AttachmentIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid #9e9e9e",
                  },
                },
              }}
            />
            <input
              type="file"
              ref={invoiceInputRef}
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e, "invoice")}
            />
          </div>
        </div>

        {/* Purchase Items Section */}
        <div style={{ width: "100%", marginTop: "24px" }}>
          <Typography
            sx={{ fontWeight: "medium", marginBottom: "16px", color: "black" }}
          >
            Add Purchase
          </Typography>

          <div
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#F7F7F7",
              borderRadius: "8px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "medium",
                marginBottom: "16px",
                color: "black",
              }}
            >
              Purchase Items
            </Typography>
            <div
              style={{
                display: "flex",
                marginBottom: "16px",
                gap: "16px",
              }}
            >
              {/* Category */}
              <div style={{ flex: 1 }}>
                <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                  Category <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <FormControl fullWidth size="small">
                  <Select
                    sx={{ ...selectStyles, backgroundColor: "white" }}
                    displayEmpty
                    value={formData.currentItem.category}
                    onChange={handleCategoryChange}
                    renderValue={(selected) => selected || "Select Category"}
                  >
                    {category?.length > 0 ? (
                      category?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No categories found</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Typography color="error" variant="caption">
                  {errors?.category}
                </Typography>
              </div>

              {/* Product */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                    Asset Reference  <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  {selectedCategoryId && (
                    <Button 
                      size="small" 
                      onClick={handleOpenCreateProductModal}
                      sx={{ textTransform: "none", fontSize: "12px", color: "#DB3027", minWidth: "auto", p: 0, mb: "8px" }}
                    >
                      + Create Product
                    </Button>
                  )}
                </div>
                <FormControl fullWidth size="small">
                  <Select
                    sx={{ ...selectStyles, backgroundColor: "white" }}
                    displayEmpty
                    value={formData.currentItem.product}
                    onChange={handleProductChange}
                    renderValue={(value) => (value ? value : "Select Product")}
                    disabled={!selectedCategoryId}
                  >
                    {products?.length > 0 ? (
                      products?.map((prod) => (
                        <MenuItem key={prod.id} value={prod.name}>
                          {prod.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No products found</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Typography color="error" variant="caption">
                  {errors?.product}
                </Typography>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                  Quantity  <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  type="number"
                  sx={dateTextFieldStyles}
                  value={formData.currentItem.quantity}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value)) || "";
                    handleCurrentItemChange("quantity", value);
                  }}
                // inputProps={{ min: 1 }}
                />
                <Typography color="error" variant="caption">
                  {errors?.quantity}
                </Typography>
              </div>

              {/* Price */}
              <div style={{ flex: 1 }}>
                <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                  Price  <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  type="number"
                  sx={dateTextFieldStyles}
                  value={formData.currentItem.rate}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value)) || "";
                    handleCurrentItemChange("rate", value);
                  }}
                />
                <Typography color="error" variant="caption">
                  {errors?.rate}
                </Typography>
              </div>

              {/* Description */}
              <div style={{ flex: 1 }}>
                <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                  Description
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  sx={dateTextFieldStyles}
                  value={formData.currentItem.description}
                  onChange={(e) =>
                    handleCurrentItemChange("description", e.target.value)
                  }
                />

              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "2.5rem",
                }}
              >
                <InputLabel sx={{ fontWeight: 400, color: "black" }}>
                  Free Product
                </InputLabel>
                <AntSwitch
                  checked={formData.currentItem.freeProduct}
                  onChange={handleShowFreeProduct}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#fff",
                      "& + .MuiSwitch-track": {
                        backgroundColor: "#DB3027",
                        opacity: 1,
                      },
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#DB3027",
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: "#ccc",
                    },
                  }}
                />
              </div>

              {formData.currentItem.freeProduct && (
                <div
                  style={{ width: "30%", minWidth: "200px", marginTop: "1rem" }}
                >
                  <InputLabel sx={{ marginBottom: "8px", color: "black" }}>
                    Quantity of free product
                  </InputLabel>
                  <CustomTextField
                    fullWidth
                    type="number"
                    size="small"
                    sx={dateTextFieldStyles}
                    value={formData.currentItem.freeQuantity}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value)) || "";
                      handleCurrentItemChange("freeQuantity", value);
                    }}

                  />
                </div>
              )}
            </div>
            <div
              style={{
                backgroundColor: "#FFF",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              {/* Product Details Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Typography sx={{ fontWeight: "medium", color: "black" }}>
                  Product Details (for current item)
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                {/* Dynamic fields from product specs (predefined) */}
                {productSpecs?.map((spec) => (
                  <div key={spec.id} style={{ flex: "1 1 150px" }}>
                    <InputLabel>{spec.name}</InputLabel>
                    {spec.fieldType === "DROPDOWN" ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={textFieldStyles}
                          value={
                            formData.currentItem.productDetails[spec.name] || ""
                          }
                          onChange={(e) =>
                            handleProductDetailsChange(
                              spec.name,
                              e.target.value
                            )
                          }
                          renderValue={(selected) =>
                            selected || `Select ${spec.name}`
                          }
                        >
                          {spec.options?.map((option) => (
                            <MenuItem key={option.id} value={option.value}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        sx={textFieldStyles}
                        value={
                          formData.currentItem.productDetails[spec.name] || ""
                        }
                        onChange={(e) =>
                          handleProductDetailsChange(spec.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Custom / Extra Attribute rows */}
              <Box sx={{ mt: productSpecs?.length > 0 ? 2 : 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "13px", color: "#555", fontWeight: 500 }}>
                    {productSpecs?.length === 0 ? "Add Specifications / Attributes" : "Additional Attributes"}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setProductExtraAttrs((prev) => [...prev, { name: "", value: "" }])}
                    sx={{ textTransform: "none", fontSize: "12px", borderColor: "#DB3027", color: "#DB3027", minWidth: "90px" }}
                  >
                    + Add Item
                  </Button>
                </Box>
                {productExtraAttrs.length === 0 && productSpecs?.length === 0 && (
                  <Typography variant="caption" sx={{ color: "#999" }}>
                    Click "+ Add Item" to add attributes like RAM: 8GB
                  </Typography>
                )}
                {productExtraAttrs.map((attr, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      placeholder="Name (e.g. RAM)"
                      value={attr.name}
                      sx={{ flex: 1, ...textFieldStyles }}
                      onChange={(e) =>
                        setProductExtraAttrs((prev) =>
                          prev.map((a, i) => i === idx ? { ...a, name: e.target.value } : a)
                        )
                      }
                    />
                    <TextField
                      size="small"
                      placeholder="Value (e.g. 8GB)"
                      value={attr.value}
                      sx={{ flex: 1, ...textFieldStyles }}
                      onChange={(e) =>
                        setProductExtraAttrs((prev) =>
                          prev.map((a, i) => i === idx ? { ...a, value: e.target.value } : a)
                        )
                      }
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        setProductExtraAttrs((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <img src={Deleteicon1} alt="delete" width={14} height={14} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </div>

            {/* Asset Maintenance Section */}
            <div
              style={{
                backgroundColor: "#FFF",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "medium",
                  marginBottom: "16px",
                  color: "black",
                }}
              >
                Asset Maintenance Details (for current item)
              </Typography>

              {/* First Row: Maintenance Fields */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                {/* Maintenance Frequency */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Maintenance Frequency (Months)  <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <FormControl fullWidth size="small">
                    <Select
                      sx={textFieldStyles}
                      value={
                        formData.currentItem.assetMaintenance
                          .maintenanceFrequency
                      }
                      onChange={(e) => {
                        handleAssetMaintenanceChange(
                          "maintenanceFrequency",
                          e.target.value
                        );
                        // Calculate new due date when frequency changes
                        if (formData.grDate) {
                          const grDate = new Date(formData.grDate);
                          const newDueDate = new Date(grDate);
                          newDueDate.setMonth(
                            newDueDate.getMonth() + parseInt(e.target.value)
                          );
                          handleAssetMaintenanceChange(
                            "maintenanceDueDate",
                            newDueDate
                          );
                        }
                      }}
                      renderValue={(selected) => selected || "Select Frequency"}
                    >
                      {Array.from({ length: 100 }, (_, i) => i + 1).map(
                        (num) => (
                          <MenuItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Month" : "Months"}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <Typography color="error" variant="caption">
                    {errors?.maintainanceFrequency}
                  </Typography>
                </div>

                {/* Maintenance Due Date */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Maintenance Due Date  <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={
                      formData.currentItem.assetMaintenance.maintenanceDueDate
                    }
                    onChange={(newValue) =>
                      handleAssetMaintenanceChange(
                        "maintenanceDueDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: datePickerStyles,
                      },
                    }}
                  />
                  <Typography color="error" variant="caption">
                    {errors?.maintainanceDueDate}
                  </Typography>
                </div>

                {/* Lifecycle Expiry Date */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Lifecycle Expiry Date  <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={
                      formData.currentItem.assetMaintenance.lifecycleExpiryDate
                    }
                    onChange={(newValue) =>
                      handleAssetMaintenanceChange(
                        "lifecycleExpiryDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: datePickerStyles,
                      },
                    }}
                  />
                  <Typography color="error" variant="caption">
                    {errors?.lifecycleExpiryDate}
                  </Typography>
                </div>

                {/* Warranty Expire Date */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Warranty Expire Date
                  </InputLabel>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={
                      formData.currentItem.assetMaintenance.warrantyExpireDate
                    }
                    onChange={(newValue) =>
                      handleAssetMaintenanceChange(
                        "warrantyExpireDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: datePickerStyles,
                      },
                    }}
                  />
                </div>
              </div>

              {/* Second Row: Important Link and Warranty Upload */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 300px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Important Link
                  </InputLabel>
                  <CustomTextField
                    fullWidth
                    size="small"
                    sx={textFieldStyles}
                    value={formData.currentItem.assetMaintenance.importantLink}
                    onChange={(e) =>
                      handleAssetMaintenanceChange(
                        "importantLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div style={{ flex: "1 1 300px" }}>
                  <InputLabel sx={{ color: "black" }}>
                    Warranty Upload
                  </InputLabel>
                  <TextField
                    sx={textFieldStyles}
                    fullWidth
                    size="small"
                    variant="outlined"
                    value={
                      formData.currentItem.assetMaintenance.warrantyUpload
                        ?.name || ""
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => handleIconClick("warranty")}
                            size="small"
                            sx={{ color: "#9e9e9e" }}
                          >
                            <AttachmentIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        // border: "1px solid #9e9e9e",
                      },

                    }}
                  />
                  <input

                    type="file"
                    ref={warrantyFileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, "warranty")}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFF",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "medium",
                  marginBottom: "16px",
                  color: "black",
                }}
              >
                Add Products Serial No
              </Typography>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                {Array.from({
                  length: Math.max(
                    1,
                    parseInt(formData.currentItem.quantity) || 1
                  ),
                }).map((_, index) => (
                  <div key={`serial-${index}`}>
                    <InputLabel sx={{ color: "black" }}>
                      Serial No {index + 1}  <span style={{ color: "red" }}>*</span>
                    </InputLabel>
                    <TextField
                      fullWidth
                      size="small"
                      sx={textFieldStyles}
                      value={
                        formData.currentItem.serialNumbers[
                        `serialNo${index + 1}`
                        ] || ""
                      }
                      onChange={(e) =>
                        handleSerialNumbersChange(
                          `serialNo${index + 1}`,
                          e.target.value
                        )
                      }
                      error={Boolean(serialErrors[`serialNo${index + 1}`])}
                    />
                    <Typography color="error" variant="caption">
                      {serialErrors[`serialNo${index + 1}`]}
                    </Typography>
                  </div>
                ))}
              </div>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  sx={{
                    backgroundColor: "#DB3027",
                    color: "white",
                  }}
                  onClick={() => {
                    handleAddItem();
                  }}
                >
                  Add Item
                </Button>
              </Box>
              {formData.currentItem.freeProduct &&
                formData.currentItem.freeQuantity && (
                  <>
                    <Typography
                      sx={{
                        fontWeight: "medium",
                        marginBottom: "16px",
                        color: "black",
                      }}
                    >
                      Add Free Products Serial No
                    </Typography>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {Array.from({
                        length: Math.max(
                          1,
                          parseInt(formData.currentItem.freeQuantity) || 0
                        ),
                      }).map((_, index) => (
                        <div key={`free-serial-${index}`}>
                          <InputLabel sx={{ color: "black" }}>
                            Serial No {index + 1}  <span style={{ color: "red" }}>*</span>
                          </InputLabel>
                          <TextField
                            fullWidth
                            size="small"
                            sx={textFieldStyles}
                            value={
                              formData.currentItem.freeSerialNumbers[
                              `serialNo${index + 1}`
                              ] || ""
                            }
                            onChange={(e) =>
                              handleFreeSerialNumbersChange(
                                `serialNo${index + 1}`,
                                e.target.value
                              )
                            }
                            error={Boolean(
                              freeSerialErrors[`serialNo${index + 1}`]
                            )}
                          />
                          <Typography variant="caption" color="error">
                            {freeSerialErrors[`serialNo${index + 1}`]}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </div>
            {/* Table Section */}
            <Box
              style={{ marginTop: "16px" }}
              sx={{
                width: {
                  xs: "100%", // Full width on extra small screens
                  sm: "100%", // Full width on small screens
                  md: "100%", // Full width on medium screens (adjust if needed)
                  lg: "1000px", // Fixed width on large screens
                  xl: "1400px", // Wider fixed width on extra large screens
                },
                overflow: "auto",
                mx: "auto", // Center the box horizontally
                px: { xs: 1, sm: 1 }, // Add some horizontal padding on smaller screens
              }}
            >
              <MaterialReactTable
                columns={columns}
                data={addedItems}
                initialState={{
                  density: "compact",
                }}
                muiTableHeadCellProps={{
                  sx: {
                    backgroundColor: "#FFE3E1",
                    color: "#333",
                  },
                }}
                muiTableContainerProps={{
                  sx: {
                    width: "100%",
                    overflowX: "auto",
                    maxWidth: "100%",
                  },
                }}
                meta={{
                  handleDeleteRow: (id) => {
                    setAddedItems((prevItems) =>
                      prevItems.filter((item) => item.id !== id)
                    );
                  },
                }}
                renderBottomToolbar={({ table }) => (
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "16px",
                      border: "1px solid #e0e0e0",
                      marginTop: "-1px", // To connect with the table border
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      Grand Total: ₹{grandTotal.toFixed(2)}
                    </Typography>
                  </div>
                )}
              />
            </Box>
          </div>
        </div>

        {/* Create GR Button */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateGR}
            disabled={createGR}
            sx={{
              padding: "8px 24px",
              textTransform: "none",
              fontWeight: "medium",
              borderRadius: "4px",
            }}
          >
            {createGR ? "Creating GR..." : "Create GR"}
          </Button>
        </div>
        <Dialog
          open={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
            Create New Product
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {productModalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {productModalError}
              </Alert>
            )}
            
            {loadingSpecs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box component="form" noValidate sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                {/* Product Name */}
                <div>
                  <InputLabel sx={inputLabelStyle}>Product Name <span style={{ color: "red" }}>*</span></InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter product name"
                    value={newProductFormData.productName}
                    onChange={(e) =>
                      setNewProductFormData((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    sx={textFieldStyles}
                  />
                </div>

                {/* Dynamic Specification / Attribute rows – always shown */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "#555" }}>
                      Specifications / Attributes
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setCustomAttrs((prev) => [...prev, { name: "", value: "" }])}
                      sx={{ textTransform: "none", fontSize: "12px", color: "#DB3027" }}
                    >
                      + Add Item
                    </Button>
                  </Box>
                  {customAttrs.length === 0 && (
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      Click "+ Add Item" to add attributes like RAM: 8GB
                    </Typography>
                  )}
                  {customAttrs.map((attr, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        placeholder="Name (e.g. RAM)"
                        value={attr.name}
                        sx={{ flex: 1, ...textFieldStyles }}
                        onChange={(e) =>
                          setCustomAttrs((prev) =>
                            prev.map((a, i) => i === idx ? { ...a, name: e.target.value } : a)
                          )
                        }
                      />
                      <TextField
                        size="small"
                        placeholder="Value (e.g. 8GB)"
                        value={attr.value}
                        sx={{ flex: 1, ...textFieldStyles }}
                        onChange={(e) =>
                          setCustomAttrs((prev) =>
                            prev.map((a, i) => i === idx ? { ...a, value: e.target.value } : a)
                          )
                        }
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setCustomAttrs((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <img src={Deleteicon1} alt="delete" width={14} height={14} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
            <Button onClick={() => setIsProductModalOpen(false)} sx={{ color: "#666", textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProductSubmit}
              disabled={isProductSubmitting || loadingSpecs}
              variant="contained"
              sx={{
                backgroundColor: "#DB3027",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#b8241d",
                },
              }}
            >
              {isProductSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </div>
  );
};

export default CreateGr;
