import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Button, IconButton, Chip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import { useNavigate } from "react-router-dom";
import log from "../../../assets/Stock/log.png";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Ewaste = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [specFields, setSpecFields] = useState([]);
  const [softwareFields, setSoftwareFields] = useState([]);
  const navigate = useNavigate();
  
  const fetchData = async () => {
    setLoading(true);
    try {
      let sortBy = "name";
      let sortOrder = "desc";

      if (sorting?.length > 0) {
        sortBy = sorting[0]?.id;
        sortOrder = sorting[0]?.desc ? "desc" : "asc";
      }

      const apiUrl = `${baseUrl}/gr/inventory/filter/E_WASTE?page=${pagination.pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pagination?.pageSize}&search=${globalFilter}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response?.status}`);
      }

      const result = await response.json();

      // Set both data and allData with the fetched data
      const fetchedData = result?.data?.data || [];
      setData(fetchedData);
      setAllData(fetchedData);
      setTotalRows(result?.data?.total || 0);

      // Extract unique spec fields and software fields from the data
      if (fetchedData.length > 0) {
        const allSpecFields = new Set();
        const allSoftwareFields = new Set();

        fetchedData.forEach((item) => {
          if (item.specValues) {
            item.specValues.forEach((spec) => {
              if (spec.specField) {
                allSpecFields.add(spec.specField.name);
              }
            });
          }

          if (item.softwareInstalls) {
            item.softwareInstalls.forEach((software) => {
              if (software.softwares) {
                allSoftwareFields.add(software.softwares.name);
              }
            });
          }
        });

        setSpecFields(Array.from(allSpecFields));
        setSoftwareFields(Array.from(allSoftwareFields));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err?.message);
      setData([]);
      setAllData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to first page when global filter changes
    setPagination({ ...pagination, pageIndex: 0 });
  }, [globalFilter]);

  useEffect(() => {
    fetchData();
  }, [pagination, sorting, globalFilter]); // Only fetch when sorting changes

  const handleGoToLog = (id) => {
    navigate(`/log/${id}`);
  };

  const columnHelper = createMRTColumnHelper();

  // Create dynamic columns for spec values
  const specColumns = specFields.map((fieldName) =>
    columnHelper.accessor(
      (row) => {
        const specValue = row.specValues?.find(
          (spec) => spec.specField?.name === fieldName
        );
        return specValue ? specValue.value : "N/A";
      },
      {
        id: `spec_${fieldName}`,
        header: fieldName,
        size: 160,
      }
    )
  );

  // Create dynamic columns for software installs
  const softwareColumns = softwareFields.map((fieldName) =>
    columnHelper.accessor(
      (row) => {
        const softwareValue = row.softwareInstalls?.find(
          (software) => software.softwares?.name === fieldName
        );
        return softwareValue ? softwareValue.value : "N/A";
      },
      {
        id: `software_${fieldName}`,
        header: fieldName,
        size: 160,
      }
    )
  );

  const baseColumns = [
    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 120,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("assignedStatus", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const color = status === "assignedStatus" ? "#d9534f" : "#f0ad4e";
        return (
          <Chip
            label={status}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: "#FFF3CD",
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 1,
            }}
          />
        );
      },
    }),
    columnHelper.accessor("action", {
      header: "Action",
      size: 100,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            onClick={() => handleGoToLog(row?.original?.id)}
            size="small"
            color="primary"
          >
            <img height={20} width={20} src={log} alt="view" />
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("unit.name", {
      header: "Unit",
      size: 120,
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue() || "N/A"}
        </div>
      ),
    }),
    columnHelper.accessor("location.name", {
      header: "Location",
      size: 120,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),
    columnHelper.accessor(
      (row) =>
        row.AssignProductDetails?.map((user) => user.assignedToUser?.name).join(
          ", "
        ) || "N/A",
      {
        id: "userNames",
        header: "User name",
        size: 120,
      }
    ),
    columnHelper.accessor("grInventoryProduct.product.category.name", {
      header: "Asset Type",
      size: 120,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),
    columnHelper.accessor((row) => row.serialNo1 || row.serialNo2 || "N/A", {
      id: "serialNumber",
      header: "Serial Number",
      size: 150,
    }),
    columnHelper.accessor("grInventoryProduct.description", {
      header: "Description",
      size: 150,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),
    columnHelper.accessor("createdUser.email", {
      header: "Used By (Email)",
      size: 150,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),
    columnHelper.accessor(
      (row) =>
        row.AssignProductDetails?.map(
          (user) => user.assignedToUser?.department?.name
        ).join(", ") || "N/A",
      {
        id: "department",
        header: "Department",
        size: 120,
      }
    ),
    columnHelper.accessor("make", {
      header: "Make",
      size: 100,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),
    columnHelper.accessor("grInventoryProduct.product.name", {
      header: "Model",
      size: 120,
      Cell: ({ cell }) => cell.getValue() || "N/A",
    }),

    ...specColumns,
    ...softwareColumns,
  ];

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
    columns: baseColumns,
    data, // Use the data state directly
    manualFiltering: true, // Set to true since you're handling filtering server-side
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    state: {
      globalFilter,
      pagination,
      sorting,
      isLoading: loading,
      rowSelection: selectedRows,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelectedRows,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,
    paginationDisplayMode: "pages",
    columnResizeMode: "onChange",
    layoutMode: "grid",
    positionToolbarAlertBanner: "bottom",
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],
    },
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
    <Box mt={3}>
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

export default Ewaste;