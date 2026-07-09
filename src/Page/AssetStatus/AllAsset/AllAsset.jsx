import React, { useState, useEffect, useMemo } from "react";
import EditInventory from "../../GrEntry/Installation/EditInventory";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  InputLabel,
  TextField,
  styled,
  Snackbar,
  Alert,
  FormGroup,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Collapse,
} from "@mui/material";
import { Grid } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/sap.png";
import { baseUrl } from "../../Api";
import log from "../../../assets/Stock/log.png";
import { useNavigate } from "react-router-dom";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import useInputStyle from "../../../CustomHooks/useInputStyle";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import { CustomTextField } from "../../../utils/CustomTextField";
import PdfExportModal from "../PdfExportModal/PdfExportModal";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const StyledSelect = styled(Select)(() => ({
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

const AllAsset = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sapCodeInput, setSapCodeInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Filter states for all columns
  const [statusFilter, setStatusFilter] = useState("all");
  const [usedStatusFilter, setUsedStatusFilter] = useState("all");
  const [installationStatusFilter, setInstallationStatusFilter] =
    useState("all");
  const [assetIdFilter, setAssetIdFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sapCodeFilter, setSapCodeFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [serialNumberFilter, setSerialNumberFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [grNoFilter, setGrNoFilter] = useState("");
  const [poNoFilter, setPoNoFilter] = useState("");
  const [invoiceNoFilter, setInvoiceNoFilter] = useState("");
  const [poValueFilter, setPoValueFilter] = useState("");
  const [warrantyAmcFilter, setWarrantyAmcFilter] = useState("");
  const [warrantyExpiryDateFilter, setWarrantyExpiryDateFilter] = useState("");
  const [lastAuditDateFilter, setLastAuditDateFilter] = useState("");
  const [maintenanceDueDateFilter, setMaintenanceDueDateFilter] = useState("");
  const [lifecycleExDateFilter, setLifecycleExDateFilter] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState("");
  const [grDateFilter, setGrDateFilter] = useState("");
  const [poDateFilter, setPoDateFilter] = useState("");
  const [totalCostFilter, setTotalCostFilter] = useState("");
  const [acquisitionDateFilter, setAcquisitionDateFilter] = useState("");

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter options from backend
  const [statusOptions, setStatusOptions] = useState([]);
  const [usedStatusOptions, setUsedStatusOptions] = useState([]);
  const [installationStatusOptions, setInstallationStatusOptions] = useState(
    []
  );
  const [unitOptions, setUnitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [usernameOptions, setUsernameOptions] = useState([]);
  const [assetTypeOptions, setAssetTypeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [productCategoryOptions, setProductCategoryOptions] = useState([]);

  // Dynamic filter states for spec and software fields
  const [specFieldFilters, setSpecFieldFilters] = useState({});
  const [softwareFieldFilters, setSoftwareFieldFilters] = useState({});

  // ID mappings for spec and software fields
  const [specFieldIdMapping, setSpecFieldIdMapping] = useState({});
  const [softwareIdMapping, setSoftwareIdMapping] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [remark, setRemark] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const { inputLabelStyle, textFieldStyles } = useInputStyle();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("profile"));
      if (userData?.data?.role) {
        setUserRole(userData.data.role);
      }
    } catch (err) {
      console.error("Failed to parse user data", err);
    }
  }, []);

  // Function to extract unique values from data for filter options
  const extractFilterOptions = (data, key, transformFn = null) => {
    const values = new Set();
    data.forEach((item) => {
      let value = item[key];
      if (transformFn) {
        value = transformFn(value);
      }
      if (value !== undefined && value !== null && value !== "NA") {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  // Fetch all filter options from backend
  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // First, get the total count of assets to request all data
      const countResponse = await fetch(
        `${baseUrl}/gr/inventory/all-assets?limit=1&page=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!countResponse.ok) {
        throw new Error("Failed to fetch asset count");
      }

      const countResult = await countResponse.json();
      const totalRows = countResult.data?.total || 0;

      if (totalRows === 0) {
        // No data available
        setStatusOptions([]);
        setUsedStatusOptions([]);
        setInstallationStatusOptions([]);
        setUnitOptions([]);
        setLocationOptions([]);
        setUsernameOptions([]);
        setAssetTypeOptions([]);
        setDepartmentOptions([]);
        setMakeOptions([]);
        setModelOptions([]);
        setProductCategoryOptions([]);
        return;
      }

      // Fetch all assets with the total limit
      const response = await fetch(
        `${baseUrl}/gr/inventory/all-assets?limit=${totalRows}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filter options");
      }

      const result = await response.json();

      if (result.status && result.data) {
        const transformedData = result.data.data.map((item) => {
          const assignedStatus = item.assignedStatus || "NA";
          const isUsed = item.isUsed ? "Used" : "New";
          const installationStatus = item.installationStatus || false;
          const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;

          return {
            status: assignedStatus,
            usedStatus: isUsed,
            installationStatus: installationStatus,
            unit: item.unit?.name || "NA",
            location: item.location?.name || "NA",
            username: assignedUser?.name || "NA",
            assetType: item.grInventoryProduct?.product?.category?.name || "NA",
            department: assignedUser?.department?.name || "NA",
            make: item.grInventoryProduct?.product?.brand?.name || "NA",
            model: item.grInventoryProduct?.product?.name || "NA",
            productCategory:
              item.grInventoryProduct?.product?.category?.name || "NA",
          };
        });

        // Extract all filter options from the complete dataset
        setStatusOptions(extractFilterOptions(transformedData, "status"));
        setUsedStatusOptions(
          extractFilterOptions(transformedData, "usedStatus")
        );
        setInstallationStatusOptions(
          extractFilterOptions(transformedData, "installationStatus", (val) =>
            val ? "true" : "false"
          )
        );
        setUnitOptions(extractFilterOptions(transformedData, "unit"));
        setLocationOptions(extractFilterOptions(transformedData, "location"));
        setUsernameOptions(extractFilterOptions(transformedData, "username"));
        setAssetTypeOptions(extractFilterOptions(transformedData, "assetType"));
        setDepartmentOptions(
          extractFilterOptions(transformedData, "department")
        );
        setMakeOptions(extractFilterOptions(transformedData, "make"));
        setModelOptions(extractFilterOptions(transformedData, "model"));
        setProductCategoryOptions(
          extractFilterOptions(transformedData, "productCategory")
        );
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      // Set empty arrays on error
      setStatusOptions([]);
      setUsedStatusOptions([]);
      setInstallationStatusOptions([]);
      setUnitOptions([]);
      setLocationOptions([]);
      setUsernameOptions([]);
      setAssetTypeOptions([]);
      setDepartmentOptions([]);
      setMakeOptions([]);
      setModelOptions([]);
      setProductCategoryOptions([]);
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // First, get the total count of assets to fetch all data for complete field mapping
      const countResponse = await fetch(
        `${baseUrl}/gr/inventory/all-assets?limit=1&page=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!countResponse.ok) {
        throw new Error("Failed to fetch asset count");
      }

      const countResult = await countResponse.json();
      const totalCount = countResult.data?.total || 0;

      // If there are no assets, set empty data and return
      if (totalCount === 0) {
        setData([]);
        setAllData([]);
        setTotalRows(0);
        setTotalPages(0);
        setDynamicColumns([]);
        return;
      }

      // Fetch ALL data to get complete field mapping for specFields and software
      const allDataResponse = await fetch(
        `${baseUrl}/gr/inventory/all-assets?limit=${totalCount}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!allDataResponse.ok) {
        throw new Error("Failed to fetch all data for field mapping");
      }

      const allDataResult = await allDataResponse.json();

      if (allDataResult.status && allDataResult.data) {
        // Collect ALL spec field names and IDs from complete dataset
        const allSpecFieldNames = new Set();
        const allSoftwareNames = new Set();
        const specIdMap = {};
        const softwareIdMap = {};

        allDataResult.data.data.forEach((item) => {
          // Collect ALL spec field names and IDs
          item.specValues?.forEach((spec) => {
            if (spec.specField?.name) {
              allSpecFieldNames.add(spec.specField.name);
              if (spec.specField?.id) {
                specIdMap[spec.specField.name] = spec.specField.id;
              }
            }
          });

          // Collect ALL software names and IDs
          item.softwareInstalls?.forEach((software) => {
            if (software.softwares?.name) {
              allSoftwareNames.add(software.softwares.name);
              if (software.softwares?.id) {
                softwareIdMap[software.softwares.name] = software.softwares.id;
              }
            }
          });
        });

        // Update ID mappings with complete dataset
        setSpecFieldIdMapping(specIdMap);
        setSoftwareIdMapping(softwareIdMap);

        // Now fetch paginated data for display with filters
        const { pageIndex, pageSize } = pagination;

        // Build sort parameters
        let sortBy = "name";
        let sortOrder = "desc";
        if (sorting.length > 0) {
          sortBy = sorting[0].id;
          sortOrder = sorting[0].desc ? "desc" : "asc";
        }

        // Build the API URL with query parameters
        const url = new URL(`${baseUrl}/gr/inventory/all-assets`);
        url.searchParams.append("page", (pageIndex + 1).toString());
        url.searchParams.append("sortBy", sortBy);
        url.searchParams.append("sortOrder", sortOrder);
        url.searchParams.append("limit", pageSize.toString());

        if (globalFilter) {
          url.searchParams.append("search", globalFilter);
        }

        // Add all filters to API call if they're set
        if (statusFilter !== "all") {
          url.searchParams.append("status", statusFilter);
        }
        if (usedStatusFilter !== "all") {
          url.searchParams.append("isUsed", usedStatusFilter === "Used");
        }
        if (installationStatusFilter !== "all") {
          url.searchParams.append(
            "installationStatus",
            installationStatusFilter === "true"
          );
        }
        if (assetIdFilter) {
          url.searchParams.append("assetId", assetIdFilter);
        }
        if (unitFilter) {
          url.searchParams.append("unit", unitFilter);
        }
        if (locationFilter) {
          url.searchParams.append("location", locationFilter);
        }
        if (sapCodeFilter) {
          url.searchParams.append("sapCode", sapCodeFilter);
        }
        if (usernameFilter) {
          url.searchParams.append("username", usernameFilter);
        }
        if (assetTypeFilter) {
          url.searchParams.append("assetType", assetTypeFilter);
        }
        if (serialNumberFilter) {
          url.searchParams.append("serialNumber", serialNumberFilter);
        }
        if (descriptionFilter) {
          url.searchParams.append("description", descriptionFilter);
        }
        if (emailFilter) {
          url.searchParams.append("email", emailFilter);
        }
        if (departmentFilter) {
          url.searchParams.append("department", departmentFilter);
        }
        if (makeFilter) {
          url.searchParams.append("make", makeFilter);
        }
        if (modelFilter) {
          url.searchParams.append("model", modelFilter);
        }
        if (grNoFilter) {
          url.searchParams.append("grNo", grNoFilter);
        }
        if (poNoFilter) {
          url.searchParams.append("poNo", poNoFilter);
        }
        if (invoiceNoFilter) {
          url.searchParams.append("invoiceNo", invoiceNoFilter);
        }
        if (poValueFilter) {
          url.searchParams.append("poValue", poValueFilter);
        }
        if (warrantyAmcFilter) {
          url.searchParams.append("warrantyAmc", warrantyAmcFilter);
        }
        if (warrantyExpiryDateFilter) {
          url.searchParams.append(
            "warrantyExpiryDate",
            warrantyExpiryDateFilter
          );
        }
        if (lastAuditDateFilter) {
          url.searchParams.append("lastAuditDate", lastAuditDateFilter);
        }
        if (maintenanceDueDateFilter) {
          url.searchParams.append(
            "maintenanceDueDate",
            maintenanceDueDateFilter
          );
        }
        if (lifecycleExDateFilter) {
          url.searchParams.append("lifecycleExDate", lifecycleExDateFilter);
        }
        if (productCategoryFilter) {
          url.searchParams.append("productCategory", productCategoryFilter);
        }
        if (invoiceDateFilter) {
          url.searchParams.append("invoiceDate", invoiceDateFilter);
        }
        if (grDateFilter) {
          url.searchParams.append("grDate", grDateFilter);
        }
        if (poDateFilter) {
          url.searchParams.append("poDate", poDateFilter);
        }
        if (totalCostFilter) {
          url.searchParams.append("totalCost", totalCostFilter);
        }
        if (acquisitionDateFilter) {
          url.searchParams.append("acquisitionDate", acquisitionDateFilter);
        }

        // Add date range filters if they're set
        if (startDate) {
          url.searchParams.append("startDate", startDate);
        }
        if (endDate) {
          url.searchParams.append("endDate", endDate);
        }

        console.log("API URL:", url.toString());

        // Prepare request body with id and value for spec and software filters
        const requestBody = {};

        // Add spec field filters with actual IDs
        if (Object.keys(specFieldFilters).length > 0) {
          requestBody.specFieldFilters = Object.entries(
            specFieldFilters
          ).reduce((acc, [fieldName, filterValue]) => {
            if (filterValue && specIdMap[fieldName]) {
              acc.push({
                id: specIdMap[fieldName],
                value: filterValue,
              });
            }
            return acc;
          }, []);
        }

        // Add software field filters with actual IDs
        if (Object.keys(softwareFieldFilters).length > 0) {
          requestBody.softwareFieldFilters = Object.entries(
            softwareFieldFilters
          ).reduce((acc, [fieldName, filterValue]) => {
            if (filterValue && softwareIdMap[fieldName]) {
              acc.push({
                id: softwareIdMap[fieldName],
                name: filterValue,
              });
            }
            return acc;
          }, []);
        }

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body:
            Object.keys(requestBody).length > 0
              ? JSON.stringify(requestBody)
              : undefined,
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (result.status && result.data) {
          // Transform data with dynamic spec fields using ALL field names
          const transformedData = result.data.data.map((item) => {
            // Create objects to hold spec and software values
            const specFields = {};
            const softwareFields = {};

            // Populate spec fields using ALL field names
            allSpecFieldNames.forEach((name) => {
              const spec = item.specValues?.find(
                (s) => s.specField?.name === name
              );
              specFields[name] = spec?.value || "NA";
            });

            // Populate software fields using ALL field names
            allSoftwareNames.forEach((name) => {
              const software = item.softwareInstalls?.find(
                (s) => s.softwares?.name === name
              );
              softwareFields[name] = software?.value || "NA";
            });

            // Get asset type and category
            const assetType =
              item.grInventoryProduct?.product?.category?.name || "NA";
            const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;

            // Get assigned status
            const assignedStatus = item.assignedStatus || "NA";

            return {
              uuid: item.uuid,
              id: item?.id,
              username: assignedUser?.name || "NA",
              assetType,
              serialNumber: item.serialNo1 || "NA",
              description: item.grInventoryProduct?.description || "NA",
              assetTag: item.grInventoryProduct?.product?.uuid || "NA",
              usedByEmail: assignedUser?.email || "NA",
              sapCode: item.sapCode || "NA",
              acquisitionDate: item.grInventoryProduct?.createdAt || "NA",
              department: assignedUser?.department?.name || "NA",
              unit: item.unit?.name || "NA",
              location: item.location?.name || "NA",
              assignedOn: item.createdAt || "NA",
              make: item.grInventoryProduct?.product?.brand?.name || "NA",
              model: item.grInventoryProduct?.product?.name || "NA",
              serialNumberAlt: item.serialNo2 || "NA",
              assetState: assignedStatus,
              grNo: item?.grInventoryProduct?.grDetails?.grId || "NA",
              poNo: item?.grInventoryProduct?.grDetails?.sapId || "NA",
              poDate:
                item?.grInventoryProduct?.grDetails?.sapDate ? dateTimeHelper.formatDate(
                  item?.grInventoryProduct?.grDetails?.sapDate
                )
                  : "NA",
              invoiceNo:
                item?.grInventoryProduct?.grDetails?.invoiceNumber || "NA",
              invoiceDate: item?.grInventoryProduct?.grDetails?.invoiceDate
                ? dateTimeHelper.formatDate(
                  item.grInventoryProduct.grDetails.invoiceDate
                )
                : "NA",
              grDate: item?.grInventoryProduct?.grDetails?.grDate ? dateTimeHelper.formatDate(item?.grInventoryProduct?.grDetails?.grDate) : "NA",
              poValue: item.grInventoryProduct?.totalAmount || "NA",
              poNumber: "NA",
              warrantyAmc: item.grInventoryProduct?.warrantyTill || "NA",
              warrantyExpiryDate: item.grInventoryProduct?.warrantyTill || "NA",
              lastAuditDate: item.updatedAt || "NA",
              totalCost: item.totalCost || "NA",
              usedStatus: item.isUsed ? "Used" : "New",
              status: assignedStatus,
              isFree: item.isFree ? "Yes" : "No",
              maintenanceFrequency:
                item.grInventoryProduct?.maintenanceFrequency || "NA",
              maintenanceDueDate:
                item.grInventoryProduct?.maintenanceDueDate || "NA",
              lifecycleExDate: item.grInventoryProduct?.lifecycleExDate || "NA",
              grInventoryProductId: item.grInventoryProductId || "NA",
              isUsed: item.isUsed ? "Yes" : "No",
              createdBy: item.createdBy || "NA",
              updatedBy: item.updatedBy || "NA",
              createdAt: item.createdAt || "NA",
              updatedAt: item.updatedAt || "NA",
              productBrand:
                item.grInventoryProduct?.product?.brand?.name || "NA",
              productCategory:
                item.grInventoryProduct?.product?.category?.name || "NA",
              ratePerPiece: item.grInventoryProduct?.ratePerPiece || "NA",
              freeQty: item.grInventoryProduct?.freeQty || "NA",
              quantity: item.grInventoryProduct?.quantity || "NA",
              grDetailsId: item.grInventoryProduct?.grDetailsId || "NA",
              installationStatus: item.installationStatus || false,
              // Add all spec fields dynamically
              ...specFields,
              // Add all software fields dynamically
              ...softwareFields,
            };
          });

          setData(transformedData);
          setAllData(transformedData);
          setTotalRows(result.data.total || 0);
          setTotalPages(result.data.totalPages || 0);

          // Generate dynamic columns using ALL field names (not just current page)
          const specColumns = Array.from(allSpecFieldNames).map((name) => {
            // Get unique values from COMPLETE dataset, not just current page
            const uniqueValues = Array.from(
              new Set(
                allDataResult.data.data
                  .map((item) => {
                    const spec = item.specValues?.find(
                      (s) => s.specField?.name === name
                    );
                    return spec?.value || "NA";
                  })
                  .filter(
                    (value) =>
                      value !== "NA" && value !== undefined && value !== null
                  )
              )
            ).sort();

            return {
              accessorKey: name,
              header: name,
              size: 150,
              Filter: () => (
                <FormControl fullWidth variant="outlined" size="small">
                  <StyledSelect
                    value={specFieldFilters[name] || ""}
                    onChange={(e) =>
                      handleSpecFieldFilterChange(name, e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">All {name}</MenuItem>
                    {uniqueValues.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              ),
              filterVariant: "custom",
            };
          });

          const softwareColumns = Array.from(allSoftwareNames).map((name) => {
            // Get unique values from COMPLETE dataset
            const uniqueValues = Array.from(
              new Set(
                allDataResult.data.data
                  .map((item) => {
                    const software = item.softwareInstalls?.find(
                      (s) => s.softwares?.name === name
                    );
                    return software?.value || "NA";
                  })
                  .filter(
                    (value) =>
                      value !== "NA" && value !== undefined && value !== null
                  )
              )
            ).sort();

            return {
              accessorKey: name,
              header: name,
              size: 150,
              Filter: () => (
                <FormControl fullWidth variant="outlined" size="small">
                  <StyledSelect
                    value={softwareFieldFilters[name] || ""}
                    onChange={(e) =>
                      handleSoftwareFieldFilterChange(name, e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">All {name}</MenuItem>
                    {uniqueValues.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              ),
              filterVariant: "custom",
            };
          });

          setDynamicColumns([...specColumns, ...softwareColumns]);
        } else {
          console.error("API response format error:", result);
          showSnackbar("Failed to load data: Invalid response format", "error");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setAllData([]);
      showSnackbar(`Failed to load data: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle spec field filter changes
  const handleSpecFieldFilterChange = (fieldName, value) => {
    setSpecFieldFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle software field filter changes
  const handleSoftwareFieldFilterChange = (fieldName, value) => {
    setSoftwareFieldFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Add useEffect to trigger fetchData when dependencies change
  useEffect(() => {
    fetchData();
  }, [
    pagination,
    sorting,
    globalFilter,
    statusFilter,
    usedStatusFilter,
    installationStatusFilter,
    assetIdFilter,
    unitFilter,
    locationFilter,
    sapCodeFilter,
    usernameFilter,
    assetTypeFilter,
    serialNumberFilter,
    descriptionFilter,
    emailFilter,
    departmentFilter,
    makeFilter,
    modelFilter,
    grNoFilter,
    poNoFilter,
    invoiceNoFilter,
    poValueFilter,
    warrantyAmcFilter,
    warrantyExpiryDateFilter,
    acquisitionDateFilter,
    lastAuditDateFilter,
    maintenanceDueDateFilter,
    lifecycleExDateFilter,
    productCategoryFilter,
    invoiceDateFilter,
    grDateFilter,
    poDateFilter,
    startDate,
    endDate,
    specFieldFilters,
    softwareFieldFilters,
  ]);

  // Reset to first page when filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    globalFilter,
    statusFilter,
    usedStatusFilter,
    installationStatusFilter,
    assetIdFilter,
    unitFilter,
    locationFilter,
    sapCodeFilter,
    usernameFilter,
    assetTypeFilter,
    serialNumberFilter,
    descriptionFilter,
    emailFilter,
    departmentFilter,
    makeFilter,
    modelFilter,
    grNoFilter,
    poNoFilter,
    invoiceNoFilter,
    poValueFilter,
    warrantyAmcFilter,
    warrantyExpiryDateFilter,
    lastAuditDateFilter,
    maintenanceDueDateFilter,
    lifecycleExDateFilter,
    productCategoryFilter,
    invoiceDateFilter,
    grDateFilter,
    poDateFilter,
    startDate,
    endDate,
    specFieldFilters,
    softwareFieldFilters,
  ]);

  const handleViewAsset = (assetId) => {
    setSelectedAsset(assetId);
    setSapCodeInput("");
    setOpenModal(true);
  };

  // const addSapCode = async () => {
  //   if (!selectedAsset) return;

  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(
  //       `${baseUrl}/gr/add-sap-code/${selectedAsset}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ sapCode: sapCodeInput }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to add SAP code");
  //     }

  //     setOpenModal(false);
  //     showSnackbar("SAP code added successfully!", "success");
  //     fetchData();
  //   } catch (error) {
  //     console.error("Error adding SAP code:", error);
  //     showSnackbar("Failed to add SAP code", "error");
  //   }
  // };

  const handleDeleteAsset = (assetId) => {
    setAssetToDelete(assetId);
    setRemark("");
    setDeleteModalOpen(true);
  };

  const confirmSoftDeleteAsset = async () => {
    if (!assetToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/request/soft-delete/update/${assetToDelete}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remarks: remark || "soft-delete" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to soft delete asset");
      }

      setDeleteModalOpen(false);
      showSnackbar("Asset deleted successfully!", "success");
      fetchData();
    } catch (error) {
      console.error("Error soft deleting asset:", error);
      showSnackbar("Failed to delete asset", "error");
    }
  };

  const handleGoToLog = (id) => {
    navigate(`/log/${id}`);
  };

  const handleSetEditing = (item) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const columnHelper = createMRTColumnHelper();
  const baseColumns = [
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">Statuses</MenuItem>
            {Array.from(
              new Set(
                statusOptions.map(
                  (status) => productStatusHelper.getLabel(status) || status
                )
              )
            ).map((displayLabel, index) => (
              <MenuItem
                key={index}
                value={statusOptions.find(
                  (opt) =>
                    productStatusHelper.getLabel(opt) === displayLabel ||
                    opt === displayLabel
                )}
              >
                {displayLabel}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);

        return (
          <Chip
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: bg,
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
    }),
    columnHelper.accessor("usedStatus", {
      header: "Used Status",
      size: 140,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={usedStatusFilter}
            onChange={(e) => setUsedStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">Used Statuses</MenuItem>
            {usedStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
      Cell: ({ cell }) => {
        const status = cell.getValue();
        return (
          <Chip
            label={status}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: status === "Used" ? "#FFE3E1" : "#E1F5FE",
              color: status === "Used" ? "#D32F2F" : "#0288D1",
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
    }),

    columnHelper.accessor("installationStatus", {
      header: "Installation Status",
      size: 180,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={installationStatusFilter}
            onChange={(e) => setInstallationStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">Installation Statuses</MenuItem>
            {installationStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status === "true" ? "Installed" : "Not Installed"}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
      Cell: ({ cell, row }) => {
        const installationStatus = cell.getValue();
        const assetType = row.original.assetType;
        const isUntagged = ["Untagged", "untagged"].includes(
          String(row.original?.status || row.original?.assetState || "")
        );
        const shouldShowInstallationButton =
          assetType === "IT Assets" && !installationStatus && !isUntagged;

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  assetType !== "IT Assets"
                    ? "#4caf50"
                    : installationStatus
                      ? "#4caf50"
                      : "#f44336",
              }}
            />

            {shouldShowInstallationButton && (
              <IconButton
                onClick={() => handleSetEditing(row.original)}
                size="small"
                color="primary"
              >
                <img src={Editicon1} alt="edit" />
              </IconButton>
            )}
          </Box>
        );
      },
    }),

    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 130,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={assetIdFilter}
          onChange={(e) => setAssetIdFilter(e.target.value)}
          placeholder="Filter Asset ID"
          size="small"
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: "Action",
      size: 130,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => handleGoToLog(row?.original?.id)}
            size="small"
            color="primary"
          >
            <img height={20} width={20} src={log} alt="view" />
          </IconButton>

          {!row?.original?.sapCode || row?.original?.sapCode === "NA" ? (
            <IconButton
              onClick={() => handleViewAsset(row.original.id)}
              size="small"
              color="primary"
            >
              <img src={ViewIcon} alt="view" />
            </IconButton>
          ) : null}

          {userRole === "Super Admin" && (
            <IconButton
              onClick={() => handleDeleteAsset(row.original.id)}
              size="small"
              color="error"
            >
              <img src={Deleteicon1} alt="delete" />
            </IconButton>
          )}
        </Box>
      ),
    }),
    columnHelper.accessor("unit", {
      header: "Unit",
      size: 140,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
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
      ),
      filterVariant: "custom",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("location", {
      header: "Location",
      size: 140,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
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
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("sapCode", {
      header: "SAP Code",
      size: 130,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={sapCodeFilter}
          onChange={(e) => setSapCodeFilter(e.target.value)}
          placeholder="Filter SAP Code"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("totalCost", {
      header: "Total Cost",
      size: 160,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value === "NA" ? "NA" : `₹${value.toLocaleString()}`;
      },
    }),
    columnHelper.accessor("username", {
      header: "Username",
      size: 120,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Users</MenuItem>
            {usernameOptions.map((username) => (
              <MenuItem key={username} value={username}>
                {username}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("assetType", {
      header: "Asset Type",
      size: 140,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Asset Types</MenuItem>
            {assetTypeOptions.map((assetType) => (
              <MenuItem key={assetType} value={assetType}>
                {assetType}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 160,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={serialNumberFilter}
          onChange={(e) => setSerialNumberFilter(e.target.value)}
          placeholder="Filter Serial Number"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 160,
      Cell: ({ cell }) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </span>
      ),
      Filter: () => (
        <CustomTextField
          fullWidth
          value={descriptionFilter}
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder="Filter Description"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("usedByEmail", {
      header: "Used By (Email)",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          placeholder="Filter Email"
          size="small"
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("acquisitionDate", {
      header: "Acquisition Date (PO)",
      size: 180,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={acquisitionDateFilter}
          onChange={(e) => setAcquisitionDateFilter(e.target.value)}
          placeholder="Filter Acquisition Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("department", {
      header: "Department",
      size: 140,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Departments</MenuItem>
            {departmentOptions.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
    }),
    // columnHelper.accessor("assignedOn", {
    //   header: "Assigned On",
    //   size: 140,
    //   Cell: ({ cell }) =>
    //     dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    // }),
    columnHelper.accessor("make", {
      header: "Make",
      size: 120,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
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
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("model", {
      header: "Model",
      size: 120,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
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
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("poValue", {
      header: "PO Value",
      size: 130,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={poValueFilter}
          onChange={(e) => setPoValueFilter(e.target.value)}
          placeholder="Filter PO Value"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("warrantyAmc", {
      header: "Warranty/AMC",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={warrantyAmcFilter}
          onChange={(e) => setWarrantyAmcFilter(e.target.value)}
          placeholder="Filter Warranty/AMC"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("warrantyExpiryDate", {
      header: "Warranty Expiry Date",
      size: 180,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={warrantyExpiryDateFilter}
          onChange={(e) => setWarrantyExpiryDateFilter(e.target.value)}
          placeholder="Filter Warranty Expiry Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lastAuditDate", {
      header: "Last Audit Date",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={lastAuditDateFilter}
          onChange={(e) => setLastAuditDateFilter(e.target.value)}
          placeholder="Filter Last Audit Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("maintenanceDueDate", {
      header: "Maintenance Due Date",
      size: 200,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={maintenanceDueDateFilter}
          onChange={(e) => setMaintenanceDueDateFilter(e.target.value)}
          placeholder="Filter Maintenance Due Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lifecycleExDate", {
      header: "Lifecycle Expiry Date",
      size: 180,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={lifecycleExDateFilter}
          onChange={(e) => setLifecycleExDateFilter(e.target.value)}
          placeholder="Filter Lifecycle Expiry Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    // columnHelper.accessor("createdAt", {
    //   header: "Created At",
    //   size: 140,
    //   Cell: ({ cell }) =>
    //     dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    // }),
    // columnHelper.accessor("updatedAt", {
    //   header: "Updated At",
    //   size: 120,
    //   Cell: ({ cell }) =>
    //     dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    // }),
    columnHelper.accessor("productCategory", {
      header: "Product Category",
      size: 180,
      Filter: () => (
        <FormControl fullWidth variant="outlined" size="small">
          <StyledSelect
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            {productCategoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("invoiceNo", {
      header: "Invoice No",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={invoiceNoFilter}
          onChange={(e) => setInvoiceNoFilter(e.target.value)}
          placeholder="Filter Invoice No"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("invoiceDate", {
      header: "Invoice Date",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={invoiceDateFilter}
          onChange={(e) => setInvoiceDateFilter(e.target.value)}
          placeholder="Filter Invoice Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("grDate", {
      header: "Gr Date",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={grDateFilter}
          onChange={(e) => setGrDateFilter(e.target.value)}
          placeholder="Filter GR Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("grNo", {
      header: "Gr No",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={grNoFilter}
          onChange={(e) => setGrNoFilter(e.target.value)}
          placeholder="Filter GR No"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("poNo", {
      header: "PO No",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          value={poNoFilter}
          onChange={(e) => setPoNoFilter(e.target.value)}
          placeholder="Filter PO No"
          size="small"
        />
      ),
      filterVariant: "custom",
    }),
    columnHelper.accessor("poDate", {
      header: "PO Date",
      size: 150,
      Filter: () => (
        <CustomTextField
          fullWidth
          type="date"
          value={poDateFilter ?? "NA"}
          onChange={(e) => setPoDateFilter(e.target.value)}
          placeholder="Filter PO Date"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
      filterVariant: "custom",
    }),
  ];

  // Combine base columns with dynamic columns
  const columns = [...baseColumns, ...dynamicColumns];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const handleApplyDateFilter = () => {
    fetchData();
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    // No need to call fetchData here as the useEffect will trigger it
  };

  const handleClearAllFilters = () => {
    setStatusFilter("all");
    setUsedStatusFilter("all");
    setInstallationStatusFilter("all");
    setAssetIdFilter("");
    setUnitFilter("");
    setLocationFilter("");
    setSapCodeFilter("");
    setUsernameFilter("");
    setAssetTypeFilter("");
    setSerialNumberFilter("");
    setDescriptionFilter("");
    setEmailFilter("");
    setDepartmentFilter("");
    setMakeFilter("");
    setModelFilter("");
    setGrNoFilter("");
    setPoNoFilter("");
    setInvoiceNoFilter("");
    setPoValueFilter("");
    setWarrantyAmcFilter("");
    setWarrantyExpiryDateFilter("");
    setLastAuditDateFilter("");
    setMaintenanceDueDateFilter("");
    setLifecycleExDateFilter("");
    setProductCategoryFilter("");
    setInvoiceDateFilter("");
    setGrDateFilter("");
    setPoDateFilter("");
    setTotalCostFilter("");
    setAcquisitionDateFilter("");
    setStartDate("");
    setEndDate("");
    setSpecFieldFilters({});
    setSoftwareFieldFilters({});
  };

  const table = useMaterialReactTable({
    columns,
    data,
    //initialState will show all the input fields by default
    initialState: {
      columnFilters: [
        {
          id: "status",
          value: statusFilter,
        },
      ],
      showColumnFilters: true,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    pageCount: totalPages,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: true,
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px", whiteSpace: "nowrap" },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:nth-of-type(odd)": {
          backgroundColor: "#fafafa",
        },
      },
    },
    muiTableContainerProps: {
      sx: {
        width: "100%",
        overflowX: "auto",
        maxWidth: "100%",
        "&::-webkit-scrollbar": {
          height: "8px",
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "8px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      },
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {/* <Button
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button> */}
        <Button
          onClick={() => setPdfModalOpen(true)}
          startIcon={<PictureAsPdfIcon />}
          className="Global-Button4"
          sx={{
            backgroundColor: "#d32f2f",
            color: "white",
            "&:hover": {
              backgroundColor: "#b71c1c",
            },
          }}
        >
          Download PDF
        </Button>
        <Button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          startIcon={<FilterListIcon />}
          className="Global-Button8"
        >
          Advanced Filters
        </Button>
        <Button
          onClick={handleClearAllFilters}
          className="Global-Button3"
          sx={{
            backgroundColor: "#f5f5f5",
            color: "#757575",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  const handleCloseEdit = (shouldRefresh = false) => {
    setIsEditing(false);
    setEditingItem(null);

    if (shouldRefresh) {
      fetchData();
    }
  };

  return (
    <>
      {isEditing == true ? (
        <EditInventory
          data={editingItem}
          onClose={handleCloseEdit}
          assetId={editingItem?.id}
          grInventoryProductId={editingItem?.grInventoryProductId}
        />
      ) : (
        <Box>
          {/* <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            maxWidth="xs"
            fullWidth
          >
            <Box px={3} py={2}>
              <InputLabel
                sx={{
                  ...inputLabelStyle,
                  mb: 0,
                }}
              >
                SAP Code:
              </InputLabel>
              <CustomTextField
                fullWidth
                value={sapCodeInput}
                onChange={(e) => setSapCodeInput(e.target.value)}
              />
            </Box>

            <Box px={3} py={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                onClick={() => setOpenModal(false)}
                className="Global-Button3"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={addSapCode}
                className="Global-Button2"
              >
                Add
              </Button>
            </Box>
          </Dialog> */}

          {/* Delete Confirmation Modal */}
          <Dialog
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <Box px={3} py={2}>
              <Typography variant="h6" gutterBottom>
                Delete Asset
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Are you sure you want to delete this asset? This action cannot
                be undone.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                Remark:
              </Typography>
              <CustomTextField
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter remark for deletion"
              />
            </Box>

            <Box px={3} py={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                onClick={() => setDeleteModalOpen(false)}
                className="Global-Button3"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={confirmSoftDeleteAsset}
                className="Global-Button6"
                color="error"
                disabled={!remark.trim()}
              >
                Delete
              </Button>
            </Box>
          </Dialog>

          {/* PDF Export Modal Component */}
          <PdfExportModal
            open={pdfModalOpen}
            onClose={() => setPdfModalOpen(false)}
            columns={columns}
            totalRows={totalRows}
            onExportSuccess={(message) => showSnackbar(message, "success")}
            onExportError={(message) => showSnackbar(message, "error")}
          />

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          ></Box>

          {/* Advanced Filters Section */}
          <Collapse in={showAdvancedFilters}>
            <Box
              sx={{
                p: 3,
                mb: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                mx: "auto", // center horizontally
                maxWidth: "1000px", // limit width for better alignment
              }}
            >
              <Typography variant="h6" mb={3} className="line" gutterBottom>
                Advanced Filters
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <InputLabel sx={{ mb: 1, fontWeight: "bold" }}>
                    Start Date
                  </InputLabel>
                  <CustomTextField
                    fullWidth
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InputLabel sx={{ mb: 1, fontWeight: "bold" }}>
                    End Date
                  </InputLabel>
                  <CustomTextField
                    fullWidth
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleApplyDateFilter}
                    className="Global-Button2"
                  >
                    Apply Filter
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearDateFilter}
                    className="Global-Button3"
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "100%",
                md: "100%",
                lg: "1050px",
                xl: "1300px",
              },
              overflow: "auto",
              mx: "auto",
              px: { xs: 1, sm: 2 },
            }}
          >
            <MaterialReactTable table={table} />
          </Box>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </>
  );
};
export default AllAsset;
