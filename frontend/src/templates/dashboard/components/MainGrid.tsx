import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import LinearProgress from '@mui/material/LinearProgress';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

// Icons
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import DateRangeIcon from '@mui/icons-material/DateRangeRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import MailOutlineIcon from '@mui/icons-material/MailOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SourceRoundedIcon from '@mui/icons-material/SourceRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import AttachEmailRoundedIcon from '@mui/icons-material/AttachEmailRounded';

// Components
import HighlightedCard from './HighlightedCard';
import CustomizedDataGrid from './CustomizedDataGrid';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import axios from 'axios';

import { useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
  }
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "primary",
  progress,
  max 
}: { 
  title: string, 
  value: number | string, 
  subtitle?: string, 
  icon: React.ReactNode, 
  color?: "primary" | "secondary" | "info" | "success" | "warning" | "error", 
  progress?: number,
  max?: number
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Paper
      component={motion.div}
      variants={itemVariants}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        background: isDarkMode 
          ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`
          : `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette[color].light, 0.07)})`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, isDarkMode ? 0.2 : 0.05)}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
          borderColor: alpha(theme.palette[color].main, 0.3)
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette[color].main, isDarkMode ? 0.2 : 0.1),
            color: theme.palette[color].main,
            width: 42,
            height: 42
          }}
        >
          {icon}
        </Avatar>
        
        {subtitle && subtitle.includes('%') && (
          <Chip
            size="small"
            icon={subtitle.includes('-') ? <TrendingDownIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
            label={subtitle}
            color={subtitle.includes('-') ? "error" : "success"}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              height: 24,
              '& .MuiChip-label': { px: 1, fontWeight: 600 },
              '& .MuiChip-icon': { ml: 0.5 }
            }}
          />
        )}
      </Box>
      
      <Box sx={{ mb: typeof progress !== 'undefined' ? 1 : 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      
      {typeof progress !== 'undefined' && typeof max !== 'undefined' && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(progress / max) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette[color].main, 0.08),
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette[color].main
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
            {progress} / {max}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export interface LocalStatCardProps {
  title: string;
  value: number;
  change: number;
}

export default function MainGrid() {
  const theme = useTheme();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const [data, setData] = React.useState<LocalStatCardProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<string>('weekly');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  
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

  // Get first name from local storage or set a default
  let fullName = localStorage.getItem('username') || 'User';
  if (fullName.length > 20) {
    fullName = fullName.split(' ')[0];
  }

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
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: { xs: 7, md: 4 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.7)
                  : alpha(theme.palette.primary.light, 0.7)
              } 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome back, {fullName}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {formattedDate} • Here's your dashboard overview
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, mt: { xs: 2, md: 0 } }}
        >
          {/* <Button
            variant="outlined"
            startIcon={<DateRangeIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={handleRangeClick}
            sx={{
              borderRadius: 2,
              borderColor: alpha(theme.palette.divider, 0.6),
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              color: theme.palette.text.primary,
              textTransform: 'none',
              px: 2,
              py: 1,
              fontWeight: 500,
            }}
          >
            {timeRange === 'daily' && 'Today'}
            {timeRange === 'weekly' && 'This Week'}
            {timeRange === 'monthly' && 'This Month'}
            {timeRange === 'yearly' && 'This Year'}
          </Button> */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleRangeClose()}
            sx={{ 
              '& .MuiPaper-root': { 
                borderRadius: 2, 
                mt: 1, 
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              } 
            }}
            elevation={0}
          >
            <MenuItem onClick={() => handleRangeClose('daily')}>Today</MenuItem>
            <MenuItem onClick={() => handleRangeClose('weekly')}>This Week</MenuItem>
            <MenuItem onClick={() => handleRangeClose('monthly')}>This Month</MenuItem>
            <MenuItem onClick={() => handleRangeClose('yearly')}>This Year</MenuItem>
          </Menu>

          <Tooltip title="Refresh data">
            <Button
              variant="contained"
              disableElevation
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                py: 1,
                fontWeight: 500,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              Refresh {loading && <CircularProgress size={16} thickness={5} sx={{ ml: 1 }} />}
            </Button>
          </Tooltip>

          {/* {!isMobile && (
            <ColorModeIconDropdown />
          )} */}
        </Stack>
      </Box>

      {/* Stats Grid */}
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Emails Sent" 
              value={2} 
              subtitle="0% from last month"
              icon={<MailOutlineIcon />} 
              color="primary" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Active Users" 
              value={1} 
              icon={<PeopleAltRoundedIcon />} 
              color="success" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Connected Emails" 
              value={0} 
              icon={<AttachEmailRoundedIcon />} 
              color="info" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Sources" 
              value={1} 
              icon={<SourceRoundedIcon />} 
              color="secondary" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Emails Drafted" 
              value={0} 
              icon={<NotesRoundedIcon />} 
              color="info" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Escalations" 
              value={2} 
              icon={<PriorityHighRoundedIcon />} 
              color="warning" 
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Usage" 
              value={0} 
              icon={<StorageRoundedIcon />} 
              color="primary" 
              progress={0}
              max={10}
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3} item>
            <StatCard 
              title="Subscription Plan" 
              value="Free" 
              subtitle="No expiration"
              icon={<WorkspacePremiumRoundedIcon />} 
              color="success" 
            />
          </Grid>
        </Grid>
      )}

      {/* Setup Card */}
      <Grid container spacing={1} sx={{ mb: 4 }}>
        <Grid xs={12} md={6} lg={4}>
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{ height: '100%'}}
          >
            <HighlightedCard />
          </Box>
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <Paper
            component={motion.div}
            variants={itemVariants}
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`
                : `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.light, 0.04)})`,
              display: 'flex',
              flexDirection: 'column',
              mt: { xs: 3, md: 1, lg: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.info.main,
                  width: 42,
                  height: 42,
                  mr: 2
                }}
              >
                <PeopleAltRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Quick Setup Guide</Typography>
                <Typography variant="body2" color="text.secondary">Complete these steps to get started</Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              {[
                { title: "Connect your email account", done: false },
                { title: "Create your first AI assistant", done: false },
                { title: "Add training data", done: false },
                { title: "Test your assistant", done: false }
              ].map((step, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2, 
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: step.done 
                      ? alpha(theme.palette.success.main, 0.08)
                      : 'transparent'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      mr: 2,
                      fontSize: '0.875rem',
                      bgcolor: step.done 
                        ? theme.palette.success.main
                        : alpha(theme.palette.action.selected, 0.8),
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: step.done ? 600 : 400,
                      color: step.done 
                        ? theme.palette.success.main
                        : theme.palette.text.primary
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Button
              variant="outlined"
              color="info"
              fullWidth
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1
              }}
              // onclick navigate to documentation
              onClick={() => navigate('/docs')}
            >
              View Full Guide
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer with branding */}
      <Box
        component={motion.div}
        variants={itemVariants}
        sx={{
          textAlign: 'center',
          mt: 6,
          mb: 2,
          color: theme.palette.text.secondary,
          fontSize: '0.875rem'
        }}
      >
        {/* <Typography variant="body2">
          © {new Date().getFullYear()} Replai.tech • AI-Powered Email Assistant
        </Typography> */}
      </Box>
    </Box>
  );
}