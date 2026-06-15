import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Api";
import { ensureArray } from "../../../utils/ensureArray";
import { CustomTextField } from "../../../utils/CustomTextField";

const ProductForm = ({ onBack, productId }) => {
  const isEditMode = Boolean(productId);
  const [formData, setFormData] = useState({
    productName: "",
    lifeCycleAging: "",
    brand: "",
    category: "",
    minStockQty: "",


    costPrice: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    productName: "",
    // lifeCycleAging: "",
    brand: "",
    category: "",
    // minStockQty: "",
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSpecFields, setAllSpecFields] = useState([]);
  const [specFields, setSpecFields] = useState([]);
  const [existingProduct, setExistingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const lifeCycleOptions = Array.from({ length: 100 }, (_, i) => i + 1);

  const token = localStorage.getItem('token');
  const apiConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const fetchSpecFieldsByCategory = async (categoryId) => {
    if (!categoryId) {
      setSpecFields([]);
      return [];
    }

    try {
      setLoadingSpecs(true);
      const response = await axios.get(
        `${baseUrl}/catalog/additional/categories/${categoryId}/specfields`,
        apiConfig
      );

      const specFieldsData = ensureArray(response.data?.data).map(item =>
        item.specField ? { ...item.specField } : null
      ).filter(Boolean);

      setSpecFields(specFieldsData);
      return specFieldsData;
    } catch (err) {
      console.error("Error fetching spec fields:", err);
      setError("Failed to load specifications for this category.");
      return [];
    } finally {
      setLoadingSpecs(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const requests = [
          axios.get(`${baseUrl}/super-admin/brands`, apiConfig),
          axios.get(`${baseUrl}/catalog/categories`, apiConfig),
          axios.get(`${baseUrl}/catalog/specfields?limit=1000`, apiConfig),
        ];

        if (isEditMode) {
          requests.push(axios.get(`${baseUrl}/catalog/products/${productId}`, apiConfig));
        }


        const responses = await Promise.all(requests);


        setBrands(ensureArray(responses[0].data?.data));
        setCategories(ensureArray(responses[1].data?.data));
        setAllSpecFields(ensureArray(responses[2].data?.data?.data || responses[2].data?.data));


        if (isEditMode && responses[3]?.data) {
          const productResponse = responses[3].data;
          const productData = productResponse.data;

          setExistingProduct(productData);

          const initialFormData = {
            productName: productData.name || "",
            lifeCycleAging: productData.lifeCycleAging || "",
            brand: productData.brand?.name || "",
            category: productData.category?.name || "",
            minStockQty: productData.msq || "",
            description: productData.description || "",
          };

          if (productData.category?.id) {
            const catSpecs = await fetchSpecFieldsByCategory(productData.category.id);

            const extraSpecs = [];
            if (productData.productSpecValue) {
              productData.productSpecValue.forEach(spec => {
                initialFormData[`spec_${spec.specFieldId}`] = spec.value || "";
                if (spec.specField && !catSpecs.some(fs => fs.id === spec.specFieldId)) {
                  extraSpecs.push(spec.specField);
                }
              });
            }
            if (extraSpecs.length > 0) {
              setSpecFields(prev => [...prev, ...extraSpecs]);
            }
          }

          setFormData(initialFormData);
        }

        setLoading(false);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load form data. Please try again.");
        setLoading(false);
      }
    };

    fetchAllData();


    return () => {
      setFormData({
        productName: "",
        lifeCycleAging: "",
        brand: "",
        category: "",
        minStockQty: "",
        costPrice: "",
        description: "",
      });
      setSpecFields([]);
    };
  }, [productId]);

  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(
        c => c.name === formData.category
      );

      if (selectedCategory?.id) {
        fetchSpecFieldsByCategory(selectedCategory.id);
      } else {
        setSpecFields([]);
      }
    } else {
      setSpecFields([]);
    }
  }, [formData.category, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (success) setSuccess(false);

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
      isValid = false;
    } else if (formData.productName.length > 100) {
      newErrors.productName = "Product name cannot exceed 100 characters";
      isValid = false;
    } else {
      newErrors.productName = "";
    }

    // if (!formData.lifeCycleAging) {
    //   newErrors.lifeCycleAging = "Life Cycle Ageing is required";
    //   isValid = false;
    // } else {
    //   newErrors.lifeCycleAging = "";
    // }

    if (!formData.brand) {
      newErrors.brand = "Brand is required";
      isValid = false;
    } else {
      newErrors.brand = "";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
      isValid = false;
    } else {
      newErrors.category = "";
    }

    // if (!formData.minStockQty) {
    //   newErrors.minStockQty = "Minimum stock quantity is required";
    //   isValid = false;
    // } 
    // // else if (isNaN(formData.minStockQty) || Number(formData.minStockQty) <= 0) {
    // //   newErrors.minStockQty = "Must be a positive number";
    // //   isValid = false;
    // // } 
    // else if (Number(formData.minStockQty) > 1000000) {
    //   newErrors.minStockQty = "Value too large";
    //   isValid = false;
    // } else {
    //   newErrors.minStockQty = "";
    // }



    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const selectedBrand = brands.find((b) => b.name === formData.brand);
      const selectedCategory = categories.find((c) => c.name === formData.category);

      const specValuesArray = specFields
        .filter(field => field && field.id)
        .map(field => ({
          specFieldId: field.id,
          value: formData[`spec_${field.id}`] || ""
        }))
        .filter(spec => spec.value.trim() !== "");

      const payload = {
        brandId: selectedBrand?.id || null,
        categoryId: selectedCategory?.id || null,
        name: formData.productName.trim(),
        lifeCycleAging: parseInt(formData.lifeCycleAging),
        msq: formData.minStockQty || null,
        description: formData.description.trim() || null,
        specValues: specValuesArray,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === null && !key.endsWith("Id")) {
          delete payload[key];
        }
      });

      const url = isEditMode
        ? `${baseUrl}/catalog/products/${productId}`
        : `${baseUrl}/catalog/products`;

      const method = isEditMode ? "put" : "post";

      const response = await axios[method](url, payload, apiConfig);

      setSuccess(true);
      setTimeout(() => onBack && onBack(), 300);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        "Operation failed. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          mb: 2,
        }}
        onClick={() => onBack && onBack()}
      >
        <ArrowLeft />
        {/* {isEditMode ? "Edit Product" : "Add New Product"} */}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isEditMode
            ? "Product updated successfully! Redirecting..."
            : "Product created successfully! Redirecting..."}
        </Alert>
      )}

      <Paper elevation={1} sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
        {/* <Typography fontSize={16} fontWeight={600} mb={3}>
          Basic Information
        </Typography> */}

        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Product Name <span className="reuired_field">*</span></Typography>
              <CustomTextField
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
                error={!!errors.productName}
                helperText={errors.productName}
              />
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>
                Life Cycle Ageing (Months)
              </Typography>
              <CustomTextField
                select
                name="lifeCycleAging"
                value={formData.lifeCycleAging}
                onChange={handleChange}
                // error={!!errors.lifeCycleAging}
                // helperText={errors.lifeCycleAging}
                placeholder="Select Life Cycle (Months)"
              >
                {lifeCycleOptions.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>

          </div>

          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Brand <span className="reuired_field">*</span></Typography>
              <CustomTextField
                select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                error={!!errors.brand}
                helperText={errors.brand}
              >
                <MenuItem value="" disabled>
                  {brands.length > 0 ? "Select Brand" : "Data Not Found"}
                </MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>

            <div style={columnStyle}>
              <Typography mb={1}>Category <span className="reuired_field">*</span></Typography>
              <CustomTextField
                select
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
                helperText={errors.category}
              >
                <MenuItem value="" disabled>
                  {categories.length > 0 ? "Select Category" : "Data Not Found"}
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </div>
          </div>

          <div style={rowStyle}>
            <div style={columnStyle}>
              <Typography mb={1}>Minimum Stock Quantity</Typography>
              <CustomTextField
                name="minStockQty"
                type="number"
                placeholder="e.g. 0"
                value={formData.minStockQty}
                onChange={handleChange}
                error={!!errors.minStockQty}
                helperText={errors.minStockQty}
                inputProps={{ min: 0 }}
              />
            </div>
            <div style={columnStyle}>
              {/* Left blank for row balance */}
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ flex: "1 1 100%" }}>
              <Typography mb={1}>Description</Typography>
              <CustomTextField
                name="description"
                placeholder="Enter description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Add Attribute UI */}
          {formData.category && (
            <Box sx={{ mt: 3, mb: 2, p: 2, border: "1px dashed #ced4da", borderRadius: 1, backgroundColor: "#f8f9fa" }}>
              <Typography fontWeight={600} fontSize={14} mb={1}>
                Dynamic Attributes
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography fontSize={13}>
                  Add another attribute/specification for this product:
                </Typography>
                <CustomTextField
                  select
                  sx={{ width: 250, backgroundColor: "#fff" }}
                  value=""
                  onChange={(e) => {
                    const selectedFieldId = parseInt(e.target.value);
                    const selectedField = allSpecFields.find(f => f.id === selectedFieldId);
                    if (selectedField) {
                      setSpecFields(prev => [...prev, selectedField]);
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Attribute
                  </MenuItem>
                  {allSpecFields
                    .filter(field => !specFields.some(existing => existing.id === field.id))
                    .map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.name}
                      </MenuItem>
                    ))}
                </CustomTextField>
              </Box>
            </Box>
          )}


          {specFields.length > 0 && (
            <>
              <Typography fontSize={16} fontWeight={600} mb={2} mt={3}>
                Specifications
              </Typography>

              {loadingSpecs ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                specFields
                  .reduce((rows, spec, index) => {
                    if (index % 2 === 0) rows.push([spec]);
                    else rows[rows.length - 1].push(spec);
                    return rows;
                  }, [])
                  .map((row, rowIndex) => (
                    <div key={`spec-row-${rowIndex}`} style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                      {row.map((spec) => {
                        // Deduplicate options
                        const uniqueOptions = [];
                        const seen = new Set();
                        if (Array.isArray(spec.options)) {
                          spec.options.forEach((opt) => {
                            if (!seen.has(opt.value)) {
                              seen.add(opt.value);
                              uniqueOptions.push(opt);
                            }
                          });
                        }

                        return (
                          <div key={spec.id} style={{ flex: 1 }}>
                            <Typography mb={1} fontWeight={500}>
                              {spec.name}
                            </Typography>

                            {spec.fieldType === "DROPDOWN" ? (
                              <CustomTextField
                                select
                                fullWidth
                                name={`spec_${spec.id}`}
                                value={formData[`spec_${spec.id}`] || ""}
                                onChange={handleChange}
                              >
                                <MenuItem value="" disabled>
                                  Select {spec.name}
                                </MenuItem>
                                {uniqueOptions.map((option) => (
                                  <MenuItem key={option.id} value={option.value}>
                                    {option.value}
                                  </MenuItem>
                                ))}
                              </CustomTextField>
                            ) : spec.fieldType === "RADIO" ? (
                              <Box sx={{ display: "flex", flexDirection: "column" }}>
                                {uniqueOptions.map((option) => (
                                  <Box key={option.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    <input
                                      type="radio"
                                      id={`spec_${spec.id}_${option.id}`}
                                      name={`spec_${spec.id}`}
                                      value={option.value}
                                      checked={formData[`spec_${spec.id}`] === option.value}
                                      onChange={handleChange}
                                      style={{ marginRight: 8 }}
                                    />
                                    <label htmlFor={`spec_${spec.id}_${option.id}`}>
                                      {option.value}
                                    </label>
                                  </Box>
                                ))}
                              </Box>
                            ) : spec.fieldType === "CHECKBOX" ? (
                              <Box sx={{ display: "flex", flexDirection: "column" }}>
                                {uniqueOptions.map((option) => {
                                  const values = formData[`spec_${spec.id}`] ?
                                    formData[`spec_${spec.id}`].split(',').map(v => v.trim()) : [];
                                  const checked = values.includes(option.value);
                                  return (
                                    <Box key={option.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                      <input
                                        type="checkbox"
                                        id={`spec_${spec.id}_${option.id}`}
                                        name={`spec_${spec.id}`}
                                        value={option.value}
                                        checked={checked}
                                        onChange={(e) => {
                                          let newValues;
                                          if (e.target.checked) {
                                            newValues = [...values, option.value];
                                          } else {
                                            newValues = values.filter(v => v !== option.value);
                                          }
                                          const newValue = newValues.join(', ');
                                          setFormData(prev => ({ ...prev, [`spec_${spec.id}`]: newValue }));
                                        }}
                                        style={{ marginRight: 8 }}
                                      />
                                      <label htmlFor={`spec_${spec.id}_${option.id}`}>
                                        {option.value}
                                      </label>
                                    </Box>
                                  );
                                })}
                              </Box>
                            ) : spec.fieldType === "TEXT" ? (
                              <CustomTextField
                                name={`spec_${spec.id}`}
                                placeholder={`Enter ${spec.name}`}
                                value={formData[`spec_${spec.id}`] || ""}
                                onChange={handleChange}
                                fullWidth
                              />
                            ) : (
                              <CustomTextField
                                name={`spec_${spec.id}`}
                                placeholder={`Enter ${spec.name}`}
                                value={formData[`spec_${spec.id}`] || ""}
                                onChange={handleChange}
                                fullWidth
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
              )}
            </>
          )}


          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              onClick={() => onBack && onBack()}
              disabled={submitting}
              className="Global-Button3"

            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="Global-Button2"
              disabled={submitting || loadingSpecs}

            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProductForm;
