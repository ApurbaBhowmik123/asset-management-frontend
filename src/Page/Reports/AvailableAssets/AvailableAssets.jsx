import React, { useEffect, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  Stack,
  TextField,
  MenuItem,
  InputLabel,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useInputStyle from "../../../CustomHooks/useInputStyle";
import { baseUrl } from "../../Api";
import { CustomTextField } from "../../../utils/CustomTextField";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

// Asset Status Enum
const AssignedStatus = {
  InStock: "InStock",
  ASSIGNED: "ASSIGNED",
  InstallationCompleted: "InstallationCompleted",
  BLOCKED: "BLOCKED",
};

const AvailableAssets = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [filterData, setFilterData] = useState({}); // Filter dropdown data
  const [loading, setLoading] = useState(false);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [softwareFields, setSoftwareFields] = useState([]);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  // Filter form state
  const [filters, setFilters] = useState({
    assetId: "",
    assetSerial: "",
    assetSapCode: "",
    poId: "",
    grId: "",
    dateStart: "",
    dateEnd: "",
    assetProduct: "",
    assetCategory: "",
    assetSubcat: "",
    assignedToUser: "",
    assetUnit: "",
    assetLocation: "",
    assignedDept: "",
    assetBrand: "",
    assetStatus: "",
  });

  const navigate = useNavigate();
  const { textFieldStyles, inputLabelStyle, datePickerStyles } =
    useInputStyle();

  // Fetch filter dropdown data on mount
  useEffect(() => {
    const fetchFilterData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${baseUrl}/report/report-query/report-get-all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setFilterData(response.data.data);

          // Extract dynamic fields from specValues
          const hardwareFields =
            response.data.data.specField?.map((item) => ({
              type: "hardware",
              name: item.name,
              key: item.name.toLowerCase().replace(/\s+/g, "_"),
              label: item.name,
              id: item.id,
              options: item.options?.map((opt) => opt.value) || [],
            })) || [];

          // Extract software fields from InstallationSoftware
          // const softwareFields = response.data.data.InstallationSoftware?.map(item => ({
          //   type: 'software',
          //   name: item.name,
          //   key: `software_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
          //   label: item.name,
          //   id: item.id,
          //   options: item.productInstalledSofts?.map(opt => opt.value) || []
          // })) || [];
          const softwareFields =
            response.data.data.InstallationSoftware?.map((item) => {
              const uniqueOptions = [
                ...new Set(
                  item.productInstalledSofts?.map((opt) => opt.value) || []
                ),
              ];

              return {
                type: "software",
                name: item.name,
                key: `software_${item.name.toLowerCase().replace(/\s+/g, "_")}`,
                label: item.name,
                id: item.id,
                options: uniqueOptions,
              };
            }) || [];

          setDynamicFields([...hardwareFields]);
          setSoftwareFields([...softwareFields]);

          // Initialize dynamic fields in filters state
          const initialDynamicFilters = {};
          [...hardwareFields, ...softwareFields].forEach((field) => {
            initialDynamicFilters[field.key] = "";
          });
          setFilters((prev) => ({ ...prev, ...initialDynamicFilters }));
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilterData();
  }, []);

  // Auto-fetch data when pagination, sorting changes (only if filters are applied)
  useEffect(() => {
    if (isFiltersApplied) {
      fetchAssets();
    }
  }, [pagination, sorting, isFiltersApplied]);

  // Fetch assets based on filters
  const fetchAssets = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      queryParams.append("page", (pagination.pageIndex + 1).toString());
      queryParams.append("limit", pagination.pageSize.toString());

      // Add sorting parameters
      if (sorting.length > 0) {
        const sort = sorting[0];
        queryParams.append("sortBy", sort.id);
        queryParams.append("sortOrder", sort.desc ? "desc" : "asc");
      }

      // Add global filter if exists
      if (globalFilter) {
        queryParams.append("search", globalFilter);
      }

      // Add column filters
      columnFilters.forEach((filter) => {
        if (filter.value) {
          queryParams.append(filter.id, filter.value);
        }
      });

      // Add all non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          // Map form field names to API parameter names
          const paramMapping = {
            assetId: "AssetID",
            assetSerial: "AssetSerial",
            assetSapCode: "AssetSAPCode",
            poId: "POID",
            grId: "GRID",
            dateStart: "DateStart",
            dateEnd: "DateEnd",
            assetProduct: "AssetProduct",
            assetCategory: "AssetCategory",
            assetSubcat: "AssetSubcat",
            assignedToUser: "AssignedtoUser",
            assetUnit: "AssetUNIT",
            assetLocation: "AssetLocation",
            assignedDept: "AssignedDEPT",
            assetBrand: "AssetBrand",
            assetStatus: "AssetStatus",
          };

          // Handle dynamic fields
          if (!paramMapping[key]) {
            // This is a dynamic field, find its configuration
            const dynamicField = [...dynamicFields, ...softwareFields].find(
              (f) => f.key === key
            );
            if (dynamicField) {
              if (dynamicField.type === "software") {
                queryParams.append(
                  "installedSoftware",
                  JSON.stringify({
                    id: dynamicField.id,
                    value: value,
                  })
                );
              } else {
                queryParams.append(
                  "specField",
                  JSON.stringify({
                    id: dynamicField.id,
                    value: value,
                  })
                );
              }
            }
          } else {
            queryParams.append(paramMapping[key], value);
          }
        }
      });

      const response = await axios.get(
        `${baseUrl}/report/report-query/report-get?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        // Transform the API data to match table columns
        const transformedData =
          response.data.data.data?.map((item) => {
            const baseData = {
              assetId: item.uuid,
              serialNo: item.serialNo1 || item.serialNo2 || "-",
              sapCode: item.grInventoryProduct?.grDetails?.sapId || "-",
              poId: item.grInventoryProduct?.grDetails?.sapId || "-",
              grId: item.grInventoryProduct?.grDetails?.grId || "-",
              productName: item.grInventoryProduct?.product?.name || "-",
              brand: item.grInventoryProduct?.product?.brand?.name || "-",
              category: item.grInventoryProduct?.product?.category?.name || "-",
              subcategory:
                item.grInventoryProduct?.product?.subcategory?.name || "-",
              assignedTo:
                item.AssignProductDetails?.[0]?.assignedToUser?.name ||
                "Unassigned",
              unit: item.grInventoryProduct?.grDetails?.unit?.name || "-",
              location: item.grInventoryProduct?.grDetails?.locationId || "-",
              department:
                item.AssignProductDetails?.[0]?.assignedToUser?.department
                  ?.name || "-",
              status: item.assignedStatus || "-",
              lifecycleDate: item.lifecycleExDate
               || "-",
              maintenanceDate: item.maintenanceDueDate
                || "-",
              uuid: item.uuid,
            };

            // Add dynamic hardware fields from specValues
            if (item.specValues && item.specValues.length > 0) {
              dynamicFields.forEach((field) => {
                const specValue = item.specValues.find(
                  (s) => s.specField.name === field.name
                );
                baseData[field.key] = specValue?.value || "-";
              });
            }

            // Add software fields from installedSoftwares
            if (item.installedSoftwares && item.installedSoftwares.length > 0) {
              softwareFields.forEach((field) => {
                const softwareValue = item.installedSoftwares.find(
                  (s) => s.installationSoftware.name === field.name
                );
                baseData[field.key] = softwareValue?.value || "-";
              });
            }

            return baseData;
          }) || [];

        setData(transformedData);
        // Set total count from API response
        setRowCount(response.data.data.total || transformedData.length);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Reset pagination to first page when applying filters
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    setIsFiltersApplied(true);
    fetchAssets();
  };

  const handleCancel = () => {
    const resetFilters = {
      assetId: "",
      assetSerial: "",
      assetSapCode: "",
      poId: "",
      grId: "",
      dateStart: "",
      dateEnd: "",
      assetProduct: "",
      assetCategory: "",
      assetSubcat: "",
      assignedToUser: "",
      assetUnit: "",
      assetLocation: "",
      assignedDept: "",
      assetBrand: "",
      assetStatus: "",
    };

    // Reset dynamic fields
    [...dynamicFields, ...softwareFields].forEach((field) => {
      resetFilters[field.key] = "";
    });

    setFilters(resetFilters);
    setData([]);
    setRowCount(0);
    setIsFiltersApplied(false);
    setGlobalFilter("");
    setColumnFilters([]);
    setSorting([]);
    setPagination({ pageIndex: 0, pageSize: 5 });
  };

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = async () => {
    // For export all, we need to fetch all data without pagination
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      // Don't add pagination for export all
      queryParams.append("page", "1");
      queryParams.append("limit", "999999"); // Large number to get all data

      // Add all current filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          const paramMapping = {
            assetId: "AssetID",
            assetSerial: "AssetSerial",
            assetSapCode: "AssetSAPCode",
            poId: "POID",
            grId: "GRID",
            dateStart: "DateStart",
            dateEnd: "DateEnd",
            assetProduct: "AssetProduct",
            assetCategory: "AssetCategory",
            assetSubcat: "AssetSubcat",
            assignedToUser: "AssignedtoUser",
            assetUnit: "AssetUNIT",
            assetLocation: "AssetLocation",
            assignedDept: "AssignedDEPT",
            assetBrand: "AssetBrand",
            assetStatus: "AssetStatus",
          };

          if (!paramMapping[key]) {
            const dynamicField = [...dynamicFields, ...softwareFields].find(
              (f) => f.key === key
            );
            if (dynamicField) {
              if (dynamicField.type === "software") {
                queryParams.append(
                  "installedSoftware",
                  JSON.stringify({
                    id: dynamicField.id,
                    value: value,
                  })
                );
              } else {
                queryParams.append(
                  "specField",
                  JSON.stringify({
                    id: dynamicField.id,
                    value: value,
                  })
                );
              }
            }
          } else {
            queryParams.append(paramMapping[key], value);
          }
        }
      });

      const response = await axios.get(
        `${baseUrl}/report/report-query/report-get?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data.data) {
        // Transform data for export
        const exportData = response.data.data.data.map((item) => {
          const baseData = {
            assetId: item.uuid,
            serialNo: item.serialNo1 || item.serialNo2 || "-",
            sapCode: item.grInventoryProduct?.grDetails?.sapId || "-",
            poId: item.grInventoryProduct?.grDetails?.sapId || "-",
            grId: item.grInventoryProduct?.grDetails?.grId || "-",
            productName: item.grInventoryProduct?.product?.name || "-",
            brand: item.grInventoryProduct?.product?.brand?.name || "-",
            category: item.grInventoryProduct?.product?.category?.name || "-",
            subcategory:
              item.grInventoryProduct?.product?.subcategory?.name || "-",
            assignedTo:
              item.AssignProductDetails?.[0]?.assignedToUser?.name ||
              "Unassigned",
            unit: item.grInventoryProduct?.grDetails?.unit?.name || "-",
            location: item.grInventoryProduct?.grDetails?.locationId || "-",
            department:
              item.AssignProductDetails?.[0]?.assignedToUser?.department
                ?.name || "-",
            status: item.assignedStatus || "-",
            lifecycleDate: item.lifecycleExDate
              || "-",
            maintenanceDate: item.maintenanceDueDate
              || "-",
          };

          // Add dynamic hardware fields
          dynamicFields.forEach((field) => {
            const specValue = item.specValues?.find(
              (s) => s.specField.name === field.name
            );
            baseData[field.name] = specValue?.value || "-";
          });

          // Add software fields
          softwareFields.forEach((field) => {
            const softwareValue = item.installedSoftwares?.find(
              (s) => s.installationSoftware.name === field.name
            );
            baseData[`${field.name}`] = softwareValue?.value || "-";
          });

          return baseData;
        });

        const csv = generateCsv(csvConfig)(exportData);
        download(csvConfig)(csv);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate columns dynamically
  const generateColumns = () => {
    const baseColumns = [
      columnHelper.accessor("assetId", {
        header: "Asset ID",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("serialNo", {
        header: "Serial No",
        size: 130,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("sapCode", {
        header: "SAP Code",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("poId", {
        header: "PO ID",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("grId", {
        header: "GR ID",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("productName", {
        header: "Product",
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("brand", {
        header: "Brand",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        size: 130,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("subcategory", {
        header: "Subcategory",
        size: 140,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("assignedTo", {
        header: "Assigned To",
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("unit", {
        header: "Unit",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("department", {
        header: "Department",
        size: 140,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          // Format the status for display
          switch (status) {
            case AssignedStatus.InStock:
              return "In Stock";
            case AssignedStatus.ASSIGNED:
              return "Assigned";
            case AssignedStatus.InstallationCompleted:
              return "Installation Completed";
            case AssignedStatus.BLOCKED:
              return "Blocked";
            default:
              return status;
          }
        },
      }),
    ];

    // Add dynamic hardware columns
    const dynamicColumns = dynamicFields.map((field) =>
      columnHelper.accessor(field.key, {
        header: field.name,
        size: 150,
        enableSorting: false,
        enableColumnFilter: true,
      })
    );

    // Add software columns
    // const softwareColumns = softwareFields.map(field =>
    //   columnHelper.accessor(field.key, {
    //     header: `${field.name}`,
    //     size: 150,
    //     enableSorting: false,
    //     enableColumnFilter: true,
    //   })
    // );

    return [...baseColumns, ...dynamicColumns];
  };

  const columns = generateColumns();

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
      isLoading: loading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: "12px",
        whiteSpace: "nowrap",
      },
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
        <Button
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
        </Button>
      </Box>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" mb={2}>
        Report Details
      </Typography>
      <Grid container spacing={2}>
        {/* Filter Section */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              p: 0,
              borderRadius: 2,
              boxShadow: "none",
              height: "calc(100vh - 150px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 3,
                pb: 2,
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                sx={{ fontSize: "13px", fontWeight: 500, color: "#4A4A4A" }}
              >
                FILTER SECTION
              </Typography>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ p: 3, pt: 0, flex: 1, overflowY: "auto" }}>
              <Stack spacing={1}>
                {/* Text Input Fields */}
                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset ID
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                
                  value={filters.assetId}
                  onChange={(e) =>
                    handleFilterChange("assetId", e.target.value)
                  }
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset Serial
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                
                  value={filters.assetSerial}
                  onChange={(e) =>
                    handleFilterChange("assetSerial", e.target.value)
                  }
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset SAP Code
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                
                  value={filters.assetSapCode}
                  onChange={(e) =>
                    handleFilterChange("assetSapCode", e.target.value)
                  }
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  PO ID
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                
                  value={filters.poId}
                  onChange={(e) => handleFilterChange("poId", e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  GR ID
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                
                  value={filters.grId}
                  onChange={(e) => handleFilterChange("grId", e.target.value)}
                />

                {/* Date Fields */}
                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Date Start
                </InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateStart}
                  onChange={(e) =>
                    handleFilterChange("dateStart", e.target.value)
                  }
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Date End
                </InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateEnd}
                  onChange={(e) =>
                    handleFilterChange("dateEnd", e.target.value)
                  }
                />

                {/* Dynamic Dropdowns */}
                <InputLabel sx={inputLabelStyle}>
                  Asset Product (model)
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetProduct}
                  onChange={(e) =>
                    handleFilterChange("assetProduct", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.product?.map((p) => (
                    <MenuItem key={p.id} value={p.name}>
                      {p.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset Category</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetCategory}
                  onChange={(e) =>
                    handleFilterChange("assetCategory", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.categories?.map((c) => (
                    <MenuItem key={c.id} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset Subcat</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetSubcat}
                  onChange={(e) =>
                    handleFilterChange("assetSubcat", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.subcategory?.map((s) => (
                    <MenuItem key={s.id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Assigned to User</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assignedToUser}
                  onChange={(e) =>
                    handleFilterChange("assignedToUser", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.user?.map((u) => (
                    <MenuItem key={u.id} value={u.name}>
                      {u.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset UNIT</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetUnit}
                  onChange={(e) =>
                    handleFilterChange("assetUnit", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.unit?.map((u) => (
                    <MenuItem key={u.id} value={u.name}>
                      {u.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset Location</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetLocation}
                  onChange={(e) =>
                    handleFilterChange("assetLocation", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.location?.map((l) => (
                    <MenuItem key={l.id} value={l.name}>
                      {l.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Assigned DEPT</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assignedDept}
                  onChange={(e) =>
                    handleFilterChange("assignedDept", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.department?.map((d) => (
                    <MenuItem key={d.id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset Brand (make)</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetBrand}
                  onChange={(e) =>
                    handleFilterChange("assetBrand", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {filterData?.brand?.map((b) => (
                    <MenuItem key={b.id} value={b.name}>
                      {b.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel sx={inputLabelStyle}>Asset Status</InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                
                  value={filters.assetStatus}
                  onChange={(e) =>
                    handleFilterChange("assetStatus", e.target.value)
                  }
                >
                  <MenuItem value="">Select</MenuItem>
                  {Object.entries(AssignedStatus).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {value === AssignedStatus.InStock
                        ? "In Stock"
                        : value === AssignedStatus.ASSIGNED
                        ? "Assigned"
                        : value === AssignedStatus.InstallationCompleted
                        ? "Installation Completed"
                        : value === AssignedStatus.BLOCKED
                        ? "Blocked"
                        : value}
                    </MenuItem>
                  ))}
                </CustomTextField>

                {/* Hardware Dynamic Fields */}
                {dynamicFields.map((field) => (
                  <React.Fragment key={field.key}>
                    <InputLabel sx={inputLabelStyle}>{field.label}</InputLabel>
                    {field.options && field.options.length > 0 ? (
                      <CustomTextField
                        select
                        fullWidth
                        size="small"
                      
                        value={filters[field.key]}
                        onChange={(e) =>
                          handleFilterChange(field.key, e.target.value)
                        }
                      >
                        <MenuItem value="">Select</MenuItem>
                        {field.options.map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    ) : (
                      <CustomTextField
                        fullWidth
                        size="small"
                      
                        value={filters[field.key]}
                        onChange={(e) =>
                          handleFilterChange(field.key, e.target.value)
                        }
                      />
                    )}
                  </React.Fragment>
                ))}

                {/* Software Dynamic Fields */}
                {softwareFields.map((field) => (
                  <React.Fragment key={field.key}>
                    <InputLabel sx={inputLabelStyle}>{field.label}</InputLabel>
                    {field.options && field.options.length > 0 ? (
                      <CustomTextField
                        select
                        fullWidth
                        size="small"
                      
                        value={filters[field.key]}
                        onChange={(e) =>
                          handleFilterChange(field.key, e.target.value)
                        }
                      >
                        <MenuItem value="">Select</MenuItem>
                        {field.options.map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    ) : (
                      <CustomTextField
                        fullWidth
                        size="small"
                      
                        value={filters[field.key]}
                        onChange={(e) =>
                          handleFilterChange(field.key, e.target.value)
                        }
                      />
                    )}
                  </React.Fragment>
                ))}
              </Stack>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                p: 3,
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                zIndex: 2,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button className="Global-Button3" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  className="Global-Button2"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: "100%",
                md: "100%",
                lg: "790px",
                xl: "1400px",
              },
              overflow: "auto",
              mx: "auto",
              px: { xs: 1, sm: 2 },
            }}
          >
            <MaterialReactTable table={table} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AvailableAssets;
