import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    Checkbox,
    IconButton,
    Chip,
    Snackbar,
    Alert,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
} from 'material-react-table';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import Deleteicon1 from "../../../assets/EmployeeImages/Vector (1).png";
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { baseUrl } from "../../Api";
import axios from "axios";
import { productStatusHelper } from "../../../Helper/StatusHelper/StatusHelper";
import { CustomTextField } from "../../../utils/CustomTextField";


const AssignAsset = ({ onBack }) => {
    const [formData, setFormData] = useState({
        fromNo: "AAM-FROM-01",
        allocationType: "Permanent", // New field: Permanent or Temporary
        personOrPlace: "Person",
        personName: "",
        employeeName: "",
        employeeCode: "",
        company: "",
        department: "",
        designation: "",
        location: "",
        phoneNumber: "",
        email: "",
        startDate: "",
        endDate: "",
        requester: "", // New field: Requester
        issuer: "",
        approver: "",
        notes: "",
        unit: "",
        placeLocation: "",
        remark: "", // Added remark field for place selection
    });

    const [users, setUsers] = useState([]);
    const [units, setUnits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [sorting, setSorting] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [unitLocations, setUnitLocations] = useState([]);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${baseUrl}/asset-mng/asset-helper/user-list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.status) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to fetch users",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${baseUrl}/gr/units/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data && response.data.status) {
                    setUnits(response.data.data);

                    // Extract all unique locations from units
                    const allLocations = [];
                    response.data.data.forEach(unit => {
                        if (unit.unitlocation && unit.unitlocation.length > 0) {
                            unit.unitlocation.forEach(ul => {
                                if (ul.location && !allLocations.some(l => l.id === ul.location.id)) {
                                    allLocations.push(ul.location);
                                }
                            });
                        }
                    });
                    setLocations(allLocations);
                }
            } catch (error) {
                console.error("Error fetching units:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to fetch units",
                    severity: "error",
                });
            }
        };
        fetchUnits();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                const { pageIndex, pageSize } = pagination;
                const page = pageIndex + 1;
                const limit = pageSize;

                let sortBy = "name";
                let sortOrder = "asc";

                if (sorting.length > 0) {
                    sortBy = sorting[0].id;
                    sortOrder = sorting[0].desc ? "desc" : "asc";
                }

                const url = `${baseUrl}/asset-mng/asset-helper/asset-assignable-products?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&search=${searchTerm}`;

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status) {
                    const formattedData = response.data.data.data.map(item => ({
                        id: item.uuid,
                        productName: item.grInventoryProduct.product.name,
                        brand: "N/A", // Not available in the response
                        category: item.grInventoryProduct.product.category.name,
                        // subcategory: item.grInventoryProduct.product.subcategory.name,
                        status: item.assignedStatus,
                        uuid: item.uuid,
                        inventoryProductDetailId: item.id,
                    }));

                    setProducts(formattedData);
                    setTotalCount(response.data.data.total);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to fetch products",
                    severity: "error",
                });
            }
        };
        fetchProducts();
    }, [pagination.pageIndex, pagination.pageSize, searchTerm, sorting]);

    const handleUserSelection = (user) => {
        setFormData({
            ...formData,
            personName: user.name,
            employeeName: user.name,
            employeeCode: user.uuid?.toString(),
            designation: user.designation || "",
            location: user.location?.name || "",
            department: user.department?.name || "",
            email: user.email || "",
            phoneNumber: user.mobile || "",
        });
    };

    const handleUnitSelection = (unitName) => {
        const selectedUnit = units.find(unit => unit.name === unitName);
        if (selectedUnit) {
            // Extract locations specific to this unit
            const unitSpecificLocations = [];
            if (selectedUnit.unitlocation && selectedUnit.unitlocation.length > 0) {
                selectedUnit.unitlocation.forEach(ul => {
                    if (ul.location && !unitSpecificLocations.some(l => l.id === ul.location.id)) {
                        unitSpecificLocations.push(ul.location);
                    }
                });
            }
            setUnitLocations(unitSpecificLocations);

            setFormData({
                ...formData,
                unit: selectedUnit.name,
                placeLocation: "" // Reset location when unit changes
            });
        } else {
            setUnitLocations([]);
            setFormData({
                ...formData,
                unit: unitName,
                placeLocation: ""
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Clear relevant fields when switching between Person and Place
        if (name === "personOrPlace") {
            if (value === "Department") {
                // Clear person-related fields and set remark
                setFormData({
                    ...formData,
                    [name]: value,
                    personName: "",
                    employeeName: "",
                    employeeCode: "",
                    company: "",
                    department: "",
                    designation: "",
                    location: "",
                    phoneNumber: "",
                    email: "",
                    unit: "",
                    placeLocation: "",
                    remark: "",
                });
            } else {
                // Clear place-related fields
                setFormData({
                    ...formData,
                    [name]: value,
                    unit: "",
                    placeLocation: "",
                    remark: "",
                });
            }
            return;
        }

        // Handle allocation type change
        if (name === "allocationType") {
            setFormData({
                ...formData,
                [name]: value,
                // Clear end date if switching to Temporary
                ...(value === "Temporary" && { endDate: "" })
            });
            return;
        }

        if (name === "personName" && value !== "" && formData.personOrPlace === "Person") {
            const selectedUser = users.find(user => user.name === value);
            if (selectedUser) {
                handleUserSelection(selectedUser);
                return;
            }
        }

        if (name === "unit" && formData.personOrPlace === "Department") {
            handleUnitSelection(value);
            return;
        }

        setFormData((s) => ({ ...s, [name]: value }));
    };

    const handleAssignSubmit = async () => {
        if (selectedProducts.length === 0) {
            setSnackbar({
                open: true,
                message: "Please select at least one product",
                severity: "warning",
            });
            return;
        }

        if (!formData.requester || !formData.issuer || !formData.approver) {
            setSnackbar({
                open: true,
                message: "Please select requester, issuer and approver",
                severity: "warning",
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const requesterUser = users.find(user => user.name === formData.requester);
            const issuerUser = users.find(user => user.name === formData.issuer);
            const approverUser = users.find(user => user.name === formData.approver);

            if (!requesterUser || !issuerUser || !approverUser) {
                throw new Error("Invalid user selection");
            }

            let payload = {
                inventoryProductDetailId: selectedProducts.map(p => p.inventoryProductDetailId),
                requesterId: parseInt(requesterUser.id),
                issuerId: parseInt(issuerUser.id),
                approverId: parseInt(approverUser.id),
                allocationType: formData.allocationType,
                start_date: `${formData.startDate}T00:00:00Z`,
                notes: formData.personOrPlace === "Department" ? formData.remark : formData.notes || "Asset assignment",
                // Only include end date for permanent allocations
                ...(formData.allocationType === "Permanent" && formData.endDate && { end_date: `${formData.endDate}T00:00:00Z` }),
            };

            if (formData.personOrPlace === "Person") {
                const assignedToUser = users.find(user => user.name === formData.personName);
                if (!assignedToUser) {
                    throw new Error("Invalid assigned user selection");
                }
                payload.assignedToUserId = parseInt(assignedToUser.id);
            } else {
                // For place assignment
                const selectedUnit = units.find(unit => unit.name === formData.unit);
                if (!selectedUnit) {
                    throw new Error("Invalid unit selection");
                }
                payload.assignedToUnitId = selectedUnit.id;

                // Get location ID from manually selected location
                if (formData.placeLocation) {
                    const selectedLocation = unitLocations.find(loc => loc.name === formData.placeLocation);
                    if (selectedLocation) {
                        payload.assignedToLocationId = selectedLocation.id;
                    }
                }
            }

            const response = await axios.post(`${baseUrl}/asset-mng/asset/assign-asset`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status) {
                setSnackbar({
                    open: true,
                    message: "Assets assigned successfully",
                    severity: "success",
                });
                // Reset selected products after successful assignment
                setSelectedProducts([]);
                // Refresh products list
                const { pageIndex, pageSize } = pagination;
                const page = pageIndex + 1;
                const limit = pageSize;
                const url = `${baseUrl}/asset-mng/asset-helper/asset-assignable-products?page=${page}&limit=${limit}`;
                const productsResponse = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (productsResponse.data.status) {
                    const formattedData = productsResponse.data.data.data.map(item => ({
                        id: item.uuid,
                        productName: item.grInventoryProduct.product.name,
                        brand: "N/A",
                        category: item.grInventoryProduct.product.category.name,
                        // subcategory: item.grInventoryProduct.product.subcategory.name,
                        status: item.assignedStatus,
                        uuid: item.uuid,
                        inventoryProductDetailId: item.id,
                    }));
                    setProducts(formattedData);
                    setTotalCount(productsResponse.data.data.total);
                }
            } else {
                throw new Error(response.data.message || "Failed to assign assets");
            }
        } catch (error) {
            console.error("Error assigning assets:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Failed to assign assets",
                severity: "error",
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const rowStyle = {
        display: "flex",
        gap: "24px",
        marginBottom: "24px",
        flexWrap: "wrap",
    };
    const columnStyle = { flex: "1 1 200px", minWidth: "180px" };

    const columnHelper = createMRTColumnHelper();

    const columns = [
        columnHelper.display({
            id: 'select',
            header: '',
            size: 50,
            Cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected() || selectedProducts.some(p => p.id === row.original.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedProducts(prev => [...prev, row.original]);
                        } else {
                            setSelectedProducts(prev => prev.filter(p => p.id !== row.original.id));
                        }
                    }}
                />
            ),
        }),
        columnHelper.accessor('uuid', {
            header: 'Asset ID',
            size: 200,
        }),
        columnHelper.accessor('productName', {
            header: 'Product Name',
            size: 200,
        }),
        // columnHelper.accessor('subcategory', {
        //     header: 'Subcategory',
        //     size: 120,
        // }),
        columnHelper.accessor('isUsed', {
            header: 'Used Status',
            size: 100,
            Cell: ({ cell }) => {
                const status = cell.getValue() ? 'Used' : 'New';
                return (
                    <Box
                        sx={{
                            borderColor: "transparent",
                            backgroundColor: status === "Used" ? "#FFE3E1" : "#E1F5FE",
                            color: status === "Used" ? "#D32F2F" : "#0288D1",
                            fontSize: "12px",
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontWeight: 'bold'
                        }}
                    >
                        {status}
                    </Box>
                );
            },
        }),
        columnHelper.accessor("status", {
            header: "Status",
            size: 150,
            Cell: ({ cell }) => {
                const status = cell.getValue();
                const label = productStatusHelper.getLabel(status);
                const { color, bg } = productStatusHelper.getStyle(status);

                return (
                    <Chip
                        label={label}
                        variant="outlined"
                        sx={{
                            borderColor: "transparent",
                            backgroundColor: bg,
                            color: color,
                            fontSize: "12px",
                            px: 1,
                            borderRadius: 1,
                        }}
                    />
                );
            },
        }),
    ];

    const selectedColumns = [
        columnHelper.accessor('id', {
            header: 'Product ID',
            size: 100,
        }),
        columnHelper.accessor('productName', {
            header: 'Product Name',
            size: 200,
        }),
        columnHelper.accessor('category', {
            header: 'Category',
            size: 120,
        }),
        // columnHelper.accessor('subcategory', {
        //     header: 'Subcategory',
        //     size: 120,
        // }),

        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            size: 80,
            Cell: ({ row }) => (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() => setSelectedProducts(prev => prev.filter(p => p.id !== row.original.id))}
                >
                    <img src={Deleteicon1} alt="delete" width={16} height={16} />
                </IconButton>
            ),
        }),
    ];

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    });

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(products);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data: products,
        enableRowSelection: false,
        enableMultiRowSelection: false,
        enableColumnResizing: false,
        columnResizeMode: 'onChange',
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        enableColumnFilters: false,   // 👈 disables filter by column
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        rowCount: totalCount,
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
        },
        onGlobalFilterChange: setSearchTerm,
        muiTablePaperProps: {
            elevation: 0,
            sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
        },
        muiTableHeadRowProps: {
            sx: {
                backgroundColor: '#FFE3E1',
            },
        },
        muiTableBodyCellProps: {
            sx: {
                fontSize: '12px',
                whiteSpace: 'nowrap',
                padding: '8px 16px',
            },
        },
        muiTableBodyRowProps: {
            sx: {
                height: '36px',
                '&:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
                },
            },
        },
        muiTableContainerProps: {
            sx: {
                width: '100%',
                overflowX: 'hidden',
            },
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

    const selectedTable = useMaterialReactTable({
        columns: selectedColumns,
        data: selectedProducts,
        enableRowSelection: false,
        enableColumnResizing: false,
        columnResizeMode: 'onChange',
        muiTablePaperProps: {
            elevation: 0,
            sx: { border: '1px solid #e0e0e0', borderRadius: 2 },
        },
        muiTableHeadRowProps: {
            sx: {
                backgroundColor: '#FFE3E1',
            },
        },
        muiTableBodyCellProps: {
            sx: {
                fontSize: '12px',
                whiteSpace: 'nowrap',
                padding: '8px 16px',
            },
        },
        muiTableBodyRowProps: {
            sx: {
                height: '36px',
                '&:nth-of-type(odd)': {
                    backgroundColor: '#fafafa',
                },
            },
        },
        muiTableContainerProps: {
            sx: {
                width: '100%',
                overflowX: 'hidden',
            },
        },
    });

    const isPlaceSelected = formData.personOrPlace === "Department";
    const isTemporaryAllocation = formData.allocationType === "Temporary";

    return (
        <Box fontSize={12}>
            <Paper elevation={1} sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
                <Typography
                    className="line"
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1, cursor: onBack ? "pointer" : "default", fontSize: 14 }}
                    onClick={onBack}
                >
                    {onBack && <ArrowLeft />} Assign Asset
                </Typography>

                <div style={rowStyle} className="line">
                    {/* From No */}
                    {/* <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Typography sx={{ minWidth: 100, }}>From No :</Typography>
                            <CustomTextField
                                name="fromNo"
                                value={formData.fromNo}
                                onChange={handleChange}
                            />
                        </div>
                    </div> */}

                    {/* Allocation Type */}
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Typography sx={{ minWidth: 130, }}>Allocation Type :</Typography>
                            <CustomTextField
                                name="allocationType"
                                select
                                value={formData.allocationType}
                                onChange={handleChange}
                            >
                                {["Permanent", "Temporary"].map((opt) => (
                                    <MenuItem key={opt} value={opt} sx={{ fontSize: 11 }}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>

                    {/* Person or Place */}
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Typography sx={{ minWidth: 160, }}>Person or Department :</Typography>
                            <CustomTextField
                                name="personOrPlace"
                                select
                                value={formData.personOrPlace}
                                onChange={handleChange}
                            >
                                {["Person", "Department"].map((opt) => (
                                    <MenuItem key={opt} value={opt} sx={{ fontSize: 11 }}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>

                    {/* Dynamic Field: Person Name or Remark */}
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Typography sx={{ minWidth: 130, }}>
                                {isPlaceSelected ? "Remark" : "Person Name"} :
                            </Typography>
                            {isPlaceSelected ? (
                                <CustomTextField
                                    name="remark"
                                    value={formData.remark}
                                    onChange={handleChange}
                                />
                            ) : (
                                <CustomTextField
                                    name="personName"
                                    select
                                    value={formData.personName}
                                    onChange={handleChange}
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.name} sx={{ fontSize: 11 }}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </CustomTextField>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unit and Location Fields - Only show when Place is selected */}
                {isPlaceSelected && (
                    <div style={rowStyle} className="line">
                        <div style={columnStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Typography sx={{ minWidth: 100, }}>Unit :</Typography>
                                <CustomTextField
                                    name="unit"
                                    select
                                    value={formData.unit}
                                    onChange={handleChange}
                                >
                                    {Array.isArray(units) && units.map((unit) => (
                                        <MenuItem key={unit.id} value={unit.name} sx={{ fontSize: 11 }}>
                                            {unit.name}
                                        </MenuItem>
                                    ))}
                                </CustomTextField>
                            </div>
                        </div>
                        <div style={columnStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Typography sx={{ minWidth: 100, }}>Location :</Typography>
                                <CustomTextField
                                    name="placeLocation"
                                    select
                                    value={formData.placeLocation}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="" sx={{ fontSize: 11 }}>Select Location</MenuItem>
                                    {unitLocations.map((location) => (
                                        <MenuItem key={location.id} value={location.name} sx={{ fontSize: 11 }}>
                                            {location.name}
                                        </MenuItem>
                                    ))}
                                </CustomTextField>
                            </div>
                        </div>
                        <div style={columnStyle}></div>
                        <div style={columnStyle}></div>
                    </div>
                )}

                {/* Other Fields - Only show when Person is selected */}
                {!isPlaceSelected && (
                    <>
                        <div style={{ ...rowStyle, marginBottom: '12px' }}>
                            {["employeeName", "employeeCode", "company", "department"].map((f, i) => (
                                <div key={i} style={{ ...columnStyle, minWidth: '180px' }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{
                                            minWidth: 'auto',
                                            marginRight: '4px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}:
                                        </Typography>
                                        <CustomTextField
                                            name={f}
                                            value={formData[f]}
                                            noBackground
                                            InputProps={{
                                                readOnly: true,
                                                style: {
                                                    fontSize: '12px',
                                                    padding: '0 0 0 2px',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    flex: 1
                                                }
                                            }}
                                            sx={{
                                                minWidth: '100px',
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: 'transparent',
                                                    padding: 0,
                                                    "& fieldset": { border: 'none' },
                                                    "&:hover fieldset": { border: 'none' },
                                                    "&.Mui-focused fieldset": { border: 'none' }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ ...rowStyle, }} className="line">
                            {["designation", "location", "phoneNumber", "email"].map((f, i) => (
                                <div key={i} style={{ ...columnStyle, minWidth: '180px' }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{
                                            minWidth: 'auto',
                                            marginRight: '4px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {f === "phoneNumber" ? "Phone:" :
                                                f === "email" ? "Email:" :
                                                    f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) + ":"}
                                        </Typography>
                                        <CustomTextField
                                            name={f}
                                            value={formData[f]}
                                            noBackground
                                            InputProps={{
                                                readOnly: true,
                                                style: {
                                                    fontSize: '12px',
                                                    padding: '0 0 0 2px',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    flex: 1
                                                }
                                            }}
                                            sx={{
                                                minWidth: '100px',
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: 'transparent',
                                                    padding: 0,
                                                    "& fieldset": { border: 'none' },
                                                    "&:hover fieldset": { border: 'none' },
                                                    "&.Mui-focused fieldset": { border: 'none' }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Date & Selection */}
                <div style={rowStyle}>
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Typography sx={{ minWidth: 100, }}>Start Date :</Typography>
                            <CustomTextField
                                fullWidth
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                               
                            />
                        </div>
                    </div>
                    
                    {/* End Date - Only show for Permanent allocation */}
                    {!isTemporaryAllocation && (
                        <div style={columnStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Typography sx={{ minWidth: 100, }}>End Date :</Typography>
                                <CustomTextField
                                    fullWidth
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                   
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Requester */}
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Typography sx={{ minWidth: 100, }}>Requester :</Typography>
                            <CustomTextField name="requester" select value={formData.requester} onChange={handleChange}>
                                <MenuItem value="" sx={{ fontSize: 12 }}>Select Requester</MenuItem>
                                {users.map(user => (
                                    <MenuItem key={user.id} value={user.name} sx={{ fontSize: 12 }}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>
                    
                    {/* Issuer */}
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Typography sx={{ minWidth: 100, }}>Issuer :</Typography>
                            <CustomTextField name="issuer" select value={formData.issuer} onChange={handleChange}>
                                <MenuItem value="" sx={{ fontSize: 12 }}>Select Issuer</MenuItem>
                                {users.map(user => (
                                    <MenuItem key={user.id} value={user.name} sx={{ fontSize: 12 }}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>
                    
                </div>
                
                {/* Approver Row */}
                <div style={rowStyle} className="line">
                    <div style={columnStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Typography sx={{ minWidth: 100, }}>Approver :</Typography>
                            <CustomTextField name="approver" select value={formData.approver} onChange={handleChange}>
                                <MenuItem value="" sx={{ fontSize: 12 }}>Select Approver</MenuItem>
                                {users.map(user => (
                                    <MenuItem key={user.id} value={user.name} sx={{ fontSize: 12 }}>
                                        {user.name}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </div>
                    </div>
                    <div style={columnStyle}></div>
                    <div style={columnStyle}></div>
                    <div style={columnStyle}></div>
                </div>

                {/* Search Product Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 12 }}>
                    <Typography fontWeight={600}>Search Product</Typography>
                </div>

                <MaterialReactTable table={table} />

                {/* Selected Products Section */}
                {selectedProducts.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                        <Typography fontWeight={600} gutterBottom>Selected Products</Typography>
                        <MaterialReactTable table={selectedTable} />
                    </div>
                )}

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained"
                        className="Global-Button2"
                        sx={{ px: 4, py: 1 }}
                        onClick={handleAssignSubmit}
                    >
                        Assign Submit
                    </Button>
                </Box>
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AssignAsset;