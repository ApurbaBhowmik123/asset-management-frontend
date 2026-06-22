import axios from 'axios';
import React, { useEffect, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Grid,
  Card,
  Stack,
  TextField,
  MenuItem,
  InputLabel
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useNavigate } from "react-router-dom";
import useInputStyle from "../../../CustomHooks/useInputStyle";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const dummyData = [
  {
    productId: "P1001",
    product: "Laptop",
    brand: "Dell",
    category: "Electronics",
    subcategory: "Computers",
    quantity: 10,
    uuid: "uuid-1",
  },
  {
    productId: "P1002",
    product: "Smartphone",
    brand: "Samsung",
    category: "Electronics",
    subcategory: "Mobiles",
    quantity: 25,
    uuid: "uuid-2",
  },
];

const EmployeeReport = () => {
  const [data, setData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const navigate = useNavigate();
  const { textFieldStyles, inputLabelStyle, datePickerStyles } = useInputStyle()

  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${baseUrl}/super-admin/locations?limit=1000`, { headers });
        if (response.data?.status) {
          setLocations(response.data.data.locations || []);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const columns = [
    columnHelper.accessor("productId", {
      header: "Product ID",
      size: 100,
    }),
    columnHelper.accessor("product", {
      header: "Product",
      size: 150,
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      size: 120,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 130,
    }),
    columnHelper.accessor("subcategory", {
      header: "Subcategory",
      size: 150,
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
    }),
    // columnHelper.display({
    //   id: "actions",
    //   header: "Actions",
    //   size: 100,
    //   Cell: ({ row }) => (
    //     <Box>
    //       <IconButton
    //         onClick={() => handleGotoQRList(row.original.uuid)}
    //         color="primary"
    //         size="small"
    //       >
    //         <img src={QRIcon} alt="qr" width={16} height={16} />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => handleViewGr(row.original.uuid)}
    //         color="error"
    //         size="small"
    //       >
    //         <img src={Editicon1} alt="edit" width={16} height={16} />
    //       </IconButton>
    //     </Box>
    //   ),
    // }),
  ];

  useEffect(() => {
    setData(dummyData);
    setRowCount(dummyData.length);
  }, []);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
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
      sx: { width: "100%", overflowX: "auto" },
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

  const handlePage = () => {
    setShowAddProduct(true);
  };

  return (


    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" mb={2}>
        Employee Report
      </Typography>
      <Grid container spacing={2}>
        {/* Filter Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#4A4A4A",
                mb: 2,
                borderBottom: "1px solid #ddd",
                pb: 1,
              }}
            >
              FILTER SECTION
            </Typography>

            <Stack spacing={1}>
              <InputLabel variant="caption" sx={inputLabelStyle}>Serial No :</InputLabel>
              <TextField fullWidth size="small" sx={textFieldStyles} />

              <InputLabel variant="caption" sx={inputLabelStyle}>Product Id</InputLabel>
              <TextField fullWidth size="small" sx={textFieldStyles} />


              <InputLabel variant="caption" sx={inputLabelStyle}>Location</InputLabel>
              <TextField
                select
                fullWidth
                size="small"
                variant="outlined"
                sx={textFieldStyles}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name || loc.identificationNumber || 'Unnamed Location'}</MenuItem>
                ))}
              </TextField>


              <InputLabel variant="caption" sx={inputLabelStyle}>Start Date</InputLabel>

              <TextField
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}

                sx={datePickerStyles}
              />

              <InputLabel variant="caption" sx={inputLabelStyle}>End Date</InputLabel>

              <TextField
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={
                  datePickerStyles
                }
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
                <Button
                  className="Global-Button3"
                >
                  Cancel
                </Button>

                <Button
                  className="Global-Button2"
                >
                  Submit
                </Button>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Table */}
        <Grid item size={{ xs: 12, md: 9 }}>
          <MaterialReactTable table={table} />
        </Grid>
      </Grid>
    </Box>

  );
};

export default EmployeeReport;
