import React, { useState, useEffect, useRef, JSX } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PauseIcon from "@mui/icons-material/Pause";
import PersonIcon from "@mui/icons-material/Person";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";

// Section container with gradient background
const SectionWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(12, 0),
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
          theme.palette.primary.dark,
          0.15
        )} 50%, ${alpha("#000", 0)} 100%)`
      : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
          theme.palette.primary.light,
          0.12
        )} 50%, ${alpha("#fff", 0)} 100%)`,
  overflow: "hidden",
  color: theme.palette.common.white,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
            theme.palette.primary.dark,
            0.15
          )} 50%, ${alpha("#000", 0)} 100%)`
        : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
            theme.palette.primary.light,
            0.12
          )} 50%, ${alpha("#fff", 0)} 100%)`,
  },
}));

// Glow background effects
const GlowEffect = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  filter: "blur(100px)",
  opacity: 0.15,
  zIndex: 0,
}));

// Workflow container
const WorkflowContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: theme.spacing(8),
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    marginTop: theme.spacing(6),
  },
}));

// Step container
const StepContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(8),
  zIndex: 5,
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    marginBottom: theme.spacing(6),
  },
}));

// Connection line between steps
const ConnectionLine = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  height: "100px",
  width: "3px",
  background:
    "linear-gradient(to bottom, rgba(0, 97, 254, 0.7), rgba(0, 30, 226, 0.7))",
  bottom: "-100px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  [theme.breakpoints.down("md")]: {
    height: "50px",
    bottom: "-50px",
  },
}));

// Icon wrapper
const IconWrapper = styled(motion.div)(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  position: "relative",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  "& svg": {
    fontSize: "36px",
    color: theme.palette.common.white,
  },
  [theme.breakpoints.down("md")]: {
    width: "70px",
    height: "70px",
    "& svg": {
      fontSize: "30px",
    },
  },
}));

// Step card
const StepCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: alpha(
    theme.palette.background.paper,
    theme.palette.mode === "dark" ? 0.8 : 0.9
  ),
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 15px 35px -10px ${alpha(theme.palette.primary.main, 0.3)}`
        : "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    "& .feature-icon": {
      transform: "scale(1.1) rotate(5deg)",
    },
  },

  backdropFilter: "blur(10px)",
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
  width: "380px",
  position: "relative",
  border: "1px solid rgba(0, 68, 255, 0.52)",
  transition: "all 0.3s ease",
  [theme.breakpoints.down("md")]: {
    width: "100%",
    padding: theme.spacing(3),
  },
}));

// Flowing particle container
const EmailParticleContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  zIndex: 1,
  pointerEvents: "none",
  overflow: "hidden",
}));

// Email particle
const EmailParticle = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  width: "20px",
  height: "14px",
  borderRadius: "3px",
  zIndex: 1,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
}));

// Control bar
const ControlBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(6),
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    // flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

// Glowing title
const GlowingTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  position: "relative",
  display: "inline-block",
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
      : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "inherit",
    WebkitBackgroundClip: "text",
    filter: "blur(20px)",
    opacity: 0.3,
    zIndex: -1,
  },
}));

// Property row
const PropertyRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1.5),
  "& .property-name": {
    minWidth: "100px",
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  "& .property-value": {
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.875rem",
  },
}));

// Message preview
const MessagePreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: "8px",
  background: "background.paper",
  marginTop: theme.spacing(2),
  border: "1px solid rgba(87, 87, 87, 0.35)",
  fontSize: "0.875rem",
  color: "text.secondary",
}));

// "Let's see" button
const DemoButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
  color: "#fff",
  borderRadius: "8px",
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: 600,
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  "&:hover": {
    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
    boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
    transform: "translateY(-2px)",
  },
}));

// Control button
const ControlButton = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.18)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.1)",
  },
}));

export default function WorkflowSection() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [emailParticles, setEmailParticles] = useState<EmailParticle[]>([]);
  const maxParticles = 7;

  // Step data
  const steps = [
    {
      title: "Email Capture",
      icon: <EmailIcon />,
      iconBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
      description:
        "Connect your email accounts from Gmail, Outlook, or any provider. Our system securely imports your emails for processing.",
      details: [
        { name: "Source", value: "Multiple Email Providers" },
        { name: "Security", value: "OAuth 2.0 Authentication" },
        { name: "Sync", value: "Real-time Updates" },
      ],
      preview:
        "Incoming message from customer@example.com: 'Hello, I'm interested in your product. Can you tell me more about pricing?'",
    },
    {
      title: "AI Processing",
      icon: <SmartToyIcon />,
      iconBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      description:
        "Our advanced AI analyzes the content, intent, and sentiment of each email to understand the context and required action.",
      details: [
        { name: "Analysis", value: "NLP & Intent Detection" },
        { name: "Context", value: "Historical Conversation" },
        { name: "Speed", value: "< 2 seconds per email" },
      ],
      preview:
        "ANALYSIS RESULTS\nIntent: Product Inquiry\nSentiment: Positive\nPriority: Medium\nResponse Type: Information Delivery",
    },
    {
      title: "Response Generation",
      icon: <TipsAndUpdatesIcon />,
      iconBg: "linear-gradient(135deg, #ec4899, #d946ef)",
      description:
        "Based on the analysis, our AI crafts personalized responses that match your tone and provide accurate information.",
      details: [
        { name: "Style", value: "Matches Your Voice" },
        { name: "Content", value: "Contextually Accurate" },
        { name: "Format", value: "Professional & Personalized" },
      ],
      preview:
        "DRAFT RESPONSE\n'Hello, Thank you for your interest! Our pricing starts at $29/month for the basic plan, which includes all core features. Would you like me to send you our detailed pricing guide?'",
    },
    {
      title: "Automated Reply",
      icon: <SendIcon />,
      iconBg: "linear-gradient(135deg, #10b981, #059669)",
      description:
        "Responses are automatically sent or queued for your approval, depending on your preferences and confidence settings.",
      details: [
        { name: "Delivery", value: "Instant or Scheduled" },
        { name: "Control", value: "Approval Workflow" },
        { name: "Tracking", value: "Open & Response Analytics" },
      ],
      preview:
        "EMAIL SENT ✓\nDelivered to: customer@example.com\nResponse time: 3 minutes\nScheduled follow-up: In 3 days if no reply",
    },
    {
      title: "Customer Experience",
      icon: <PersonIcon />,
      iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      description:
        "Customers receive timely, helpful responses that address their needs - creating a seamless experience without manual effort.",
      details: [
        { name: "Experience", value: "Seamless Communication" },
        { name: "Speed", value: "24/7 Availability" },
        { name: "Satisfaction", value: "Increased Customer Retention" },
      ],
      preview:
        "CUSTOMER FEEDBACK\n'Wow, that was fast! Thank you for the information. The pricing works for me. Can we schedule a demo this week?'",
    },
  ];

  // Play the animation automatically
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prevStep) => (prevStep + 1) % steps.length);
      }, 3000 / speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, steps.length]);

  // Generate email particles
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (emailParticles.length < maxParticles) {
          const newParticle = {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random() * 100,
            y: -20,
            color: ["#60a5fa", "#8b5cf6", "#ec4899", "#10b981"][
              Math.floor(Math.random() * 4)
            ],
            speed: 1 + Math.random() * 2,
            size: 8 + Math.random() * 12,
          };

          setEmailParticles((prev) => [...prev, newParticle]);

          // Remove particle after animation
          setTimeout(() => {
            setEmailParticles((prev) =>
              prev.filter((p) => p.id !== newParticle.id)
            );
          }, 10000);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, emailParticles.length]);

  // Handle step change
  interface Step {
    title: string;
    icon: JSX.Element;
    iconBg: string;
    description: string;
    details: { name: string; value: string }[];
    preview: string;
  }

  interface EmailParticle {
    id: string;
    x: number;
    y: number;
    color: string;
    speed: number;
    size: number;
  }

  const handleStepChange = (step: number): void => {
    setActiveStep(step);
    // Pause animation when manually changing steps
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset animation
  const resetAnimation = () => {
    setActiveStep(0);
    setIsPlaying(false);
  };

  // Change speed
  const changeSpeed = () => {
    setSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const theme = useTheme();

  return (
    <SectionWrapper id="workflow">
      {/* Background effects */}
      <GlowEffect
        sx={{
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.15
                )} 50%, ${alpha("#000", 0)} 100%)`
              : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                  theme.palette.primary.light,
                  0.12
                )} 50%, ${alpha("#fff", 0)} 100%)`,
          top: "10%",
          left: "15%",
        }}
      />
      <GlowEffect
        sx={{
          background: "#8b5cf6",
          bottom: "20%",
          right: "10%",
        }}
      />

      {/* Email particles animation */}
      <EmailParticleContainer>
        <AnimatePresence>
          {emailParticles.map((particle) => (
            <EmailParticle
              key={particle.id}
              initial={{
                x: `${particle.x}%`,
                y: "-5%",
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: `${particle.x + (Math.random() * 20 - 10)}%`,
                y: "105%",
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.7],
              }}
              exit={{ opacity: 0 }}
              transition={{
                y: { duration: 10 / particle.speed, ease: "linear" },
                opacity: {
                  times: [0, 0.1, 0.9, 1],
                  duration: 10 / particle.speed,
                },
                scale: {
                  times: [0, 0.1, 0.9, 1],
                  duration: 10 / particle.speed,
                },
              }}
              style={{
                backgroundColor: particle.color,
                width: `${particle.size}px`,
                height: `${particle.size * 0.7}px`,
              }}
            />
          ))}
        </AnimatePresence>
      </EmailParticleContainer>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* Header */}
        <Box textAlign="center" position="relative" zIndex={5}>
          <GlowingTitle variant={isMobile ? "h3" : "h1"}>
            How It Works
          </GlowingTitle>
          <Typography
            variant="h6"
            sx={{
              maxWidth: "700px",
              mx: "auto",
              mb: 2,
              color: "text.secondary",
              fontWeight: 300,
            }}
          >
            Our AI-powered workflow intelligently manages your emails from
            reception to response
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "600px",
              mx: "auto",
              mb: 4,
              color: "text.secondary",
            }}
          >
            See how we transform your email management with advanced AI
            technology
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              resetAnimation();
              setIsPlaying(true);
            }}
          >
            See it in action
          </Button>
        </Box>

        {/* Step indicators */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 6,
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStepChange(index)}
              sx={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                background:
                  activeStep === index
                    ? "linear-gradient(to right,rgb(0, 115, 255),rgb(0, 157, 242))"
                    : "rgba(0, 183, 255, 0.56)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 0 0 3px rgba(1, 83, 213, 0.3)",
                },
              }}
            />
          ))}
        </Box>

        {/* Main workflow display */}
        <WorkflowContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <StepContainer>
                <StepCard>
                  <IconWrapper
                    style={{
                      background: steps[activeStep].iconBg,
                      textAlign: "center",
                    }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 8px 16px rgba(0, 0, 0, 0.2)",
                        "0 12px 24px rgba(0, 0, 0, 0.3)",
                        "0 8px 16px rgba(0, 0, 0, 0.2)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  >
                    {steps[activeStep].icon}
                  </IconWrapper>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    {steps[activeStep].title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  >
                    {steps[activeStep].description}
                  </Typography>

                  <Box sx={{ mt: 4 }}>
                    {steps[activeStep].details.map((detail, idx) => (
                      <PropertyRow key={idx}>
                        <Typography
                          className="property-name"
                          color="text.secondary"
                        >
                          {detail.name}
                        </Typography>
                        <Typography
                          className="property-value"
                          color="text.secondary"
                        >
                          {detail.value}
                        </Typography>
                      </PropertyRow>
                    ))}
                  </Box>

                  <MessagePreview>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {steps[activeStep].preview}
                    </Typography>
                  </MessagePreview>
                </StepCard>

                {activeStep < steps.length - 1 && (
                  <ConnectionLine
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: isMobile ? 50 : 100, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                )}
              </StepContainer>
            </motion.div>
          </AnimatePresence>
        </WorkflowContainer>

        {/* Controls */}
        <ControlBar>
          <Tooltip title={isPlaying ? "Pause" : "Play"}>
            <ControlButton onClick={togglePlay} color="primary">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </ControlButton>
          </Tooltip>

          <Tooltip title="Restart">
            <ControlButton onClick={resetAnimation} color="primary">
              <RestartAltIcon />
            </ControlButton>
          </Tooltip>

          <Tooltip title={`Speed: ${speed}x`}>
            <Button
              variant="text"
              onClick={changeSpeed}
              size="small"
              sx={{
                color: 'text.secondary',
                fontSize: "0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                padding: "4px 8px",
              }}
            >
              {speed}x Speed
            </Button>
          </Tooltip>

          <Typography
            variant="caption"
            sx={{ ml: { xs: 0, sm: 2 }, color: "text.secondary" }}
          >
            {activeStep + 1} of {steps.length}
          </Typography>
        </ControlBar>
      </Container>
    </SectionWrapper>
  );
}
