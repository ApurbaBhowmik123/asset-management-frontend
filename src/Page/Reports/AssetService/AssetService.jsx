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
import useInputStyle from "../../../CustomHooks/useInputStyle";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { CustomTextField } from "../../../utils/CustomTextField";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const AssetService = () => {
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form filter states
  const [assetId, setAssetId] = useState("");
  const [assetSerial, setAssetSerial] = useState("");
  const [assetSapCode, setAssetSapCode] = useState("");
  const [grId, setGrId] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [serviceAwaiting, setServiceAwaiting] = useState("");
  const [serviceExpired, setServiceExpired] = useState("");

  // Dropdown filter data
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  // new added
  const [serviceDate, setServiceDate] = useState("");
  const [serviceWithin, setServiceWithin] = useState("");
  // Selected values for dropdowns
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const navigate = useNavigate();
  const { textFieldStyles, inputLabelStyle, datePickerStyles } =
    useInputStyle();

  const columns = [
    columnHelper.accessor("uuid", { header: "Asset ID", size: 100 }),
    columnHelper.accessor("serialNo1", { header: "Serial No", size: 150 }),
    columnHelper.accessor("grInventoryProduct.product.name", {
      header: "Product Name",
      size: 150,
      Cell: ({ cell }) =>
        cell.row.original.grInventoryProduct?.product?.name || "-",
    }),
    columnHelper.accessor("grInventoryProduct.product.brand.name", {
      header: "Brand",
      size: 120,
      Cell: ({ cell }) =>
        cell.row.original.grInventoryProduct?.product?.brand?.name || "-",
    }),
    columnHelper.accessor("grInventoryProduct.product.category.name", {
      header: "Category",
      size: 130,
      Cell: ({ cell }) =>
        cell.row.original.grInventoryProduct?.product?.category?.name || "-",
    }),
    columnHelper.accessor("grInventoryProduct.product.subcategory.name", {
      header: "Subcategory",
      size: 150,
      Cell: ({ cell }) =>
        cell.row.original.grInventoryProduct?.product?.subcategory?.name || "-",
    }),
    columnHelper.accessor("grInventoryProduct.maintenanceDueDate", {
      header: "Maintenance Due Date",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    // columnHelper.accessor("nextServiceDate", {
    //   header: "Next Service Date",
    //   size: 150,
    //   Cell: ({ cell }) => {
    //     const date = cell.row.original.nextServiceDate;
    //     return date ? new Date(date).toLocaleDateString() : '-';
    //   }
    // }),
    columnHelper.accessor("nextServiceDate", {
      header: "Next Service Date",
      size: 150,
      Cell: ({ cell }) => {
        const date = cell.row.original.nextServiceDate;
        return date
          ? new Date(date).toLocaleDateString("en-GB") // formats as DD/MM/YYYY
          : "-";
      },
    }),

    columnHelper.accessor("AssignProductDetails[0].assignedToUser.name", {
      header: "Assigned To",
      size: 150,
      Cell: ({ cell }) =>
        cell.row.original.AssignProductDetails?.[0]?.assignedToUser?.name ||
        "-",
    }),
    // columnHelper.accessor("grInventoryProduct.grDetails.unit.name", {
    //   header: "Unit",
    //   size: 120,
    //   Cell: ({ cell }) => cell.row.original.grInventoryProduct?.grDetails?.unit?.name || '-'
    // }),
    columnHelper.accessor("grInventoryProduct.grDetails.location.name", {
      header: "Location",
      size: 120,
      Cell: ({ cell }) =>
        cell.row.original.grInventoryProduct?.grDetails?.location?.name || "-",
    }),
    columnHelper.accessor("serviceAwaiting", {
      header: "Service Awaiting",
      size: 120,
      Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
    }),
    columnHelper.accessor("serviceExpired", {
      header: "Service Expired",
      size: 120,
      Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
    }),
  ];

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${baseUrl}/report/report-query/report-get-all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (result.status) {
          setUnits(result.data.unit || []);
          setLocations(result.data.location || []);
          setDepartments(result.data.department || []);
          setProducts(result.data.product || []);
          setCategories(result.data.categories || []);
          setSubcategories(result.data.subcategory || []);
          setUsers(result.data.user || []);
          setBrands(result.data.brand || []);
        } else {
          console.error("API Error:", result.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Prepare query parameters
      const params = new URLSearchParams({
        AssetID: assetId,
        AssetSerial: assetSerial,
        AssetSAPCode: assetSapCode,
        GRID: grId,
        DateStart: dateStart,
        DateEnd: dateEnd,
        AssetUNIT: selectedUnit,
        AssetLocation: selectedLocation,
        AssignedDEPT: selectedDept,
        AssetProduct: selectedProduct,
        AssetCategory: selectedCategory,
        AssetSubcat: selectedSubcategory,
        AssignedtoUser: selectedUser,
        AssetBrand: selectedBrand,
        ServiceAwaiting:
          serviceAwaiting === "Yes"
            ? "true"
            : serviceAwaiting === "No"
            ? "false"
            : "",
        ServiceExpired:
          serviceExpired === "Yes"
            ? "true"
            : serviceExpired === "No"
            ? "false"
            : "",
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        // new added
        serviceDate: serviceDate.toString(),
        serviceWithin: serviceWithin.toString(),
      });

      // Add sorting if available
      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      const response = await fetch(
        `${baseUrl}/report/report-query/report-get?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (result.status) {
        setData(result.data?.data || []);
        setRowCount(result.data?.totalCount || 0);
      } else {
        console.error("API Error:", result.message);
        setData([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAssetId("");
    setAssetSerial("");
    setAssetSapCode("");
    setGrId("");
    setDateStart("");
    setDateEnd("");
    setSelectedUnit("");
    setSelectedLocation("");
    setSelectedDept("");
    setSelectedProduct("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedUser("");
    setSelectedBrand("");
    setServiceAwaiting("");
    setServiceExpired("");
    setGlobalFilter("");
    // new added
    setServiceDate("");
    setServiceWithin("");

    setPagination({ pageIndex: 0, pageSize: 5 });
    setSorting([]);
    setData([]);
    setRowCount(0);
  };

  // Fetch data when pagination or sorting changes
  useEffect(() => {
    if (data.length > 0) {
      // Only fetch if we already have data (filters applied)
      handleSubmit();
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => {
      const original = row.original;
      // Convert boolean values to Yes/No for export
      return {
        ...original,
        serviceAwaiting: original.serviceAwaiting ? "Yes" : "No",
        serviceExpired: original.serviceExpired ? "Yes" : "No",
      };
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const exportData = data.map((item) => ({
      ...item,
      serviceAwaiting: item.serviceAwaiting ? "Yes" : "No",
      serviceExpired: item.serviceExpired ? "Yes" : "No",
    }));
    const csv = generateCsv(csvConfig)(exportData);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    state: {
      globalFilter,
      pagination,
      sorting,
      columnFilters,
      isLoading,
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
          disabled={data.length === 0}
        >
          Export All Data
        </Button>
        <Button
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={data.length === 0}
        >
          Export All Rows
        </Button>
        <Button
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button4"
          disabled={data.length === 0}
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
        Asset Service Check
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
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Grid item>
                  <Typography
                    sx={{ fontSize: "13px", fontWeight: 500, color: "#4A4A4A" }}
                  >
                    FILTER SECTION
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3, pt: 0, flex: 1, overflowY: "auto" }}>
              <Stack spacing={1}>
                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset ID
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                 
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset Serial
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                 
                  value={assetSerial}
                  onChange={(e) => setAssetSerial(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset SAP Code
                </InputLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                 
                  value={assetSapCode}
                  onChange={(e) => setAssetSapCode(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Date Start
                </InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                 
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Date End
                </InputLabel>
                <CustomTextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
               
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset UNIT
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Asset Location
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.name}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Assigned DEPT
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Service Awaiting
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={serviceAwaiting}
                  onChange={(e) => setServiceAwaiting(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Service Expired
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={serviceExpired}
                  onChange={(e) => setServiceExpired(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </CustomTextField>
                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Service Date
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="7">7 days</MenuItem>
                  <MenuItem value="15">15 days</MenuItem>
                  <MenuItem value="30">1 month</MenuItem>
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>
                  Service Within
                </InputLabel>
                <CustomTextField
                  select
                  fullWidth
                  size="small"
                 
                  value={serviceWithin}
                  onChange={(e) => setServiceWithin(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="7">7 days</MenuItem>
                  <MenuItem value="15">15 days</MenuItem>
                  <MenuItem value="30">1 month</MenuItem>
                </CustomTextField>
              </Stack>
            </Box>

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
                <Button className="Global-Button3" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  className="Global-Button2"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Submit"}
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

export default AssetService;
