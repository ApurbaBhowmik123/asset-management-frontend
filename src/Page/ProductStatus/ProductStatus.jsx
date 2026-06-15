
import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Grid,
    InputLabel,
    TextField,
    Typography,
} from "@mui/material";
import {
    createMRTColumnHelper,
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { baseUrl } from "../Api";
import { useParams } from "react-router-dom";
import { generateCsv, mkConfig } from "export-to-csv";
import { dateTimeHelper } from "../../Helper/DateTimeHelper/DateTimeHelper";
import { CustomTextField } from "../../utils/CustomTextField";

const ProductStatus = () => {
    const columnHelper = createMRTColumnHelper();
    const columns = [
        columnHelper.accessor("transactionId", { header: "Transaction Id", size: 80 }),
        columnHelper.accessor("logReportDetails", {
            header: "Log report details",
            size: 120,
            Cell: ({ cell }) => (
                <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {cell.getValue()}
                </div>
            ),
        }),
        columnHelper.accessor("transactionDate", {
            header: "Transaction Date",
            size: 120,
            Cell: ({ cell }) =>
                dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        }),
        columnHelper.accessor("productStatus", { header: "Product Status", size: 80 }),
        columnHelper.accessor("transactionType", {
            header: "Transaction Type",
            size: 120,
            Cell: ({ cell }) => (
                <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {cell.getValue()}
                </div>
            ),
        }),
    ]


    const csvConfig = mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true,
    });

    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [sorting, setSorting] = useState([]);
    const [selectedRows, setSelectedRows] = useState({});
    const [loading, setLoading] = useState(false);
    const [logData, setLogData] = useState([]);
    const [productData, setProductData] = useState({});
    const params = useParams();
    const { id } = params;

    const totalRows = logData.length;
    const totalPages = Math.ceil(totalRows / pagination.pageSize);

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(logData);
        download(csvConfig)(csv);
    };

    const calculateGrandTotal = () => {
        return logData.reduce((sum, item) => sum + item.price || 0, 0);
    };

    const handleFetchProductStatus = async () => {
        const res = await fetch(
            `${baseUrl}/request/request-product/log-details/${id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        const data = await res?.json();
        if (!data?.status) {
            return;
        }
        setLogData(data?.data?.logDetails || []);
        setProductData(data?.data?.productRequest || {});
    };

    useEffect(() => {
        handleFetchProductStatus();
    }, []);



    const table = useMaterialReactTable({
        columns,
        data: logData,
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
            rowSelection: selectedRows,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setSelectedRows,
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
        // renderTopToolbarCustomActions: ({ table }) => (
        //     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        //         <Button
        //             onClick={handleExportData}
        //             startIcon={<FileDownloadIcon />}
        //             className="Global-Button4"
        //         >
        //             Export All Data
        //         </Button>
        //         <Button
        //             onClick={() =>
        //                 handleExportRows(table.getPrePaginationRowModel().rows)
        //             }
        //             startIcon={<FileDownloadIcon />}
        //             className="Global-Button4"
        //         >
        //             Export All Rows
        //         </Button>
        //         <Button
        //             onClick={() => handleExportRows(table.getRowModel().rows)}
        //             startIcon={<FileDownloadIcon />}
        //             className="Global-Button4"
        //         >
        //             Export Page Rows
        //         </Button>
        //         <Button
        //             disabled={
        //                 !table.getIsSomeRowsSelected() &&
        //                 !table.getIsAllRowsSelected()
        //             }
        //             onClick={() =>
        //                 handleExportRows(table.getSelectedRowModel().rows)
        //             }
        //             startIcon={<FileDownloadIcon />}
        //             className="Global-Button5"
        //         >
        //             Export Selected Rows
        //         </Button>
        //     </Box>
        // ),
        // renderBottomToolbar: () => (
        //     <Box
        //         sx={{
        //             display: "flex",
        //             justifyContent: "flex-end",
        //             p: 1,
        //             alignItems: "center",
        //         }}
        //     >
        //         <Typography variant="body2" fontWeight={"bold"}>
        //             Grand Total : ₹{calculateGrandTotal()}
        //         </Typography>
        //     </Box>
        // ),
    });

    return (
        <div>
            <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Transaction Id:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.uuid || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Reason:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.Reason || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Request status:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.RequestStatus || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Approval status:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.approvalStatus || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Asset Id:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.InventoryProductDetails?.uuid || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Serial No:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.InventoryProductDetails?.serialNo1 || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Asset status:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={productData?.InventoryProductDetails?.assignedStatus || ""}
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Product name:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={
                            productData?.InventoryProductDetails?.grInventoryProduct?.product
                                ?.name || ""
                        }
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Asset type:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={
                            productData?.InventoryProductDetails?.grInventoryProduct?.product
                                ?.subcategory?.name || ""
                        }
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Created By:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={
                            productData?.createdUser?.name ?? ""

                        }
                        size="small"
                        variant="outlined"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <InputLabel>Approved By:</InputLabel>
                    <CustomTextField
                        fullWidth
                        // disabled
                        value={
                            productData?.approver?.name ?? ""
                        }
                        size="small"
                        variant="outlined"
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    width: {
                        xs: "100%",
                        sm: "500px",
                        md: "750px",
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
        </div>
    );
};

export default ProductStatus;
