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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
import Footer from '../homepage/components/Footer';

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

export default function EmailManager(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
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
                      // white fade background
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
              
              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh email accounts">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBot}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                  }}
                >
                  {loading ? 'Connecting...' : 'Connect Email Account'}
                </Button>
              </Stack>
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
                  <InfoOutlinedIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.info.main, fontWeight: 600, mb: 0.5 }}>
                    Why connect your email?
                  </Typography>
                  <Typography variant="body2">
                    Connected email accounts enable automatic responses, email analysis, and help you save time managing your inbox.
                    We only use read-only access and never store your passwords.
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
            
            {/* Connected Emails */}
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
              
              {/* Animated content wrapper */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={refreshTrigger}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <GetConnectedEmails key={refreshTrigger} />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
