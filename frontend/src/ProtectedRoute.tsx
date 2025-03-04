import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Typography, Box, useTheme, alpha } from "@mui/material";
import { keyframes } from "@mui/system";
import { motion } from "framer-motion";
import Logo from "../logo/logo_light.png"; // Adjust the path to your logo

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;


  React.useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      
      // Simulated loading progress
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);
      
      // Set minimum loading time for better UX
      setTimeout(() => {
        clearInterval(interval);
        setLoadingProgress(100);
        setTimeout(() => setLoading(false), 500); // Small delay after reaching 100%
      }, 2000);
    };
    
    verifyAuth();
  }, [checkAuthStatus]);

  if (loading) {
    // Animation definitions
    const float = keyframes`
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    `;
    
    const pulse = keyframes`
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    `;
    
    const gradientMove = keyframes`
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    `;

    // Variants for staggered animations
    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.3
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
        }
      }
    };

    const progressVariants = {
      initial: { width: "0%" },
      animate: { 
        width: `${loadingProgress}%`,
        transition: { 
          duration: 0.5,
          ease: "easeOut"
        }
      }
    };

    // Orb animations
    const orbVariants = (delay: number) => ({
      initial: { scale: 0, opacity: 0 },
      animate: { 
        scale: [0, 1.2, 1],
        opacity: [0, 0.8, 1],
        transition: {
          duration: 1.5,
          delay,
          ease: "easeOut"
        }
      }
    });

    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background orbs */}
        <motion.div
          variants={orbVariants(0)}
          initial="initial"
          animate="animate"
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            zIndex: 0
          }}
        />
        <motion.div
          variants={orbVariants(0.3)}
          initial="initial"
          animate="animate"
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: isDarkMode
              ? `radial-gradient(circle, ${alpha(theme.palette.secondary.dark, 0.15)}, transparent 70%)`
              : `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.12)}, transparent 70%)`,
            filter: "blur(60px)",
            zIndex: 0
          }}
        />

        {/* Grid pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isDarkMode ? 0.15 : 0.07,
            backgroundImage: `linear-gradient(${theme.palette.divider} 1px, transparent 1px), 
                            linear-gradient(90deg, ${theme.palette.divider} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            zIndex: 1
          }}
        />

        {/* Content container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            maxWidth: "400px",
            width: "80%"
          }}
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            style={{
              marginBottom: "2rem",
              animation: `${float} 3s ease-in-out infinite`
            }}
          >
            {/* Replace with your actual logo */}
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{
                height: "70px",
                width: "auto",
                filter: isDarkMode ? "brightness(1.2)" : "none"
              }}
            />
          </motion.div>

          {/* Loading message */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 1,
                background: isDarkMode
                  ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                  : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                backgroundSize: "200% auto",
                animation: `${gradientMove} 3s ease infinite`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Preparing Your Experience
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "center",
                mb: 3,
                maxWidth: "300px",
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            >
              Setting up your AI email assistant with secure connections
            </Typography>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            variants={itemVariants}
            style={{
              width: "100%",
              marginBottom: "2rem",
            }}
          >
            <Box
              sx={{
                height: "4px",
                width: "100%",
                borderRadius: "2px",
                backgroundColor: alpha(theme.palette.divider, 0.2),
                overflow: "hidden",
              }}
            >
              <motion.div
                variants={progressVariants}
                initial="initial"
                animate="animate"
                style={{
                  height: "100%",
                  borderRadius: "2px",
                  background: isDarkMode
                    ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 1
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {Math.round(loadingProgress)}%
              </Typography>
            </Box>
          </motion.div>

          {/* Status indicators */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              width: "100%",
            }}
          >
            {["Authenticating", "Loading preferences", "Establishing connection"].map((text, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: loadingProgress > (index + 1) * 30 
                      ? theme.palette.primary.main 
                      : alpha(theme.palette.text.disabled, 0.3),
                    mr: 1.5,
                  }}
                />
                <Typography
                  variant="body2"
                  color={loadingProgress > (index + 1) * 30 ? "text.primary" : "text.disabled"}
                  sx={{ fontSize: "0.875rem" }}
                >
                  {text}
                </Typography>
                {loadingProgress > (index + 1) * 30 && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      color: theme.palette.success.main,
                      ml: 'auto'
                    }}
                  >
                    ✓
                  </Box>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;