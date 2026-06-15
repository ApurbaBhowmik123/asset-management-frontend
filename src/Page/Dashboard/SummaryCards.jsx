
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { baseUrl } from '../Api';
import SummaryIcon1 from "../../assets/DashboardImages/Group 314.png"
import SummaryIcon2 from "../../assets/DashboardImages/Group 312.png"
import SummaryIcon3 from "../../assets/DashboardImages/Group 313.png"
import { useNavigate } from 'react-router-dom';
const SummaryCards = () => {
  const defaultSummaryData = [
    { label: 'Total asset', count: null, icon: SummaryIcon2, pathName: '/assetstatus/all-asset' },
    { label: 'Asset In Stock', count: null, icon: SummaryIcon1, pathName: '/assetstatus/in-stock' },
    { label: 'Assigned ', count: null, icon: SummaryIcon2, pathName: '/assetstatus/assigned-stock' },
    { label: 'On hold', count: null, icon: SummaryIcon1 },
    { label: 'Pending setup', count: null, icon: SummaryIcon2 },
    { label: 'Pending Service', count: null, icon: SummaryIcon1 },
    { label: 'Open Tickets', count: null, icon: SummaryIcon2, pathName: '/ticketservice/ticketlist' },
    { label: 'Total Employee', count: null, icon: SummaryIcon1, pathName: '/employee/activeemp' },
    { label: 'Request Pending', count: null, icon: SummaryIcon3, pathName: '/request/initiate' },
    { label: 'Write-Off', count: null, icon: SummaryIcon3, pathName: '/assetstatus/write-off' },

  ];

  const [summaryData, setSummaryData] = useState(defaultSummaryData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const data = await response.json();

        const transformedData = [
          { label: "Total asset", count: data.data?.totalInventory || 0, icon: SummaryIcon2, pathName: '/assetstatus/all-asset' },
          { label: " In Stock", count: data.data?.totalInstock || 0, icon: SummaryIcon1, pathName: '/assetstatus/in-stock' },
          { label: "Assigned ", count: data.data?.totalAssignedStock || 0, icon: SummaryIcon2, pathName: '/assetstatus/assigned-stock' },
          { label: "On hold", count: data.data?.totalholdSetup || 0, icon: SummaryIcon1 },
          { label: "Pending setup", count: data.data?.totalPendingSetup || 0, icon: SummaryIcon2 },
          { label: "Pending Service", count: data.data?.totalPendingServices || 0, icon: SummaryIcon1 },
          { label: "Open Tickets", count: data.data?.totalopenTickets || 0, icon: SummaryIcon2, pathName: '/ticketservice/ticketlist' },
          { label: "Total Employee", count: data.data?.totalEmployees || 0, icon: SummaryIcon1, pathName: '/employee/activeemp' },
          { label: "Request Pending", count: data.data?.totalRequestsPending || 0, icon: SummaryIcon2, pathName: '/request/initiate' },
          { label: "Write-Off", count: data.data?.totalEwaste || 0, icon: SummaryIcon1, pathName: '/assetstatus/write-off' }
        ];

        setSummaryData(transformedData);
      } catch (error) {
        console.error("Error fetching summary data:", error);
        setError(error.message || "Failed to load summary data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
    const interval = setInterval(fetchSummaryData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGotoPath = (item) => {
    navigate(item?.pathName)
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4, alignItems: 'stretch' }}>
      <Box sx={{ flex: "1 1 65%", minWidth: 300 }}>
        {error && (
          <Box sx={{ py: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {summaryData.map((item, i) => (
            <Box key={i} sx={{ flex: "1 1 calc(20% - 16px)", minWidth: 180 }}>
              <Card
                onClick={() => handleGotoPath(item)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 1.5,
                  gap: 2,
                  cursor: 'pointer',
                  backgroundColor: "transparent",
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <img src={item.icon} alt={item.label} style={{ width: 64, height: 64 }} />
                </Box>
                <CardContent sx={{ pt: 0, pr: 0, pl: 0, pb: "0 !important" }}>
                  <Typography variant="body1">{item.label}</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {loading ? <CircularProgress size={20} /> : item.count}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryCards;