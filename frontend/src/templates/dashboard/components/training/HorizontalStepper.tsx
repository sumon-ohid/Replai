import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  LinearProgress,
  Paper,
  Stack,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SettingsIcon from "@mui/icons-material/Settings";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { keyframes } from '@emotion/react';

// Define the pulse animation
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(var(--mui-palette-primary-mainChannel) / 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--mui-palette-primary-mainChannel) / 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--mui-palette-primary-mainChannel) / 0);
  }
`;

// Step icons mapping
const STEP_ICONS = [
  DataObjectIcon,
  SettingsIcon,
  ModelTrainingIcon,
  CelebrationIcon,
];

// Styled components for the stepper
const StepperContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  position: "relative",
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(4),
  overflowX: "auto",
  scrollbarWidth: "none", // Firefox
  "&::-webkit-scrollbar": {
    display: "none", // Chrome, Safari, Edge
  },
}));

const StepperTrack = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%", // Center vertically through the icons
  left: 50,
  right: 50,
  height: 4, // Slightly thicker for better visibility
  transform: "translateY(-50%)",
  backgroundColor: alpha(theme.palette.divider, 0.4),
  borderRadius: 8,
  zIndex: 0,
  overflow: "hidden", // Ensure the progress stays within track
  boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`, // Subtle inset shadow for depth
}));

const StepperProgress = styled(LinearProgress)(({ theme }) => ({
  position: "absolute",
  height: "100%",
  width: "100%",
  borderRadius: 8,
  backgroundColor: "transparent",
  "& .MuiLinearProgress-bar": {
    borderRadius: 8,
    // Gradient background that subtly shifts hues with theme colors
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.secondary.main} 50%, 
      ${theme.palette.success.main} 100%)`,
    backgroundSize: "200% 100%",
    animation: "gradientShift 5s ease infinite",
    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`, // Glow effect
    transition: "transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)", // Custom easing for smooth animation
  },
  // Add keyframes for subtle gradient animation
  "@keyframes gradientShift": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
}));

// Instead of passing the theme directly, create components that take specific props
const StepConnector = styled(Box)<{ completed: boolean }>(({ theme, completed }) => ({
  position: "absolute",
  top: "50%",
  right: "-50%",
  width: "100%",
  height: 4,
  transform: "translateY(-50%)",
  backgroundColor: completed
    ? "transparent" // Let the progress bar show through
    : alpha(theme.palette.divider, 0.4),
  zIndex: 0,
}));

// For StepDot, create a component that takes a statustype prop instead of status
const StepDot = styled(Box)<{ statustype: string }>(({ theme, statustype }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: statustype === "inactive" ? 12 : 16,
  height: statustype === "inactive" ? 12 : 16,
  borderRadius: "50%",
  transition: "all 0.3s ease",
  zIndex: 3,
  backgroundColor: theme.palette.background.paper,
  border:
    statustype === "completed"
      ? `2px solid ${theme.palette.success.main}`
      : statustype === "active"
      ? `2px solid ${theme.palette.primary.main}`
      : `2px solid ${alpha(theme.palette.divider, 0.6)}`,
  boxShadow:
    statustype !== "inactive"
      ? `0 0 0 4px ${alpha(
          statustype === "completed"
            ? theme.palette.success.main
            : theme.palette.primary.main,
          0.15
        )}`
      : "none",
}));

const StepItem = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  zIndex: 1,
  minWidth: 100,
  padding: theme.spacing(0, 1),
}));

const StepIconContainer = styled(motion.div)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: theme.spacing(1.5),
  position: "relative",
  zIndex: 2,
}));

const StepCircle = styled(Paper)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  zIndex: 2,
  "@keyframes pulse": {
    "0%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`
    },
    "70%": {
      boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}`
    },
    "100%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`
    }
  }
}));

const StepLabel = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.7),
  fontSize: "0.875rem",
  fontWeight: 500,
  textAlign: "center",
  marginTop: theme.spacing(1),
  width: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

// Animation variants
const circleVariants = {
  inactive: { scale: 0.9, opacity: 0.6 },
  active: {
    scale: 1,
    opacity: 1,
    boxShadow: "0 0 0 6px rgba(var(--mui-palette-primary-mainChannel) / 0.2)",
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  completed: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

interface HorizontalStepperProps {
  steps: string[];
  activeStep: number;
  completedSteps?: number[];
  className?: string;
}

export const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps,
  activeStep,
  completedSteps = [],
  className,
}) => {
  const theme = useTheme();
  const progress = (100 / (steps.length - 1)) * activeStep;

  // Calculate step status
  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return "completed";
    if (index === activeStep) return "active";
    return "inactive";
  };

  // Get color for step based on status
  const getStepColor = (index: number) => {
    if (completedSteps.includes(index)) return theme.palette.success.main;
    if (index === activeStep) return theme.palette.primary.main;
    return alpha(theme.palette.text.secondary, 0.4);
  };

  // Get background for step icon
  const getStepBackground = (index: number) => {
    if (completedSteps.includes(index)) {
      return `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`;
    }
    if (index === activeStep) {
      return `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
    }
    return theme.palette.background.paper;
  };

  // Icon color
  const getIconColor = (index: number) => {
    if (completedSteps.includes(index) || index === activeStep) {
      return theme.palette.common.white;
    }
    return alpha(theme.palette.text.primary, 0.5);
  };

  return (
    <StepperContainer className={className}>
      {/* Main Progress Track */}
      <StepperTrack>
        <StepperProgress variant="determinate" value={progress} />
      </StepperTrack>

      {/* Step Items */}
      {steps.map((label, index) => {
        const StepIcon = STEP_ICONS[index] || STEP_ICONS[0];
        const status = getStepStatus(index);
        const isCompleted = completedSteps.includes(index);
        const isActive = index === activeStep;

        return (
          <StepItem key={label}>
            {/* Step Dot (visible on top of the track) */}
            <StepDot statustype={status} />

            {/* Connect steps with lines (except last step) */}
            {index < steps.length - 1 && (
              <StepConnector completed={activeStep > index} />
            )}

            {/* Icon Container with Animation */}
            <StepIconContainer
              initial="inactive"
              animate={status}
              variants={circleVariants}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${index}-${status}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: 60, height: 60, position: "absolute" }}
                >
                  <StepCircle
                    elevation={status === "active" ? 4 : 0}
                    sx={{
                      background: getStepBackground(index),
                      border:
                        status === "inactive"
                          ? `1px solid ${alpha(theme.palette.divider, 0.5)}`
                          : "none",
                      // Add a subtle pulse animation for the active step
                      animation: isActive ? "pulse 2s infinite" : "none",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircleRoundedIcon
                        sx={{
                          color: theme.palette.common.white,
                          fontSize: 28,
                        }}
                      />
                    ) : (
                      <StepIcon
                        sx={{ color: getIconColor(index), fontSize: 28 }}
                      />
                    )}
                  </StepCircle>
                </motion.div>
              </AnimatePresence>
            </StepIconContainer>

            {/* Label Stack */}
            <Stack
              sx={{
                width: "100%",
                alignItems: "center",
                mt: 3, // Add more space for the step dots
              }}
            >
              <StepLabel
                sx={{
                  color:
                    status === "inactive"
                      ? alpha(theme.palette.text.primary, 0.5)
                      : theme.palette.text.primary,
                  fontWeight: status === "active" ? 600 : 500,
                }}
              >
                {label}
              </StepLabel>

              {/* Current Step Indicator */}
              {status === "active" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      •
                    </motion.span>
                    Current Step
                  </Typography>
                </motion.div>
              )}
            </Stack>
          </StepItem>
        );
      })}
    </StepperContainer>
  );
};

export default HorizontalStepper;