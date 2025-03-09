import * as React from "react";
import { useState } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha, useTheme, lighten, darken } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import { 
  Typography, 
  Paper, 
  Chip, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Link,
  IconButton,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import Button from "@mui/material/Button";
import DataTabs from "./components/DataTabs";
import { motion } from "framer-motion";

// Icons
import AddIcon from "@mui/icons-material/Add";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import StorageIcon from "@mui/icons-material/Storage";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import Footer from './components/Footer';

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

const DataManager = (props: { disableCustomTheme?: boolean }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const headerGradient = `linear-gradient(90deg, ${primaryColor} 0%, ${
    theme.palette.mode === "dark"
      ? lighten(primaryColor, 0.1)
      : primaryColor
  } 100%)`;

  const benefitItems = [
    {
      icon: <StorageIcon />,
      title: "Unified Data",
      description: "Centralize all your data sources into one consistent training platform"
    },
    {
      icon: <AnalyticsOutlinedIcon />,
      title: "Enhanced Learning",
      description: "Higher quality data leads to more accurate AI responses to emails"
    },
    {
      icon: <RocketLaunchOutlinedIcon />,
      title: "Custom Automation",
      description: "Train models to understand your specific communication style and needs"
    }
  ];

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
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
                mx: "auto"
              }}
            >
              {/* Header Section */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 5 }}
              >
                <Box sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
                  <Box sx={{ 
                    display: "flex",
                    alignItems: "center", 
                    mb: 1,
                    justifyContent: isMobile ? "center" : "flex-start"
                  }}>
                    <DataUsageIcon 
                      sx={{ 
                        fontSize: 40, 
                        mr: 1.5,
                        color: theme.palette.primary.main 
                      }} 
                    />
                    <Typography 
                      variant={isMobile ? "h4" : "h3"} 
                      component="h1"
                      sx={{ 
                        fontWeight: 800,
                        background: headerGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      AI Data Manager
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ maxWidth: 900 }}
                  >
                    Connect data sources and upload files to train your AI models. Higher quality data results in more accurate and personalized AI responses.
                  </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {benefitItems.map((item, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Card 
                        elevation={0} 
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              mb: 2,
                              alignItems: 'center',
                              justifyContent: 'flex-start'
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                bgcolor: isDarkMode 
                                  ? alpha(theme.palette.primary.main, 0.2) 
                                  : alpha(theme.palette.primary.light, 0.2),
                                color: theme.palette.primary.main,
                                width: 48,
                                height: 48,
                                mr: 1.5
                              }}
                            >
                              {item.icon}
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              {item.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              {/* Main Content Area */}
              <Box component={motion.div} variants={itemVariants}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    mb: 4,
                    borderRadius: 4,
                    backgroundImage: `radial-gradient(circle at top right, ${alpha(primaryColor, isDarkMode ? 0.15 : 0.08)} 0%, transparent 70%),
                                      radial-gradient(circle at bottom left, ${alpha(secondaryColor, isDarkMode ? 0.1 : 0.05)} 0%, transparent 70%)`,
                    backgroundSize: 'cover',
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    boxShadow: isDarkMode
                      ? `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`
                      : `0 10px 40px ${alpha(theme.palette.common.black, 0.05)}`,
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'center', md: 'flex-start' },
                    textAlign: { xs: 'center', md: 'left' },
                    mb: 4
                  }}>
                    <Box sx={{ 
                      mr: { md: 4 }, 
                      mb: { xs: 3, md: 0 },
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <Box 
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDarkMode
                            ? `linear-gradient(135deg, ${alpha(primaryColor, 0.3)}, ${alpha(secondaryColor, 0.15)})`
                            : `linear-gradient(135deg, ${alpha(primaryColor, 0.15)}, ${alpha(secondaryColor, 0.05)})`,
                          boxShadow: `0 8px 32px ${alpha(primaryColor, 0.25)}`,
                          border: `1px solid ${alpha(primaryColor, 0.2)}`,
                        }}
                      >
                        <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 40, color: primaryColor }} />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          mb: 1, 
                          fontWeight: 700,
                          color: "primary.main",
                          background: headerGradient,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Train AI with Your Data
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 800 }}>
                        Enhance your AI's capabilities by providing it with relevant data. Connect your email 
                        accounts, upload documents, or manually input information to create a personalized AI 
                        assistant that understands your communication style and preferences.
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: { xs: 'center', md: 'flex-start' }
                      }}>
                        <Chip 
                          label="Gmail" 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          label="Outlook" 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          label="CSV Files" 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          label="PDF Documents" 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          label="Manual Input" 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ ml: { md: 'auto' }, mt: { xs: 3, md: 0 } }}>
                      <Tooltip title="Learn more about data training">
                        <IconButton
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    mb: 3
                  }}>
                    {/* <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        px: 3,
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                        background: isDarkMode
                          ? `linear-gradient(90deg, ${primaryColor}, ${darken(primaryColor, 0.2)})`
                          : `linear-gradient(90deg, ${primaryColor}, ${lighten(primaryColor, 0.1)})`
                      }}
                    >
                      Add Data Source
                    </Button> */}
                  </Box>
                  
                  {/* Data Tabs Component */}
                  <Box sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    backgroundColor: alpha(theme.palette.background.paper, isDarkMode ? 0.6 : 0.8)
                  }}>
                  </Box>
                </Paper>
              </Box>
              
               <DataTabs />
              
              {/* Data Quality Tips Section */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{ mt: 4 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    backgroundColor: isDarkMode
                      ? alpha(theme.palette.info.dark, 0.1)
                      : alpha(theme.palette.info.light, 0.1),
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <InfoOutlinedIcon color="info" />
                    Tips for Optimal AI Training
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {[
                      "Provide diverse data sources for better understanding",
                      "Include both positive and negative communication examples",
                      "Upload documents that contain domain-specific terminology",
                      "Regularly update your data to improve AI accuracy",
                      "Remove sensitive or confidential information before uploading"
                    ].map((tip, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                            color: theme.palette.info.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            flexShrink: 0,
                            fontSize: '0.85rem'
                          }}>
                            {index + 1}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {tip}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link 
                      href="#" 
                      underline="hover"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 500
                      }}
                    >
                      Learn more about data quality guidelines
                    </Link>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Container>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
};

export default DataManager;