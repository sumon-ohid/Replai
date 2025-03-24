import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha, styled, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import {
  Typography,
  Button,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Skeleton,
  Avatar,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Card,
  CircularProgress,
  Alert,
  Checkbox,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery
} from '@mui/material';
import Footer from './components/Footer';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DraftsIcon from '@mui/icons-material/Drafts';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SortIcon from '@mui/icons-material/Sort';
import EmailIcon from '@mui/icons-material/Email';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import NotificationsIcon from '@mui/icons-material/Notifications';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Types
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  read: boolean;
  email?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  errors: number;
  warnings: number;
}

// Styled components
const NotificationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  }
}));

const TypeBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 4,
  height: '100%',
}));

const ReadDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(1)
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.7),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 1),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none'
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 16,
  fontWeight: 500
}));

export default function NotificationView(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    errors: 0,
    warnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<string | null>(null);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    action: () => {}
  });
  
  const itemsPerPage = 10;
  
  // Load notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      interface NotificationsResponse {
        success: boolean;
        data: Notification[];
        stats: NotificationStats;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get<NotificationsResponse>(`${apiBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 100
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setStats(response.data.stats);
        setLoading(false);
      } else {
        throw new Error('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      setLoading(false);
    }
  }, []);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query) ||
        (notification.email && notification.email.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }
    
    // Apply read/unread filter
    if (readFilter === 'read') {
      filtered = filtered.filter(notification => notification.read);
    } else if (readFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredNotifications(filtered);
    setPage(1); // Reset to first page when filters change
    setSelectedNotifications([]); // Clear selections
    setSelectAll(false);
  }, [notifications, searchQuery, typeFilter, readFilter, sortOrder]);
  
  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Pagination logic
  const pageCount = Math.ceil(filteredNotifications.length / itemsPerPage);
  const currentPageItems = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Toggle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedNotifications(currentPageItems.map(n => n._id));
    } else if (selectedNotifications.length === currentPageItems.length) {
      setSelectedNotifications([]);
    }
  }, [selectAll]);
  
  // Check if all are selected
  useEffect(() => {
    if (currentPageItems.length > 0 && selectedNotifications.length === currentPageItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedNotifications, currentPageItems]);
  
  // Action handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenu(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };
  
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSort(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setAnchorElSort(null);
  };
  
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setSelectedNotifications([]);
    setSelectAll(false);
  };
  
  const handleTypeFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    setTypeFilter(newFilter);
  };
  
  const handleReadFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    setReadFilter(newFilter);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter(null);
    setReadFilter(null);
    setSortOrder('newest');
  };
  
  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };
  
  // Fix the markAsRead function:
const markAsRead = async (notificationId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }
    
    // Corrected: Pass notificationId in URL path and headers in config object
    await axios.post(
      `${apiBaseUrl}/api/notifications/mark-read/${notificationId}`, 
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
};

// Fix the markAllAsRead function:
const markAllAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    await axios.post(
      `${apiBaseUrl}/api/notifications/mark-all-read`,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: 0
    }));
    
    // Close confirmation dialog
    setConfirmDialog({ ...confirmDialog, open: false });
  } catch (err) {
    console.error('Failed to mark all as read:', err);
  }
};

// Fix the markSelectedAsRead function:
const markSelectedAsRead = async () => {
  if (selectedNotifications.length === 0) return;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    const promises = selectedNotifications.map(id => 
      axios.post(
        `${apiBaseUrl}/api/notifications/mark-read/${id}`, 
        {}, // empty body
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
    );
    
    await Promise.all(promises);
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => 
        selectedNotifications.includes(notification._id)
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Count how many were actually unread before
    const newlyRead = notifications.filter(
      n => selectedNotifications.includes(n._id) && !n.read
    ).length;
    
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - newlyRead)
    }));
    
    // Reset selection
    setSelectedNotifications([]);
    setSelectAll(false);
    
    // Close confirmation dialog
    setConfirmDialog({ ...confirmDialog, open: false });
  } catch (err) {
    console.error('Failed to mark selected as read:', err);
  }
};

// Fix the clearAllNotifications function:
const clearAllNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    await axios.post(
      `${apiBaseUrl}/api/notifications/clear-all`, 
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Update local state
    setNotifications([]);
    setStats({
      total: 0,
      unread: 0,
      errors: 0,
      warnings: 0
    });
    
    // Close confirmation dialog
    setConfirmDialog({ ...confirmDialog, open: false });
  } catch (err) {
    console.error('Failed to clear notifications:', err);
  }
};
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If less than 24 hours ago, show relative time
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show the date
    return format(date, 'MMM d, yyyy');
  };
  
  // Get icon based on notification type
  const getIcon = (type: string, size: 'small' | 'medium' = 'small') => {
    switch (type) {
      case 'error':
        return <ErrorOutlineIcon fontSize={size} color="error" />;
      case 'warning':
        return <WarningAmberIcon fontSize={size} color="warning" />;
      case 'success':
        return <CheckCircleOutlineIcon fontSize={size} color="success" />;
      case 'info':
      default:
        return <InfoOutlinedIcon fontSize={size} color="info" />;
    }
  };
  
  // Get color based on notification type
  const getColor = (type: string) => {
    switch (type) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  // Confirmation dialog handlers
  const openConfirmDialog = (title: string, content: string, action: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      content,
      action
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header/>
            
            {/* Notification content */}
            <Box sx={{ width: '100%', maxWidth: 1200, px: { xs: 0, sm: 3 }, py: 2 }}>
              {/* Page header */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  Notifications
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {stats.total} notifications • {stats.unread} unread
                </Typography>
                
                {/* Action toolbar */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ 
                    flexWrap: 'wrap', 
                    mb: 3,
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <SearchBar
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton 
                            size="small" 
                            onClick={() => setSearchQuery('')}
                            edge="end"
                          >
                            <ClearAllIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }} />
                  
                  {selectedNotifications.length > 0 ? (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap'}}>
                      <Chip 
                        label={`${selectedNotifications.length} selected`} 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                      <Tooltip title="Mark selected as read">
                        <ActionButton 
                          variant="outlined" 
                          size="small" 
                          startIcon={<MarkEmailReadIcon />}
                          onClick={() => openConfirmDialog(
                            'Mark as Read',
                            `Are you sure you want to mark ${selectedNotifications.length} notification(s) as read?`,
                            markSelectedAsRead
                          )}
                        >
                          Mark as Read
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Clear selection">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedNotifications([]);
                            setSelectAll(false);
                          }}
                        >
                          <ClearAllIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap'}}>
                      <Tooltip title="Refresh notifications" placement="top">
                        <Button onClick={fetchNotifications} variant="outlined" size="small" startIcon={<RefreshIcon />}>
                            Refresh
                        </Button>
                      </Tooltip>
                      
                      {/* <Tooltip title="Sort by">
                        <IconButton onClick={handleSortMenuOpen}>
                          <SortIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Mark all as read">
                        <ActionButton 
                          variant="outlined" 
                          size="small" 
                          startIcon={<DraftsIcon />}
                          onClick={() => openConfirmDialog(
                            'Mark All as Read',
                            'Are you sure you want to mark all notifications as read?',
                            markAllAsRead
                          )}
                        >
                          Mark All as Read
                        </ActionButton>
                      </Tooltip>
                      
                      <Tooltip title="Clear all notifications">
                        <ActionButton 
                          variant="outlined" 
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => openConfirmDialog(
                            'Clear All Notifications',
                            'Are you sure you want to clear all notifications? This action cannot be undone.',
                            clearAllNotifications
                          )}
                        >
                          Clear All
                        </ActionButton>
                      </Tooltip> */}
                    </Stack>
                  )}
                </Stack>
                
                {/* Filter toolbar */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: 2 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FilterListIcon sx={{ mr: 1 }} color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Filters:
                    </Typography>
                  </Box>
                  
                  <ToggleButtonGroup
                    value={typeFilter}
                    exclusive
                    onChange={handleTypeFilterChange}
                    aria-label="notification type filter"
                    size="small"
                    sx={{ ml: 1}}
                  >
                    <ToggleButton value="info" aria-label="info" sx={{ borderRadius: 2 }}>
                      <InfoOutlinedIcon fontSize="small" color="info" sx={{ mr: 0.5 }} />
                      Info
                    </ToggleButton>
                    <ToggleButton value="success" aria-label="success" sx={{ borderRadius: 2 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      Success
                    </ToggleButton>
                    <ToggleButton value="warning" aria-label="warning" sx={{ borderRadius: 2 }}>
                      <WarningAmberIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                      Warning
                    </ToggleButton>
                    <ToggleButton value="error" aria-label="error" sx={{ borderRadius: 2 }}>
                      <ErrorOutlineIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      Error
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  <ToggleButtonGroup
                    value={readFilter}
                    exclusive
                    onChange={handleReadFilterChange}
                    aria-label="read status filter"
                    size="small"
                  >
                    <ToggleButton value="unread" aria-label="unread only" sx={{ borderRadius: 2 }}>
                      <MarkunreadIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Unread
                    </ToggleButton>
                    <ToggleButton value="read" aria-label="read only" sx={{ borderRadius: 2 }}>
                      <DraftsIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Read
                    </ToggleButton>
                  </ToggleButtonGroup>
                  
                  {(typeFilter || readFilter || searchQuery || sortOrder !== 'newest') && (
                    <Tooltip title="Clear all filters">
                      <IconButton onClick={handleClearFilters} size="small">
                        <FilterAltOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                
                {/* Active filters */}
                {(typeFilter || readFilter || searchQuery || sortOrder !== 'newest') && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    {searchQuery && (
                      <FilterChip 
                        label={`Search: "${searchQuery}"`}
                        onDelete={() => setSearchQuery('')}
                        color="default"
                        variant="outlined"
                      />
                    )}
                    
                    {typeFilter && (
                      <FilterChip 
                        label={`Type: ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`}
                        onDelete={() => setTypeFilter(null)}
                        color={
                          typeFilter === 'error' ? 'error' :
                          typeFilter === 'warning' ? 'warning' :
                          typeFilter === 'success' ? 'success' : 'info'
                        }
                        variant="outlined"
                        icon={getIcon(typeFilter)}
                      />
                    )}
                    
                    {readFilter && (
                      <FilterChip 
                        label={`Status: ${readFilter === 'read' ? 'Read' : 'Unread'}`}
                        onDelete={() => setReadFilter(null)}
                        color="primary"
                        variant="outlined"
                        icon={readFilter === 'read' ? <DraftsIcon fontSize="small" /> : <MarkunreadIcon fontSize="small" />}
                      />
                    )}
                    
                    {sortOrder !== 'newest' && (
                      <FilterChip 
                        label={`Sort: Oldest first`}
                        onDelete={() => setSortOrder('newest')}
                        color="default"
                        variant="outlined"
                        icon={<SortIcon fontSize="small" />}
                      />
                    )}
                  </Box>
                )}
                
                <Divider sx={{ mt: 2 }} />
              </Box>
              
              {/* Notifications list */}
              {loading ? (
                // Loading state
                <Stack spacing={2}>
                  {[...Array(5)].map((_, i) => (
                    <NotificationCard key={i}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ width: '100%' }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="90%" />
                          <Skeleton variant="text" width="40%" />
                          <Box sx={{ mt: 1 }}>
                            <Skeleton variant="text" width="20%" />
                          </Box>
                        </Box>
                      </Stack>
                    </NotificationCard>
                  ))}
                </Stack>
              ) : error ? (
                // Error state
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Alert 
                    severity="error" 
                    action={
                      <Button color="inherit" size="small" onClick={fetchNotifications}>
                        Retry
                      </Button>
                    }
                  >
                    {error}
                  </Alert>
                </Box>
              ) : filteredNotifications.length === 0 ? (
                // Empty state
                <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <NotificationsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {notifications.length > 0 
                      ? 'Try adjusting your filters to see more results.'
                      : 'You have no notifications at this time.'}
                  </Typography>
                  {notifications.length > 0 && (
                    <Button 
                      variant="outlined" 
                      startIcon={<FilterAltOffIcon />}
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                // Notifications list
                <>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'} found
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <Fade in={true} timeout={500}>
                      <div>
                        {currentPageItems.map((notification) => (
                          <NotificationCard 
                            key={notification._id} 
                            sx={{
                              backgroundColor: "transparent",
                              border: '1px solid',
                              borderColor: "divider",
                            }}
                          >
                            <TypeBadge sx={{ backgroundColor: getColor(notification.type) }} />
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Checkbox 
                                checked={selectedNotifications.includes(notification._id)}
                                onChange={() => toggleSelectNotification(notification._id)}
                                sx={{ ml: 0.5 }}
                              />
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(getColor(notification.type), 0.1),
                                  color: getColor(notification.type)
                                }}
                              >
                                {getIcon(notification.type)}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {!notification.read && <ReadDot />}
                                    <Typography variant="subtitle1" component="h2" fontWeight={!notification.read ? 600 : 400}>
                                      {notification.title}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(notification.createdAt)}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                                  {notification.message}
                                </Typography>
                                {notification.email && (
                                  <Chip 
                                    size="small" 
                                    label={notification.email}
                                    icon={<EmailIcon fontSize="small" />}
                                    variant="outlined"
                                    sx={{ 
                                      mt: 1, 
                                      borderRadius: 1,
                                      height: 24,
                                      '& .MuiChip-label': {
                                        fontSize: '0.75rem'
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                              <Box>
                                <IconButton 
                                  size="small" 
                                  onClick={() => markAsRead(notification._id)}
                                  disabled={notification.read}
                                  sx={{ 
                                    visibility: notification.read ? 'hidden' : 'visible',
                                    mr: 1
                                  }}
                                >
                                  <DraftsIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Stack>
                          </NotificationCard>
                        ))}
                      </div>
                    </Fade>
                  </Stack>
                  
                  {/* Pagination */}
                  {pageCount > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination 
                        count={pageCount} 
                        page={page} 
                        onChange={handleChangePage}
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Stack>
          <Footer />
        </Box>
      </Box>
      
      {/* Sort menu */}
      <Menu
        anchorEl={anchorElSort}
        open={Boolean(anchorElSort)}
        onClose={handleSortMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => {
            setSortOrder('newest');
            handleSortMenuClose();
          }}
          selected={sortOrder === 'newest'}
        >
          <ListItemIcon>
            <SortIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Newest first</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortOrder('oldest');
            handleSortMenuClose();
          }}
          selected={sortOrder === 'oldest'}
        >
          <ListItemIcon>
            <SortIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
          </ListItemIcon>
          <ListItemText>Oldest first</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {confirmDialog.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={confirmDialog.action} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}