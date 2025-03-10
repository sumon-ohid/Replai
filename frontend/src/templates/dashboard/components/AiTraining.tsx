import * as React from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  useMediaQuery,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Components
import { DataSourceSelector } from "./training/DataSourceSelector";
import { DataPreview } from "./training/DataPreview";
import { TrainingProgress } from "./training/TrainingProgress";
import { TrainingComplete } from "./training/TrainingComplete";
import { DataImportTabs } from "./training/DataImportTabs";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// Custom styled components
const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  "& .MuiStepLabel-label": {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: alpha(theme.palette.text.primary, 0.8),
    "&.Mui-active": {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    "&.Mui-completed": {
      fontWeight: 500,
      color: theme.palette.success.main,
    },
  },
  "& .MuiStepIcon-root": {
    color: alpha(theme.palette.action.disabled, 0.6),
    "&.Mui-active": {
      color: theme.palette.primary.main,
      "& .MuiStepIcon-text": {
        fill: theme.palette.primary.contrastText,
        fontWeight: 700,
      },
    },
    "&.Mui-completed": {
      color: theme.palette.success.main,
    },
  },
}));

// Step content wrapper component
const StepContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  backgroundColor: alpha(
    theme.palette.background.paper,
    theme.palette.mode === "dark" ? 0.4 : 0.7
  ),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
}));

// Training steps
const steps = [
  "Select Data Sources",
  "Preview & Configure",
  "Train Model",
  "Review Results",
];

export default function AITraining() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = React.useState(0);
  const [trainingProgress, setTrainingProgress] = React.useState(0);
  const [trainingComplete, setTrainingComplete] = React.useState(false);
  const [trainingError, setTrainingError] = React.useState("");
  const [selectedSources, setSelectedSources] = React.useState<string[]>([]);
  const [dataPreviewReady, setDataPreviewReady] = React.useState(false);
  
  // Training statistics
  const [trainingStats, setTrainingStats] = React.useState({
    dataSize: 0,
    duration: 0,
    accuracy: 0
  });

  // Pre-training configurations
  const [trainingConfig, setTrainingConfig] = React.useState({
    learningRate: 0.001,
    epochs: 5,
    batchSize: 32,
  });

  // Handle next step in the training process
  const handleNext = () => {
    if (activeStep === 2) {
      // Start training
      handleStartTraining();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle back navigation in stepper
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle restart from beginning
  const handleReset = () => {
    setActiveStep(0);
    setTrainingProgress(0);
    setTrainingComplete(false);
    setTrainingError("");
    setSelectedSources([]);
    setDataPreviewReady(false);
  };

  // Source selection handler
  const handleSourceSelection = (sources: string[]) => {
    setSelectedSources(sources);
  };

  // Data preview readiness handler
  const handleDataPreviewReady = () => {
    setDataPreviewReady(true);
  };

  // Start model training
  const handleStartTraining = async () => {
    try {
      setTrainingError("");
      setTrainingProgress(0);

      // Simulate training progress
      const simulateTraining = () => {
        const interval = setInterval(() => {
          setTrainingProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(interval);
              
              // Set mock training stats
              setTrainingStats({
                dataSize: 2048576 + Math.floor(Math.random() * 1000000), // 2MB + random bytes
                duration: 60 + Math.floor(Math.random() * 120), // 1-3 minutes
                accuracy: 92.5 + (Math.random() * 5.5), // 92.5-98% accuracy
              });
              
              setTrainingComplete(true);
              return 100;
            }
            return Math.min(prevProgress + Math.random() * 5, 100);
          });
        }, 400);
      };

      simulateTraining();
    } catch (error) {
      console.error("Error during training:", error);
      setTrainingError("There was an error during the training process. Please try again.");
    }
  };

  // Training configuration handler
  const handleConfigChange = (config: any) => {
    setTrainingConfig(config);
    setTrainingProgress(1);
    setTrainingComplete(false);
  };

  // Handler for starting to use the trained model
  const handleStartUsingModel = () => {
    console.log("Start using trained model");
    // Navigate to chat or implementation page
  };

  // Render step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <DataSourceSelector
            onSourceSelection={handleSourceSelection}
            selectedSources={selectedSources}
          />
        );
      case 1:
        return (
          <DataImportTabs 
            selectedSources={selectedSources}
            onDataPreviewReady={handleDataPreviewReady} 
          />
        );
      case 2:
        return (
          <DataPreview 
            selectedSources={selectedSources}
            config={trainingConfig}
            onConfigChange={handleConfigChange}
          />
        );
      case 3:
        return trainingComplete ? (
          <TrainingComplete 
            dataSize={trainingStats.dataSize}
            duration={trainingStats.duration}
            accuracy={trainingStats.accuracy}
            onReset={handleReset}
            onStart={handleStartUsingModel}
          />
        ) : (
          <TrainingProgress 
            progress={trainingProgress} 
            error={trainingError} 
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mb: 6 }}>
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ width: "100%" }}
      >
        {/* Header Section */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            mb: 5,
            display: "flex",
            flexDirection: isXsScreen ? "column" : "row",
            alignItems: isXsScreen ? "center" : "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: isXsScreen ? "center" : "flex-start",
              textAlign: isXsScreen ? "center" : "left",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
                    theme.palette.primary.dark,
                    0.8
                  )})`,
                  boxShadow: `0 4px 14px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                }}
              >
                <AutoAwesomeIcon />
              </Avatar>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Model Training
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 700, mb: 2 }}
            >
              Train your AI model with custom data to improve response accuracy and
              personalization. Choose from multiple data sources and configure training
              parameters to achieve optimal results.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
                justifyContent: isXsScreen ? "center" : "flex-start",
              }}
            >
              <Chip
                icon={<DataObjectIcon fontSize="small" />}
                label="Text Data"
                variant="outlined"
                color="primary"
                size="small"
              />
              <Chip
                icon={<PsychologyAltIcon fontSize="small" />}
                label="PDF Documents"
                variant="outlined"
                color="primary"
                size="small"
              />
              <Chip
                icon={<SmartToyIcon fontSize="small" />}
                label="Website Crawling"
                variant="outlined"
                color="primary"
                size="small"
              />
            </Box>
          </Box>

          <Box
            sx={{
              mt: isXsScreen ? 3 : 0,
              display: "flex",
              gap: 1,
            }}
          >
            <Tooltip title="Training guide">
              <IconButton
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Advanced settings">
              <IconButton
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <SettingsSuggestIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Training Process Card */}
        <Card
          elevation={0}
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            overflow: "visible",
            mb: 4,
            backgroundImage: isDark
              ? `radial-gradient(circle at top right, ${alpha(
                  theme.palette.primary.dark,
                  0.15
                )}, transparent 70%)`
              : `radial-gradient(circle at top right, ${alpha(
                  theme.palette.primary.light,
                  0.1
                )}, transparent 70%)`,
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              alternativeLabel={isSmallScreen}
              orientation={isSmallScreen ? "horizontal" : "vertical"}
              sx={{
                ".MuiStepConnector-line": {
                  minHeight: isSmallScreen ? 0 : 40,
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StyledStepLabel>{label}</StyledStepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <StepContentWrapper>
              {getStepContent(activeStep)}
            </StepContentWrapper>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Box sx={{ order: { xs: 2, sm: 1 } }}>
                {activeStep === steps.length - 1 && trainingComplete ? (
                  <Button
                    variant="outlined"
                    startIcon={<ReplayIcon />}
                    onClick={handleReset}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 3,
                    }}
                  >
                    Train New Model
                  </Button>
                ) : (
                  activeStep !== 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        px: 3,
                      }}
                    >
                      Back
                    </Button>
                  )
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  order: { xs: 1, sm: 2 },
                }}
              >
                {activeStep === steps.length - 1 ? (
                  trainingComplete && (
                    <Button
                      variant="contained"
                      endIcon={<RocketLaunchIcon />}
                      onClick={handleStartUsingModel}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        px: 3,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 4px 12px ${alpha(
                          theme.palette.primary.main,
                          0.4
                        )}`,
                      }}
                    >
                      Deploy Model
                    </Button>
                  )
                ) : (
                  <Button
                    variant="contained"
                    endIcon={
                      activeStep === 2 ? <AutoFixHighIcon /> : <CheckCircleIcon />
                    }
                    onClick={handleNext}
                    disabled={
                      (activeStep === 0 && selectedSources.length === 0) ||
                      (activeStep === 1 && !dataPreviewReady)
                    }
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      px: 3,
                      background:
                        activeStep === 2
                          ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          : undefined,
                      boxShadow:
                        activeStep === 2
                          ? `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.4
                            )}`
                          : undefined,
                    }}
                  >
                    {activeStep === 2
                      ? "Start Training"
                      : activeStep === steps.length - 1
                      ? "Finish"
                      : "Continue"}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Training Tips Card */}
        <Card
          elevation={0}
          component={motion.div}
          variants={itemVariants}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SmartToyIcon color="info" fontSize="small" />
              AI Training Best Practices
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    1
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Quality Over Quantity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Focus on high-quality, relevant data rather than large volumes of generic content.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    2
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Diverse Examples
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Include varied communication styles and scenarios in your training data.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    3
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Regular Retraining
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your model periodically with new data to maintain relevance and accuracy.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}