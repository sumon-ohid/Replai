import * as React from 'react';
import {
  Paper, 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Avatar, 
  Divider, 
  alpha, 
  useTheme, 
  Skeleton, 
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EmailIcon from '@mui/icons-material/EmailRounded';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSnackbar } from 'notistack';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface ConnectedEmail {
  id: string;
  email: string;
  provider: 'google' | 'microsoft' | 'custom';
  status: 'active' | 'paused' | 'error';
  lastSynced: string;
  avatarUrl?: string;
  displayName?: string;
  error?: string;
}

interface EmailConnectionStatusProps {
  refreshTrigger: number;
}

export default function EmailConnectionStatus({ refreshTrigger }: EmailConnectionStatusProps) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [connectedEmails, setConnectedEmails] = React.useState<ConnectedEmail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeEmailId, setActiveEmailId] = React.useState<string | null>(null);

  // Fetch connected emails from API
  React.useEffect(() => {
    const fetchConnectedEmails = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('Authentication required');
        return;
      }
      
      try {
        const response = await axios.get(`${apiBaseUrl}/api/emails/connected`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConnectedEmails(response.data as ConnectedEmail[]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching connected emails:', err);
        setError('Failed to load connected email accounts');
        setLoading(false);
      }
    };
    
    fetchConnectedEmails();
  }, [refreshTrigger]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, emailId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveEmailId(emailId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveEmailId(null);
  };

  const handleSyncEmail = async (emailId: string) => {
    handleMenuClose();
    
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Authentication required', { variant: 'error' });
      return;
    }
    
    try {
      enqueueSnackbar('Syncing email account...', { variant: 'info' });
      await axios.post(`${apiBaseUrl}/api/emails/${emailId}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Email account synced successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error syncing email:', err);
      enqueueSnackbar('Failed to sync email account', { variant: 'error' });
    }
  };

  const handleToggleStatus = async (emailId: string, currentStatus: 'active' | 'paused' | 'error') => {
    handleMenuClose();
    
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Authentication required', { variant: 'error' });
      return;
    }
    
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      await axios.patch(`${apiBaseUrl}/api/emails/${emailId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setConnectedEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, status: newStatus } : email
      ));
      
      enqueueSnackbar(`Email account ${newStatus === 'active' ? 'activated' : 'paused'}`, { variant: 'success' });
    } catch (err) {
      console.error('Error toggling email status:', err);
      enqueueSnackbar('Failed to update email account status', { variant: 'error' });
    }
  };

  const handleDisconnect = async (emailId: string) => {
    handleMenuClose();
    
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Authentication required', { variant: 'error' });
      return;
    }
    
    try {
      await axios.delete(`${apiBaseUrl}/api/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setConnectedEmails(prev => prev.filter(email => email.id !== emailId));
      
      enqueueSnackbar('Email account disconnected successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error disconnecting email:', err);
      enqueueSnackbar('Failed to disconnect email account', { variant: 'error' });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <GoogleIcon sx={{ color: '#DB4437' }} />;
      case 'microsoft':
        return <MicrosoftIcon sx={{ color: '#0078D4' }} />;
      case 'custom':
      default:
        return <AlternateEmailIcon sx={{ color: '#673AB7' }} />;
    }
  };

  const formatLastSynced = (lastSynced: string) => {
    const date = new Date(lastSynced);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Empty state animation
  const emptyStateAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 0.3, duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        
        {[1, 2].map((item) => (
          <Box key={item} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        ))}
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        sx={{
          borderRadius: 3,
          mb: 3
        }}
      >
        {error}
      </Alert>
    );
  }

  if (connectedEmails.length === 0) {
    return (
      <Paper
        component={motion.div}
        variants={emptyStateAnimation}
        initial="hidden"
        animate="visible"
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200
        }}
      >
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <EmailIcon sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.8 }} />
        </Box>
        <Typography variant="h6" gutterBottom>
          No Email Accounts Connected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Connect your email accounts above to start automating responses and analyzing your email performance.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        overflow: 'hidden'
      }}
    >
      {connectedEmails.map((email, index) => (
        <React.Fragment key={email.id}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              backgroundColor: email.status === 'error' 
                ? alpha(theme.palette.error.main, 0.05)
                : 'transparent'
            }}
          >
            {/* Account Avatar */}
            <Avatar
              src={email.avatarUrl}
              alt={email.displayName || email.email}
              sx={{ 
                width: 48, 
                height: 48,
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              {getProviderIcon(email.provider)}
            </Avatar>
            
            {/* Account Details */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {email.displayName || email.email.split('@')[0]}
                </Typography>
                
                {email.status === 'active' && (
                  <Chip
                    size="small"
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label="Active"
                    sx={{ 
                      ml: 1.5,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      '& .MuiChip-icon': { color: theme.palette.success.main }
                    }}
                  />
                )}
                
                {email.status === 'paused' && (
                  <Chip
                    size="small"
                    icon={<PauseCircleOutlineIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label="Paused"
                    sx={{ 
                      ml: 1.5,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      '& .MuiChip-icon': { color: theme.palette.warning.main }
                    }}
                  />
                )}
                
                {email.status === 'error' && (
                  <Chip
                    size="small"
                    label="Error"
                    sx={{ 
                      ml: 1.5,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    }}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {email.email}
              </Typography>
              
              {email.status === 'error' && email.error && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.error.main,
                    display: 'block',
                    mt: 0.5
                  }}
                >
                  Error: {email.error}
                </Typography>
              )}
              
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center', 
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem'
                }}
              >
                <SyncIcon sx={{ fontSize: '0.875rem', mr: 0.5, opacity: 0.7 }} />
                Last synced {formatLastSynced(email.lastSynced)}
              </Box>
            </Box>
            
            {/* Account Actions */}
            <IconButton 
              size="small"
              onClick={(e) => handleMenuOpen(e, email.id)}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.active, 0.05)
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {index < connectedEmails.length - 1 && (
            <Divider sx={{ 
              mx: 3,
              borderColor: alpha(theme.palette.divider, 0.08)
            }} />
          )}
        </React.Fragment>
      ))}
      
      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            mt: 0.5,
            '& .MuiMenuItem-root': {
              py: 1.2,
              px: 2
            }
          }
        }}
      >
        <MenuItem onClick={() => activeEmailId && handleSyncEmail(activeEmailId)}>
          <ListItemIcon>
            <SyncIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sync Now</ListItemText>
        </MenuItem>
        
        {activeEmailId && (
          <MenuItem 
            onClick={() => {
              const email = connectedEmails.find(e => e.id === activeEmailId);
              if (email) handleToggleStatus(activeEmailId, email.status);
            }}
          >
            <ListItemIcon>
              {connectedEmails.find(e => e.id === activeEmailId)?.status === 'active' ? (
                <PauseCircleOutlineIcon fontSize="small" />
              ) : (
                <PlayCircleOutlineIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {connectedEmails.find(e => e.id === activeEmailId)?.status === 'active' 
                ? 'Pause Account' 
                : 'Activate Account'
              }
            </ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => activeEmailId && handleDisconnect(activeEmailId)}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>
            Disconnect
          </ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}