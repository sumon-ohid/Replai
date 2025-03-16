import * as React from 'react';
import { Paper, Typography, Box, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';

interface EmailProviderCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  loading: boolean;
  animation: any;
}

export default function EmailProviderCard({
  title,
  description,
  icon,
  color,
  onClick,
  loading,
  animation
}: EmailProviderCardProps) {
  const theme = useTheme();

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Paper
        component={motion.div}
        variants={animation}
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          borderLeft: `4px solid ${color}`,
        }}
      >
        {/* Decorative gradient in the background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            borderRadius: '0 0 0 100%',
            opacity: 0.03,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
        
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.2 : 0.1),
            color: color,
            width: 60,
            height: 60,
            zIndex: 1,
          }}
        >
          {icon}
        </Box>
        
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600, zIndex: 1 }}>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, zIndex: 1 }}>
          {description}
        </Typography>
        
        <Box sx={{ mt: 'auto', zIndex: 1 }}>
          <LoadingButton
            variant="contained"
            fullWidth
            loading={loading}
            onClick={onClick}
            sx={{
              borderRadius: 2,
              bgcolor: color,
              '&:hover': {
                bgcolor: alpha(color, 0.8),
              },
              textTransform: 'none',
              boxShadow: theme.shadows[2],
            }}
          >
            Connect
          </LoadingButton>
        </Box>
      </Paper>
    </motion.div>
  );
}