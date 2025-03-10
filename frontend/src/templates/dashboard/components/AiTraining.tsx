import * as React from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import { 
  Tabs, Tab, Typography, Box, TextField, Button, Divider, 
  useMediaQuery, IconButton, Alert, CircularProgress, Paper,
  Chip, Card, CardContent, Fade, Backdrop, LinearProgress
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Styled components with enhanced visual design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    width: 3,
    borderRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  margin: 8,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  borderRadius: 12,
  transition: "all 0.2s",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 600,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  padding: "12px 20px",
  "& .MuiTab-iconWrapper": {
    marginBottom: 8,
  }
}));

export default function AiTraining() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [value, setValue] = React.useState(0);
  const [isTraining, setIsTraining] = React.useState(false);
  const [trainingCompleted, setTrainingCompleted] = React.useState(false);
  const [trainingProgress, setTrainingProgress] = React.useState(0);

  const handleTrainAI = async () => {
    setIsTraining(true);
    setTrainingCompleted(false);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newValue = prev + Math.random() * 15;
        return newValue > 100 ? 100 : newValue;
      });
    }, 300);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTrainingCompleted(true);
      clearInterval(progressInterval);
      setTrainingProgress(100);
    } catch (error) {
      console.error("Error training AI:", error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 4,
      }}
    >
        
      {/* AI Training Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          textAlign: "center",
          background: isDark 
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.6)}, ${alpha(theme.palette.background.default, 0.3)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.default, 0.5)})`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: isDark 
              ? alpha(theme.palette.primary.main, 0.15) 
              : alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            {isTraining ? (
              <CircularProgress 
                variant="determinate" 
                value={trainingProgress} 
                size={50}
                sx={{ color: theme.palette.primary.main }}
              />
            ) : trainingCompleted ? (
              <CheckCircleIcon sx={{ fontSize: 50, color: theme.palette.success.main }} />
            ) : (
              <SettingsSuggestIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
            )}
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {isTraining ? "Training in Progress" : trainingCompleted ? "Training Complete" : "AI Training Section"}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            After providing data, train your AI model to update data and improve its performance.
            This process may take a few moments to complete.
          </Typography>
          
          {trainingCompleted ? (
            <Alert 
              variant="outlined" 
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                maxWidth: 500,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                AI Model trained successfully with new data!
              </Typography>
            </Alert>
          ) : (
            <Alert 
              variant="outlined" 
              severity="info"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                maxWidth: 500,
                mx: 'auto',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2">
                AI Model is not trained yet. Please train the model to use it.
              </Typography>
            </Alert>
          )}
          
          <Divider sx={{ width: "100%", my: 3 }} />
          
          <Button
            variant="contained"
            color={trainingCompleted ? "success" : "primary"}
            startIcon={trainingCompleted ? <CheckCircleIcon /> : <SettingsSuggestIcon />}
            disabled={isTraining}
            onClick={handleTrainAI}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: trainingCompleted
                ? `0 4px 14px ${alpha(theme.palette.success.main, 0.3)}`
                : `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {isTraining ? `Training... ${Math.round(trainingProgress)}%` : trainingCompleted ? "Model Trained" : "Train AI Model"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}