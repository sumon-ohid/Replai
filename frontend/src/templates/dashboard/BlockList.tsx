import * as React from 'react';
import { useState } from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha, useTheme, lighten, darken } from '@mui/material/styles';
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
import BlockListData from './components/BlockListData';
import { 
  Typography, 
  Container, 
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Chip,
  useMediaQuery,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import BlockIcon from '@mui/icons-material/Block';
import SecurityIcon from '@mui/icons-material/Security';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShieldIcon from '@mui/icons-material/Shield';

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
      delayChildren: 0.1
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
      stiffness: 260,
      damping: 20
    }
  }
};

export default function BlockList(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Get gradient colors based on theme
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const headerGradient = `linear-gradient(90deg, ${primaryColor} 0%, ${
    theme.palette.mode === "dark"
      ? lighten(secondaryColor, 0.1)
      : secondaryColor
  } 100%)`;

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
          
          <Container maxWidth="xl">
            <Box
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              sx={{ 
                px: { xs: 1, sm: 2, md: 3 }, 
                py: 3,
                maxWidth: 1200,
                mx: 'auto'
              }}
            >
              {/* Page Header */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 4 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BlockIcon 
                    sx={{ 
                      mr: 1.5, 
                      fontSize: 36,
                      color: theme.palette.error.main
                    }} 
                  />
                  <Typography 
                    variant={isMobile ? 'h5' : 'h4'} 
                    component="h1"
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Email Block List
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 2 
                  }}
                >
                  Manage your email security by adding domains or specific addresses to your block list.
                  Blocked emails will be automatically filtered out of your inbox.
                </Typography>
                
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    backgroundColor: isDarkMode 
                      ? alpha(theme.palette.error.dark, 0.1)
                      : alpha(theme.palette.error.light, 0.1),
                    mb: 3
                  }}
                >
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    icon={<ShieldIcon />}
                    sx={{ 
                      borderRadius: 1.5,
                      '& .MuiAlert-message': {
                        fontSize: '0.9rem',
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      How blocking works:
                    </Typography>
                    <Typography variant="body2">
                      Email addresses or domains added to your block list won't be able to reach your inbox. 
                      You can block entire domains (e.g., <Chip size="small" label="spam.com" sx={{ fontSize: '0.75rem', height: 22 }} />) 
                      or specific addresses (e.g., <Chip size="small" label="user@example.com" sx={{ fontSize: '0.75rem', height: 22 }} />).
                    </Typography>
                  </Alert>
                </Paper>
              </Box>

              {/* Block List Content */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: isDarkMode
                    ? `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
                    : `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                }}
              >
                <Card elevation={0}>
                  <CardContent sx={{ p: 0 }}>
                    <BlockListData />
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}