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
import { CustomTextField } from "../../../utils/CustomTextField";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

// Asset Status Enum
const AssignedStatus = {
  InStock: "In Stock",
  ASSIGNED: "Assigned",
  InstallationCompleted: "Installation Completed",
  BLOCKED: "Blocked",
};

const AssetLocation = () => {
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
  const [assetStatus, setAssetStatus] = useState("");

  // Dropdown filter data
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);

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
  const { textFieldStyles, inputLabelStyle, datePickerStyles } = useInputStyle();

  const columns = [
    columnHelper.accessor("uuid", { header: "Asset ID", size: 100 }),
    columnHelper.accessor("serialNo1", { header: "Asset Serial", size: 150 }),
    columnHelper.accessor("grInventoryProduct.product.name", { 
      header: "Asset Product", 
      size: 150,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.product?.name || '-'
    }),
    columnHelper.accessor("grInventoryProduct.product.brand.name", { 
      header: "Asset Brand", 
      size: 120,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.product?.brand?.name || '-'
    }),
    columnHelper.accessor("grInventoryProduct.product.category.name", { 
      header: "Asset Category", 
      size: 130,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.product?.category?.name || '-'
    }),
    columnHelper.accessor("grInventoryProduct.product.subcategory.name", { 
      header: "Asset Subcat", 
      size: 150,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.product?.subcategory?.name || '-'
    }),
    columnHelper.accessor("grInventoryProduct.grDetails.grId", { 
      header: "GR ID", 
      size: 120,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.grDetails?.grId || '-'
    }),
    columnHelper.accessor("AssignProductDetails[0].assignedToUser.name", { 
      header: "Assigned to User", 
      size: 150,
      Cell: ({ cell }) => cell.row.original.AssignProductDetails?.[0]?.assignedToUser?.name || '-'
    }),
    // columnHelper.accessor("grInventoryProduct.grDetails.unit.name", { 
    //   header: "Asset UNIT", 
    //   size: 120,
    //   Cell: ({ cell }) => cell.row.original.grInventoryProduct?.grDetails?.unit?.name || '-'
    // }),
    columnHelper.accessor("grInventoryProduct.grDetails.location.name", { 
      header: "Asset Location", 
      size: 120,
      Cell: ({ cell }) => cell.row.original.grInventoryProduct?.grDetails?.location?.name || '-'
    }),
    columnHelper.accessor("AssignProductDetails[0].assignedToUser.department.name", { 
      header: "Assigned DEPT", 
      size: 150,
      Cell: ({ cell }) => cell.row.original.AssignProductDetails?.[0]?.assignedToUser?.department?.name || '-'
    }),
    columnHelper.accessor("assignedStatus", { 
      header: "Asset Status", 
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.row.original.assignedStatus;
        return status ? AssignedStatus[status] || status : '-';
      }
    }),
    columnHelper.accessor("specValues", {
      header: "Specifications",
      size: 200,
      Cell: ({ cell }) => {
        const specs = cell.row.original.specValues || [];
        return (
          <Box>
            {specs.map((spec, index) => (
              <Typography key={index} variant="body2">
                {spec.specField.name}: {spec.value}
              </Typography>
            ))}
          </Box>
        );
      },
    }),
  ];

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
    columnResizeMode: "onChange",
    paginationDisplayMode: "pages",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: { backgroundColor: "#FFE3E1" },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "12px" },
    },
    muiTableBodyRowProps: {
      sx: { "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } },
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
        <Button onClick={() => { const csv = generateCsv(csvConfig)(data); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export All Data
        </Button>
        <Button onClick={() => { const rowData = table.getPrePaginationRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export All Rows
        </Button>
        <Button onClick={() => { const rowData = table.getRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button4" disabled={data.length === 0}>
          Export Page Rows
        </Button>
        <Button disabled={!(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())} onClick={() => { const rowData = table.getSelectedRowModel().rows.map(r => r.original); const csv = generateCsv(csvConfig)(rowData); download(csvConfig)(csv); }} startIcon={<FileDownloadIcon />} className="Global-Button5">
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  // Fetch API dropdown data
  useEffect(() => {
    async function fetchFilters() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseUrl}/report/report-query/report-get-all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.status) {
          const d = json.data;
          setUnits(d.unit || []);
          setLocations(d.location || []);
          setDepartments(d.department || []);
          setProducts(d.product || []);
          setCategories(d.categories || []);
          setSubcategories(d.subcategory || []);
          setUsers(d.user || []);
          setBrands(d.brand || []);
        } else {
          console.error("API Error:", json.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchFilters();
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
      AssetStatus: assetStatus,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    });

    // Add sorting if available
    if (sorting.length > 0) {
      params.append('sortBy', sorting[0].id);
      params.append('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }

    const response = await fetch(`${baseUrl}/report/report-query/report-get?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

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
    setAssetStatus("");
    setGlobalFilter("");
    setPagination({ pageIndex: 0, pageSize: 5 });
    setSorting([]);
    setData([]);
    setRowCount(0);
  };

  // Fetch data when pagination or sorting changes
  useEffect(() => {
    if (data.length > 0) { // Only fetch if we already have data (filters applied)
      handleSubmit();
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" mb={2}>Asset Location</Typography>
      <Grid container spacing={2}>
         <Grid size={{ xs: 12, md: 3 }}>

          <Card sx={{ p: 0, borderRadius: 2, boxShadow: "none", height: "calc(100vh - 150px)", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, pb: 2, position: "sticky", top: 0, backgroundColor: "white", zIndex: 2, borderBottom: "1px solid #e0e0e0" }}>
              <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#4A4A4A" }}>FILTER SECTION</Typography>
                </Grid>
                <Grid item>
                  {/* <Button className="Global-Button7" onClick={handleReset}>
                    Reset All
                  </Button> */}
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ p: 3, pt: 0, flex: 1, overflowY: "auto" }}>
              <Stack spacing={1}>
                <InputLabel variant="caption" sx={inputLabelStyle}>Asset ID</InputLabel>
                <CustomTextField 
                  fullWidth 
                  size="small" 
                  
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Serial</InputLabel>
                <CustomTextField 
                  fullWidth 
                  size="small" 
                  
                  value={assetSerial}
                  onChange={(e) => setAssetSerial(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset SAP Code</InputLabel>
                <CustomTextField 
                  fullWidth 
                  size="small" 
                  
                  value={assetSapCode}
                  onChange={(e) => setAssetSapCode(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>GR ID</InputLabel>
                <CustomTextField 
                  fullWidth 
                  size="small" 
                  
                  value={grId}
                  onChange={(e) => setGrId(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Date Start</InputLabel>
                <CustomTextField 
                  type="date" 
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                  
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Date End</InputLabel>
                <CustomTextField 
                  type="date" 
                  fullWidth 
                  size="small" 
                  InputLabelProps={{ shrink: true }} 
                 
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Unit</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedUnit} 
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {units.map((u) => <MenuItem key={u.id} value={u.name}>{u.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Location</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {locations.map((l) => <MenuItem key={l.id} value={l.name}>{l.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Assigned Dept</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {departments.map((d) => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Product (Model)</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedProduct} 
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {products.map((p) => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Category</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {categories.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Subcat</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedSubcategory} 
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {subcategories.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Assigned to User</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {users.map((u) => <MenuItem key={u.id} value={u.name}>{u.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Brand</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                  
                  value={selectedBrand} 
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {brands.map((b) => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
                </CustomTextField>

                <InputLabel variant="caption" sx={inputLabelStyle}>Asset Status</InputLabel>
                <CustomTextField 
                  select 
                  fullWidth 
                  size="small" 
                 
                  value={assetStatus}
                  onChange={(e) => setAssetStatus(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  {Object.entries(AssignedStatus).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value}</MenuItem>
                  ))}
                </CustomTextField>
              </Stack>
            </Box>
            <Box sx={{ p: 3, position: "sticky", bottom: 0, backgroundColor: "white", zIndex: 2, borderTop: "1px solid #e0e0e0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button className="Global-Button3" onClick={handleReset}>Cancel</Button>
                <Button className="Global-Button2" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Submit'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

                <Grid item size={{ xs: 12, md: 9 }}>
          <Box sx={{ 
                      width: { 
                        xs: "100%",  
                        sm: "100%", 
                        md: "100%",   
                        lg: "790px", 
                        xl: "1400px"  
                      }, 
                      overflow: "auto",
                      mx: "auto",  
                      px: { xs: 1, sm: 2 } 
                    }}>
                      <MaterialReactTable table={table} />
                    </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetLocation;