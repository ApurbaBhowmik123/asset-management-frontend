import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { baseUrl } from '../Api';
import Icon1 from "../../assets/DashboardImages/Group 223.png";
import SummaryIcon1 from "../../assets/DashboardImages/Group 314.png";
import SummaryIcon2 from "../../assets/DashboardImages/Group 312.png";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ margin: 0, color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const LastMonthTickets = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastMonthData, setLastMonthData] = useState([]);
  const [openTicketsData, setOpenTicketsData] = useState([]);
  const [reopenTicketsData, setReopenTicketsData] = useState([]);
  const [summaryCards, setSummaryCards] = useState([
    { label: "Total Tickets", count: 0, icon: SummaryIcon2 },
    { label: "Open Tickets", count: 0, icon: SummaryIcon1 },
    { label: "Reopened Tickets", count: 0, icon: SummaryIcon2 },
  ]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        
        const summaryResponse = await fetch(`${baseUrl}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!summaryResponse.ok) throw new Error(`Server responded with ${summaryResponse.status}`);

        const summaryData = await summaryResponse.json();

        setSummaryCards([
          { label: "Total Tickets", count: summaryData.data?.totalTickets || 0, icon: SummaryIcon2 },
          { label: "Open Tickets", count: summaryData.data?.openTickets || 0, icon: SummaryIcon1 },
          { label: "Reopened Tickets", count: summaryData.data?.reopenedTickets || 0, icon: SummaryIcon2 },
        ]);

        const endpoints = [
          `${baseUrl}/dashboard/last-month-tickets-by-day`,
          `${baseUrl}/dashboard/open-tickets-by-priority`,
          `${baseUrl}/dashboard/reopen-tickets-by-priority`
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint => 
            fetch(endpoint, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const data = await Promise.all(
          responses.map(response => {
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            return response.json();
          })
        );

        setLastMonthData(data[0].data || []);
        setOpenTicketsData(data[1].data || []);
        setReopenTicketsData(data[2].data || []);

      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setError(error.message || "Failed to load ticket data");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
    const interval = setInterval(fetchTicketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const priorityColors = {
    High: "#DB3027",
    Medium: "#d8db2a",
    Low: "#76d663"
  };

  // Customize X-axis for mobile to show fewer labels
  const CustomizedAxisTick = ({ x, y, payload }) => {
    const dateParts = payload.value.split(' ');
    const day = dateParts[0];
    const month = dateParts[1];
    const dayName = dateParts[2].replace('(', '').replace(')', '');
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={10}>
          {isMobile ? `${day}\n${dayName.charAt(0)}` : `${day} ${month}\n${dayName}`}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }}>
      {error && (
        <Box sx={{ py: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {/* --- Summary Cards --- */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {summaryCards.map((item, i) => (
          <Box key={i} sx={{ flex: "1 1 calc(33% - 16px)", minWidth: 200 }}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 1.5,
                gap: 2,
                cursor: "pointer",
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

      {/* --- Last Month Tickets Chart (Daily) --- */}
      <Card>
        <CardContent>
          <Typography variant="h6" display="flex" alignItems="center" mb={2}>
            <img src={Icon1} alt="icon" style={{ marginRight: 8 }} />
            Last Month's Tickets (Daily)
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={lastMonthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap={isMobile ? 2 : 5}
                barSize={isMobile ? 10 : 15}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={isMobile ? Math.ceil(lastMonthData.length / 7) : 0}
                  tick={<CustomizedAxisTick />}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 80 : 60}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Open" stackId="a" fill="#76d663" />
                <Bar dataKey="ReOpen" stackId="a" fill="#d8db2a" />
                <Bar dataKey="Closed" stackId="a" fill="#DB3027" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- Open & Reopen Tickets --- */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* Open Tickets */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" mb={2}>
                <img src={Icon1} alt="icon" style={{ marginRight: 8 }} />
                Open Tickets
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={openTicketsData} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                      {openTicketsData.map((entry, index) => (
                        <Cell key={index} fill={priorityColors[entry.name]} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="inside"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Reopen Tickets */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" display="flex" alignItems="center" mb={2}>
                <img src={Icon1} alt="icon" style={{ marginRight: 8 }} />
                Reopen Tickets
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reopenTicketsData} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                      {reopenTicketsData.map((entry, index) => (
                        <Cell key={index} fill={priorityColors[entry.name]} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="inside"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};