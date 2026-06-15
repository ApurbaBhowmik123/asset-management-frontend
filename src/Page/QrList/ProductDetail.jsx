import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../Api";

const ProductDetail = () => {
    const { assetId } = useParams(); // Get dynamic ID from route
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // if (!assetId) return; // If no ID, don't fetch

        const fetchProductDetail = async () => {
            try {
                const res = await fetch(`${baseUrl}/asset/detail/${assetId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const result = await res.json();

                if (result.status && result.data) {
                    const data = result.data;
                    setProductData({
                        assetId: data.uuid,
                        subcategory:
                            data.grInventoryProduct?.product?.subcategory?.name || "-",
                        grDate: data.grInventoryProduct?.grDetails?.grDate || null,
                        productName: data.grInventoryProduct?.product?.name || "-",
                        serialNo: data.serialNo1 || "-",
                        unit:
                            data.unit?.name || "-",
                        location:
                            data.grInventoryProduct?.grDetails?.location?.name || "-",
                    });
                } else {
                    setProductData(null);
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                setProductData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [assetId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!productData) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                p={3}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Product not found
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/")}
                    sx={{ mt: 2 }}
                >
                    Go to Home
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3} sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    maxWidth: 900,
                    margin: "0 auto",
                    borderRadius: "16px",
                    backgroundColor: "#fff",
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    align="center"
                    sx={{ fontWeight: "bold", color: "#333" }}
                >
                    Product Details
                </Typography>

                <TableContainer
                    component={Paper}
                    sx={{
                        mt: 4,
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#FFE3E1" }}>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Field</TableCell>
                                <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[
                                { field: "Asset ID", value: productData.assetId },
                                { field: "Subcategory", value: productData.subcategory },
                                {
                                    field: "GR Date",
                                    value: productData.grDate
                                        ? new Date(productData.grDate).toLocaleDateString()
                                        : "-",
                                },
                                { field: "Product Name", value: productData.productName },
                                { field: "Serial Number", value: productData.serialNo },
                                { field: "Unit", value: productData.unit },
                                { field: "Location", value: productData.location },
                            ].map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        "&:hover": { backgroundColor: "#f5f5f5" },
                                        transition: "background-color 0.3s ease",
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500 }}>{row.field}</TableCell>
                                    <TableCell>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ProductDetail;
