import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import HandoverIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useNavigate } from 'react-router-dom';
import handIcon from "../../../assets/DashboardImages/homework.png"
import { baseUrl } from '../../Api';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const ListHandHover = () => {
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
    const [sorting, setSorting] = useState([{ id: 'name', desc: true }]);
    const navigate = useNavigate();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { pageIndex, pageSize } = pagination;
            const { id, desc } = sorting[0] || { id: 'name', desc: true };

            const url = new URL(`${baseUrl}/asset-mng/asset-helper/asset-assignable-details`);
            url.searchParams.set('page', pageIndex + 1);
            url.searchParams.set('limit', pageSize);
            url.searchParams.set('sortBy', id);
            url.searchParams.set('sortOrder', desc ? 'desc' : 'asc');
            // if (globalFilter) {
            //     url.searchParams.set('search', globalFilter);
            // }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            if (result.status) {
                setData(result.data.data);
                setAllData(result.data.data); // Store all data for client-side filtering
                setRowCount(result.data.pagination.total);
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
            console.error('Error fetching data:', error);
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
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting]);

    const columnHelper = createMRTColumnHelper();
    const columns = useMemo(() => [
        columnHelper.accessor('assignedId', {
            header: 'Assignment ID',
            size: 120,
            enableSorting: false,
            Cell: ({ cell }) => cell.getValue()?.slice(0, 6) || 'N/A',
        }),
        columnHelper.accessor('uuid', {
            header: 'Assign ID',
            size: 120,
            enableSorting: false,
            Cell: ({ cell }) => cell.getValue() || 'N/A',
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
                        onClick={() => navigate(`/assetmanagement/handover/${row.original.assignedId}`)}
                    >
                        <img src={handIcon} style={{ height: 20, width: 20 }} alt="Handover" />
                    </IconButton>
                </Box>
            ),
        }),
        columnHelper.accessor(row => row.products[0]?.AssetID, {
            header: 'Asset ID',
            size: 120,
            enableSorting: false,
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


        columnHelper.accessor(row => row.products[0]?.name, {
            header: 'Product Name',
            size: 140,
            Cell: ({ cell }) => cell.getValue() || 'N/A'
        }),
        columnHelper.accessor(row => row.products[0]?.brand?.name, {
            header: 'Brand',
            size: 100,
            Cell: ({ cell }) => cell.getValue() || 'N/A'
        }),
        // columnHelper.accessor(row => row.products[0]?.unit?.name, { 
        //     header: 'Unit', 
        //     size: 100,
        //     Cell: ({ cell }) => cell.getValue() || 'N/A'
        // }),
        columnHelper.accessor('assignedTo.user.name', {
            header: 'Assigned To',
            size: 150,
            Cell: ({ cell }) => cell.getValue() || 'N/A'
        }),
        columnHelper.accessor('assignedTo.user.department.name', {
            header: 'Department',
            size: 150,
            Cell: ({ cell }) => cell.getValue() || 'N/A'
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            size: 100,
            Cell: ({ cell }) => {
                const status = cell.getValue();
                const color = status === 'Active' ? '#345481' : '#28A745';
                return (
                    <Chip
                        label={status}
                        variant="outlined"
                        sx={{
                            borderColor: 'transparent',
                            backgroundColor: '#DAF2FF',
                            color: color,
                            fontSize: '12px',
                            px: 1,
                            borderRadius: 2,
                        }}
                    />
                );
            },
        }),

    ], [navigate]);

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
        data: filteredData,
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
        enableColumnFilters: false,   // 👈 disables filter by column
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
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                {/* <Typography variant="body1" fontWeight={500}>
                    All Assets
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
        </Box>
    );
};

export default ListHandHover;