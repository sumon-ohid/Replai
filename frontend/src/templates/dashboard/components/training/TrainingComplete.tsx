import * as React from 'react';
import { Box, Typography, Paper, Button, Chip, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import LanguageIcon from '@mui/icons-material/Language';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

interface TrainingData {
  textData: string;
  fileData: string;
  webData: string;
  files: {
    name: string;
    charCount: number;
    pages: number;
    lastUpdated: Date;
  }[];
  urls: {
    url: string;
    title: string;
    charCount: number;
    lastUpdated: Date;
  }[];
}

interface TrainingCompleteProps {
  trainingData: TrainingData;
  onReset: () => void;
}

export function TrainingComplete({ trainingData, onReset }: TrainingCompleteProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Calculate total character counts
  const textCharCount = trainingData.textData?.length || 0;
  const fileCharCount = trainingData.fileData?.length || 0;
  const webCharCount = trainingData.webData?.length || 0;
  const totalCharCount = textCharCount + fileCharCount + webCharCount;
  
  // Format character count for display
  const formatCharCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M chars`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K chars`;
    return `${count} chars`;
  };

  // Determine training sources
  const hasText = textCharCount > 0;
  const hasFiles = fileCharCount > 0;
  const hasWeb = webCharCount > 0;
  
  // Calculate metrics for sources
  const sources = [
    ...(hasText ? [{
      type: 'Direct Text',
      charCount: textCharCount,
      icon: <TextSnippetIcon />,
      color: theme.palette.info.main
    }] : []),
    ...(hasFiles ? [{
      type: 'Documents',
      charCount: fileCharCount,
      count: trainingData.files?.length || 0,
      icon: <ArticleIcon />,
      color: theme.palette.primary.main
    }] : []),
    ...(hasWeb ? [{
      type: 'Websites',
      charCount: webCharCount,
      count: trainingData.urls?.length || 0,
      icon: <LanguageIcon />,
      color: theme.palette.secondary.main
    }] : [])
  ];
  
  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ mb: 4}}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: isDark 
            ? `linear-gradient(145deg, ${alpha(theme.palette.success.dark, 0.2)}, ${alpha(theme.palette.primary.dark, 0.1)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.success.light, 0.2)}, ${alpha(theme.palette.primary.light, 0.1)})`,
          border: `1px solid ${alpha(theme.palette.success.main, isDark ? 0.3 : 0.2)}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Success header */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <Box 
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260 }}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              border: `2px solid ${alpha(theme.palette.success.main, 0.5)}`,
              color: theme.palette.success.main,
              p: 1.5
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
          </Box>
          
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={700}
              color="success.main"
              sx={{ mb: 0.5 }}
            >
              Training Complete!
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {/* Your AI assistant has been trained with {formatCharCount(totalCharCount)} of your content */}
              Your AI assistant has been trained with your content.
            </Typography>
          </Box>
        </Box>
        
        {/* Training data sources */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
          }}
        >
          {sources.map((source, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(source.color, 0.1),
                border: `1px solid ${alpha(source.color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 1,
                minWidth: '180px'
              }}
            >
              <Box sx={{ 
                p: 1,
                borderRadius: '50%',
                backgroundColor: alpha(source.color, 0.2),
                color: source.color
              }}>
                {source.icon}
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {source.type}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCharCount(source.charCount)}
                  {source.count && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({source.count} {source.type === 'Documents' ? 'files' : 'sites'})
                  </Typography>}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        
        {/* AI improvement highlights */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.4)
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
          >
            <LightbulbIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
            Your AI has improved in these areas
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {[
              'Domain Knowledge',
              'Content Awareness',
              'Specialized Terminology',
              'Contextual Understanding'
            ].map((improvement, index) => (
              <Chip 
                key={index}
                label={improvement}
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 1.5,
                  '& .MuiChip-icon': {
                    color: theme.palette.success.main
                  },
                  px: 1,
                }}
              />
            ))}
          </Box>
        </Box>
        
        {/* Action button */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 3
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Train Again
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}