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
import Footer from '../marketing-page/components/Footer';
import CustomizedDataGrid from './components/CustomizedDataGrid';

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

export default function InboxEmail(props: { disableCustomTheme?: boolean }) {
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

          <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          }}
        >
          <Box sx={{ p: 3 }}>
            <CustomizedDataGrid />
          </Box>
        </Paper>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
