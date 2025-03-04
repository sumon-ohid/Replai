import * as React from 'react';
import { 
  Card, CardContent, Button, Typography, Box, 
  CircularProgress, useMediaQuery, alpha 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { motion } from 'framer-motion';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function HighlightedCard() {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

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

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      sx={{
        height: '100%',
        width: isSmallScreen ? '100%' : 360,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`
          : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
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
            mb: 2.5
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
            height: '2.5rem',
            overflow: 'hidden'
          }}
        >
          Create your intelligent email assistant powered by AI
        </Typography>
        
        <Button
          variant="contained"
          startIcon={loading ? null : <GoogleIcon />}
          endIcon={loading ? null : <ChevronRightRoundedIcon />}
          fullWidth
          onClick={handleCreateBot}
          disabled={loading}
          disableElevation
          sx={{
            borderRadius: 2,
            py: 1.2,
            textTransform: 'none',
            fontSize: '1rem',
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
            "Connect Gmail"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}