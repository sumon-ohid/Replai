import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, Button, Typography, Box, 
  useMediaQuery, alpha, Badge 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import { motion } from 'framer-motion';

export default function ConnectedEmails() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleViewConnectedEmails = () => {
    navigate('/email-manager');
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
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        background: isDarkMode
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`
          : `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.info.light, 0.05)})`,
        boxShadow: isDarkMode 
          ? `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`
          : `0 8px 24px ${alpha(theme.palette.info.main, 0.15)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -15,
          left: -15,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.15)}, transparent 70%)`,
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
          <Badge 
            badgeContent={2} 
            color="info"
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: -3
              }
            }}
          >
            <Box
              sx={{
                bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.1),
                color: theme.palette.info.main,
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <AttachEmailIcon sx={{ fontSize: 24 }} />
            </Box>
          </Badge>
          <Typography
            component="h2"
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Connected Emails
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3, height: '2.5rem', overflow: 'hidden' }}
        >
          View and manage all your connected email accounts in one place.
        </Typography>
        
        <Button
          variant="contained"
          color="info"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
          onClick={handleViewConnectedEmails}
          disableElevation
          sx={{
            borderRadius: 2,
            py: 1,
            px: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.25)}`,
            background: alpha(theme.palette.info.main, 0.9),
            '&:hover': {
              background: theme.palette.info.main,
            }
          }}
        >
          Manage Connections
        </Button>
      </CardContent>
    </Card>
  );
}