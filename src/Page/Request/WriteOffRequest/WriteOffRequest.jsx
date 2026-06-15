import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Select,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from "material-react-table";
import { mkConfig, generateCsv, download } from "export-to-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ViewIcon from "../../../assets/EmployeeImages/Group (2).png";
import { baseUrl } from "../../Api";
import axios from "axios";
import { dateTimeHelper } from "../../../Helper/DateTimeHelper/DateTimeHelper";
import companyLogo from "../../../assets/Sidebarimages/Layer 1 1.jpeg";
// CSV Config
const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});
const today = new Date().toLocaleDateString("en-GB");

const WriteOffRequest = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [sorting, setSorting] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRows, setSelectedRows] = useState({});

    // Dropdown states
    const [preparedBy, setPreparedBy] = useState("");
    const [reviewedBy, setReviewedBy] = useState("");
    const [approvedBy, setApprovedBy] = useState("");

    // Dropdown user list
    const [userList, setUserList] = useState([]);

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    // Approve dialog state
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [approveSignatureFile, setApproveSignatureFile] = useState(null);
    const [approveStatus, setApproveStatus] = useState("");

    // Transform API data to match table structure
    const transformApiData = (apiData) => {
        return apiData.map((item, index) => ({
            refNo: item.uuid || 'N/A',
            assetCode: item.InventoryProductDetails?.uuid || 'N/A',
            assetType: item.InventoryProductDetails?.grInventoryProduct?.product?.subcategory?.name || 'N/A',
            serialNumber: item.InventoryProductDetails?.serialNo1 || 'N/A',
            qty: 1, // Hardcoded as per requirement
            location: item.InventoryProductDetails?.location?.name || 'N/A',
            capDate: item.InventoryProductDetails?.grInventoryProduct?.grDetails?.grDate
                || 'N/A',
            age: item.InventoryProductDetails?.grInventoryProduct?.grDetails?.grDate
                ? ((new Date() - new Date(item.InventoryProductDetails.grInventoryProduct.grDetails.grDate)) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
                : 'N/A',
            toBeWriteOff: "To be write off", // Hardcoded as per requirement
            grossValue: item.totalCost ? item.totalCost.toLocaleString() : '0',
            netBookValue: item.InventoryProductDetails?.grInventoryProduct?.ratePerPiece
                ? item.InventoryProductDetails.grInventoryProduct.ratePerPiece.toLocaleString() : '0',
            remark: item.Reason || '',
            originalData: item, // Keep original data for reference
            id: item.id // Keep the original ID for API calls
        }));
    };

    // Fetch data from API
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            // Build query parameters
            const params = new URLSearchParams({
                page: (pagination.pageIndex + 1).toString(),
                limit: pagination.pageSize.toString(),
                search: globalFilter || '',
            });

            // Add sorting parameters
            if (sorting.length > 0) {
                const sort = sorting[0];
                params.append('sortBy', sort.id);
                params.append('sortOrder', sort.desc ? 'desc' : 'asc');
            } else {
                params.append('sortBy', 'id');
                params.append('sortOrder', 'desc');
            }

            const response = await axios.get(
                `${baseUrl}/request/e-waste/list?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.status && response.data?.data) {
                const transformedData = transformApiData(response.data.data.data);
                setData(transformedData);
                setTotalRows(response.data.data.total);
                setTotalPages(response.data.data.totalPages);
            } else {
                setData([]);
                setTotalRows(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
            setTotalRows(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change
    useEffect(() => {
        fetchData();
    }, [pagination, sorting, globalFilter]);

    // Fetch user list
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${baseUrl}/asset-mng/asset-helper/user-list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.data?.data) {
                    setUserList(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching user list:", err);
            }
        };
        fetchUsers();
    }, []);

    // Totals Calculation
    const totals = useMemo(() => {
        const qty = data.reduce((sum, item) => sum + Number(item.qty || 0), 0);
        const gross = data.reduce(
            (sum, item) => sum + Number(item.grossValue?.replace(/,/g, "") || 0),
            0
        );
        const net = data.reduce(
            (sum, item) => sum + Number(item.netBookValue?.replace(/,/g, "") || 0),
            0
        );
        return { qty, gross, net };
    }, [data]);

    // File upload handlers
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus("");
        }
    };

    // const handleUpload = async () => {
    //     if (!selectedFile) {
    //         setUploadStatus("Please select a file first.");
    //         return;
    //     }

    //     try {
    //         setUploadStatus("Uploading...");
    //         const formData = new FormData();
    //         formData.append("file", selectedFile);

    //         // Add other form data if needed
    //         formData.append("preparedBy", preparedBy);
    //         formData.append("reviewedBy", reviewedBy);
    //         formData.append("approvedBy", approvedBy);

    //         const token = localStorage.getItem("token");
    //         const response = await axios.post(`${baseUrl}/write-off/upload`, formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         if (response.status === 200) {
    //             setUploadStatus("File uploaded successfully!");
    //             setUploadDialogOpen(false);
    //             setSelectedFile(null);
    //             // Refresh data after upload
    //             fetchData();
    //         } else {
    //             setUploadStatus("Upload failed. Please try again.");
    //         }
    //     } catch (error) {
    //         console.error("Upload error:", error);
    //         setUploadStatus("Upload failed. Please try again.");
    //     }
    // };

    // Approve signature file selection
    const handleApproveSignatureSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setApproveSignatureFile(file);
            setApproveStatus("");
        }
    };

    // Approve write-off request
    const handleApproveRequest = async () => {
        if (!approveSignatureFile) {
            setApproveStatus("Please select a signature file first.");
            return;
        }

        if (!preparedBy || !reviewedBy || !approvedBy) {
            setApproveStatus("Please select all personnel (Prepared By, Reviewed By, Approved By).");
            return;
        }

        const selectedRowIds = Object.keys(selectedRows)
            .filter(key => selectedRows[key])
            .map(key => data[key].id);

        if (selectedRowIds.length === 0) {
            setApproveStatus("Please select at least one row to approve.");
            return;
        }

        try {
            setApproveStatus("Approving...");
            const formData = new FormData();
            formData.append("signaturedFile", approveSignatureFile);

            // Find user IDs from names
            const preparedByUser = userList.find(user => user.name === preparedBy);
            const reviewedByUser = userList.find(user => user.name === reviewedBy);
            const approvedByUser = userList.find(user => user.name === approvedBy);

            if (!preparedByUser || !reviewedByUser || !approvedByUser) {
                setApproveStatus("Could not find user information. Please refresh and try again.");
                return;
            }

            formData.append("issuerId", preparedByUser.id);
            formData.append("approverId", approvedByUser.id);
            formData.append("reviewerId", reviewedByUser.id);
            formData.append("ProductRequestIds", JSON.stringify(selectedRowIds));

            const token = localStorage.getItem("token");
            const response = await axios.post(`${baseUrl}/request/e-waste/approve`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data?.status) {
                setApproveStatus("Request approved successfully!");
                setApproveDialogOpen(false);
                setApproveSignatureFile(null);
                // Refresh data after approval
                fetchData();
            } else {
                setApproveStatus("Approval failed. Please try again.");
            }
        } catch (error) {
            console.error("Approval error:", error);
            setApproveStatus("Approval failed. Please try again.");
        }
    };

    // PDF Export Function - Updated with hardcoded personnel and signature lines
    const handleExportToPDF = (selectedData = []) => {
        try {
            // Create a new PDF document in landscape mode
            const doc = new jsPDF('landscape');

            // Set document properties
            doc.setProperties({
                title: 'Write Off Request Report',
                subject: 'Asset Write Off Details',
                author: 'Asset Management System'
            });

            // Add company logo (replace with your actual logo)
            // For now, using a placeholder text as logo
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.addImage(companyLogo, 'PNG', 20, 15, 20, 20);

            // Add header information - more compact layout
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);

            // Company info on left (moved right to make space for logo)
            doc.text('To', 45, 15);
            doc.text('CDIO,', 45, 20);
            doc.text('Essel Mining & Industries Limited', 45, 25);
            doc.text('Kolkata - 700 017', 45, 30);

            // Reference info on right
            const currentDate = new Date();
            const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

            // doc.text(`Ref. Doc. No: WO/25/HO/01`, 200, 15);
            const firstRefNo = selectedData.length > 0 ? selectedData[0].refNo : "N/A";
            doc.text(`Ref. Doc. No: ${firstRefNo}`, 200, 15);
            doc.text(`Date: ${formattedDate}`, 200, 20);

            // Add description text - more compact
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const descriptionText = "The following IT Assets/Peripherals are in non-usable condition, because of obsoleted Technology / broken & damaged. Kindly approve to write-off the same, accordingly update the books of accounts. After write-off items will be scrapped as per E-Waste policy governed by ABG.";

            // Split description into multiple lines if needed
            const splitDescription = doc.splitTextToSize(descriptionText, 250);
            doc.text(splitDescription, 20, 40);

            let yPosition = 55; // Reduced starting position

            // Add asset details table
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('Asset Details:', 20, yPosition);
            yPosition += 7; // Reduced gap

            // Prepare table data
            const tableColumns = [
                { header: 'Ref No.', dataKey: 'refNo' },
                { header: 'Asset Code', dataKey: 'assetCode' },
                { header: 'Type', dataKey: 'assetType' },
                { header: 'Serial No.', dataKey: 'serialNumber' },
                { header: 'Qty', dataKey: 'qty' },
                { header: 'Location', dataKey: 'location' },
                { header: 'CAP Date', dataKey: 'capDate' },
                { header: 'Age', dataKey: 'age' },
                { header: 'Status', dataKey: 'toBeWriteOff' },
                { header: 'Gross Value', dataKey: 'grossValue' },
                { header: 'Net Value', dataKey: 'netBookValue' },
                { header: 'Remark', dataKey: 'remark' }
            ];

            // Calculate totals for selected data
            const selectedQty = selectedData.reduce((sum, item) => sum + Number(item.qty || 0), 0);
            const selectedGross = selectedData.reduce(
                (sum, item) => sum + Number(item.grossValue?.replace(/,/g, "") || 0),
                0
            );
            const selectedNet = selectedData.reduce(
                (sum, item) => sum + Number(item.netBookValue?.replace(/,/g, "") || 0),
                0
            );

            // Add totals row
            const tableData = [...selectedData];
            tableData.push({
                refNo: '',
                assetCode: '',
                assetType: '',
                serialNumber: 'TOTAL:',
                qty: selectedQty,
                location: '',
                capDate: '',
                age: '',
                toBeWriteOff: '',
                grossValue: selectedGross.toLocaleString(),
                netBookValue: selectedNet.toLocaleString(),
                remark: ''
            });

            // Draw the main table with smaller font and padding
            autoTable(doc, {
                startY: yPosition,
                columns: tableColumns,
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 227, 225],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 6
                },
                styles: {
                    fontSize: 6, // Smaller font
                    cellPadding: 1, // Reduced padding
                    overflow: 'linebreak',
                    halign: 'left'
                },
                margin: { left: 20, right: 20 },
                didDrawCell: (data) => {
                    // Highlight the totals row
                    if (data.section === 'body' && data.row.index === selectedData.length) {
                        doc.setFillColor(52, 84, 129);
                        doc.setTextColor(255, 255, 255);
                        doc.setFont("helvetica", "bold");
                    }
                },
            });

            // Get the final Y position after the table
            yPosition = doc.lastAutoTable.finalY + 15; // Reduced gap

            // Add Personnel Information
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('Personnel Information:', 20, yPosition);
            yPosition += 10; // Reduced gap

            // Hardcoded personnel data
            const personnelData = [
                'Kingshuk Sen',
                'Diganta De',
                'Muthu Vijayan',
                'Snehabindu Sarkar',
                'Vivek Banka',
                'Arun Garg'
            ];

            // Calculate column width for 3 columns
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const availableWidth = pageWidth - (margin * 2);
            const colWidth = availableWidth / 3;

            // Draw personnel names with signature lines in 3 columns
            personnelData.forEach((person, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);

                const x = margin + (col * colWidth);
                const y = yPosition + (row * 20); // Reduced row height

                // Draw name
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9); // Smaller font
                doc.text(`${person}:`, x, y);

                // Draw signature line (underline)
                const lineStartX = x + 35; // Adjusted position
                const lineEndX = x + colWidth - 10;
                doc.line(lineStartX, y + 1.5, lineEndX, y + 1.5); // Thinner line
            });

            // Calculate new yPosition based on number of rows
            const numRows = Math.ceil(personnelData.length / 3);
            yPosition += (numRows * 20) + 12; // Reduced gap

            // Add Approval Information
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40, 40, 40);
            doc.text('Approval Information:', 20, yPosition);
            yPosition += 10; // Reduced gap

            // Create approval data with selected users
            const approvalData = [
                { role: 'Prepared By', person: preparedBy || 'Not Selected' },
                { role: 'Reviewed By', person: reviewedBy || 'Not Selected' },
                { role: 'Approved By', person: approvedBy || 'Not Selected' }
            ];

            // Draw approval information in 3 columns with signature lines
            approvalData.forEach((approval, index) => {
                const x = margin + (index * colWidth);

                // Draw role
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9); // Smaller font
                doc.text(`${approval.role}:`, x, yPosition);

                // Draw person name
                doc.setFont('helvetica', 'normal');
                doc.text(approval.person, x, yPosition + 7); // Reduced gap

                // Draw signature line
                const lineStartX = x;
                const lineEndX = x + colWidth - 10;
                doc.line(lineStartX, yPosition + 11, lineEndX, yPosition + 11); // Reduced gap
            });

            // Save the PDF
            const fileName = `WriteOff_Request_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };
    // Columns
    const columnHelper = createMRTColumnHelper();
    const columns = [
        columnHelper.accessor("refNo", { header: "Ref No.", size: 150 }),
        columnHelper.accessor("assetCode", { header: "ASSET CODE", size: 150 }),
        columnHelper.accessor("assetType", { header: "Asset Type", size: 120 }),
        columnHelper.accessor("serialNumber", {
            header: "Asset Serial Number",
            size: 150,
        }),
        columnHelper.accessor("qty", {
            header: "Qty.",
            size: 80,
            Footer: () => <strong style={{ color: "#345481" }}>{totals.qty}</strong>,
        }),
        columnHelper.accessor("location", {
            header: "Physical Location",
            size: 180,
        }),
        columnHelper.accessor("capDate", {
            header: "CAP. DATE", size: 130,
            Cell: ({ cell }) => dateTimeHelper.formatDate(cell.getValue(), "DD/MM/YYYY"),
        }),
        columnHelper.accessor("age", {
            header: `Age As On ${new Date().toLocaleDateString("en-GB")}`,
            size: 160,
        }),

        columnHelper.accessor("toBeWriteOff", {
            header: "To be Write off",
            size: 150,
            Cell: ({ cell }) => (
                <Chip
                    label={cell.getValue()}
                    sx={{
                        backgroundColor: "#DAF2FF",
                        color: "#345481",
                        fontSize: "12px",
                        px: 1,
                        borderRadius: 1,
                    }}
                />
            ),
        }),
        columnHelper.accessor("grossValue", {
            header: "Gross Value",
            size: 130,
            Footer: () => (
                <strong style={{ color: "#345481" }}>
                    {totals.gross.toLocaleString()}
                </strong>
            ),
        }),
        columnHelper.accessor("netBookValue", {
            header: "Net Book Value",
            size: 150,
            Footer: () => (
                <strong style={{ color: "#345481" }}>
                    {totals.net.toLocaleString()}
                </strong>
            ),
        }),
        columnHelper.accessor("remark", { header: "REMARK", size: 220 }),

    ];

    // CSV Export
    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    // Table
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
            rowSelection: selectedRows,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setSelectedRows,
        enableGlobalFilter: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        paginationDisplayMode: "pages",
        muiPaginationProps: { rowsPerPageOptions: [5, 10, 20, 50] },
        muiTablePaperProps: {
            elevation: 0,
            sx: { border: "1px solid #e0e0e0", borderRadius: 2 },
        },
        muiTableHeadRowProps: { sx: { backgroundColor: "#FFE3E1" } },
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
                    onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
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
                    disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                    onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                    className="Global-Button5"
                >
                    Export Selected Rows
                </Button>
                <Button
                    disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                    onClick={() => {
                        const selectedData = table.getSelectedRowModel().rows.map(row => row.original);
                        handleExportToPDF(selectedData);
                    }}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{
                        backgroundColor: "#d32f2f",
                        color: "white",
                        "&:hover": { backgroundColor: "#b71c1c" },
                        "&:disabled": {
                            backgroundColor: "#ccc",
                            color: "#666"
                        }
                    }}
                >
                    Export Selected to PDF
                </Button>
                {/* <Button
                    onClick={() => setUploadDialogOpen(true)}
                    startIcon={<AttachFileIcon />}
                    className="Global-Button8"
                >
                    Upload File
                </Button> */}
                <Button
                    disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                    onClick={() => setApproveDialogOpen(true)}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                        backgroundColor: "#2e7d32",
                        color: "white",
                        "&:hover": { backgroundColor: "#1b5e20" },
                        "&:disabled": {
                            backgroundColor: "#ccc",
                            color: "#666"
                        }
                    }}
                >
                    Approve Selected
                </Button>
            </Box>
        ),
        // Only Dropdowns in table footer (TextFields removed)
        renderBottomToolbarCustomActions: () => (

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
                <Typography
                    variant="body2"
                    sx={{ ml: 2, fontWeight: 500 }}
                >
                    Total Rows: {totalRows}
                </Typography>
                {/* Only Dropdowns row */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
                        <Typography variant="caption">Prepared By</Typography>
                        <Select
                            size="small"
                            value={preparedBy}
                            onChange={(e) => setPreparedBy(e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, px: 1, border:"1px solid black" }}
                        >
                            {userList.map((user) => (
                                <MenuItem key={user.id} value={user.name}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
                        <Typography variant="caption">Reviewed By</Typography>
                        <Select
                            size="small"
                            value={reviewedBy}
                            onChange={(e) => setReviewedBy(e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, px: 1, border:"1px solid black"}}
                        >
                            {userList.map((user) => (
                                <MenuItem key={user.id} value={user.name}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
                        <Typography variant="caption">Approved By</Typography>
                        <Select
                            size="small"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, px: 1, border:"1px solid black" }}
                        >
                            {userList.map((user) => (
                                <MenuItem key={user.id} value={user.name}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
            </Box>
        )
    });

    return (
        <Box>
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

                {/* File Upload Dialog */}
                <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
                    <DialogTitle>Upload Supporting Document</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: '400px' }}>
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-upload">
                                <Button className="Global-Button3" component="span">
                                    Select File
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="body2">
                                    Selected file: {selectedFile.name}
                                </Typography>
                            )}
                            {uploadStatus && (
                                <Typography
                                    variant="body2"
                                    color={uploadStatus.includes("success") ? "success.main" : "error.main"}
                                >
                                    {uploadStatus}
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button className="Global-Button3" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                        {/* <Button
                            onClick={handleUpload}
                            className="Global-Button2"
                            disabled={!selectedFile || uploadStatus === "Uploading..."}
                        >
                            Submit
                        </Button> */}
                    </DialogActions>
                </Dialog>

                {/* Approve Request Dialog */}
                <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
                    <DialogTitle>Approve Write-off Request</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: '400px' }}>
                            <Typography variant="body2">
                                Selected rows: {Object.keys(selectedRows).filter(key => selectedRows[key]).length}
                            </Typography>
                            <input
                                type="file"
                                id="approve-signature-upload"
                                onChange={handleApproveSignatureSelect}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="approve-signature-upload">
                                <Button className="Global-Button3" component="span">
                                    Select Signature File
                                </Button>
                            </label>
                            {approveSignatureFile && (
                                <Typography variant="body2">
                                    Selected signature file: {approveSignatureFile.name}
                                </Typography>
                            )}
                            {approveStatus && (
                                <Typography
                                    variant="body2"
                                    color={approveStatus.includes("success") ? "success.main" : "error.main"}
                                >
                                    {approveStatus}
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button className="Global-Button3" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleApproveRequest}
                            className="Global-Button2"
                            disabled={!approveSignatureFile || approveStatus === "Approving..."}
                        >
                            Approve
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default WriteOffRequest;