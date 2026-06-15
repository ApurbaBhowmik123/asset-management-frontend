import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { ArrowLeft } from "lucide-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../../Api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const columnHelper = createMRTColumnHelper();

const AwaitingStock = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const navigate = useNavigate();

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;

      // Build sort parameters
      let sortBy = "uuid";
      let sortOrder = "asc";
      if (sorting.length > 0) {
        sortBy = sorting[0].id;
        sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      // Build column filters
      const filterParams = columnFilters
        .map(
          (filter) =>
            `filters[${filter.id}]=${encodeURIComponent(filter.value)}`
        )
        .join("&");

      const response = await fetch(
        `${baseUrl}/gr/installations/list?page=${pageIndex + 1
        }&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${pageSize} `, //  &search=${globalFilter}&${filterParams}
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
        // First pass to collect all unique spec field names
        const specFieldNames = new Set();

        result.data.data.forEach((item) => {
          if (item.specValues) {
            item.specValues.forEach((spec) => {
              if (spec.specField?.name) {
                specFieldNames.add(spec.specField.name);
              }
            });
          }
        });

        // Transform data with dynamic spec fields
        const transformedData = result.data.data.map((item) => {
          // Create object for spec values
          const specValues = {};
          specFieldNames.forEach((name) => {
            const spec = item.specValues?.find(
              (s) => s.specField?.name === name
            );
            specValues[name] = spec?.value || "N/A";
          });

          return {
            id: item.id,
            uuid: item.uuid,
            serialNo1: item.serialNo1 || "N/A",
            serialNo2: item.serialNo2 || "N/A",
            isFree: item.isFree ? "Yes" : "No",
            assignedStatus: item.assignedStatus || "N/A",
            status: item.status ? "Active" : "Inactive",
            createdAt: item.createdAt
              ? dayjs(item.createdAt).format("DD/MM/YYYY")
              : "N/A",
            updatedAt: item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",

            // User information
            createdUserName: item.createdUser?.name || "N/A",
            createdUserEmail: item.createdUser?.email || "N/A",
            updatedUserName: item.updatedUser?.name || "N/A",
            updatedUserEmail: item.updatedUser?.email || "N/A",
            unit: item.unit?.name || "NA",
            location: item.location?.name || "NA",
            // Product information
            productName: item.grInventoryProduct?.product?.name || "N/A",
            productBrand:
              item.grInventoryProduct?.product?.brand?.name || "N/A",
            productCategory:
              item.grInventoryProduct?.product?.category?.name || "N/A",
            productSubCategory:
              item.grInventoryProduct?.product?.subcategory?.name || "N/A",
            productSerialNo:
              item.grInventoryProduct?.product?.serialNo || "N/A",
            productCostPrice:
              item.grInventoryProduct?.product?.costPrice || "N/A",

            // Inventory product details
            quantity: item.grInventoryProduct?.quantity || "N/A",
            ratePerPiece: item.grInventoryProduct?.ratePerPiece || "N/A",
            freeQty: item.grInventoryProduct?.freeQty || "N/A",
            description: item.grInventoryProduct?.description || "N/A",
            totalAmount: item.grInventoryProduct?.totalAmount || "N/A",
            maintenanceFrequency:
              item.grInventoryProduct?.maintenanceFrequency || "N/A",
            maintenanceDueDate: item.grInventoryProduct?.maintenanceDueDate
              ? dayjs(item.grInventoryProduct.maintenanceDueDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            warrantyTill: item.grInventoryProduct?.warrantyTill
              ? dayjs(item.grInventoryProduct.warrantyTill).format("DD/MM/YYYY")
              : "N/A",
            lifecycleExDate: item.grInventoryProduct?.lifecycleExDate
              ? dayjs(item.grInventoryProduct.lifecycleExDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            importantLink: item.grInventoryProduct?.importantLink || "N/A",

            // GR Details
            grDetailsId: item.grInventoryProduct?.grDetails?.uuid || "N/A",
            sapId: item.grInventoryProduct?.grDetails?.sapId || "N/A",
            sapDate: item.grInventoryProduct?.grDetails?.sapDate
              ? dayjs(item.grInventoryProduct.grDetails.sapDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            invoiceNumber:
              item.grInventoryProduct?.grDetails?.invoiceNumber || "N/A",
            invoiceDate: item.grInventoryProduct?.grDetails?.invoiceDate
              ? dayjs(item.grInventoryProduct.grDetails.invoiceDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            grId: item.grInventoryProduct?.grDetails?.grId || "N/A",
            grDate: item.grInventoryProduct?.grDetails?.grDate
              ? dayjs(item.grInventoryProduct.grDetails.grDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            vendorId: item.grInventoryProduct?.grDetails?.vendorId || "N/A",
            unitId: item.grInventoryProduct?.grDetails?.unitId || "N/A",

            // Add all dynamic spec fields
            ...specValues,

            // Original data for reference
            originalData: item,
          };
        });

        setData(transformedData);
        setAllData(transformedData); // Store all data for client-side filtering
        setTotalRows(result.data.total);

        // Generate dynamic columns for spec fields
        const specColumns = Array.from(specFieldNames).map((name) => ({
          accessorKey: name,
          header: name,
          size: 150,
          filterFn: "contains",
        }));

        setDynamicColumns(specColumns);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination, sorting]);

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

  const handleBack = () => {
    navigate(-1);
  };

  const baseColumns = [
    // columnHelper.accessor("assignedStatus", {
    //   header: "Status",
    //   size: 120,
    //   Cell: ({ cell }) => {
    //     const status = cell.getValue();
    //     const color =
    //       status === "InStock"
    //         ? "#28A745"
    //         : status === "Assigned"
    //           ? "#345481"
    //           : status === "Blocked"
    //             ? "#FF0000"
    //             : "#666666";
    //     return (
    //       <Chip
    //         label={status}
    //         variant="outlined"
    //         sx={{
    //           borderColor: "transparent",
    //           backgroundColor: "#DAF2FF",
    //           color: color,
    //           fontSize: "12px",
    //           px: 1,
    //           borderRadius: 2,
    //         }}
    //       />
    //     );
    //   },
    //   filterFn: "equals",
    // }),
    columnHelper.accessor("assignedStatus", {
      header: "Status",
      size: 200,
      Cell: ({ cell }) => {
        let status = cell.getValue();

        if (status?.toLowerCase().replace(/\s/g, "") === "instock") {
          status = "Awaiting Quality Check";
        }

        const color =
          status === "Awaiting Quality Check"
            ? "#28A745"
            : status === "Assigned"
              ? "#345481"
              : status === "Blocked"
                ? "#FF0000"
                : "#666666";

        return (
          <Chip
            label={status}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: "#DAF2FF",
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 2,
            }}
          />
        );
      },
      filterFn: "equals",
    }),

    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 120,
      filterFn: "contains",
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("serialNo1", {
      header: "Serial No",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("unit", { header: "Unit", size: 130,
       Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
     }),
    columnHelper.accessor("location", { header: "Location", size: 100 }),
    columnHelper.accessor("productName", {
      header: "Product Name",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("productBrand", {
      header: "Brand",
      size: 100,
      filterFn: "contains",
    }),
    columnHelper.accessor("productCategory", {
      header: "Category",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("productSubCategory", {
      header: "Sub Category",
      size: 140,
      filterFn: "contains",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
      filterFn: "equals",
    }),
    columnHelper.accessor("ratePerPiece", {
      header: "Rate/Piece",
      size: 120,
      Cell: ({ cell }) => `₹${cell.getValue().toLocaleString()}`,
      filterFn: "between",
    }),
    columnHelper.accessor("totalAmount", {
      header: "Total Amount",
      size: 140,
      Cell: ({ cell }) => `₹${cell.getValue().toLocaleString()}`,
      filterFn: "between",
    }),
    columnHelper.accessor("warrantyTill", {
      header: "Warranty Till",
      size: 140,
      filterFn: "contains",
    }),
    columnHelper.accessor("lifecycleExDate", {
      header: "Lifecycle Expiry",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("createdUserName", {
      header: "Created By",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("sapId", {
      header: "SAP ID",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("invoiceNumber", {
      header: "Invoice Number",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("grId", {
      header: "GR ID",
      size: 120,
      filterFn: "contains",
    }),
    // columnHelper.display({
    //     id: 'actions',
    //     header: 'Actions',
    //     size: 100,
    //     Cell: () => (
    //         <Box>
    //             <IconButton size="small" color="primary">
    //                 <img src={ViewIcon} alt="view" />
    //             </IconButton>
    //         </Box>
    //     ),
    // }),
  ];

  // Combine base columns with dynamic columns
  const columns = [...baseColumns, ...dynamicColumns];

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/gr/installations/list?page=1&limit=${totalRows}`,
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
        // First pass to collect all unique spec field names for export
        const exportSpecFieldNames = new Set();

        result.data.data.forEach((item) => {
          if (item.grInventoryProduct?.specValues) {
            item.grInventoryProduct.specValues.forEach((spec) => {
              if (spec.specField?.name) {
                exportSpecFieldNames.add(spec.specField.name);
              }
            });
          }
        });

        const allData = result.data.data.map((item) => {
          // Create object for spec values in export
          const exportSpecValues = {};
          exportSpecFieldNames.forEach((name) => {
            const spec = item.grInventoryProduct?.specValues?.find(
              (s) => s.specField?.name === name
            );
            exportSpecValues[name] = spec?.value || "N/A";
          });

          return {
            ID: item.id,
            "Asset Tag": item.uuid,
            "Serial No 1": item.serialNo1 || "N/A",
            "Serial No 2": item.serialNo2 || "N/A",
            "Is Free": item.isFree ? "Yes" : "No",
            Status: item.assignedStatus || "N/A",
            "Product Name": item.grInventoryProduct?.product?.name || "N/A",
            Brand: item.grInventoryProduct?.product?.brand?.name || "N/A",
            Category: item.grInventoryProduct?.product?.category?.name || "N/A",
            "Sub Category":
              item.grInventoryProduct?.product?.subcategory?.name || "N/A",
            Quantity: item.grInventoryProduct?.quantity || "N/A",
            "Rate Per Piece": item.grInventoryProduct?.ratePerPiece || "N/A",
            "Free Quantity": item.grInventoryProduct?.freeQty || "N/A",
            Description: item.grInventoryProduct?.description || "N/A",
            "Total Amount": item.grInventoryProduct?.totalAmount || "N/A",
            "Maintenance Frequency":
              item.grInventoryProduct?.maintenanceFrequency || "N/A",
            "Maintenance Due Date": item.grInventoryProduct?.maintenanceDueDate
              ? dayjs(item.grInventoryProduct.maintenanceDueDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            "Warranty Till": item.grInventoryProduct?.warrantyTill
              ? dayjs(item.grInventoryProduct.warrantyTill).format("DD/MM/YYYY")
              : "N/A",
            "Lifecycle Expiry": item.grInventoryProduct?.lifecycleExDate
              ? dayjs(item.grInventoryProduct.lifecycleExDate).format(
                "DD/MM/YYYY"
              )
              : "N/A",
            "Important Link": item.grInventoryProduct?.importantLink || "N/A",
            "SAP ID": item.grInventoryProduct?.grDetails?.sapId || "N/A",
            "Invoice Number":
              item.grInventoryProduct?.grDetails?.invoiceNumber || "N/A",
            "GR ID": item.grInventoryProduct?.grDetails?.grId || "N/A",
            "Created By": item.createdUser?.name || "N/A",
            "Created At": item.createdAt
              ? dayjs(item.createdAt).format("DD/MM/YYYY")
              : "N/A",
            "Updated At": item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",
            // Add all dynamic spec fields to export
            ...exportSpecValues,
          };
        });

        const csv = generateCsv(csvConfig)(allData);
        download(csvConfig)(csv);
      }
    } catch (error) {
      console.error("Error exporting all data:", error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    manualFiltering: false,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
    state: {
      globalFilter,
      columnFilters,
      pagination,
      sorting,
      isLoading: loading,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    enableColumnFilters: false,   // 👈 disables filter by column
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
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
    <Box sx={{ width: "100%" }}>
      {/* Heading with ArrowLeft */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        {/* <IconButton onClick={handleBack}>
                    <ArrowLeft size={20} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Awaiting Stock
                </Typography> */}
      </Box>

      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
            lg: "1040px",
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

export default AwaitingStock;
