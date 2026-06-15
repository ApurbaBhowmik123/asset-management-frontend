import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import Editicon1 from "../../../assets/EmployeeImages/Vector.png";
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from "export-to-csv";
import AddEmail from "./AddEmail";
import { baseUrl } from "../../Api";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";

const columnHelper = createMRTColumnHelper();

const ListEmail = () => {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);
  const [emailData, setEmailData] = useState({})
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);

  const token = localStorage.getItem("token");

  const handleEmailUpdate = (data) => {
    setSelectedEmailId(data.id);
    setShowAddEmail(true);
    setEmailData(data)
  }

  const columns = [
    columnHelper.accessor("subject", {
      header: "Subject",
      size: 200,
    }),
    columnHelper.accessor("action", {
      header: "Action",
      size: 200,
    }),
    columnHelper.accessor("unit.name", {
      header: "Unit",
      size: 120,
    }),
    columnHelper.accessor("unitAdmin.name", {
      header: "Unit Admin",
      size: 120,
    }),
    columnHelper.accessor("superAdmin.name", {
      header: "Super Admin",
      size: 120,
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
              handleEmailUpdate(row.original)
            }}
          >
            <img src={Editicon1} alt="edit" />
          </IconButton>

        </Box>
      ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename:
      "emails_export_" +
      new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  const flattenEmailData = (email) => {
    return {
      id: email.id,
      subject: email.subject,
      unit: email.unit?.name || "N/A",
      unitAdmin: email.unitAdmin?.name || "N/A",
      superAdmin: email.superAdmin?.name || "N/A",
      createdAt: dateTimeHelper.formatDate(email.createdAt, "DD/MM/YYYY"),
      updatedAt: dateTimeHelper.formatDate(email.updatedAt, "DD/MM/YYYY"),
    };
  };


  const fetchData = useCallback(
    async ({ pageIndex, pageSize, sorting, globalFilter }) => {
      setLoading(true);
      const sort = sorting?.[0] || { id: "createdAt", desc: true };

      try {
        const response = await axios.get(`${baseUrl}/super-admin/mail-config/list`, {
          params: {
            page: pageIndex + 1,
            limit: pageSize,
            sortBy: sort.id,
            sortOrder: sort.desc ? "desc" : "asc",
            search: globalFilter || "",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status) {
          setData(response.data.data.data);
          setTotalRows(response.data.data.total);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("Failed to fetch emails", "error");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchData({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      globalFilter,
    });
  }, [pagination, sorting, globalFilter, fetchData]);

  const handleExportRows = (rows) => {
    try {
      const rowData = rows.map((row) => flattenEmailData(row.original));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const handleExportData = () => {
    try {
      const rowData = data.map((email) => flattenEmailData(email));
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };


  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalRows,
    state: { pagination, sorting, globalFilter },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: false,
    enableColumnFilters: false,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
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
        Total Rows: {totalRows}
      </Typography>
    ),
    loading,
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
        {!showAddEmail && (
          <Button
            className="Global-Button4"
            sx={{ marginRight: "16px" }}
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedEmailId(null);
              setShowAddEmail(true);
            }}
          >
            Add Email
          </Button>
        )}
      </Box>

      {showAddEmail ? (
        <AddEmail
          onBack={(refresh = false) => {
            setShowAddEmail(false);
            setSelectedEmailId(null);
            setEmailData({});
            if (refresh) {
              fetchData({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sorting,
                globalFilter,
              });
            }
          }}
          emailId={selectedEmailId}
          emailData={emailData}
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
            Are you sure you want to delete the email{" "}
            <strong>{emailToDelete?.subject}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="Global-Button3"
            disabled={loading}
          >
            Cancel
          </Button>

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

export default ListEmail;
