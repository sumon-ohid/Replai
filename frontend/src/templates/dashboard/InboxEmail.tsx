import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

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
import EmailClient from "./components/mailbox/EmailClient";

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            > 
            {/* <CustomizedDataGrid /> */}
            <EmailClient />
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
