import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
  TextField,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import AddEmp from "./AddEmp";
import { mkConfig, generateCsv, download } from "export-to-csv";
// ICONS for top cards
import TotalIcon from "../../assets/EmployeeImages/Group 282.png";
import ActiveIcon from "../../assets/EmployeeImages/Group 283.png";
import InActiveIcon from "../../assets/EmployeeImages/Group 284.png";
import NewIcon from "../../assets/EmployeeImages/Group 285.png";
import ViewIcon from "../../assets/EmployeeImages/Group (2).png"
import { baseUrl } from "../Api";
import { Eye } from "lucide-react";
import AssignProductList from "./AssignProductList";

const SubCategoryDashboard = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const stats = [
    {
      label: "Total Employee",
      value: 614,
      color: "#2E2E2E",
      bgColor: "#E0E0E0",
      icon: TotalIcon,
    },
    {
      label: "Active",
      value: 152,
      color: "#34D399",
      bgColor: "#D1FAE5",
      icon: ActiveIcon,
    },
    {
      label: "Inactive",
      value: 200,
      color: "#EF4444",
      bgColor: "#FEE2E2",
      icon: InActiveIcon,
    },
    {
      label: "New Joiners",
      value: 145,
      color: "#3B82F6",
      bgColor: "#DBEAFE",
      icon: NewIcon,
    },
  ];

  const columnHelper = createMRTColumnHelper();

  const columns = [
    columnHelper.accessor("uuid", {
      header: "Emp ID",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="body2">{cell.getValue()}</Typography>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 150,
    }),
    columnHelper.accessor(
      row => row.roles?.map(role => role.name).join(", ") || "—",
      {
        id: "roles",
        header: "Roles",
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2">{cell.getValue()}</Typography>
        ),
      }
    ),

    columnHelper.accessor(
      row => row.unit?.name || "-",
      {
        id: "unitName",
        header: "Unit",
        size: 110,
      }
    ),

    columnHelper.accessor(
      row => row.location?.name || "-",
      {
        id: "locationName",
        header: "Location",
        size: 110,
      }
    ),

    columnHelper.accessor("designation", {
      header: "Designation",
      size: 120,
      Cell: ({ cell }) => (
        <span
          style={{
            whiteSpace: "normal",  
            wordBreak: "break-word",
          }}
        >
          {cell.getValue()}
        </span>
      ),
    }),



    columnHelper.accessor(
      row => row.productAssignAssignedToUser?.filter(
        p => p.status === "Active" || p.status === "Handovered"
      ).length || 0,
      {
        id: "productAssignAssignedToUser",
        header: "Products",
        size: 130,
        Cell: ({ cell, row }) => (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">{cell.getValue()}</Typography>
            {cell.getValue() > 0 && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedUnitId(row.original.id);
                  setShowProductList(true);
                }}
              >
                <Eye size={16} />
              </IconButton>
            )}
          </Box>
        ),
      }
    ),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 120,
      Cell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setSelectedUnitId(row.original.id);

              setShowAddVendor(true);
            }}
          >
            <img src={Editicon1} alt="edit" width={16} height={16} />
          </IconButton>
          <IconButton color="error" size="small">
            <img src={ViewIcon}
              onClick={() => {
                setSelectedUnitId(row.original.id);
                setShowProductList(true);
              }}
            />
          </IconButton>
        </Box>
      ),
    }),
  ];

  // CSV Config
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename: 'employees_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
  });

  const fetchData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const token = localStorage.getItem("token");
    const url = new URL(`${baseUrl}/super-admin/acl/user`);

    // Add pagination parameters
    url.searchParams.set("page", pagination.pageIndex + 1);
    url.searchParams.set("limit", pagination.pageSize);

    // Add sorting parameters
    if (sorting.length > 0) {
      url.searchParams.set("sortBy", sorting[0].id);
      url.searchParams.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }

    // Add search parameter
    if (globalFilter) {
      url.searchParams.set("search", globalFilter);
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      setData(json.data.data);
      setRowCount(json.data.total);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  // Flatten employee data for CSV export
  const flattenEmployeeData = (employee) => {
    return {
      "Emp ID": employee.uuid || 'N/A',
      "Name": employee.name || 'N/A',
      "Email": employee.email || 'N/A',
      "Roles": employee.roles?.map(role => role.name).join(", ") || 'N/A',
      "Unit": employee.unit?.name || 'N/A',
      "Location": employee.location?.name || 'N/A',
      "Designation": employee.designation || 'N/A',
      "Products Count": employee.productAssignAssignedToUser?.filter(
        p => p.status === "Active" || p.status === "Handovered"
      ).length || 0
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map(row => flattenEmployeeData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setIsError(true);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/super-admin/acl/user?limit=${rowCount}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      const rowData = json.data.data.map(employee => flattenEmployeeData(employee));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Error exporting data:", error);
      setIsError(true);
    }
  };

  const handleBackClick = () => {
    setShowAddEmp(false);
  };

  const handleAddEmp = () => {
    setShowAddEmp(true);
    setSelectedUnitId(null);
    setShowAddVendor(true);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,   // 👈 disables filter by column
    columnResizeMode: "onChange",
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
        Total Rows: {rowCount}
      </Typography>
    ),

  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Top Stat Cards */}
      {!showAddVendor && !showProductList && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            mb: 3,
            "& > *": {
              flex: "1 1 calc(25% - 16px)",
              minWidth: "200px",
              maxWidth: "100%",
              boxSizing: "border-box",
            },
            "@media (max-width: 900px)": {
              "& > *": {
                flex: "1 1 calc(50% - 16px)",
              },
            },
            "@media (max-width: 600px)": {
              "& > *": {
                flex: "1 1 100%",
              },
            },
          }}
        >
          {/* {stats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                backgroundColor: "#fff",
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.label}
                </Typography>
                <Typography variant="h6">{stat.value}</Typography>
              </Box>
              <img src={stat.icon} alt={stat.label} />
            </Box>
          ))} */}
        </Box>
      )}

      {/* Table Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {!showAddVendor && !showProductList && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            // onClick={handleAddEmp}
            onClick={() => {
              setSelectedUnitId(null);
              setShowAddVendor(true);
            }}
          >
            Add Employees
          </Button>
        )}
      </Box>

      {showProductList ? (
        <AssignProductList
          unitId={selectedUnitId}
          onBack={() => {
            setShowProductList(false);
            setSelectedUnitId(null);
            fetchData(); // Optional: add if you want to refresh data when going back
          }}
        />
      ) : showAddVendor ? (
        <AddEmp
          onBack={(refresh = false) => {
            setShowAddVendor(false);
            setSelectedUnitId(null);
            if (refresh) {
              fetchData();
            }
          }}
          onEmployeeAdded={() => {
            fetchData();
            setShowAddEmp(false);
          }}
          unitId={selectedUnitId}
        />
      ) : (
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
      )}
    </Box>
  );
};

export default SubCategoryDashboard;
