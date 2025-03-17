import * as React from 'react';
import { Paper, Typography, Box, alpha, useTheme, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
  delay?: number;
  percentage?: number;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  isLoading = false, 
  delay = 0,
  percentage
}: StatCardProps) {
  const theme = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: delay
      }
    }
  };

  return (
    <Paper
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      elevation={1}
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
          borderRadius: 2,
          backgroundColor: alpha(color, 0.12),
          color: color,
          mr: 2
        }}
      >
        {icon}
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        
        {isLoading ? (
          <Skeleton variant="text" width={80} height={28} />
        ) : (
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {value}
            
            {percentage !== undefined && (
              <Box
                component="span"
                sx={{
                  ml: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main
                }}
              >
                {percentage}%
              </Box>
            )}
          </Typography>
        )}
      </Box>
      
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -15,
          right: -15,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: alpha(color, 0.04),
          zIndex: 0
        }}
      />
    </Paper>
  );
}