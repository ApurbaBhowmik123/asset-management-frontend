import React, { useState, useEffect, useMemo } from "react";
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
  Chip,
  TextField,
  Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InstallIcon from "../../../assets/EmployeeImages/install.png";
import Editicon2 from "../../../assets/EmployeeImages/Group (2).png";
import { ArrowLeft } from "lucide-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import EditInventory from "./EditInventory";
import { baseUrl } from "../../Api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export const Installation = ({ onBack }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [allData, setAllData] = useState([]); // Store all data for client-side filtering
  const [columnFilters, setColumnFilters] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [sorting, setSorting] = useState([{ id: "description", desc: false }]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const navigate = useNavigate();

  const fetchInstallationData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { pageIndex, pageSize } = pagination;
      const sortField = sorting.length > 0 ? sorting[0].id : "description";
      const sortOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      // Column filter processing
      const columnFilterParams = columnFilters
        .map((f) => `filters[${f.id}]=${encodeURIComponent(f.value)}`)
        .join("&");

      const url = `${baseUrl}/gr/installations/list?page=${pageIndex + 1
        }&sortOrder=${sortOrder}&limit=${pageSize}`; //&search=${globalFilter || ""  }&${columnFilterParams}

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        // First pass to collect all unique spec field names
        const specFieldNames = new Set();

        response.data.data.data.forEach((item) => {
          if (item.specValues) {
            item.specValues.forEach((spec) => {
              if (spec.specField?.name) {
                specFieldNames.add(spec.specField.name);
              }
            });
          }
        });

        const formattedData = response.data.data.data.map((item) => {
          // Create object for spec values
          const specValues = {};
          specFieldNames.forEach(name => {
            const spec = item.specValues?.find(
              s => s.specField?.name === name
            );
            specValues[name] = spec?.value || "N/A";
          });

          return {
            id: item.id,
            uuid: item.uuid,
            productId: item.grInventoryProduct?.product.uuid || "N/A",
            assetType: item.grInventoryProduct?.product?.category?.name || "N/A",
            serialNumber: item.serialNo1 || item.serialNo2 || "N/A",
            description: item.grInventoryProduct?.description || "N/A",
            assetTag: item.uuid || "N/A",
            usedByEmail: "N/A",
            sapCode: item.grInventoryProduct?.grDetails?.sapId || "N/A",
            acquisitionDate: item.grInventoryProduct?.grDetails?.sapDate
              ? dayjs(item.grInventoryProduct.grDetails.sapDate).format("DD/MM/YYYY")
              : "N/A",
            department: "N/A",
            location: "N/A",
            assignedOn: "N/A",
            make: item.grInventoryProduct?.product?.brand?.name || "N/A",
            model: item.grInventoryProduct?.product?.name || "N/A",
            serialNumber2: item.serialNo2 || "N/A",
            os: "N/A",
            osVersion: "N/A",
            osServicePack: "N/A",
            macAddress: "N/A",
            bitlocker: "N/A",
            hostname: "N/A",
            ipAddress: "N/A",
            assetState: item.assignedStatus || "N/A",
            poValue: item.grInventoryProduct?.totalAmount || 0,
            poNumber: item.grInventoryProduct?.grDetails?.grId || "N/A",
            warrantyAMC: item.grInventoryProduct?.warrantyTill ? "Warranty" : "N/A",
            warrantyExpiryDate: item.grInventoryProduct?.warrantyTill
              ? dayjs(item.grInventoryProduct.warrantyTill).format("DD/MM/YYYY")
              : "N/A",
            domain: "N/A",
            lastAuditDate: item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",
            av: "N/A",
            proxy: "N/A",
            status: item.assignedStatus || "N/A",
            maintenanceFrequency: item.grInventoryProduct?.maintenanceFrequency || "N/A",
            maintenanceDueDate: item.grInventoryProduct?.maintenanceDueDate
              ? dayjs(item.grInventoryProduct.maintenanceDueDate).format("DD/MM/YYYY")
              : "N/A",
            lifecycleExDate: item.grInventoryProduct?.lifecycleExDate
              ? dayjs(item.grInventoryProduct.lifecycleExDate).format("DD/MM/YYYY")
              : "N/A",
            importantLink: item.grInventoryProduct?.importantLink || "N/A",
            ratePerPiece: item.grInventoryProduct?.ratePerPiece || 0,
            quantity: item.grInventoryProduct?.quantity || 0,
            freeQty: item.grInventoryProduct?.freeQty || 0,
            totalAmount: item.grInventoryProduct?.totalAmount || 0,
            invoiceNumber: item.grInventoryProduct?.grDetails?.invoiceNumber || "N/A",
            invoiceDate: item.grInventoryProduct?.grDetails?.invoiceDate
              ? dayjs(item.grInventoryProduct.grDetails.invoiceDate).format("DD/MM/YYYY")
              : "N/A",
            grDate: item.grInventoryProduct?.grDetails?.grDate
              ? dayjs(item.grInventoryProduct.grDetails.grDate).format("DD/MM/YYYY")
              : "N/A",
            vendor: item.grInventoryProduct?.grDetails?.vendor?.name || "N/A",
            unit: item.grInventoryProduct?.grDetails?.unit?.name || "N/A",
            category: item.grInventoryProduct?.product?.category?.name || "N/A",
            subcategory: item.grInventoryProduct?.product?.subcategory?.name || "N/A",
            createdBy: item.createdUser?.name || "N/A",
            createdAt: item.createdAt
              ? dayjs(item.createdAt).format("DD/MM/YYYY")
              : "N/A",
            updatedAt: item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",
            serialNumbers: [item.serialNo1, item.serialNo2].filter(Boolean).join(", ") || "N/A",
            isFree: item.isFree ? "Yes" : "No",
            software: [],
            // Add all dynamic spec fields
            ...specValues,
            // Store the original item data for editing
           originalData: item 
          };
        });

        setData(formattedData);
        setAllData(formattedData); // Store all data for client-side filtering
        setTotalCount(response.data.data.total);

        // Generate dynamic columns for spec fields
        const specColumns = Array.from(specFieldNames).map(name => ({
          accessorKey: name,
          header: name,
          size: 150,
          filterFn: "contains",
        }));

        setDynamicColumns(specColumns);
      }
    } catch (error) {
      console.error("Error fetching installation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!globalFilter) return allData;

    const lowercasedFilter = globalFilter.toLowerCase();

    return allData.filter(item => {
      return Object.keys(item).some(key => {
        const value = item[key];

        // Skip null/undefined values
        if (value === null || value === undefined) return false;

        // Handle number values
        if (typeof value === 'number') {
          return value.toString().includes(globalFilter);
        }

        // Handle string values
        if (typeof value === 'string') {
          return value.includes(globalFilter) ||
            value.toLowerCase().includes(lowercasedFilter);
        }

        // Handle nested object values
        if (typeof value === 'object') {
          const stringValue = JSON.stringify(value).toLowerCase();
          return stringValue.includes(lowercasedFilter);
        }

        return false;
      });
    });
  }, [allData, globalFilter]);


  useEffect(() => {
    fetchInstallationData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    // globalFilter,
    // columnFilters,
  ]);

  const handleEditClick = (item) => {
    setEditingItem(item.originalData);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    fetchInstallationData(); // Refresh data after editing
  };

  const baseColumns = [
    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 120,
      filterFn: "contains",
    }),

    columnHelper.accessor("assetType", {
      header: "Asset Type",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("serialNumber", {
      header: "Serial Number",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 150,
      filterFn: "contains",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {cell.getValue()}
        </div>
      ),
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
            <img src={InstallIcon} alt="edit" />
          </IconButton>
          <IconButton color="error" size="small">
            {/* <img src={Editicon2} alt="delete" width={16} height={16} /> */}
          </IconButton>
        </Box>
      ),
    }),
    columnHelper.accessor("usedByEmail", {
      header: "Used By (Email)",
      size: 180,
      filterFn: "contains",
    }),
    columnHelper.accessor("sapCode", {
      header: "SAP Code",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("acquisitionDate", {
      header: "Acquisition Date (PO)",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("department", {
      header: "Department",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("location", {
      header: "Location",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("assignedOn", {
      header: "Assigned On",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("make", {
      header: "Make",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("model", {
      header: "Model",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("serialNumber2", {
      header: "Serial Number 2",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("os", {
      header: "OS",
      size: 100,
      filterFn: "contains",
    }),
    columnHelper.accessor("osVersion", {
      header: "OS Version",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("osServicePack", {
      header: "OS Service Pack",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("macAddress", {
      header: "MAC Address",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("bitlocker", {
      header: "Bitlocker",
      size: 100,
      filterFn: "contains",
    }),
    columnHelper.accessor("hostname", {
      header: "Hostname",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("assetState", {
      header: "Asset State",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        let color, bgColor;

        switch (status) {
          case "Assigned":
            color = "#345481";
            bgColor = "#DAF2FF";
            break;
          case "InStock":
            color = "#28A745";
            bgColor = "#E8F5E9";
            break;
          case "UnderMaintenance":
            color = "#FF9800";
            bgColor = "#FFF3E0";
            break;
          case "Disposed":
            color = "#F44336";
            bgColor = "#FFEBEE";
            break;
          default:
            color = "#9E9E9E";
            bgColor = "#FAFAFA";
        }

        return (
          <Chip
            label={status}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              backgroundColor: bgColor,
              color: color,
              fontSize: "12px",
              px: 1,
              borderRadius: 2,
              fontWeight: 500,
            }}
          />
        );
      },
      filterFn: "contains",
    }),
    columnHelper.accessor("poValue", {
      header: "PO Value",
      size: 100,
      Cell: ({ cell }) => `₹${cell.getValue().toLocaleString()}`,
      filterFn: "between",
    }),
    columnHelper.accessor("poNumber", {
      header: "PO Number",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("warrantyAMC", {
      header: "Warranty/AMC",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("warrantyExpiryDate", {
      header: "Warranty Expiry Date",
      size: 150,
      filterFn: "contains",
    }),
    columnHelper.accessor("domain", {
      header: "Domain",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("lastAuditDate", {
      header: "Last Audit Date",
      size: 120,
      filterFn: "contains",
    }),
    columnHelper.accessor("av", {
      header: "AV",
      size: 100,
      filterFn: "contains",
    }),
    columnHelper.accessor("proxy", {
      header: "Proxy",
      size: 100,
      filterFn: "contains",
    }),
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
      const response = await axios.get(
        `${baseUrl}/gr/installations/list?page=1&limit=${totalCount}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        // First pass to collect all unique spec field names for export
        const exportSpecFieldNames = new Set();

        response.data.data.data.forEach((item) => {
          if (item.grInventoryProduct?.specValues) {
            item.grInventoryProduct.specValues.forEach((spec) => {
              if (spec.specField?.name) {
                exportSpecFieldNames.add(spec.specField.name);
              }
            });
          }
        });

        const allData = response.data.data.data.map((item) => {
          // Create object for spec values in export
          const exportSpecValues = {};
          exportSpecFieldNames.forEach(name => {
            const spec = item.grInventoryProduct?.specValues?.find(
              s => s.specField?.name === name
            );
            exportSpecValues[name] = spec?.value || "N/A";
          });

          return {
            "Asset Id": item.uuid || "N/A",
            "Product Id": item.grInventoryProduct?.productId || "N/A",
            "Asset Type": item.grInventoryProduct?.product?.category?.name || "N/A",
            "Serial Number": item.serialNo1 || item.serialNo2 || "N/A",
            "Description": item.grInventoryProduct?.description || "N/A",
            "Asset Tag": item.uuid || "N/A",
            "Used By (Email)": "N/A",
            "SAP Code": item.grInventoryProduct?.grDetails?.sapId || "N/A",
            "Acquisition Date (PO)": item.grInventoryProduct?.grDetails?.sapDate
              ? dayjs(item.grInventoryProduct.grDetails.sapDate).format("DD/MM/YYYY")
              : "N/A",
            "Department": "N/A",
            "Location": "N/A",
            "Assigned On": "N/A",
            "Make": item.grInventoryProduct?.product?.brand?.name || "N/A",
            "Model": item.grInventoryProduct?.product?.name || "N/A",
            "Serial Number 2": item.serialNo2 || "N/A",
            "OS": "N/A",
            "OS Version": "N/A",
            "OS Service Pack": "N/A",
            "MAC Address": "N/A",
            "Bitlocker": "N/A",
            "Hostname": "N/A",
            "IP Address": "N/A",
            "Asset State": item.assignedStatus || "N/A",
            "PO Value": item.grInventoryProduct?.totalAmount || 0,
            "PO Number": item.grInventoryProduct?.grDetails?.grId || "N/A",
            "Warranty/AMC": item.grInventoryProduct?.warrantyTill ? "Warranty" : "N/A",
            "Warranty Expiry Date": item.grInventoryProduct?.warrantyTill
              ? dayjs(item.grInventoryProduct.warrantyTill).format("DD/MM/YYYY")
              : "N/A",
            "Domain": "N/A",
            "Last Audit Date": item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",
            "AV": "N/A",
            "Proxy": "N/A",
            "Maintenance Frequency": item.grInventoryProduct?.maintenanceFrequency || "N/A",
            "Maintenance Due Date": item.grInventoryProduct?.maintenanceDueDate
              ? dayjs(item.grInventoryProduct.maintenanceDueDate).format("DD/MM/YYYY")
              : "N/A",
            "Lifecycle Expiry": item.grInventoryProduct?.lifecycleExDate
              ? dayjs(item.grInventoryProduct.lifecycleExDate).format("DD/MM/YYYY")
              : "N/A",
            "Important Link": item.grInventoryProduct?.importantLink || "N/A",
            "Rate Per Piece": item.grInventoryProduct?.ratePerPiece || 0,
            "Quantity": item.grInventoryProduct?.quantity || 0,
            "Free Quantity": item.grInventoryProduct?.freeQty || 0,
            "Total Amount": item.grInventoryProduct?.totalAmount || 0,
            "Invoice Number": item.grInventoryProduct?.grDetails?.invoiceNumber || "N/A",
            "Invoice Date": item.grInventoryProduct?.grDetails?.invoiceDate
              ? dayjs(item.grInventoryProduct.grDetails.invoiceDate).format("DD/MM/YYYY")
              : "N/A",
            "GR Date": item.grInventoryProduct?.grDetails?.grDate
              ? dayjs(item.grInventoryProduct.grDetails.grDate).format("DD/MM/YYYY")
              : "N/A",
            "Vendor": item.grInventoryProduct?.grDetails?.vendor?.name || "N/A",
            "Unit": item.grInventoryProduct?.grDetails?.unit?.name || "N/A",
            "Category": item.grInventoryProduct?.product?.category?.name || "N/A",
            "Subcategory": item.grInventoryProduct?.product?.subcategory?.name || "N/A",
            "Created By": item.createdUser?.name || "N/A",
            "Created At": item.createdAt
              ? dayjs(item.createdAt).format("DD/MM/YYYY")
              : "N/A",
            "Updated At": item.updatedAt
              ? dayjs(item.updatedAt).format("DD/MM/YYYY")
              : "N/A",
            "Serial Numbers": [item.serialNo1, item.serialNo2].filter(Boolean).join(", ") || "N/A",
            "Is Free": item.isFree ? "Yes" : "No",
            // Add all dynamic spec fields to export
            ...exportSpecValues
          };
        });

        const csv = generateCsv(csvConfig)(allData);
        download(csvConfig)(csv);
      }
    } catch (error) {
      console.error("Error exporting all data:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    state: {
      globalFilter,
      columnFilters,
      isLoading,
      pagination,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: false,
    rowCount: totalCount,
    enableGlobalFilter: true,
    enableColumnFilters: false,   // 👈 disables filter by column
    enableRowSelection: true,
    enableMultiRowSelection: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    layoutMode: "grid",
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
    },
    muiTableHeadRowProps: {
      sx: {
        backgroundColor: "#FFE3E1",
      },
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
    renderBottomToolbarCustomActions: () => (
      <Typography
        variant="body2"
        sx={{ ml: 2, fontWeight: 500 }}
      >
        Total Rows: {totalCount}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      {isEditing ? (
        <EditInventory data={editingItem} onClose={handleCloseEdit} />
      ) : (
        <>
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
              Installation
            </Typography> */}
          </Box>
          <Box sx={{
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "1050px",
              xl: "1400px"
            },
            overflow: "auto",
            mx: "auto",
            px: { xs: 1, sm: 2 }
          }}>
            <MaterialReactTable table={table} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Installation;