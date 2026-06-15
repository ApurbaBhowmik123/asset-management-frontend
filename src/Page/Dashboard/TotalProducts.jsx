import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList
} from 'recharts';

import Icon1 from "../../assets/DashboardImages/Group 223.png";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { baseUrl } from '../Api';


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Product: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-item-${index}`} style={{ margin: 0, color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
const CustomBarLabel = ({ x, y, width, value, height }) => {
  return (
    <text
      x={x + width + 16}
      y={y + height / 2}
      fill="#000"
      dy={4}
      fontSize={12}
      textAnchor="start"
      dominantBaseline="middle"
      transform={`rotate(-90, ${x + width + 20}, ${y + height / 2})`}

    >
      {value}
    </text>
  );
};

export const TotalProducts = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/dashboard/total-products-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setChartData(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch product breakdown data:", err);
        setError("Failed to load chart data.");
        setIsLoading(false);
      }
    };

    if (token) {
      fetchChartData();
    }
  }, [token]);

  // if (isLoading) {
  //   return <Typography>Loading chart data...</Typography>;
  // }

  // if (error) {
  //   return <Typography color="error">{error}</Typography>;
  // }

  // if (chartData.length === 0) {
  //   return <Typography>No data to display.</Typography>;
  // }

    if (isLoading) {
    return <Typography>Loading chart data...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!Array.isArray(chartData) || chartData.length === 0) {
    return <Typography>No data to display.</Typography>;
  }

  return (
    <>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mb={2}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img src={Icon1} alt="icon" style={{ marginRight: 8 }} />
                  Total Products
                </Box>
              </Typography>
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 150, left: 20, bottom: 5 }}
              barCategoryGap={10}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Total" stackId="a" fill="#76d663ff" barSize={20}>
                <LabelList
                  dataKey="Total"
                  content={({ value, x, y, width, height }) =>
                    value > 0 ? (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        dy={4}
                        textAnchor="middle"
                        fill="#000"
                        fontSize={12}
                      >
                        {value}
                      </text>
                    ) : null
                  }
                />
              </Bar>

              <Bar dataKey="Instock" stackId="a" fill="#d8db2aff" barSize={20}>
                <LabelList
                  dataKey="Instock"
                  content={({ value, x, y, width, height }) =>
                    value > 0 ? (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        dy={4}
                        textAnchor="middle"
                        fill="#000"
                        fontSize={12}
                      >
                        {value}
                      </text>
                    ) : null
                  }
                />
              </Bar>

              <Bar dataKey="Used" stackId="a" fill="#DB3027" barSize={20}>
                <LabelList
                  dataKey="Used"
                  content={({ value, x, y, width, height }) =>
                    value > 0 ? (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        dy={4}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                      >
                        {value}
                      </text>
                    ) : null
                  }
                />
                <LabelList dataKey="name" content={<CustomBarLabel />} />
              </Bar>

            </BarChart>




          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};