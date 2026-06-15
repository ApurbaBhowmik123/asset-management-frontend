import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../../Api";

const globalSx = {
  textField: {
    backgroundColor: "#f9fafb",
    "& fieldset": { border: "none" },
    "& .MuiOutlinedInput-root": {
      height: "33px",
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      height: "20px",
      padding: "8px 14px",
    },
  },
  checkbox: {
    color: "#4caf50",
    "&.Mui-checked": {
      color: "#4caf50",
    },
  },
};

const columnHelper = createMRTColumnHelper();

const Software = () => {
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const [softwareName, setSoftwareName] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [errors, setErrors] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!softwareName.trim()) newErrors.softwareName = "Software name is required";
    // if (!softwareVersion.trim()) newErrors.softwareVersion = "Version is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseUrl}/catalog/installsof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: softwareName,
          version: softwareVersion,
          required: isRequired,
          status: true,
          createdBy: 1,
          updatedBy: 1,
        }),
      });

      const result = await res.json();

      if (result.status) {
        showSnackbar("Installation created successfully!");
        setSoftwareName("");
        setSoftwareVersion("");
        setIsRequired(false);
        setErrors({});
        fetchData(); // Refresh table after save
      } else {
        showSnackbar("Failed to save. Please try again.", "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      showSnackbar("Something went wrong!", "error");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const sort = sorting[0];
      const sortBy = sort?.id || "Date";
      const sortOrder = sort?.desc ? "desc" : "asc";
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const search = globalFilter || "";

      const res = await fetch(
        `${baseUrl}/catalog/installsof?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.status) {
        setData(json.data.data);
        setRowCount(json.data.total);
      } else {
        showSnackbar("Failed to fetch data", "error");
      }
    } catch (err) {
      console.error("Fetch error", err);
      showSnackbar("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    columnHelper.accessor("name", {
      header: "Software Name",
      size: 140,
      enableSorting: true,
    }),
    columnHelper.accessor("version", {
      header: "Software Version",
      size: 120,
      enableSorting: true,
    }),
    columnHelper.accessor("required", {
      header: "Required",
      Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 80,
      Cell: () => (
        <Box>
          <IconButton color="primary" size="small">
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <IconButton color="error" size="small">
            <img src={Deleteicon1} alt="delete" width={16} height={16} />
          </IconButton>
        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

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
  state: {
    sorting,
    globalFilter,
    pagination,
  },
  onSortingChange: setSorting,
  onGlobalFilterChange: setGlobalFilter,
  onPaginationChange: setPagination,
  manualSorting: true,
  manualPagination: true,
  manualFiltering: true,
  rowCount,
  enableGlobalFilter: true,
  enableRowSelection: true,
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
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
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
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
          className="Global-Button5"
        >
          Export Selected Rows
        </Button>
      </Box>
  ),
  enableColumnResizing: false,
  isLoading: loading,
});


  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
        <Typography fontSize={15} fontWeight={600} mb={2} className="line">
          Add Required Software
        </Typography>

        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={3} mb={2}>
          <Box sx={{ flex: 1 }}>
            <Typography mb={1}>Software Name</Typography>
            <TextField
              fullWidth
              placeholder="Enter software name"
              variant="outlined"
              value={softwareName}
              onChange={(e) => setSoftwareName(e.target.value)}
              error={!!errors.softwareName}
              helperText={errors.softwareName}
              sx={globalSx.textField}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography mb={1}>Software Version</Typography>
            <TextField
              fullWidth
              placeholder="Enter version"
              variant="outlined"
              value={softwareVersion}
              onChange={(e) => setSoftwareVersion(e.target.value)}
              error={!!errors.softwareVersion}
              helperText={errors.softwareVersion}
              sx={globalSx.textField}
            />
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              sx={globalSx.checkbox}
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
          }
          label="Is Required"
        />

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button className="Global-Button2" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Paper>

      <Typography fontSize={15} fontWeight={600} mb={1}>
        Software List
      </Typography>
      <MaterialReactTable table={table} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} onClose={handleSnackbarClose} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Software;