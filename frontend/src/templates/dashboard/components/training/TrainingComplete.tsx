import * as React from 'react';
import { Box, Typography, Paper, Button, Chip, Grid, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';

interface TrainingCompleteProps {
  dataSize: number; // Size of data processed in bytes
  duration: number; // Training duration in seconds
  accuracy: number; // Training accuracy percentage
  onReset: () => void;
  onStart: () => void;
}

export function TrainingComplete({ 
  dataSize = 2048576, // Default 2MB 
  duration = 78, // Default 1:18
  accuracy = 98.7, // Default 98.7%
  onReset,
  onStart
}: TrainingCompleteProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Sparkles animation
  const sparkleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      transition: {
        delay: i * 0.1,
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 2
      }
    })
  };
  
  // Format byte size to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format seconds to MM:SS format
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Metrics for the training summary
  const metrics = [
    { 
      label: 'Data Processed', 
      value: formatBytes(dataSize),
      icon: <ArticleIcon />,
      color: theme.palette.primary.main
    },
    { 
      label: 'Training Time', 
      value: formatDuration(duration),
      icon: <AutoGraphIcon />,
      color: theme.palette.secondary.main
    },
    { 
      label: 'Model Accuracy', 
      value: `${accuracy.toFixed(1)}%`,
      icon: <LightbulbIcon />,
      color: theme.palette.success.main
    }
  ];
  
  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ position: 'relative', overflow: 'hidden', mb: 4 }}
    >
      {/* Success animation background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: 'none'
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Box
            component={motion.div}
            key={i}
            custom={i}
            variants={sparkleVariants}
            initial="hidden"
            animate="visible"
            sx={{
              position: 'absolute',
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.primary.light} 0%, transparent 70%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          background: isDark 
            ? `linear-gradient(145deg, ${alpha(theme.palette.success.dark, 0.2)}, ${alpha(theme.palette.primary.dark, 0.1)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.primary.light, 0.1)})`,
          border: `1px solid ${alpha(theme.palette.success.main, isDark ? 0.3 : 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Success header */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          mb: 4,
          textAlign: { xs: 'center', sm: 'left' } 
        }}>
          <Box 
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              border: `2px solid ${alpha(theme.palette.success.main, 0.5)}`,
              color: theme.palette.success.main,
              mb: { xs: 2, sm: 0 },
              mr: { sm: 3 },
              boxShadow: `0 10px 30px ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700}
              color="success.main"
              sx={{ mb: 1 }}
            >
              Training Complete!
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              Your AI model has been successfully trained with your data and is ready to use.
              The model can now respond more accurately based on your specific content.
            </Typography>
          </Box>
          
          <Box 
            component={motion.div}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              delay: 0.5 
            }}
            sx={{ 
              ml: { sm: 'auto' }, 
              mt: { xs: 2, sm: 0 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EmojiEventsIcon 
              sx={{ 
                fontSize: 60, 
                color: theme.palette.warning.light,
                filter: 'drop-shadow(0 2px 8px rgba(255, 180, 0, 0.5))'
              }} 
            />
          </Box>
        </Box>
        
        {/* Training metrics */}
        <Grid 
          container 
          spacing={3} 
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
          sx={{ mb: 4 }}
        >
          {metrics.map((metric, index) => (
            <Grid 
              item 
              xs={12} 
              sm={4} 
              key={index}
              component={motion.div}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 20
                  }
                }
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha(metric.color, 0.2)}`,
                  backgroundColor: alpha(metric.color, 0.05),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: alpha(metric.color, 0.1),
                  color: metric.color,
                  mb: 2
                }}>
                  {metric.icon}
                </Box>
                
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {metric.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {metric.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {/* AI improvement highlights */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.4)
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
            AI Improvements
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              'Improved Response Quality',
              'Enhanced Domain Knowledge',
              'Better Style Matching',
              'Personalized Responses',
              'Context Awareness',
              'Specialized Terminology'
            ].map((improvement, index) => (
              <Chip 
                key={index}
                label={improvement}
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ 
                  px: 1,
                  borderRadius: 2,
                  '& .MuiChip-icon': {
                    color: theme.palette.success.main
                  }
                }}
              />
            ))}
          </Box>
        </Box>
        
        {/* Action buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={onStart}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Start Using Your AI
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Train Again
          </Button>
          
          <Button
            variant="text"
            size="large"
            startIcon={<DownloadIcon />}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Export Report
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}