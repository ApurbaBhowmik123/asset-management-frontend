import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, List, ListItem, ListItemText, ListItemAvatar, Avatar, Select, MenuItem, FormControl } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { baseUrl } from '../Api';
import ArticleIcon from '@mui/icons-material/Article';
import { TotalProducts } from './TotalProducts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f43f5e'];

const DashboardAnalytics = () => {
  const [data, setData] = useState({
    assetSummaryByCategory: [],
    assetStatus: [],
    assetsByLocation: [],
    top5AssetsByValue: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [depreciationPeriod, setDepreciationPeriod] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/dashboard/analytics?depreciationPeriod=${depreciationPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.status) {
          setData(result.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [depreciationPeriod]);

  const totalProductsCount = data.assetSummaryByCategory.reduce((acc, curr) => acc + curr.count, 0);
  const totalStatusCount = data.assetStatus.reduce((acc, curr) => acc + curr.value, 0);

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    borderRadius: 1
  };

  const cardContentStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, mb: 2 }}>
      {loading ? (
        <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
          <Typography>Loading Analytics...</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '70%' }}>
            {/* 1. Asset summary by Category */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 100 }}>
              <Card sx={{ ...cardStyle, maxHeight: 300, height: 280 }}>
                <CardContent sx={{ ...cardContentStyle, maxHeight: 200 }}>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>Asset Summary by Category</Typography>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, minHeight: 200, width: '100%' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={data.assetSummaryByCategory}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {data.assetSummaryByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Label
                              value={totalProductsCount}
                              position="center"
                              style={{ fontSize: '26px', fontWeight: 'bold', fill: '#333' }}
                            />
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [`Count: ${value}, Value: ₹${props.payload.value}`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%', maxHeight: 200, pr: 1 }}>
                      <List dense disablePadding>
                        {data.assetSummaryByCategory.map((entry, index) => (
                          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length], mr: 1.5, flexShrink: 0 }} />
                            <ListItemText
                              primary={entry.name}
                              primaryTypographyProps={{ variant: 'body2' }}
                              sx={{ m: 0, pr: 2 }}
                            />
                            <Typography variant="body2" fontWeight="bold">{entry.count}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* 2. Asset Status Distribution */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 100 }}>
              <Card sx={{ ...cardStyle, maxHeight: 300, height: 280 }}>
                <CardContent sx={{ ...cardContentStyle, maxHeight: 200 }}>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>Asset Status Distribution</Typography>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, minHeight: 200, width: '100%' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={data.assetStatus}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke="none"
                          >
                            {data.assetStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <Label
                              value={totalStatusCount}
                              position="center"
                              style={{ fontSize: '26px', fontWeight: 'bold', fill: '#333' }}
                            />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ flex: 1, width: '100%', maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                      <List dense disablePadding>
                        {data.assetStatus.map((entry, index) => (
                          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length], mr: 1.5, flexShrink: 0 }} />
                            <ListItemText
                              primary={entry.name}
                              primaryTypographyProps={{ variant: 'body2' }}
                              sx={{ m: 0, pr: 2 }}
                            />
                            <Typography variant="body2" fontWeight="bold">{entry.value}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* 5. Recent Activities */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(20% - 8px)' }, minWidth: 100 }}>
            <Card sx={{ ...cardStyle, maxHeight: 300, height: 280, overflowY: 'auto' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="text.secondary">Recent Activities Feed</Typography>
                {loading ? (
                  <Typography sx={{ px: 2, py: 1, textAlign: 'center' }}>Loading activities...</Typography>
                ) : (
                  <List sx={{ bgcolor: 'background.paper', maxHeight: 200, overflowY: 'auto', padding: 0 }}>
                    {data.recentActivities.map((act, i) => (
                      <ListItem key={i} divider={i !== data.recentActivities.length - 1} alignItems="flex-start" sx={{ pb: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS[i % COLORS.length] }}>
                            <ArticleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="bold">
                              {act.transactionType}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                <strong>By:</strong> {act.createdBy} • {new Date(act.transactionDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {act.details || "No details provided"}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                    {data.recentActivities.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No recent activities found.</Typography>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 3. Assets by location */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 300 }}>
            <Card sx={cardStyle}>
              <CardContent sx={cardContentStyle}>
                <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>Assets By Location</Typography>
                <Box sx={{ overflowX: 'auto', mt: 1 }}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Location Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Assets</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Allocated</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'success.main' }}>InStock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.assetsByLocation.map((loc, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{loc.locationName}</TableCell>
                          <TableCell align="center">{loc.totalAsset}</TableCell>
                          <TableCell align="center">{loc.allocated}</TableCell>
                          <TableCell align="center">{loc.instock}</TableCell>
                        </TableRow>
                      ))}
                      {data.assetsByLocation.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center">No location data found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* 4. Top 5 assets by value */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 300 }}>
            <Card sx={cardStyle}>
              <CardContent sx={cardContentStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" color="text.secondary">Top 5 Categories By Value</Typography>
                  <FormControl size="small">
                    <Select
                      value={depreciationPeriod}
                      onChange={(e) => setDepreciationPeriod(e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={0}>Today</MenuItem>
                      <MenuItem value={1}>1 Year</MenuItem>
                      <MenuItem value={2}>2 Years</MenuItem>
                      <MenuItem value={3}>3 Years</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ overflowX: 'auto', mt: 1 }}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category Name</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actual Value</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Depreciated Value ({depreciationPeriod === 0 ? "Today" : depreciationPeriod + " Yrs"})</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.top5AssetsByValue.map((asset, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            ₹{asset.value?.toLocaleString('en-IN') || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            ₹{Math.round(asset.depreciatedValue || 0).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.top5AssetsByValue.length === 0 && (
                        <TableRow><TableCell colSpan={3} align="center">No asset value data found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </>
      )}



      {/* 6. Total Products */}
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }, minWidth: 300 }}>
        <TotalProducts />
      </Box>

    </Box>
  );
};

export default DashboardAnalytics;
