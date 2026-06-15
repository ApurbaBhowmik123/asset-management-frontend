import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
  TextField,
  Modal,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
// import Deleteicon1 from "../../assets/EmployeeImages/Vector (1).png";
import AddIcon from "@mui/icons-material/Add";
import { mkConfig, generateCsv, download } from "export-to-csv";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import { Eye } from "lucide-react";

const SoftwareAssign = () => {
  const [globalFilter, setGlobalFilter] = useState("");
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

  //  State for Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedSoftwares, setSelectedSoftwares] = useState([]);
  const [softwares, setSoftwares] = useState([]); // fetched software list
  const [loadingSoftwares, setLoadingSoftwares] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  // Fetch Software List API
  const fetchSoftwares = async () => {
    setLoadingSoftwares(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/software/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch softwares");
      }

      const json = await response.json();
      setSoftwares(json.data || []); // Adjust if API response structure differs
    } catch (error) {
      console.error("Error fetching softwares:", error);
      setIsError(true);
    } finally {
      setLoadingSoftwares(false);
    }
  };

  const handleCheckboxChange = (softwareId) => {
    setSelectedSoftwares((prev) =>
      prev.includes(softwareId)
        ? prev.filter((s) => s !== softwareId)
        : [...prev, softwareId]
    );
  };

  const handleSubmitSoftware = async () => {
    try {
      const token = localStorage.getItem("token");
      const body = {
        softwareIds: selectedSoftwares,
        assignToUser: selectedUserId,
      };

      const response = await fetch(`${baseUrl}/software/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to assign software");
      }

      const json = await response.json();
      setSnackbarMessage(json.message || "Operation successful");
      setSnackbarSeverity(json.status ? "success" : "error");
      setSnackbarOpen(true);
      await fetchData();
    } catch (error) {
      console.error("Error assigning software:", error);
      setIsError(true);
      setSnackbarMessage("Failed to assign/unassign software");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setOpenModal(false);
      setSelectedSoftwares([]);
    }
  };

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
      (row) => row.roles?.map((role) => role.name).join(", ") || "—",
      {
        id: "roles",
        header: "Roles",
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2">{cell.getValue()}</Typography>
        ),
      }
    ),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 160,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Button to open modal and fetch softwares */}
          <Button
            className="Global-Button7"
            onClick={() => {
              setSelectedUserId(row.original.id); // save user ID
              setSelectedSoftwares(
                row.original.softAssignedTo?.map((s) => s.software.id) || []
              ); // preselect assigned
              fetchSoftwares();
              setOpenModal(true);
            }}
          >
            Assign/Unassign Software
          </Button>

        </Box>
      ),
    }),
    columnHelper.accessor((row) => row.unit?.name || "-", {
      id: "unitName",
      header: "Unit",
      size: 110,
    }),
    columnHelper.accessor((row) => row.location?.name || "-", {
      id: "locationName",
      header: "Location",
      size: 110,
    }),
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

  ];

  // CSV Config
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "employees_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const fetchData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const token = localStorage.getItem("token");
    const url = new URL(`${baseUrl}/super-admin/acl/user`);
    url.searchParams.set("page", pagination.pageIndex + 1);
    url.searchParams.set("limit", pagination.pageSize);

    if (sorting.length > 0) {
      url.searchParams.set("sortBy", sorting[0].id);
      url.searchParams.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }
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

  const flattenEmployeeData = (employee) => {
    return {
      "Emp ID": employee.uuid || "N/A",
      Name: employee.name || "N/A",
      Email: employee.email || "N/A",
      Roles: employee.roles?.map((role) => role.name).join(", ") || "N/A",
      Unit: employee.unit?.name || "N/A",
      Location: employee.location?.name || "N/A",
      Designation: employee.designation || "N/A",
      "Products Count":
        employee.productAssignAssignedToUser?.filter(
          (p) => p.status === "Active" || p.status === "Handovered"
        ).length || 0,
    };
  };

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => flattenEmployeeData(row.original));
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
      const rowData = json.data.data.map((employee) =>
        flattenEmployeeData(employee)
      );
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Error exporting data:", error);
      setIsError(true);
    }
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
    enableColumnFilters: false,
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
      <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
        Total Rows: {rowCount}
      </Typography>
    ),
  });

  return (
    <Box sx={{ width: "100%" }}>
      {!showAddVendor && !showProductList && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            mb: 3,
          }}
        ></Box>
      )}

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

      {/* Modal for Assign Software */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            width: 500,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Assign/Unassign Software
          </Typography>

          {loadingSoftwares ? (
            <Typography variant="body2">Loading softwares...</Typography>
          ) : softwares.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr", // ✅ 2 columns
                gap: 1,
              }}
            >
              {softwares.map((software) => (
                <FormControlLabel
                  key={software.id}
                  control={
                    <Checkbox
                      checked={selectedSoftwares.includes(software.id)}
                      onChange={() => handleCheckboxChange(software.id)}
                    />
                  }
                  label={software.name}
                />
              ))}

            </Box>
          ) : (
            <Typography variant="body2">No softwares found</Typography>
          )}

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              className="Global-Button2"
              onClick={handleSubmitSoftware}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>


    </Box>
  );
};

export default SoftwareAssign;
