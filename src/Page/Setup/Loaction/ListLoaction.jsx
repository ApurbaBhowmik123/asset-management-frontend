import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from "material-react-table";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AddLocation from "./AddLOaction";
import axios from "axios";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const ListLoaction = () => {
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);

  // const fetchData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const token = localStorage.getItem("token"); // ⬅️ Get token from localStorage

  //     const response = await axios.get(
  //       `${baseUrl}/super-admin/locations?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // ⬅️ Attach token in Authorization header
  //         },
  //       }
  //     );

  //     const result = response.data?.data;
  //     setData(result.data);
  //     setRowCount(result.total);
  //   } catch (err) {
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to fetch locations",
  //       severity: "error",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/super-admin/locations?page=${pagination.pageIndex + 1
        }&limit=${pagination.pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status || response.data.success) {
        // setSnackbar({
        //   open: true,
        //   message: response.data.message,
        //   severity: "success",
        // });

        const result = response.data?.data;
        setData(result.data);
        setRowCount(result.total);
      } else {
        const errorResponse = response.data.errorResponse;
        const message = errorResponse?.message || "Operation failed";
        setSnackbar({
          open: true,
          message,
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: errorResponse.message,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showAddVendor) fetchData();
  }, [pagination, showAddVendor]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("uuid", { header: "ID", size: 60 }),
      columnHelper.accessor("identificationNumber", { header: "IN", size: 80 }),
      columnHelper.accessor("abbriviatedName", {
        header: "Abbr Name",
        size: 120,
      }),
      columnHelper.accessor("name", { header: "Location Name", size: 140 }),
      columnHelper.accessor("address", { header: "Address", size: 140 }),
      columnHelper.accessor("units", {
        header: "Units",
        size: 120,
        Cell: ({ cell }) => {
          const units = cell.getValue();
          return (
            <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
              {units && units.length > 0
                ? units.map((u, i) => (
                  <div key={i}>{u.name}</div> // each on new line
                ))
                : "-"}
            </div>
          );
        },
      }),

      columnHelper.accessor("createdAt", {
        header: "Created At",
        size: 120,
        Cell: ({ cell }) =>
          dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        size: 120,
        Cell: ({ cell }) =>
          dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
      }),
      columnHelper.accessor("createdBy.name", {
        header: "Created By",
        size: 120,
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
              onClick={() => {
                setSelectedUnitId(row.original.id);
                setShowAddVendor(true);
              }}
            >
              <img src={Editicon1} alt="edit" width={16} height={16} />
            </IconButton>
          </Box>
        ),
      }),
    ],
    []
  );

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "locations_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const flattenLocationData = (location) => {
    return {
      ID: location.uuid || "",
      "Identification Number": location.identificationNumber || "N/A",
      "Abbriviated Name": location.abbriviatedName || "N/A",
      "Location Name": location.name || "N/A",
      Units: location.units?.map((u) => u.name).join(", ") || "N/A",
      "Created At": dateTimeHelper.formatDate(location.createdAt, "DD/MM/YYYY"),
      "Updated At": location.updatedAt
        ? dateTimeHelper.formatDate(location.updatedAt, "DD/MM/YYYY")
        : "N/A",
      "Created By": location.createdBy?.name || "System",
    };
  };

  const handleExportRows = (rows) => {
    try {
      if (!rows || !Array.isArray(rows)) {
        throw new Error("Invalid rows data for export");
      }

      const rowData = rows.map((row) => flattenLocationData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error",
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch all data for complete export
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/super-admin/locations?page=1&limit=${rowCount}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.status) {
        throw new Error("Failed to fetch data for export");
      }

      const locations = response.data?.data?.data || [];
      const rowData = locations.map(flattenLocationData);
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to export all data",
        severity: "error",
      });
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    rowCount,
    state: {
      pagination,
      isLoading,
    },
    onPaginationChange: setPagination,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false, // 👈 disables filter by column
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
        {!showAddVendor && (
          <Button
            className="Global-Button4"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUnitId(null);
              setShowAddVendor(true);
            }}
          >
            Add Location
          </Button>
        )}
      </Box>

      {showAddVendor ? (
        <AddLocation
          onBack={() => {
            setShowAddVendor(false);
            setSelectedUnitId(null);
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
              xl: "1400px",
            },
            overflow: "auto",
            mx: "auto",
            px: { xs: 1, sm: 2 },
          }}
        >
          <MaterialReactTable table={table} />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the unit{" "}
            <strong>{unitToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="Global-Button3"
          >
            Cancel
          </Button>
          <Button className="Global-Button6">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListLoaction;
