import * as React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Button,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MemoryIcon from "@mui/icons-material/Memory";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TuneIcon from "@mui/icons-material/Tune";
import BiotechIcon from "@mui/icons-material/Biotech";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Training phases for the progress display
const trainingPhases = [
  { 
    name: "Preprocessing", 
    description: "Cleaning and preparing data for training",
    icon: <TuneIcon />,
    thresholdPercentage: 15
  },
  { 
    name: "Data Analysis", 
    description: "Identifying patterns and key elements",
    icon: <SwapVertIcon />,
    thresholdPercentage: 30 
  },
  { 
    name: "Model Training", 
    description: "Training the neural network on your data",
    icon: <MemoryIcon />,
    thresholdPercentage: 70
  },
  { 
    name: "Optimization", 
    description: "Fine-tuning model parameters for improved performance",
    icon: <BiotechIcon />,
    thresholdPercentage: 85 
  },
  { 
    name: "Validation", 
    description: "Testing model accuracy with validation data",
    icon: <AutoFixHighIcon />,
    thresholdPercentage: 95 
  }
];

interface TrainingProgressProps {
  progress: number;
  error: string;
}

export function TrainingProgress({ progress, error }: TrainingProgressProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentPhase, setCurrentPhase] = React.useState(0);

  // Update the current phase based on the progress
  React.useEffect(() => {
    for (let i = trainingPhases.length - 1; i >= 0; i--) {
      if (progress >= trainingPhases[i].thresholdPercentage) {
        setCurrentPhase(i);
        break;
      }
    }
  }, [progress]);

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box component={motion.div} variants={itemVariants}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          AI Model Training in Progress
        </Typography>
      </Box>

      {/* Error alert */}
      {error && (
        <Box component={motion.div} variants={itemVariants} sx={{ mb: 3 }}>
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Progress visual */}
      <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
        <Box sx={{ 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RocketLaunchIcon color="primary" />
            Training Progress
          </Typography>
          <Chip 
            label={`${Math.round(progress)}%`}
            color="primary"
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.875rem',
              height: 32
            }}
          />
        </Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            mb: 2
          }}
        >
          <Box sx={{ position: 'relative', height: 10, mb: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: '100%', 
                borderRadius: 5,
                backgroundColor: alpha(theme.palette.divider, 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}
            />
          </Box>

          <Grid container spacing={2}>
            {trainingPhases.map((phase, index) => (
              <Grid item xs={6} sm={2.4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${
                      currentPhase === index
                        ? theme.palette.primary.main
                        : currentPhase > index
                          ? theme.palette.success.main
                          : alpha(theme.palette.divider, 0.7)
                    }`,
                    backgroundColor: 
                      currentPhase === index
                        ? alpha(theme.palette.primary.main, 0.1)
                        : currentPhase > index
                          ? alpha(theme.palette.success.main, 0.1)
                          : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {phase.icon}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {phase.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
          
      {/* Random strings while waiting for the process */}
      {progress < 100 && (
        <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
            This won't take long. Just a few more seconds...
            </Typography>
          </Stack>
        </Box>
      )}
      
    </Box>
  );
}
