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
import AiTraining from './components/AiTraining';

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
  const headerGradient = 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))';

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
          
            <AiTraining />
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
};

export default DataManager;