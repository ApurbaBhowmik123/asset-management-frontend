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
import log from "../../../assets/Stock/log.png";
import { useNavigate } from "react-router-dom";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const AssignedStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;

      let sortBy = "name";
      let sortOrder = "desc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      const response = await fetch(
        `${baseUrl}/gr/inventory/filter/ASSIGNED?page=${pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pageSize}&search=${globalFilter}`,
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
        // First pass to collect all unique spec field and software names
        const specFieldNames = new Set();
        const softwareNames = new Set();

        result.data.data.forEach((item) => {
          // Collect all spec field names
          item.specValues?.forEach((spec) => {
            if (spec.specField?.name) {
              specFieldNames.add(spec.specField.name);
            }
          });

          // Collect all software names
          item.softwareInstalls?.forEach((software) => {
            if (software.softwares?.name) {
              softwareNames.add(software.softwares.name);
            }
          });
        });

        // Transform data with dynamic fields
        const transformedData = result.data.data.map((item) => {
          // Create object for spec values
          const specValues = {};
          specFieldNames.forEach((name) => {
            const spec = item.specValues?.find(
              (s) => s.specField?.name === name
            );
            specValues[name] = spec?.value || "NA";
          });

          // Create object for software values
          const softwareValues = {};
          softwareNames.forEach((name) => {
            const software = item.softwareInstalls?.find(
              (s) => s.softwares?.name === name
            );
            softwareValues[name] = software?.value || "NA";
          });

          const assignedUser = item.AssignProductDetails?.[0]?.assignedToUser;

          return {
            id: item.id,
            uuid: item.uuid,
            username: assignedUser?.name || "NA",
            assetType: item.grInventoryProduct?.product?.category?.name || "NA",
            serialNumber: item.serialNo1 || "NA",
            description: item.grInventoryProduct?.description || "NA",
            assetTag: item.grInventoryProduct?.product?.uuid || "NA",
            usedByEmail: assignedUser?.email || "NA",
            sapCode: item.grInventoryProduct?.product?.serialNo || "NA",
            acquisitionDate: item.grInventoryProduct?.createdAt || "NA",
            department: assignedUser?.department?.name || "NA",
            unit: item.unit?.name || "NA",
            location: item.location?.name || "NA",
            assignedOn: item.createdAt || "NA",
            make: item.grInventoryProduct?.product?.brand?.name || "NA",
            model: item.grInventoryProduct?.product?.name || "NA",
            serialNumberAlt: item.serialNo2 || "NA",
            assetState: item.assignedStatus || "NA",
            grNo: item?.grInventoryProduct?.grDetails?.grId || "NA",
            poNo: item?.grInventoryProduct?.grDetails?.sapId || "NA",
            poDate:
              dateTimeHelper.formatDate(
                item?.grInventoryProduct?.grDetails?.sapDate
              ) || "NA",
            invoiceNo:
              item?.grInventoryProduct?.grDetails?.invoiceNumber || "NA",
            invoiceDate:
              dateTimeHelper.formatDate(
                item?.grInventoryProduct?.grDetails?.invoiceDate
              ) || "NA",
            grDate:
              dateTimeHelper.formatDate(
                item?.grInventoryProduct?.grDetails?.grDate
              ) || "NA",

            poValue: item.grInventoryProduct?.totalAmount || "NA",
            poNumber: "NA",
            warrantyAmc: item.grInventoryProduct?.warrantyTill || "NA",
            warrantyExpiryDate: item.grInventoryProduct?.warrantyTill || "NA",
            lastAuditDate: item.updatedAt || "NA",
            av: "NA",
            proxy: "NA",
            status: item.assignedStatus || "NA",
            isFree: item.isFree ? "Yes" : "No",
            maintenanceFrequency:
              item.grInventoryProduct?.maintenanceFrequency || "NA",
            maintenanceDueDate:
              item.grInventoryProduct?.maintenanceDueDate || "NA",
            lifecycleExDate: item.grInventoryProduct?.lifecycleExDate || "NA",
            quantity: item.grInventoryProduct?.quantity || "NA",
            ratePerPiece: item.grInventoryProduct?.ratePerPiece || "NA",
            // Add all dynamic spec fields
            ...specValues,
            // Add all dynamic software fields
            ...softwareValues,
          };
        });

        setData(transformedData);
        setAllData(transformedData); // Store all data for client-side filtering
        setTotalRows(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);

        // Generate dynamic columns for spec fields
        const specColumns = Array.from(specFieldNames).map((name) => ({
          accessorKey: name,
          header: name,
          size: 150,
        }));

        // Generate dynamic columns for software fields
        const softwareColumns = Array.from(softwareNames).map((name) => ({
          accessorKey: name,
          header: name,
          size: 150,
        }));

        setDynamicColumns([...specColumns, ...softwareColumns]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const handleGoToLog = (id) => {
    navigate(`/log/${id}`);
  };

  useEffect(() => {
      // Reset to first page when global filter changes
      setPagination({ ...pagination, pageIndex: 0 });
    }, [globalFilter]);
  
  useEffect(() => {
    fetchData();
  }, [pagination, sorting,globalFilter]);

  // Update the filteredData useMemo hook
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter((item) => {
      // Check both string and number representations
      return Object.keys(item).some((key) => {
        const value = item[key];

        // Skip null/undefined values
        if (value === null || value === undefined) return false;

        // Handle number values
        if (typeof value === "number") {
          return value.toString().includes(globalFilter); // Use original filter (not lowercased) for numbers
        }

        // Handle string values
        if (typeof value === "string") {
          // Check both original and lowercase versions for better matching
          return (
            value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter)
          );
        }

        return false;
      });
    });
  }, [allData, globalFilter]);

  const columnHelper = createMRTColumnHelper();
  const baseColumns = [
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        // const color =
        //   status === "InstallationCompleted" ? "#345481" : "#28A745";
        const label = productStatusHelper.getLabel(status);
        const { color, bg } = productStatusHelper.getStyle(status);
        return (
          <Chip
            // label={status}
            label={label}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: "#DAF2FF",
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
    columnHelper.accessor("uuid", { header: "Asset ID", size: 130,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
     }),
    columnHelper.accessor("unit", { header: "Unit", size: 130,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
     }),
    columnHelper.accessor("location", { header: "Location", size: 100 }),
    columnHelper.accessor("username", { header: "Username", size: 120 }),
    columnHelper.accessor("assetType", { header: "Asset Type", size: 120 }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 150,
    }),
    columnHelper.accessor("description", { header: "Description", size: 150 }),

    columnHelper.accessor("usedByEmail", {
      header: "Used By (Email)",
      size: 150,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("sapCode", { header: "SAP Code", size: 120 }),
    columnHelper.accessor("acquisitionDate", {
      header: "Acquisition Date",
      size: 160,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("department", { header: "Department", size: 120 }),
    columnHelper.accessor("make", { header: "Make", size: 100 }),
    columnHelper.accessor("model", { header: "Model", size: 120 }),
    // columnHelper.accessor("serialNumberAlt", {
    //   header: "Serial Number Alt",
    //   size: 130,
    // }),
    // columnHelper.accessor("assetState", { header: "Asset State", size: 120 }),
    columnHelper.accessor("poValue", { header: "PO Value", size: 110 }),
    columnHelper.accessor("warrantyExpiryDate", {
      header: "Warranty Expiry",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("maintenanceFrequency", {
      header: "Maintenance Frequency",
      size: 200,
    }),
    columnHelper.accessor("maintenanceDueDate", {
      header: "Maintenance Due",
      size: 180,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("lifecycleExDate", {
      header: "Lifecycle Expiry",
      size: 150,
      Cell: ({ cell }) =>
        dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
    }),
    columnHelper.accessor("ratePerPiece", {
      header: "Rate Per Piece",
      size: 120,
    }),

    columnHelper.accessor("invoiceNo", { header: "Invoice No", size: 150 }),
    columnHelper.accessor("invoiceDate", { header: "Invoice Date", size: 150 }),
    columnHelper.accessor("grDate", { header: "Gr Date", size: 150 }),
    columnHelper.accessor("grNo", { header: "Gr No", size: 150 }),
    columnHelper.accessor("poNo", { header: "PO No", size: 150 }),
    columnHelper.accessor("poDate", { header: "PO Date", size: 150 }),
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

  const table = useMaterialReactTable({
    columns,
    data,
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

export default AssignedStock;
