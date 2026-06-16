import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { useNavigate } from 'react-router-dom';
import handIcon from "../../../assets/DashboardImages/homework.png";
import { baseUrl } from '../../Api';

//Update csvConfig with filename
const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename: 'assignments_export_' + new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
});

const AssignList = () => {
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]); // Store all data for client-side filtering
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [rowCount, setRowCount] = useState(0);
    const [sorting, setSorting] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const navigate = useNavigate();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { pageIndex, pageSize } = pagination;
            const sortBy = sorting[0]?.id || '';
            const sortOrder = sorting[0]?.asc ? 'asc' : 'desc';
            const search = globalFilter || '';

            const res = await fetch(
                `${baseUrl}/asset-mng/asset/list?page=${pageIndex + 1}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}`, //&search=${search}
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const json = await res.json();

            if (json.status) {
                setData(json.data.data);
                setAllData(json.data.data); // Store all data for client-side filtering
                setRowCount(json.data.total);
                setIsError(false);
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsError(true);
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

                // Handle nested object values (like assignedToUser.name)
                if (typeof value === 'object') {
                    // Convert nested object to string and search
                    const stringValue = JSON.stringify(value).toLowerCase();
                    return stringValue.includes(lowercasedFilter);
                }

                return false;
            });
        });
    }, [allData, globalFilter]);

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

    const columnHelper = createMRTColumnHelper();
    const columns = useMemo(() => [
        columnHelper.accessor('assignedId', {
            header: 'Assignment ID',
            size: 140,
            Cell: ({ cell }) => cell.getValue()?.slice(0, 6) || 'N/A',
        }),
        columnHelper.accessor('inventoryProductDetail.uuid', {
            header: 'Asset ID',
            size: 120,
            Cell: ({ cell }) => (
                <Box
                    sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: 1.2,
                    }}
                >
                    {cell.getValue() || 'N/A'}
                </Box>
            ),
        }),

        // columnHelper.accessor('status', {
        //     header: 'Status',
        //     size: 130,
        //     Cell: ({ cell }) => {
        //         const status = cell.getValue();
        //         const color = status === 'Active' ? '#345481' : '#28A745';
        //         return (
        //             <Chip
        //                 label={status}
        //                 variant="outlined"
        //                 sx={{
        //                     borderColor: 'transparent',
        //                     backgroundColor: '#DAF2FF',
        //                     color: color,
        //                     fontSize: '12px',
        //                     px: 1,
        //                     borderRadius: 2,
        //                 }}
        //             />
        //         );
        //     },
        // }),

        columnHelper.accessor('endDate', {
            header: 'Allocation Expired',
            size: 160,
            Cell: ({ cell }) => {
                const endDate = cell.getValue();
                const today = new Date();

                let color = 'green';
                if (endDate) {
                    const end = new Date(endDate);
                    if (end < today) {
                        color = 'red';
                    }
                }

                return (
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: color,
                            mx: 'auto',
                        }}
                    />
                );
            },
        }),

        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            size: 100,
            Cell: ({ row }) => (
                <Box>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(
                                    `${baseUrl}/asset-mng/asset/details/${row.original.assignedId}`,
                                    {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        }
                                    }
                                );
                                const json = await response.json();
                                if (json.status) {
                                    navigate(`/assetmanagement/assigndetails/${row.original.assignedId}`, {
                                        state: { assignment: json.data.data }
                                    });
                                } else {
                                    console.error('Failed to fetch assignment details');
                                }
                            } catch (error) {
                                console.error('Error fetching assignment details:', error);
                            }
                        }}
                    >
                        <img src={handIcon} style={{ height: 20, width: 20 }} alt="Handover" />
                    </IconButton>
                </Box>
            ),
        }),

        // Updated columns to handle both assignedToUser and assignedToLocation
        columnHelper.accessor(row => {
            // Check if assigned to user or location
            if (row.assignedToUser) {
                return row.assignedToUser.name;
            } else if (row.assignedToLocation) {
                return row.assignedToLocation.name;
            }
            return '-';
        }, {
            id: 'assignedTo',
            header: 'Assigned To',
            size: 150,
        }),

        columnHelper.accessor(row => {
            // Check if assigned to user or location
            if (row.assignedToUser) {
                return row.assignedToUser.unit?.name || '-';
            } else if (row.assignedToLocation && row.assignedToLocation.unitlocation?.length > 0) {
                return row.assignedToLocation.unitlocation[0]?.unit?.name || '-';
            }
            return '-';
        }, {
            id: 'unit',
            header: 'Unit',
            size: 150,
        }),

        columnHelper.accessor(row => {
            // Check if assigned to user or location
            if (row.assignedToUser) {
                return row.assignedToUser.location?.name || '-';
            } else if (row.assignedToLocation) {
                return row.assignedToLocation.name || '-';
            }
            return '-';
        }, {
            id: 'location',
            header: 'Location',
            size: 150,
        }),



        columnHelper.accessor('inventoryProductDetail.grInventoryProduct.product.name', {
            header: 'Product Name',
            size: 160,
            Cell: ({ cell }) => cell.getValue() || 'N/A',
        }),
        columnHelper.accessor('inventoryProductDetail.grInventoryProduct.product.category.name', {
            header: 'Category',
            size: 120,
            Cell: ({ cell }) => cell.getValue() || 'N/A',
        }),
        columnHelper.accessor('inventoryProductDetail.specValues', {
            header: 'Attributes',
            id: 'attributes',
            size: 200,
            Cell: ({ row }) => {
                const invDetails = row.original.inventoryProductDetail;
                const specValues = invDetails?.specValues?.length ? invDetails.specValues : invDetails?.grInventoryProduct?.product?.productSpecValue;
                if (!specValues || specValues.length === 0) return 'N/A';
                return specValues.map(s => `${s.specField?.name}: ${s.value}`).join(', ');
            },
        }),
        columnHelper.accessor('inventoryProductDetail.grInventoryProduct.product.brand.name', {
            header: 'Brand',
            size: 100,
            Cell: ({ cell }) => cell.getValue() || 'N/A',
        }),
    ], [navigate]);

    // Add flattenAssignmentData function
    const flattenAssignmentData = (assignment) => {
        return {
            assignmentId: assignment.assignedId || 'N/A',
            assetId: assignment.inventoryProductDetail?.uuid || 'N/A',
            assignedTo: assignment.assignedToUser ? assignment.assignedToUser.name :
                assignment.assignedToLocation ? assignment.assignedToLocation.name : 'N/A',
            unit: assignment.assignedToUser ? assignment.assignedToUser.unit?.name :
                assignment.assignedToLocation && assignment.assignedToLocation.unitlocation?.length > 0 ?
                    assignment.assignedToLocation.unitlocation[0]?.unit?.name : 'N/A',
            location: assignment.assignedToUser ? assignment.assignedToUser.location?.name :
                assignment.assignedToLocation ? assignment.assignedToLocation.name : 'N/A',
            productName: assignment.inventoryProductDetail?.grInventoryProduct?.product?.name || 'N/A',
            category: assignment.inventoryProductDetail?.grInventoryProduct?.product?.category?.name || 'N/A',
            brand: assignment.inventoryProductDetail?.grInventoryProduct?.product?.brand?.name || 'N/A',
            attributes: (() => {
                const specValues = assignment.inventoryProductDetail?.specValues?.length ? assignment.inventoryProductDetail.specValues : assignment.inventoryProductDetail?.grInventoryProduct?.product?.productSpecValue;
                return specValues?.length ? specValues.map(s => `${s.specField?.name}: ${s.value}`).join(', ') : 'N/A';
            })()
            // endDate: assignment.endDate || 'N/A',
            // allocationExpired: assignment.endDate ?
            //     (new Date(assignment.endDate) < new Date() ? 'Yes' : 'No') : 'N/A'
        };
    };

    // Replace export functions
    const handleExportRows = (rows) => {
        try {
            const rowData = rows.map(row => flattenAssignmentData(row.original));
            const csv = generateCsv(csvConfig)(rowData);
            download(csvConfig)(csv);
        } catch (error) {
            console.error("Export error:", error);
            showSnackbar("Failed to export data", "error");
        }
    };

    const handleExportData = () => {
        try {
            const rowData = data.map(assignment => flattenAssignmentData(assignment));
            const csv = generateCsv(csvConfig)(rowData);
            download(csvConfig)(csv);
        } catch (error) {
            console.error("Export error:", error);
            showSnackbar("Failed to export data", "error");
        }
    };

    // Add showSnackbar function
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };


    const table = useMaterialReactTable({
        columns,
        data,
        state: {
            globalFilter,
            isLoading,
            pagination,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        enableGlobalFilter: true,
        manualPagination: true,
        manualSorting: true,
        rowCount,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableColumnResizing: false,
        enableColumnFilters: true,
        initialState: {
            showGlobalFilter: true,
            showColumnFilters: false,
        },
        paginationDisplayMode: 'pages',
        columnResizeMode: 'onChange',
        layoutMode: 'grid',
        positionToolbarAlertBanner: 'bottom',
        muiTablePaperProps: {
            elevation: 0,
            sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
        },
        muiTableHeadRowProps: {
            sx: { backgroundColor: '#FFE3E1' },
        },
        muiTableBodyCellProps: {
            sx: { fontSize: '12px', whiteSpace: 'nowrap' },
        },
        muiTableBodyRowProps: {
            sx: {
                '&:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button onClick={handleExportData} startIcon={<FileDownloadIcon />} className="Global-Button4">
                    Export All Data
                </Button>
                <Button onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
                    Export All Rows
                </Button>
                <Button onClick={() => handleExportRows(table.getRowModel().rows)} startIcon={<FileDownloadIcon />} className="Global-Button4">
                    Export Page Rows
                </Button>
                <Button
                    disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
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

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <Typography color="error">Error loading data. Please try again.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} />
            <Box sx={{
                width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "1050px",
                    xl: "1300px"
                },
                overflow: "auto",
                mx: "auto",
                px: { xs: 1, sm: 2 }
            }}>
                <MaterialReactTable table={table} />
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AssignList;