import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  ButtonGroup,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsData = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    responseTime: {
      labels: [],
      values: []
    },
    volume: {
      labels: [],
      received: [],
      autoResponded: []
    },
    categories: {
      labels: [],
      values: []
    },
    sentiment: {
      labels: [],
      values: []
    }
  });
  
  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/analytics/dashboard/${timeRange}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update analytics data with response from API
        setAnalyticsData(response.data as any);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  // Prepare chart data objects with the fetched data
  const responseTimeData = {
    labels: analyticsData.responseTime.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average Response Time (minutes)',
        data: analyticsData.responseTime.values || [2.5, 3.2, 2.1, 1.9, 2.8, 1.5, 1.7],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const emailVolumeData = {
    labels: analyticsData.volume.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Received',
        data: analyticsData.volume.received || [18, 25, 22, 30, 27, 15, 12],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Auto-Responded',
        data: analyticsData.volume.autoResponded || [15, 20, 18, 25, 22, 10, 8],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const emailCategoryData = {
    labels: analyticsData.categories.labels || ['Inquiries', 'Support', 'Feedback', 'Sales', 'Other'],
    datasets: [
      {
        data: analyticsData.categories.values || [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const sentimentAnalysisData = {
    labels: analyticsData.sentiment.labels || ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: analyticsData.sentiment.values || [65, 25, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const renderChart = (Component: any, data: any, options: any) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    return <Component data={data} options={options} />;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">
          Email Analytics Dashboard
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={() => handleTimeRangeChange('week')}
            variant={timeRange === 'week' ? 'contained' : 'outlined'}
          >
            Week
          </Button>
          <Button 
            onClick={() => handleTimeRangeChange('month')}
            variant={timeRange === 'month' ? 'contained' : 'outlined'}
          >
            Month
          </Button>
          <Button 
            onClick={() => handleTimeRangeChange('year')}
            variant={timeRange === 'year' ? 'contained' : 'outlined'}
          >
            Year
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Response Time Chart */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Response Time Analysis" 
              subheader="Average time to respond to emails"
              titleTypographyProps={{ variant: 'h6' }}
              subheaderTypographyProps={{ variant: 'body2' }}
            />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {renderChart(Line, responseTimeData, {
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Time (minutes)'
                    }
                  }
                }
              })}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Email Volume Chart */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Email Volume" 
              subheader="Received vs Auto-Responded emails"
              titleTypographyProps={{ variant: 'h6' }}
              subheaderTypographyProps={{ variant: 'body2' }}
            />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {renderChart(Bar, emailVolumeData, {
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Emails'
                    }
                  }
                }
              })}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Email Categories Chart */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Email Categories" 
              subheader="Distribution by email type"
              titleTypographyProps={{ variant: 'h6' }}
              subheaderTypographyProps={{ variant: 'body2' }}
            />
            <Divider />
            <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '80%', height: '100%' }}>
                {renderChart(Pie, emailCategoryData, chartOptions)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sentiment Analysis Chart */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Sentiment Analysis" 
              subheader="Customer sentiment in incoming emails"
              titleTypographyProps={{ variant: 'h6' }}
              subheaderTypographyProps={{ variant: 'body2' }}
            />
            <Divider />
            <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '80%', height: '100%' }}>
                {renderChart(Doughnut, sentimentAnalysisData, chartOptions)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsData;
