import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Grid,
    Divider
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { baseUrl } from '../../Api';
import dayjs from 'dayjs';

const EditInventory = ({ data, onClose }) => {
    const [formData, setFormData] = useState(data || { software: [] });
    const [softwareList, setSoftwareList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [softwareInputs, setSoftwareInputs] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");

            try {
                const softwareRes = await axios.get(`${baseUrl}/catalog/installsof`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const softwareData = softwareRes.data?.data?.data || [];
                const filteredSoftware = softwareData.filter(item => item.name && item.name.trim() !== "");
                setSoftwareList(filteredSoftware);

                const initialInputs = {};
                filteredSoftware.forEach(item => {
                    initialInputs[item.id] = '';
                });

                if (data && data.software) {
                    const updatedInputs = { ...initialInputs };
                    data.software.forEach(installedSoftware => {
                        const matchingSoftware = filteredSoftware.find(item => item.name === installedSoftware.name);
                        if (matchingSoftware) {
                            updatedInputs[matchingSoftware.id] = installedSoftware.version || '';
                        }
                    });
                    setSoftwareInputs(updatedInputs);
                } else {
                    setSoftwareInputs(initialInputs);
                }

            } catch (error) {
                console.error("Error fetching data", error);
                setSoftwareList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [data]);

    const handleInputChange = (id, value) => {
        setSoftwareInputs(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // const handleSubmit = async () => {
    //     const token = localStorage.getItem("token");
    //     const inventoryId = data?.id; // Use the id from the data prop

    //     // Prepare software data in the required format
    //     const softwareData = Object.entries(softwareInputs)
    //         .filter(([id, version]) => version.trim() !== '')
    //         .map(([id, version]) => ({
    //             id: parseInt(id),
    //             value: version.trim()
    //         }));

    //     try {
    //         // First API to install software
    //         const installResponse = await axios.post(
    //             `${baseUrl}/gr/installations/install-software/${inventoryId}`,
    //             {
    //                 softwareIds: softwareData
    //             },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             }
    //         );

    //         if (installResponse.data.status) {
    //             onClose();
    //         } else {
    //             console.error('Failed to install software:', installResponse.data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error installing software:', error);
    //     }
    // };
const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const inventoryId = data?.id; // Use the id from the data prop

    // Prepare software data in the required format
    const softwareData = Object.entries(softwareInputs)
        .filter(([id, version]) => version.trim() !== '')
        .map(([id, version]) => ({
            id: parseInt(id),
            value: version.trim()
        }));

    try {
        // First API to install software
        const installResponse = await axios.post(
            `${baseUrl}/gr/installations/install-software/${inventoryId}`,
            {
                softwareIds: softwareData
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (installResponse.data.status) {
            // Call onClose with a refresh flag
            onClose(true); // Pass true to indicate successful installation
        } else {
            console.error('Failed to install software:', installResponse.data.message);
            onClose(false); // Pass false to indicate failure
        }
    } catch (error) {
        console.error('Error installing software:', error);
        onClose(false); // Pass false to indicate failure
    }
};
    return (
        <>
            <style>{`
                .custom-text-field .MuiOutlinedInput-root {
                    background-color: #F9F9F9;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .custom-text-field .MuiOutlinedInput-notchedOutline {
                    border: none !important;
                }
                .custom-text-field .Mui-focused .MuiOutlinedInput-notchedOutline {
                    border-color: #D7D7D7 !important;
                }
                .button-container {
                    margin-top: 20px;
                    display: flex;
                    gap: 16px;
                    justify-content: flex-end;
                }
                .software-fields-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .software-field {
                    flex: 1 1 calc(50% - 8px);
                    min-width: 250px;
                }
                .installation-info-box {
                    background: #F5F5F5;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
            `}</style>

            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <ArrowLeft onClick={onClose} style={{ cursor: 'pointer' }} />
                </Box>

                <Paper elevation={0}>
                    <Box sx={{ p: 3 }}>
                        <Typography fontSize={15} fontWeight={600} mb={3}>
                            Installation Details
                        </Typography>

                        {loading ? (
                            <Typography>Loading software data...</Typography>
                        ) : (
                            <>
                                <Box className="installation-info-box">
                                    <Typography variant="h6" mb={2}>Current Installation Information</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                <strong>Asset ID:</strong> {data?.uuid || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>GR ID:</strong> {data?.grNo || data?.grInventoryProduct?.grDetails?.grId || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>Product Name:</strong> {data?.model || data?.grInventoryProduct?.product?.name || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>Brand:</strong> {data?.make || data?.grInventoryProduct?.product?.brand?.name || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>Category:</strong> {data?.assetType || data?.grInventoryProduct?.product?.category?.name || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>GR Date:</strong> {data?.grDate || 
                                                    (data?.grInventoryProduct?.grDetails?.grDate 
                                                        ? dayjs(data.grInventoryProduct.grDetails.grDate).format("DD/MM/YYYY") 
                                                        : 'N/A')}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>Serial Numbers:</strong>{' '}
                                                {data?.serialNumber || data?.serialNumberAlt || 
                                                 data?.serialNo1 || data?.serialNo2 || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                {/* Handle both data structures */}
                                                <strong>Status:</strong> {data?.status || data?.assignedStatus || 'N/A'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" mb={2}>Installation</Typography>

                                <div className="software-fields-container">
                                    {softwareList.map((software) => (
                                        <div className="software-field" key={software.id}>
                                            <Typography sx={{ mb: 1, fontWeight: 500 }}>
                                                {software.name}
                                                {software.description && (
                                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                        - {software.description}
                                                    </Typography>
                                                )}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                value={softwareInputs[software.id] || ''}
                                                onChange={(e) => handleInputChange(software.id, e.target.value)}
                                                className="custom-text-field"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Box className="button-container">
                                    <Button
                                        className='Global-Button3'
                                        variant="outlined"
                                        onClick={onClose}
                                        sx={{ height: 40, minWidth: 120 }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className='Global-Button2'
                                        onClick={handleSubmit}
                                    >
                                        Update Installation
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default EditInventory;