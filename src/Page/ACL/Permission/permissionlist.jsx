import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { baseUrl } from "../../Api";
import axios from "axios";
import PermissionCreate from "./permissioncreate";
import AddIcon from "@mui/icons-material/Add";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

const PermissionList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [sorting, setSorting] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [rowSelection, setRowSelection] = useState({});
    const [showCreateRole, setShowCreateRole] = useState(false);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const sortBy = sorting[0]?.id || "createdAt";
            const sortOrder = sorting[0]?.desc ? "desc" : "asc";

            const res = await axios.get(
                `${baseUrl}/super-admin/acl/permission?page=${pagination.pageIndex + 1
                }&limit=${pagination.pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${globalFilter}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data?.status) {
                const responseData = res.data.data;
                setData(responseData.data || []);
                setTotalRows(responseData.total || 0);
                setTotalPages(responseData.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, [pagination, sorting, globalFilter]);

    const columnHelper = createMRTColumnHelper();
    const columns = [
        columnHelper.accessor("name", { header: "Name", size: 180 }),
        columnHelper.accessor("description", { header: "Description", size: 250 }),
        columnHelper.accessor("slug", { header: "Slug", size: 150 }),
        columnHelper.accessor("createdAt", {
            header: "Created At",
            size: 180,
            Cell: ({ cell }) =>
                dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        }),
        columnHelper.accessor("updatedAt", {
            header: "Updated At",
            size: 180,
            Cell: ({ cell }) =>
                dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        }),
    ];

    // Export helpers
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
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        rowCount: totalRows,
        pageCount: totalPages,
        state: {
            globalFilter,
            pagination,
            sorting,
            isLoading: loading,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        enableGlobalFilter: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableColumnResizing: false,
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
                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
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
        // Replace the renderBottomToolbarCustomActions function in your table configuration
        renderBottomToolbarCustomActions: () => (
            <Typography variant="body2" sx={{ ml: 2, fontWeight: 500 }}>
                Total Rows: {totalRows}
            </Typography>
        ),
    });


    if (showCreateRole) {
        return (
            <PermissionCreate
                onBack={() => setShowCreateRole(false)} // go back to list
                onSuccess={() => {
                    setShowCreateRole(false);
                    // refresh list after creating
                    setPagination({ ...pagination });
                }}
            />
        );
    }

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="flex-end"
                mb={2}
                px={{ xs: 1, sm: 2 }}
            >
                <Button
                    className="Global-Button4"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateRole(true)}
                >
                    Add Permission
                </Button>
            </Box>

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

export default PermissionList;
