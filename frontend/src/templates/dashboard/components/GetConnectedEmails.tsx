import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import { motion } from 'framer-motion';

// Icons
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import SyncIcon from '@mui/icons-material/SyncRounded';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorIcon from '@mui/icons-material/ErrorOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface EmailAccount {
  id: number;
  email: string;
  provider: string;
  status?: 'active' | 'error' | 'syncing';
  lastSync?: string;
  type?: 'personal' | 'work';
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  exit: { opacity: 0, y: 10 }
};



export default function GetConnectedEmails() {
  const { user } = useAuth();
  const theme = useTheme();
  const [connectedEmails, setConnectedEmails] = React.useState<EmailAccount[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState<string>('');
  const [actionEmail, setActionEmail] = React.useState<EmailAccount | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Enhancement: Demo data for visualization
  const mockEmails: EmailAccount[] = [
    { id: 1, email: 'work@example.com', provider: 'google', status: 'active', lastSync: '2 minutes ago', type: 'work' },
    { id: 2, email: 'personal@gmail.com', provider: 'google', status: 'active', lastSync: '5 minutes ago', type: 'personal' },
    { id: 3, email: 'support@company.com', provider: 'gmail', status: 'error', lastSync: '1 hour ago', type: 'work' },
    { id: 4, email: 'alex.smith@outlook.com', provider: 'outlook', status: 'syncing', lastSync: 'syncing...', type: 'personal' },
  ];

  const fetchConnectedEmails = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/api/emails/connected`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // In production, use this:
      const emails = (response.data as EmailAccount[]).map((email: EmailAccount, index: number) => ({ ...email, id: index }));
      
      // For demo purposes using mock data:
      // const emails = mockEmails;
      
      setTimeout(() => {
        setConnectedEmails(emails);
        setLoading(false);
      }, 800); // Simulate network delay for demo
    } catch (error) {
      console.error('Error fetching connected emails:', error);
      setError('Error fetching connected emails');
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (email: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/api/emails/connected/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setConnectedEmails(connectedEmails.filter(account => account.email !== email));
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting email:', error);
      setError('Error deleting email');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, email: EmailAccount) => {
    setActionEmail(email);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleRefreshAccount = (email: EmailAccount) => {
    // Set specific account to syncing status
    const updatedEmails = connectedEmails.map(acc => 
      acc.id === email.id ? { ...acc, status: 'syncing' as 'syncing', lastSync: 'syncing...' } : acc
    );
    setConnectedEmails(updatedEmails);
    
    // Simulate sync completion
    setTimeout(() => {
      const completedEmails = connectedEmails.map(acc => 
        acc.id === email.id ? { ...acc, status: 'active' as 'active', lastSync: 'just now' } : acc
      );
      setConnectedEmails(completedEmails);
    }, 2000);
    
    handleCloseMenu();
  };

  React.useEffect(() => {
    fetchConnectedEmails();
  }, []);

  const filteredEmails = connectedEmails.filter(emailAccount =>
    emailAccount.email.toLowerCase().includes(search.toLowerCase())
  );

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
      case 'gmail':
        return <GoogleIcon sx={{ fontSize: 18 }} />;
      default:
        return <AlternateEmailIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'active':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />;
      case 'syncing':
        return <SyncIcon sx={{ color: theme.palette.info.main, fontSize: 16, animation: 'spin 1.5s linear infinite' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'active':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'syncing':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCreateBot = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/api/emails/auth/google`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const authUrl = (response.data as { authUrl: string }).authUrl;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error creating bot:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Search and actions bar */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 3,
            gap: 2
          }}
        >
          <TextField
            placeholder='Search email accounts'
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.6),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
            sx={{ 
              width: { xs: '100%', sm: 300 },
              '& .MuiInputBase-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchConnectedEmails()}
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              Refresh All
            </Button>
            
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              color="primary"
              disableElevation
              onClick={handleCreateBot}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Add Account
            </Button>
          </Stack>
        </Box>

        {/* Email accounts list */}
        {loading ? (
          <Box sx={{ mt: 3 }}>
            {[1, 2, 3].map((_, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={180} height={24} />
                      <Skeleton variant="text" width={120} height={20} />
                    </Box>
                  </Stack>
                  <Skeleton variant="rounded" width={100} height={36} />
                </Stack>
              </Paper>
            ))}
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: 'center',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.2),
              bgcolor: alpha(theme.palette.error.main, 0.05)
            }}
          >
            <ErrorOutlineIcon 
              color="error" 
              sx={{ fontSize: 40, opacity: 0.8, mb: 1 }} 
            />
            <Typography color="error.main" variant="h6" gutterBottom>
              Error Loading Accounts
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error || 'Failed to load your connected email accounts'}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />} 
              onClick={fetchConnectedEmails}
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        ) : filteredEmails.length === 0 ? (
          search ? (
            <Box textAlign="center" py={4}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                No matching accounts
              </Typography>
              <Typography color="text.secondary">
                No email accounts match your search query
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                textAlign: 'center',
                border: '1px dashed',
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}
            >
              <Box 
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <AlternateEmailIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                No Email Accounts Connected
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                Connect your email accounts to start automating responses and get analytics
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
                onClick={handleCreateBot}
              >
                Connect Your First Account
              </Button>
            </Paper>
          )
        ) : (
          <Box>
            {filteredEmails.map((email, index) => (
              <Box 
                component={motion.div}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                key={email.id}
                sx={{ mb: 2 }}
              >
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.8),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 0 }}
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          email.status && (
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(email.status),
                                border: `2px solid ${theme.palette.background.paper}`
                              }}
                            />
                          )
                        }
                      >
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44, 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.2)
                          }}
                        >
                          {getProviderIcon(email.provider)}
                        </Avatar>
                      </Badge>
                      
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {email.email}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          {email.type && (
                            <Chip 
                              label={email.type} 
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                backgroundColor: alpha(theme.palette.action.selected, 0.1),
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: getStatusColor(email.status)
                            }}
                          >
                            {getStatusIcon(email.status)}
                            {email.status === 'active' ? 'Active' : 
                              email.status === 'error' ? 'Connection error' : 
                              email.status === 'syncing' ? 'Syncing...' : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last synced: {email.lastSync || 'Never'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      sx={{ 
                        alignSelf: { xs: 'flex-end', sm: 'center' },
                        mt: { xs: 1, sm: 0 }
                      }}
                    >
                      <Tooltip title="Sync account">
                        <IconButton 
                          size="small"
                          onClick={() => handleRefreshAccount(email)}
                          sx={{ 
                            color: theme.palette.text.secondary,
                            backgroundColor: alpha(theme.palette.action.hover, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }
                          }}
                        >
                          <SyncIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Box>
                        <Tooltip title="More options">
                          <IconButton 
                            size="small"
                            onClick={(e) => handleOpenMenu(e, email)}
                            sx={{ 
                              color: theme.palette.text.secondary,
                              backgroundColor: alpha(theme.palette.action.hover, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                              }
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleCloseMenu}
                          elevation={2}
                          sx={{
                            mt: 1,
                            '& .MuiPaper-root': { 
                              borderRadius: 2,
                              boxShadow: theme.palette.mode === 'dark'
                                ? '0 4px 20px rgba(0,0,0,0.4)'
                                : '0 4px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <MenuItem onClick={() => handleRefreshAccount(actionEmail!)}>
                            <ListItemIcon>
                              <RefreshIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Sync Now</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon>
                              <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Account Settings</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon>
                              <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Edit Label</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleCloseMenu}>
                            <ListItemIcon>
                              <VisibilityOffIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Pause Sync</ListItemText>
                          </MenuItem>
                          <Divider />
                          <MenuItem 
                            onClick={() => actionEmail && handleDeleteEmail(actionEmail.email)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <ListItemIcon>
                              <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                            </ListItemIcon>
                            <ListItemText>Disconnect</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Box>
        )}

        {/* Status summary */}
        {filteredEmails.length > 0 && !loading && !error && (
          <Box
            sx={{
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: theme.palette.divider,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {filteredEmails.length} active account{filteredEmails.length > 1 ? 's' : ''}
            </Typography>
            {/* <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <Typography component="span" fontWeight={600} color="text.primary">
                  4,512
                </Typography> emails processed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Typography component="span" fontWeight={600} color="text.primary">
                  98%
                </Typography> success rate
              </Typography>
            </Box> */}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
