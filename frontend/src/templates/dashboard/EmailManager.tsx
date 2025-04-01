import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';

// Icons
import EmailIcon from '@mui/icons-material/EmailRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';

// Lazy loaded components
const EmailProviderCard = React.lazy(() => import('./components/EmailProviderCard'));
const ConnectEmailDialog = React.lazy(() => import('./components/ConnectEmailDialog'));
const EmailAnalytics = React.lazy(() => import('./components/EmailAnalytics'));
const EmailConnectionStatus = React.lazy(() => import('./components/EmailConnectionStatus'));

// Components
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import GetConnectedEmails from './components/GetConnectedEmails';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import axios from 'axios';
import Footer from './components/Footer';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import { n } from 'framer-motion/dist/types.d-B50aGbjN';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const cardHoverAnimation = {
  rest: { scale: 1, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' },
  hover: { 
    scale: 1.02,
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export default function EmailManager(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState<{[key: string]: boolean}>({
    google: false,
    microsoft: false,
    custom: false
  });
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [emailProvider, setEmailProvider] = React.useState<'google' | 'microsoft' | 'custom' | null>(null);
  const [stats, setStats] = React.useState({
    totalEmails: 0,
    processedEmails: 0,
    automatedResponses: 0
  });

  // Fetch email stats
  React.useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await axios.get(`${apiBaseUrl}/api/emails/stats/basic`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data as any);
      } catch (error) {
        console.error('Error fetching email stats:', error);
      }
    };
    
    fetchStats();
  }, [refreshTrigger]);

  const handleConnectEmail = (provider: 'google' | 'microsoft' | 'custom') => {
    setEmailProvider(provider);
    setOpenDialog(true);
  };

   // Updated the handleAuthProvider function
    const handleAuthProvider = async (provider: 'google' | 'microsoft') => {
    setLoading({...loading, [provider]: true});
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Authentication required', { variant: 'error' });
      setLoading({...loading, [provider]: false});
      return;
    }
  
    try {
      const endpoint = provider === 'google' ? 'google' : 'outlook';
      
      interface AuthResponse {
        authUrl: string;
      }
  
      const response = await axios.get<AuthResponse>(`${apiBaseUrl}/api/emails/auth/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data || !response.data.authUrl) {
        throw new Error(`Invalid response from server: missing authUrl`);
      }
      
      const authUrl = response.data.authUrl;
      
      // show success message
      window.location.href = authUrl;
      enqueueSnackbar(`Redirecting to ${provider} for authentication`, { variant: 'info' });
    } catch (error: any) {
      console.error(`Error connecting to ${provider}:`, error);
      
      // Check for specific subscription error
      if (error.response && error.response.status === 403) {
        if (error.response.data?.error === 'subscription_required') {
          enqueueSnackbar(error.response.data.message || 'Free plan users cannot connect email account. Please upgrade to a Pro plan.', {
            variant: 'error',
            autoHideDuration: 3000,
            preventDuplicate: true
          });
        } else {
          enqueueSnackbar(`Permission denied: ${error.response.data?.message || 'Unable to connect email'}`, {
            variant: 'error'
          });
        }
      } else {
        // Generic error handling
        enqueueSnackbar(`Failed to connect to ${provider}: ${error.message || 'Unknown error'}`, {
          variant: 'error'
        });
      }
    } finally {
      setLoading({...loading, [provider]: false});
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmailProvider(null);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    enqueueSnackbar('Refreshing connected accounts', { variant: 'info' });
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
              mx: { xs: 2, sm: 3 },
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>

          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              px: { xs: 2, sm: 3 },
              pb: 5,
            }}
          >
            {/* Header section */}
            <Box 
              component={motion.div}
              variants={itemVariants}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 3,
                gap: 2
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    component={motion.div}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    sx={{
                      mr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                      borderRadius: '50%',
                      background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                    }}
                  >
                    <EmailIcon 
                      sx={{ 
                        color: 'white',
                        fontSize: 32, 
                        opacity: .8,
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      color: 'transparent',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                      mr: 3,
                      zIndex: 1,
                      opacity: .7,
                    }}
                  >
                    Email Manager
                  </Typography>
                  
                  <Tooltip title="Connect your email accounts to automate responses" placement='right'>
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ maxWidth: 600 }}
                >
                  Connect and manage your email accounts for automated responses and analytics.
                </Typography>
              </Box>
              
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2,
                  height: 36
                }}
              >
                Refresh Status
              </Button>
            </Box>

            {/* Analytics Cards */}
            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ mb: 4 }}
            >
              <React.Suspense fallback={<Skeleton variant="rectangular" height={120} />}>
                <EmailAnalytics stats={stats} refreshTrigger={refreshTrigger} />
              </React.Suspense>
            </Box>
            
            {/* Info Card */}
            <Box 
              component={motion.div}
              variants={itemVariants}
              sx={{ mb: 4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                  background: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.info.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <SecurityIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 0.5 }}>
                    Your data is secure with us
                  </Typography>
                  <Typography variant="body2">
                    Connected email accounts enable automatic responses and email analysis. We use OAuth2 for secure access 
                    and never store your passwords. You can revoke access at any time.
                  </Typography>
                </Box>
                
                <Chip 
                  label="Secure OAuth2" 
                  size="small"
                  color="secondary"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.5) : alpha(theme.palette.info.main, 0.9),
                    borderRadius: 1.5
                  }} 
                />
              </Paper>
            </Box>

            {/* Email Provider Options */}
            <Box 
              component={motion.div}
              variants={itemVariants}
              sx={{ mb: 4 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2.5,
                  ml: 2,
                  fontWeight: 600
                }}
              >
                Connect Email Provider
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <React.Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
                    <EmailProviderCard
                      title="Gmail"
                      description="Connect your Google account to automate Gmail responses"
                      icon={<GoogleIcon sx={{ fontSize: 40 }} />}
                      color="#DB4437"
                      onClick={() => handleAuthProvider('google')}
                      loading={loading.google}
                      animation={cardHoverAnimation}
                    />
                  </React.Suspense>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <React.Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
                    <EmailProviderCard
                      title="Microsoft Outlook"
                      description="Connect your Microsoft account for Outlook automation"
                      icon={<MicrosoftIcon sx={{ fontSize: 40 }} />}
                      color="#0078D4"
                      onClick={() => handleAuthProvider('microsoft')}
                      loading={loading.microsoft}
                      animation={cardHoverAnimation}
                    />
                  </React.Suspense>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <React.Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
                    <EmailProviderCard
                      title="Custom Email"
                      description="Connect other email providers via IMAP/SMTP"
                      icon={<AlternateEmailIcon sx={{ fontSize: 40 }} />}
                      color="#673AB7"
                      onClick={() => handleConnectEmail('custom')}
                      loading={loading.custom}
                      animation={cardHoverAnimation}
                    />
                  </React.Suspense>
                </Grid>
              </Grid>
            </Box>
            
            {/* Connected Emails Status */}
            <Box component={motion.div} variants={itemVariants}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2.5,
                  ml: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Connected Accounts
                <Chip
                  label="Refreshing..."
                  size="small"
                  color="default"
                  variant="outlined"
                  sx={{
                    height: 24,
                    display: refreshTrigger > 0 ? 'inline-flex' : 'none',
                    '& .MuiChip-label': { px: 1 },
                    borderColor: alpha(theme.palette.action.active, 0.2)
                  }}
                />
              </Typography>

               {/* get ConnectedEmails from './components/GetConnectedEmails'; */}
              <GetConnectedEmails/>
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>

      
      
      {/* Custom Email Connection Dialog */}
      <React.Suspense fallback={null}>
        <ConnectEmailDialog
          open={openDialog}
          onClose={handleCloseDialog}
          provider={emailProvider}
        />
      </React.Suspense>
    </AppTheme>
  );
}