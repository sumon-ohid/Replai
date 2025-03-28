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
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import EmailIcon from "@mui/icons-material/Email";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
import axios from "axios";

// Main component
export default function InboxEmail(props: { disableCustomTheme?: boolean }) {
  const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const theme = useTheme();
  
  // Track if user has connected email accounts
  const [hasConnectedEmail, setHasConnectedEmail] = React.useState(false);
  const navigate = useNavigate();
  
       // Check if user has connected email accounts
    interface ConnectedEmail {
      id: string;
      email: string;
      provider: string;
      name: string;
      status: string;
      syncEnabled: boolean;
      lastSync?: Date;
      aiEnabled: boolean;
    }
    
    React.useEffect(() => {
      const checkEmailConnections = async () => {
        try {
          if (!token) {
            console.log("No authentication token found");
            setHasConnectedEmail(false);
            return;
          }
    
          const response = await axios.get(`${apiBaseUrl}/api/emails/auth/connected`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          // The response is directly an array of connected emails
          const connectedEmails = response.data as ConnectedEmail[];
          console.log("Connected emails:", connectedEmails);
    
          // Check if there are any connected emails with "active" status
          if (connectedEmails && connectedEmails.length > 0) {
            const activeEmails = connectedEmails.filter(
              emailAccount => emailAccount.status === "active"
            );
            
            if (activeEmails.length > 0) {
              console.log("Active connected emails:", activeEmails);
              setHasConnectedEmail(true);
            } else {
              console.log("No active email connections found.");
              setHasConnectedEmail(false);
            }
          } else {
            console.log("No connected emails found.");
            setHasConnectedEmail(false);
          }
        } catch (error) {
          console.error('Failed to fetch email connections:', error);
          setHasConnectedEmail(false);
        }
      };
      
      checkEmailConnections();
    }, [apiBaseUrl, token]);
  
  // Handler to navigate to email manager
  const handleConnectEmail = () => {
    navigate('/email-manager');
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
            {hasConnectedEmail ? (
              <EmailClient />
            ) : (
              <Paper 
                elevation={0}
                sx={{
                  p: 5, 
                  width: '100%', 
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  py: 8
                }}
              >
                <EmailIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: 'primary.main',
                    mb: 3,
                    opacity: 0.8
                  }} 
                />
                <Typography variant="h5" gutterBottom fontWeight="medium">
                  No Email Accounts Connected
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ maxWidth: 450, mb: 4 }}
                >
                  Connect your email account to start using Replai's AI-powered email automation.
                  Train the AI with your communication style and choose between automatic replies or draft mode.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddCircleIcon />}
                  size="large"
                  onClick={handleConnectEmail}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Connect Email Account
                </Button>
              </Paper>
            )}
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}