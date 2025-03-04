import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import MainGrid from "./components/MainGrid";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import { Typography } from "@mui/material";
import GetConnectedEmails from "./components/GetConnectedEmails";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import DataTabs from "./components/DataTabs";
import { useTheme } from '@mui/material/styles';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

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
          <Box
            sx={{
              mx: 3,
              mt: 3,
              background: `radial-gradient(circle, ${alpha(
                primaryColor,
                0.1
              )} 20%, transparent 70%)`,
              p: 3,
              borderRadius: 1,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h4" sx={{ mb: 1, color: primaryColor }}>
              Train AI with your data
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
              To train AI models, you need to provide data. You can upload your
              data or connect your data sources to the platform.
            </Typography>
          </Box>
          <DataTabs />
        </Box>
      </Box>
    </AppTheme>
  );
}
