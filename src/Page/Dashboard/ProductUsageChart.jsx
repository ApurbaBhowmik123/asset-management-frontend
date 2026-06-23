import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { baseUrl } from '../Api';
import Icon2 from "../../assets/DashboardImages/Group 222.png"

const ProductUsageCharts = ({ isMobile }) => {
  const [usedProductsData, setUsedProductsData] = useState([]);
  const [unusedProductsData, setUnusedProductsData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingServiceProducts, setPendingServiceProducts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, lowStockRes, pendingServiceRes] = await Promise.all([
          axios.get(`${baseUrl}/dashboard/products-usage`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseUrl}/dashboard/low-stock-products`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseUrl}/dashboard/pending-service-products`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);


        const mapProducts = (products) => {
          if (!products || !Array.isArray(products)) {
            return [];
          }

          return products.map((item, index) => ({
            name: `${item.product?.name || 'Unknown Product'} (ID: ${item.id})`,
            displayName: item.product?.name || 'Unknown Product',
            value: item.itemsCount || 0,
            id: item.id,
            description: item.product?.description || ''
          }));
        };

        setUsedProductsData(mapProducts(usageRes?.data?.data?.topUsed || []));
        setUnusedProductsData(mapProducts(usageRes?.data?.data?.topUnused || []));


        const lowStockData = lowStockRes?.data?.data?.map(product => ({
          name: `${product.name} (ID: ${product.id})`,
          displayName: product.name,
          value: product.inStockCount,
          msq: product.msq,
          description: `MSQ: ${product.msq}, Current: ${product.inStockCount}`
        }));

        setLowStockProducts(lowStockData);


        const pendingServiceData = pendingServiceRes?.data?.data?.map(product => ({
          name: product.name,
          displayName: product.name,
          value: product.totalPendingCount,
        }));

        setPendingServiceProducts(pendingServiceData);

      } catch (error) {
        console.error('Error fetching product data', error);
        setUsedProductsData([]);
        setUnusedProductsData([]);
        setLowStockProducts([]);
        setPendingServiceProducts([]);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {data.displayName}
          </p>
          <p style={{ margin: 0, color: '#8a27db' }}>
            Total : {payload[0].value}
          </p>
          {data.description && (
            <p style={{ margin: 0, fontSize: '11px', color: '#999', maxWidth: '200px' }}>
              {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const LowStockTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {data.displayName}
          </p>
          <p style={{ margin: 0, color: '#d39cc1' }}>
            Current Stock: {data.value}
          </p>
          <p style={{ margin: 0, color: '#d39cc1' }}>
            Minimum Required (MSQ): {data.msq}
          </p>
          <p style={{ margin: 0, color: '#ff6b6b', fontWeight: 'bold' }}>
            Deficit: {data.msq - data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarValue = (value, msq) => {
    if (value === 0) {
      return msq * 4;
    }
    return value;
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '24px',
        }}
      >
        <div style={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  Top 10 Used Products
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={usedProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8a27db"
                    strokeWidth={2}
                    dot={{ fill: '#8a27db', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card>
            <CardContent sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  Top 10 Unused Products
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={unusedProductsData} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {unusedProductsData.map((entry, index) => (
                      <Cell key={`cell-${entry.id}-${index}`} fill="#DB3027" />
                    ))}

                    <LabelList
                      dataKey="value"
                      position="inside"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                    />
                    <LabelList
                      dataKey="displayName"
                      position="right"
                      content={({ x, y, width, height, value }) => (
                        <text
                          x={x + width + 5}
                          y={y + height / 2}
                          dy={4}
                          textAnchor="start"
                          fill="#333"
                          fontSize={12}
                          transform={`rotate(-90, ${x + width + 10}, ${y + height / 2})`}

                        >
                          {value}
                        </text>
                      )}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="h6">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src={Icon2} alt="icon" style={{ marginRight: 8 }} />
                      Low Stock Products
                    </Box>
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={lowStockProducts} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip content={<LowStockTooltip />} />
                    <Bar dataKey={(data) => getBarValue(data.value, data.msq)} radius={[4, 4, 0, 0]} barSize={25}>
                      {lowStockProducts.map((entry, index) => {
                        const severity = entry.value / entry.msq;
                        let fillColor = '#DB3027';
                        return <Cell key={`cell-low-${index}`} fill={fillColor} />;
                      })}


                      <LabelList
                        dataKey="value"
                        position="inside"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      />



                      <LabelList
                        dataKey="displayName"
                        position="right"
                        content={({ x, y, width, height, value }) => (
                          <text
                            x={x + width + 5}
                            y={y + height / 2}
                            dy={4}
                            textAnchor="start"
                            fill="#333"
                            fontSize={12}
                            transform={`rotate(-90, ${x + width + 10}, ${y + height / 2})`}

                          >
                            {value}
                          </text>
                        )}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </div>
      </div>



      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          mt: 4,
        }}
      >


        {/* <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src={Icon2} alt="icon" style={{ marginRight: 8 }} />
                    Service Pending Products
                  </Box>
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pendingServiceProducts} barCategoryGap={10}>
                  <CartesianGrid strokeDasharray='3 3'></CartesianGrid>
                  <XAxis dataKey="displayName" hide />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                    {pendingServiceProducts.map((entry, index) => (
                      <Cell key={`cell-service-${index}`} fill="#dfd660ff" />
                    ))}

                     <LabelList
                      dataKey="value"
                      position="inside"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                    />
                     <LabelList
                      dataKey="displayName"
                      position="right"
                      content={({ x, y, width, height, value }) => (
                        <text
                          x={x + width + 5}
                          y={y + height / 2}
                          dy={4}
                          textAnchor="start"
                          fill="#333"
                          fontSize={12}
                          transform={`rotate(-90, ${x + width + 10}, ${y + height / 2})`}

                        >
                          {value}
                        </text>
                      )}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box> */}
      </Box>
    </>
  );
};

export default ProductUsageCharts;