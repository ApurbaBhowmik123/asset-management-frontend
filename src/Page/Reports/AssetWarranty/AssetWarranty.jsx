import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable, createMRTColumnHelper } from "material-react-table";
import DownloadIcon from '@mui/icons-material/Download';
import { useLocation } from "react-router-dom";
import { baseUrl } from "../../Api";

const AssetWarranty = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const location = useLocation();

  // Determine filter type based on URL path
  const filterType = location.pathname.includes("upcoming") 
    ? "upcoming" 
    : location.pathname.includes("expired") 
      ? "expired" 
      : "all";

  const getPageTitle = () => {
    if (filterType === "upcoming") return "Upcoming Warranty Asset (15 Days)";
    if (filterType === "expired") return "Expired Warranty Asset";
    return "Asset Warranty List";
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filterType === "all" 
        ? `${baseUrl}/report/report-query/asset-warranty`
        : `${baseUrl}/report/report-query/asset-warranty?filter=${filterType}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status) {
        setData(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching warranty list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const columnHelper = createMRTColumnHelper();
  
  const columns = [
    columnHelper.accessor("uuid", {
      header: "Asset ID",
      size: 150,
    }),
    columnHelper.accessor("serialNo1", {
      header: "Serial No",
      size: 150,
      Cell: ({ row }) => row.original.serialNo1 || row.original.serialNo2 || 'N/A'
    }),
    columnHelper.accessor("productName", {
      header: "Product Name",
      size: 200,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 150,
    }),
    columnHelper.accessor("assignedUser", {
      header: "Assigned To",
      size: 150,
    }),
    columnHelper.accessor("location", {
      header: "Location",
      size: 150,
    }),
    columnHelper.accessor("warrantyTill", {
      header: "Warranty Expiry",
      size: 150,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        if (!val) return <Chip label="N/A" size="small" />;
        
        const expiryDate = new Date(val);
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let color = "success";
        if (daysLeft < 0) color = "error";
        else if (daysLeft <= 15) color = "warning";
        
        return (
          <Chip 
            label={expiryDate.toLocaleDateString()} 
            color={color} 
            size="small" 
            variant={daysLeft <= 15 ? "filled" : "outlined"} 
          />
        );
      }
    }),
    columnHelper.display({
      id: "warrantyFile",
      header: "Document",
      size: 100,
      Cell: ({ row }) => {
        const fileUrl = row.original.warrantyFile;
        if (!fileUrl) return 'N/A';
        return (
          <IconButton 
            color="primary" 
            onClick={() => window.open(fileUrl.startsWith('http') ? fileUrl : `${baseUrl}/${fileUrl}`, '_blank')}
          >
            <DownloadIcon />
          </IconButton>
        );
      }
    })
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading, pagination },
    onPaginationChange: setPagination,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    muiTablePaperProps: { elevation: 0, sx: { borderRadius: '12px' } }
  });

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
          {getPageTitle()}
        </Typography>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AssetWarranty;
