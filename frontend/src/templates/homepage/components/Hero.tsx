import React, { useEffect, lazy, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import useMediaQuery from "@mui/material/useMediaQuery";

// Lazily load non-critical icons
const AutoAwesomeIcon = lazy(() => import("@mui/icons-material/AutoAwesome"));
const CheckCircleIcon = lazy(() => import("@mui/icons-material/CheckCircle"));
const CalendarMonthIcon = lazy(
  () => import("@mui/icons-material/CalendarMonth")
);
const GoogleIcon = lazy(() => import("@mui/icons-material/Google"));
const EmailIcon = lazy(() => import("@mui/icons-material/Email"));
const ArrowForwardIcon = lazy(() => import("@mui/icons-material/ArrowForward"));
const WavingHandIcon = lazy(() => import("@mui/icons-material/WavingHand"));
const Badge = lazy(() => import("@mui/material/Badge"));

// Video modal component
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRef } from "react";

// Import assets
import heroBackground from "../../../assets/animations/hero-grid.svg"; // Create or download this asset

const AnimatedText: React.FC<{ text: React.ReactNode; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          delay,
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      });
    }
  }, [controls, inView, delay]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={controls}>
      {text}
    </motion.div>
  );
};

const GlowingButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "relative",
        zIndex: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle closest-side, ${alpha(
            theme.palette.primary.main,
            0.4
          )}, transparent)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.5s",
          transform: "scale(1.5)",
          zIndex: -1,
          borderRadius: "16px",
        },
      }}
    >
      <Button
        component={motion.button}
        variant="contained"
        size="large"
        color="primary"
        onClick={onClick}
        endIcon={<ArrowForwardIcon />}
        sx={{
          borderRadius: "12px",
          px: 4,
          py: 1.5,
          position: "relative",
          overflow: "hidden",
          textTransform: "none",
          fontSize: "1.1rem",
          fontWeight: 600,
          background: isHovered
            ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : theme.palette.primary.main,
          transition: "background 0.3s",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)",
            transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
            transition: "transform 0.6s",
          },
        }}
      >
        {children}
      </Button>
    </Box>
  );
};

// Animated email notification component
interface FloatingEmailProps {
  delay: number;
  position: { x: number; y: number };
  scale?: number;
}

const FloatingEmail: React.FC<FloatingEmailProps> = ({
  delay,
  position,
  scale = 1,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: position.x }}
      animate={{
        opacity: 1,
        y: position.y,
        x: position.x,
        transition: {
          delay,
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      }}
      style={{
        position: "absolute",
        zIndex: 2,
      }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[10],
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            display: "flex",
            alignItems: "center",
            gap: 1,
            transform: `scale(${scale})`,
          }}
        >
          <Badge color="error" variant="dot">
            <EmailIcon sx={{ color: theme.palette.primary.main }} />
          </Badge>
          <Typography variant="body2" fontWeight={500}>
            New email from client
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
};

// Animated AI response component
interface FloatingResponseProps {
  delay: number;
  position: { x: number; y: number };
  scale?: number;
}

const FloatingResponse: React.FC<FloatingResponseProps> = ({
  delay,
  position,
  scale = 1,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: position.x }}
      animate={{
        opacity: 1,
        y: position.y,
        x: position.x,
        transition: {
          delay,
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      }}
      style={{
        position: "absolute",
        zIndex: 2,
      }}
    >
      <motion.div
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[10],
            border: "1px solid",
            borderColor: alpha(theme.palette.success.main, 0.3),
            display: "flex",
            alignItems: "center",
            gap: 1,
            transform: `scale(${scale})`,
          }}
        >
          <AutoAwesomeIcon sx={{ color: theme.palette.success.main }} />
          <Typography variant="body2" fontWeight={500}>
            AI drafting response
          </Typography>
          <motion.div
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Typography variant="body2">...</Typography>
          </motion.div>
        </Box>
      </motion.div>
    </motion.div>
  );
};

// Animated success notification
interface FloatingSuccessProps {
  delay: number;
  position: { x: number; y: number };
  scale?: number;
}

const FloatingSuccess: React.FC<FloatingSuccessProps> = ({
  delay,
  position,
  scale = 1,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: position.x }}
      animate={{
        opacity: 1,
        y: position.y,
        x: position.x,
        transition: {
          delay,
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      }}
      style={{
        position: "absolute",
        zIndex: 2,
      }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: 1.5,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[10],
            border: "1px solid",
            borderColor: alpha(theme.palette.success.main, 0.3),
            display: "flex",
            alignItems: "center",
            gap: 1,
            transform: `scale(${scale})`,
          }}
        >
          <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
          <Typography variant="body2" fontWeight={500}>
            Response sent automatically
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default function Hero() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isRendered, setIsRendered] = React.useState(false);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const watchDemoButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    // Return focus to the button that opened the modal
    setTimeout(() => {
      if (watchDemoButtonRef.current) {
        watchDemoButtonRef.current.focus();
      }
    }, 0);
  };

  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  // Parallax effect on scroll
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Animated notification badge
  const [showBadge, setShowBadge] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBadge(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Animation for the hero image
  const heroImageControls = useAnimation();
  const [heroImageRef, heroImageInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (heroImageInView) {
      heroImageControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: 0.3 },
      });
    }
  }, [heroImageControls, heroImageInView]);

  return (
    <Box
      id="hero"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 10, sm: 12, md: 16 },
        pb: { xs: 8, sm: 10, md: 12 },
        backgroundImage:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.28) 0%, rgba(0, 0, 0, 0) 45%)"
            : "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%)",
        zIndex: 0,
      }}
    >
      {/* Background elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: theme.palette.mode === "dark" ? 0.2 : 0.05,
          zIndex: 0,
        }}
      />

      <Box
        component={motion.div}
        style={{ y }}
        sx={{
          position: "absolute",
          top: -100,
          left: "10%",
          width: "80%",
          height: 300,
          backgroundImage:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.1) 0%, rgba(0, 0, 0, 0) 60%)"
              : "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1, mt: isMobile ? 5 : 0 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 6, md: 4 }}
          alignItems="center"
        >
          {/* Left content: Text and CTA */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              zIndex: 3,
              position: "relative",
            }}
          >
            {/* Beta badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "20px",
                  mb: 4,
                  px: 2,
                  py: 0.5,
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                    ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  boxShadow: `0 2px 8px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                }}
              >
                <WavingHandIcon
                  sx={{ mr: 1, fontSize: "0.9rem", color: "primary.main" }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 500, letterSpacing: 1 }}
                >
                  NOW IN BETA TESTING
                </Typography>
              </Box>
            </motion.div>

            {/* Main headline */}
            <Typography
              variant="h2"
              component={motion.div}
              transition={{ duration: 0.3 }}
              sx={{
                fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Your
              <Typography
                component="span"
                variant="inherit"
                color="primary.main"
                sx={{
                  position: "relative",
                  ml: 1.5,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 4,
                    height: "0.2em",
                    background: `linear-gradient(90deg, 
                      transparent 0%, 
                      ${alpha(theme.palette.primary.main, 0.2)} 20%, 
                      ${alpha(theme.palette.primary.main, 0.2)} 80%, 
                      transparent 100%)`,
                    zIndex: -1,
                  },
                }}
              >
                Personal
              </Typography>
              <br />
              AI Email Assistant
            </Typography>

            {/* Subheadline with animated reveal */}
            <AnimatedText
              delay={0.3}
              text={
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 400,
                    mb: 4,
                    maxWidth: 500,
                    lineHeight: 1.5,
                    p: { xs: 1, sm: 0 },
                  }}
                >
                  Save hours every day with AI-powered email automation that
                  understands your style and responds like you would.
                </Typography>
              }
            />

            {/* CTA buttons section */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              sx={{ mt: 5 }}
            >
              <GlowingButton onClick={() => navigate("/signin")}>
                Get Started Free
              </GlowingButton>

              <Button
                ref={watchDemoButtonRef}
                variant="outlined"
                size="large"
                color="primary"
                onClick={handleOpenVideoModal}
                aria-haspopup="dialog"
                sx={{
                  borderRadius: "12px",
                  px: 3,
                  py: 1.5,
                  borderWidth: 2,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  height: isMobile ? 48 : 56,
                  width: isMobile ? "50%" : "auto",
                }}
              >
                Watch Demo
              </Button>
            </Stack>

            {/* Terms text */}
            <Typography
              variant="caption"
              color="text.secondary"
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              sx={{
                display: "block",
                mt: 2,
              }}
            >
              No credit card required. By signing up you agree to our&nbsp;
              <Link href="/privacy" underline="hover" sx={{ fontWeight: 500 }}>
                Terms & Conditions
              </Link>
            </Typography>

            {/* Video modal */}
            <Dialog
              open={videoModalOpen}
              onClose={handleCloseVideoModal}
              maxWidth="lg"
              aria-labelledby="video-modal-title"
              keepMounted={false}
              fullWidth
              sx={{ zIndex: theme.zIndex.modal + 1 }}
              container={document.body}
              BackdropProps={{
                sx: { backdropFilter: "blur(4px)" },
              }}
              PaperProps={{
                elevation: 24,
                sx: {
                  bgcolor: "background.paper",
                  backgroundImage:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))"
                      : "linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0))",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: theme.shadows[24],
                  width: "100%",
                },
              }}
            >
              <Box sx={{ position: "relative", bgcolor: "black" }}>
                <Typography
                  variant="h6"
                  id="video-modal-title"
                  sx={{ position: "absolute", left: -9999, width: 1 }}
                >
                  Replai Demo Video
                </Typography>
                <IconButton
                  aria-label="close video"
                  onClick={handleCloseVideoModal}
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    color: "white",
                    bgcolor: alpha(theme.palette.common.black, 0.5),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.black, 0.7),
                    },
                    zIndex: 2,
                  }}
                >
                  <CloseIcon />
                </IconButton>

                <DialogContent
                  sx={{
                    p: 0,
                    overflow: "hidden",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                    bgcolor: "black", // Ensure black background for videos
                  }}
                >
                  <Box
                    sx={{ position: "relative", pt: "56.25%", width: "100%" }}
                  >
                    {/* Direct video embed rather than iframe for better compatibility */}
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      src="https://www.youtube.com/embed/Ep3bE4bkTwA?autoplay=1&rel=0&modestbranding=1"
                      title="Replai Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </DialogContent>
              </Box>
            </Dialog>
          </Box>

          {/* Right content: Interactive mail UI mockup */}
          <Box
            ref={heroImageRef}
            component={motion.div}
            initial={{ opacity: 0, y: 40 }}
            animate={heroImageControls}
            sx={{
              width: { xs: "100%", md: "50%" },
              height: { xs: "350px", sm: "400px", md: "450px" },
              position: "relative",
            }}
          >
            {/* Main device mockup */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                // boxShadow: theme.shadows[20],
                // border: '1px solid',
                borderColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.1),
              }}
            >
              {/* Overlay gradient */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "30%",
                  background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
                  opacity: 0.8,
                }}
              />
            </Box>

            {/* Floating UI Elements - Only show on larger screens */}
            {
              <>
                {/* Fixed Floating Email component */}
                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: 10, md: 40 },
                    top: { xs: 30, md: 60 },
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.5,
                          bgcolor: "background.paper",
                          boxShadow: theme.shadows[10],
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transform: `scale(${isMobile ? 0.8 : 1})`,
                        }}
                      >
                        <Badge color="error" variant="dot">
                          <EmailIcon
                            sx={{ color: theme.palette.primary.main }}
                          />
                        </Badge>
                        <Typography variant="body2" fontWeight={500}>
                          New email from client
                        </Typography>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>

                {/* Fixed Floating Response component */}
                <Box
                  sx={{
                    position: "absolute",
                    left: isMobile ? 40 : 100,
                    top: isMobile ? 120 : 170,
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -12, 0],
                      }}
                      transition={{
                        duration: 5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.5,
                          bgcolor: "background.paper",
                          boxShadow: theme.shadows[10],
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transform: `scale(${isMobile ? 0.8 : 1})`,
                        }}
                      >
                        <AutoAwesomeIcon
                          sx={{ color: theme.palette.success.main }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          AI drafting response
                        </Typography>
                        <motion.div
                          animate={{
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        >
                          <Typography variant="body2">...</Typography>
                        </motion.div>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>

                {/* Fixed Floating Success component */}
                <Box
                  sx={{
                    position: "absolute",
                    left: isMobile ? -30 : -60,
                    top: isMobile ? 190 : 260,
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 1,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 4.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.5,
                          bgcolor: "background.paper",
                          boxShadow: theme.shadows[10],
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transform: `scale(${isMobile ? 0.8 : 1})`,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ color: theme.palette.success.main }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          Response sent automatically
                        </Typography>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>

                {/* Floating google calendar connect */}
                <Box
                  sx={{
                    position: "absolute",
                    right: isMobile ? 10 : 40,
                    top: isMobile ? 70 : 80,
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 1.5,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.5,
                          bgcolor: "background.paper",
                          boxShadow: theme.shadows[10],
                          border: "1px solid",
                          borderColor: alpha(theme.palette.info.main, 0.3),
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transform: `scale(${isMobile ? 0.8 : 1})`,
                        }}
                      >
                        <CalendarMonthIcon
                          sx={{ color: theme.palette.info.main }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          Connect Google Calendar
                        </Typography>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>

                {/* Floating gmail connect */}
                <Box
                  sx={{
                    position: "absolute",
                    right: isMobile ? -10 : 10,
                    top: isMobile ? 160 : 210,
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 2,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <Box
                        sx={{
                          borderRadius: 3,
                          p: 1.5,
                          bgcolor: "background.paper",
                          boxShadow: theme.shadows[10],
                          border: "1px solid",
                          borderColor: alpha(theme.palette.info.main, 0.3),
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          transform: `scale(${isMobile ? 0.8 : 1})`,
                        }}
                      >
                        <GoogleIcon sx={{ color: theme.palette.info.main }} />
                        <Typography variant="body2" fontWeight={500}>
                          Connect Gmail Account
                        </Typography>
                      </Box>
                    </motion.div>
                  </motion.div>
                </Box>
              </>
            }

            {/* Stats pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  left: 0,
                  right: 0,
                  mx: "auto",
                  width: "fit-content",
                  borderRadius: 8,
                  px: 3,
                  py: 2,
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[10],
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  zIndex: 3,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    3hrs+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saved Daily
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 30,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />

                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    93%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Accuracy
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
