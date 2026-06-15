import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  Divider,
  DialogContent,
  DialogActions,
  InputLabel,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import log from "../../../assets/Stock/log.png";
import { useNavigate } from "react-router-dom";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import useInputStyle from "../../../CustomHooks/useInputStyle";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import { Eye } from "lucide-react";

// CSV Config - UPDATED
const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
  filename: 'installations_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
});

const InstallationList = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const navigate = useNavigate();
  const { inputLabelStyle, textFieldStyles } = useInputStyle();

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;

      // Build sort parameters
      let sortBy = "createdAt";
      let sortOrder = "desc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      const response = await fetch(
        `${baseUrl}/gr/installations/complete-installation/list?page=${pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pageSize}`, //&search=${globalFilter}
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.data) {
        const transformedData = result.data.data.map((item) => ({
          id: item.id, // Added id for installation record
          assetId: item.product.uuid,
          installationId: item.installationId || "NA",
          softwareName: item.softwares?.name || "NA",
          softwareVersion: item.softwares?.version || "NA",
          installedStatus: item.value || "NA",
          installedAt: item.installedAt
            || "NA",
          installedBy: item.createdUser?.name || "NA",
          createdAt: item.createdAt
            || "NA",
          updatedAt: item.updatedAt
            || "NA",
          productDetails: item.product
            ? {
              serialNo1: item.product.serialNo1 || "NA",
              serialNo2: item.product.serialNo2 || "NA",
              sapCode: item.product.sapCode || "NA",
              assignedStatus: item.product.assignedStatus || "NA",
              unit: item.product.unit?.name || "NA",
              brand:
                item.product.grInventoryProduct?.product?.brand?.name || "NA",
              category:
                item.product.grInventoryProduct?.product?.category?.name ||
                "NA",
              subcategory:
                item.product.grInventoryProduct?.product?.subcategory?.name ||
                "NA",
            }
            : null,
        }));

        setData(transformedData);
        setAllData(transformedData); // Store all data for client-side filtering
        setTotalRows(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rowData) => {
    navigate(`/installation-details/${rowData?.installationId}`, {
      state: { installationData: rowData },
    });
  };

  const handleViewAsset = (rowData) => {
    setSelectedAsset(rowData);
    setOpenModal(true);
  };

  const handleAddSapCode = () => {
    setOpenModal((prev) => !prev);
  };


  // Update the filteredData useMemo hook
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter(item => {
      // Check both string and number representations
      return Object.keys(item).some(key => {
        const value = item[key];

        // Skip null/undefined values
        if (value === null || value === undefined) return false;

        // Handle number values
        if (typeof value === 'number') {
          return value.toString().includes(globalFilter); // Use original filter (not lowercased) for numbers
        }

        // Handle string values
        if (typeof value === 'string') {
          // Check both original and lowercase versions for better matching
          return value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter);
        }

        return false;
      });
    });
  }, [allData, globalFilter]);

  useEffect(() => {
    fetchData();
  }, [pagination, sorting]);

  const columnHelper = createMRTColumnHelper();
  const columns = [
    columnHelper.accessor("installationId", {
      header: "Installation ID",
      size: 150,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEditClick(row.original)}
          >
            <img src={ViewIcon} />
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("assetId", {
      header: "Asset ID",
      size: 100,
    }),
    columnHelper.accessor("installedBy", {
      header: "Installed By",
      size: 150,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
  ];

  // Flatten installation data for CSV export - NEW FUNCTION
  const flattenInstallationData = (installation) => {
    return {
      "Installation ID": installation.installationId || 'N/A',
      "Asset ID": installation.assetId || 'N/A',
      "Installed By": installation.installedBy || 'N/A',
      "Created At": installation.createdAt
        ? new Date(installation.createdAt).toLocaleDateString("en-GB")
        : "N/A",

    };
  };

  // UPDATED: Export functions
  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map(row => flattenInstallationData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map(installation => flattenInstallationData(installation));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    manualFiltering: false,
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
    enableColumnFilters: false,   // 👈 disables filter by column
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    // muiPaginationProps: {
    //   rowsPerPageOptions: [5, 10, 20, 50],
    // },
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
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalRows}
      </Typography>
    ),
  });

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      ></Box>
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
    </Box>
  );
};

export default InstallationList;
