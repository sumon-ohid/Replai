import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";

// Icons
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import FilterListIcon from "@mui/icons-material/FilterListRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";
import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import InboxIcon from "@mui/icons-material/InboxRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import SendIcon from "@mui/icons-material/SendRounded";
import AttachmentIcon from "@mui/icons-material/AttachFileRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArchiveIcon from "@mui/icons-material/ArchiveRounded";
import LabelImportantIcon from "@mui/icons-material/LabelImportantRounded";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import SortIcon from "@mui/icons-material/SortRounded";
import AddIcon from "@mui/icons-material/AddRounded";

// Components
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
import Footer from "./components/Footer";
import CustomizedDataGrid from "./components/CustomizedDataGrid";

// Main component
export default function InboxEmail(props: { disableCustomTheme?: boolean }) {
  const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />

        {/* Main content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
            minHeight: "100vh",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: { xs: 2, sm: 3 },
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>

          {/* Main email interface */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              mb: 4,
              maxWidth: 1400,
              mx: "auto",
            }}
          >
            {/* Header with search */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "column" },
                alignItems: { xs: "stretch", md: "left" },
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
                backgroundColor: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                mt: 2,
              }}
            >
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Email Inbox
              </Typography>

              <Typography variant="body1" color="text.secondary" mt={-1}>
                View and manage your emails from different providers. Connect
                your accounts to get started.
              </Typography>
            </Box>
            <CustomizedDataGrid />
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
