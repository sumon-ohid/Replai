import * as React from 'react';
import { 
  Card, CardContent, Button, Typography, Box, 
  CircularProgress, useMediaQuery, alpha, Divider, Tab, Tabs
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { motion } from 'framer-motion';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function HighlightedCard() {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [emailProvider, setEmailProvider] = React.useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setEmailProvider(newValue);
  };

  const handleGmailAuth = async () => {
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
      console.error('Error connecting to Gmail:', error);
      setLoading(false);
    }
  };

  const handleOutlookAuth = async () => {
    setLoading(true);
    window.location.href = '/dashboard';
    return;
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      // Placeholder for outlook auth endpoint
      const response = await axios.get(`${apiBaseUrl}/api/emails/auth/microsoft`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const authUrl = (response.data as { authUrl: string }).authUrl;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      setLoading(false);
    }
  };

  const handleCustomEmail = () => {
    // Navigate to custom email setup page or open modal
    window.location.href = '/dashboard';
  };

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      sx={{
        height: '100%',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`
          : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        mt: { xs: 2, sm: 0 },
        mr: { xs: 0, sm: 1 },
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)}, transparent 70%)`,
          zIndex: 0
        }}
      />
      
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
              color: theme.palette.primary.main,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography
            component="h2"
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            AI Assistant
          </Typography>
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          Create your intelligent email assistant powered by AI. Connect your preferred email provider to get started.
        </Typography>

        <Tabs 
          value={emailProvider} 
          onChange={handleTabChange}
          centered
          sx={{
            mb: 2,
            '& .MuiTabs-flexContainer': {
              justifyContent: 'space-around',
            },
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }
          }}
        >
          <Tab 
            icon={<GoogleIcon />} 
            iconPosition="start" 
            label={isMediumScreen ? "" : "Gmail"} 
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<MicrosoftIcon />} 
            iconPosition="start" 
            label={isMediumScreen ? "" : "Outlook"} 
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<AlternateEmailIcon />} 
            iconPosition="start" 
            label={isMediumScreen ? "" : "Custom"} 
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
        
        <Box sx={{ display: emailProvider === 0 ? 'block' : 'none' }}>
          <Button
            variant="contained"
            startIcon={loading ? null : <GoogleIcon />}
            endIcon={loading ? null : <ChevronRightRoundedIcon />}
            fullWidth
            onClick={handleGmailAuth}
            disabled={loading}
            disableElevation
            sx={{
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              background: "#DB4437", // Gmail red
              '&:hover': {
                background: "#C53929",
              },
              boxShadow: `0 4px 12px ${alpha('#DB4437', 0.25)}`
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Connect Gmail"
            )}
          </Button>
        </Box>

        <Box sx={{ display: emailProvider === 1 ? 'block' : 'none' }}>
          <Button
            variant="contained"
            startIcon={loading ? null : <MicrosoftIcon />}
            endIcon={loading ? null : <ChevronRightRoundedIcon />}
            fullWidth
            onClick={handleOutlookAuth}
            disabled={loading}
            disableElevation
            sx={{
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              background: "#0078D4", // Microsoft blue
              '&:hover': {
                background: "#006CBE",
              },
              boxShadow: `0 4px 12px ${alpha('#0078D4', 0.25)}`
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "coming soon"
            )}
          </Button>
        </Box>

        <Box sx={{ display: emailProvider === 2 ? 'block' : 'none' }}>
          <Button
            variant="contained"
            startIcon={loading ? null : <AlternateEmailIcon />}
            endIcon={loading ? null : <ChevronRightRoundedIcon />}
            fullWidth
            onClick={handleCustomEmail}
            disabled={loading}
            disableElevation
            sx={{
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              background: theme.palette.primary.main,
              '&:hover': {
                background: theme.palette.primary.dark,
              },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "coming soon"
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />
        
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
          Connect your email to enable AI-powered email interactions
        </Typography>
      </CardContent>
    </Card>
  );
}