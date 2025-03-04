import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

// Icons
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import DateRangeIcon from '@mui/icons-material/DateRangeRounded';
import AnalyticsIcon from '@mui/icons-material/AnalyticsRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHorizRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import GetAppIcon from '@mui/icons-material/GetAppRounded';
import MailOutlineIcon from '@mui/icons-material/MailOutlineRounded';

// Components
import Copyright from '../internals/components/Copyright';
import HighlightedCard from './HighlightedCard';
import ConnectedEmails from './ConnectedEmails';
import CustomizedDataGrid from './CustomizedDataGrid';
import StatCard from './StatCard';
import SessionsChart from './SessionsChart';
import EmailCountChart from './EmailCountChart';

import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';


import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    }
  }
};

export interface LocalStatCardProps {
  title: string;
  value: number;
  change: number; // Add this line
}

export default function MainGrid() {
  const theme = useTheme();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const [data, setData] = React.useState<LocalStatCardProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<string>('weekly');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = React.useState(0);
  
  // Get current date for display
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<LocalStatCardProps[]>(`${apiBaseUrl}/api/emails/stats?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching stats data:', error);
      setError('Error fetching stats data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleRangeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRangeClose = (range?: string) => {
    setAnchorEl(null);
    if (range) {
      setTimeRange(range);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Sample data for email count chart (if your actual component doesn't have data)
  const emailData = {
    sent: [120, 132, 101, 134, 90, 230, 210],
    received: [320, 332, 301, 334, 390, 330, 320],
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Dashboard Header */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box
        component={motion.div}
        variants={itemVariants}
        sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 5 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              background: `linear-gradient(90deg, ${theme.palette.text.primary} 30%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome back, Alex
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your email interactions today.
          </Typography>
        </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DateRangeIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={handleRangeClick}
            sx={{
              borderRadius: 2,
              borderColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.divider, 0.3)
                : theme.palette.divider,
              bgcolor: theme.palette.background.paper,
              textTransform: 'none',
              px: 2,
            }}
          >
            {timeRange === 'daily' && 'Today'}
            {timeRange === 'weekly' && 'This Week'}
            {timeRange === 'monthly' && 'This Month'}
            {timeRange === 'yearly' && 'This Year'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleRangeClose()}
            sx={{ '& .MuiPaper-root': { borderRadius: 2, mt: 1 } }}
          >
            <MenuItem onClick={() => handleRangeClose('daily')}>Today</MenuItem>
            <MenuItem onClick={() => handleRangeClose('weekly')}>This Week</MenuItem>
            <MenuItem onClick={() => handleRangeClose('monthly')}>This Month</MenuItem>
            <MenuItem onClick={() => handleRangeClose('yearly')}>This Year</MenuItem>
          </Menu>

          <Button
            variant="contained"
            disableElevation
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            Refresh
          </Button>
          {!isMobile && (
            <ColorModeIconDropdown />
          )}
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Typography
        component={motion.h2}
        variant="h6"
        variants={itemVariants}
        sx={{
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <AnalyticsIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
        Overview
        {loading && (
          <CircularProgress
            size={16}
            thickness={5}
            sx={{ ml: 2, color: theme.palette.primary.main }}
          />
        )}
      </Typography>

      {error ? (
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.3),
              bgcolor: alpha(theme.palette.error.main, 0.05),
              textAlign: 'center',
            }}
          >
            <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
              {error}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid
          container
          spacing={3}
          columns={12}
          sx={{ mb: 4 }}
        >
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box
              component={motion.div}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <HighlightedCard />
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box
              component={motion.div}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <ConnectedEmails />
            </Box>
          </Grid>
          
          {loading ? (
            <>
              {[1, 2].map((index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Box component={motion.div} variants={itemVariants}>
                    <Skeleton
                      variant="rounded"
                      height={160}
                      animation="wave"
                      sx={{ borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
              ))}
            </>
          ) : (
            <>
              {data.map((card, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Box
                    component={motion.div}
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        height: '100%',
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          boxShadow: theme.palette.mode === 'dark'
                            ? `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`
                            : `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`
                        }
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {card.title}
                        </Typography>
                        
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          <MailOutlineIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                        </Box>
                      </Stack>
                      
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {card.value}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          icon={card.change > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={`${Math.abs(card.change)}%`}
                          size="small"
                          color={card.change > 0 ? "success" : "error"}
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 1 },
                            bgcolor: card.change > 0
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          vs previous {timeRange}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}

      {/* Recent Contacts and Activity Feed - Add more content here */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: theme.palette.divider,
                p: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Top Contacts
              </Typography>
              
              {/* Sample contact list */}
              {['Amy Mayer', 'John Smith', 'Lisa Cooper', 'Michael Brown'].map((name, index) => (
                <Stack 
                  key={index}
                  direction="row" 
                  alignItems="center" 
                  sx={{ 
                    py: 1.5,
                    borderBottom: index < 3 ? `1px solid ${theme.palette.divider}` : 'none'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      mr: 2, 
                      bgcolor: `${['primary', 'secondary', 'success', 'info'][index % 4]}.main`,
                      width: 40,
                      height: 40
                    }}
                  >
                    {name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {index % 2 === 0 ? 'Responded within 1 day' : 'Awaiting response'}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={`${5 - index} emails`} 
                    sx={{ ml: 'auto' }}
                  />
                </Stack>
              ))}
            </Paper>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Box component={motion.div} variants={itemVariants}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: theme.palette.divider,
                p: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              
              {/* Activity timeline */}
              {[
                { time: '10:45 AM', event: 'Email sent to marketing@example.com' },
                { time: '9:30 AM', event: 'New connection with lisa@company.co' },
                { time: '8:15 AM', event: 'Auto-reply configured for out-of-office' },
                { time: 'Yesterday', event: 'Response drafted for Team Budget Review' }
              ].map((activity, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    position: 'relative',
                    pl: 3,
                    pb: index < 3 ? 3 : 0,
                    '&::before': index < 3 ? {
                      content: '""',
                      position: 'absolute',
                      left: '10px',
                      top: '24px',
                      height: '100%',
                      width: '2px',
                      bgcolor: theme.palette.divider
                    } : {}
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: index === 0 
                        ? 'primary.main' 
                        : alpha(theme.palette.action.active, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {index === 0 && (
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'white' 
                        }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {activity.time}
                  </Typography>
                  <Typography variant="body2">
                    {activity.event}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Email Analytics Charts */}
      {/* <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Email Analytics
              </Typography>
              
              <IconButton size="small">
                <MoreHorizIcon />
              </IconButton>
            </Stack>
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="email analytics tabs"
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 100
                }
              }}
            >
              <Tab label="Activity" />
              <Tab label="Response Rate" />
              <Tab label="Categories" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3, height: 400 }}>
            {tabValue === 0 && <EmailCountChart />}
            {tabValue === 1 && <SessionsChart />}
            {tabValue === 2 && <EmailCountChart />}
          </Box>
        </Paper>
      </Box> */}

      {/* Recent Emails Table */}
      <Box component={motion.div} variants={itemVariants}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 2 }}
        >
          <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
            Recent Emails Sent
          </Typography>
        </Stack>
        
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider,
            mb: 4,
            p: 3
          }}
        >
          <CustomizedDataGrid />
        </Paper>
      </Box>
      <Box component={motion.div} variants={itemVariants} sx={{ textAlign: 'center', mt: 4 }}>
        {/* <Copyright /> */}
      </Box>
    </Box>
  );
}