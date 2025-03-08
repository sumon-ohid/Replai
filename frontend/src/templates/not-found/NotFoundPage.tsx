import * as React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme, 
  useMediaQuery,
  IconButton,
  CssBaseline
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { motion } from "framer-motion";
import AppTheme from "../../templates/shared-theme/AppTheme";
import { ThemeToggleContext } from "../../templates/shared-theme/ThemeToggleContext";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const glitch = keyframes`
  100% {
    text-shadow: -0.025em 0 0 rgba(0, 183, 255, 0.75),
                -0.025em -0.025em 0 rgba(0, 123, 255, 0.75),
                -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotateIn = keyframes`
  from {
    transform: rotate(-10deg) scale(0.8);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
`;

// Styled components
const Styled404Text = styled(Typography)(({ theme }) => ({
  fontSize: "12rem",
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-8px",
  marginBottom: theme.spacing(2),
  display: "inline-block",
  position: "relative",
  backgroundSize: "400% 400%",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  // animation: `${glitch} 3s infinite`,
  [theme.breakpoints.down("md")]: {
    fontSize: "8rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "6rem",
    letterSpacing: "-4px",
  },
  "&::after": {
    content: '"404"',
    position: "absolute",
    top: "2px",
    left: "-2px",
    textShadow: "none",
    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    opacity: 0.7,
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: "30px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.25)",
  },
}));

const StyledCircle = styled(motion.div)(({ theme, color = "primary" }) => ({
  position: "absolute",
  borderRadius: "50%",
  background: theme.palette.mode === "dark" 
    ? `radial-gradient(circle, ${theme.palette[color].dark} 0%, transparent 70%)`
    : `radial-gradient(circle, ${theme.palette[color].light} 0%, transparent 70%)`,
  filter: "blur(40px)",
  zIndex: 0,
}));

const StyledIllustrationWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "200px",
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    height: "250px",
  },
}));

export default function NotFoundPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { toggleTheme, mode } = React.useContext(ThemeToggleContext);
  
  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // Elements for the abstract illustration
  const illustrationElements = [
    { 
      shape: "box", 
      x: "10%", 
      y: "30%", 
      size: { width: 40, height: 40 }, 
      color: theme.palette.primary.main,
      delay: 0.1,
      rotate: 45
    },
    { 
      shape: "circle", 
      x: "40%", 
      y: "10%", 
      size: { width: 60, height: 60 }, 
      color: theme.palette.secondary.main,
      delay: 0.3,
      rotate: 0
    },
    { 
      shape: "box", 
      x: "80%", 
      y: "20%", 
      size: { width: 30, height: 30 }, 
      color: theme.palette.primary.light,
      delay: 0.5,
      rotate: 15
    },
    { 
      shape: "triangle", 
      x: "65%", 
      y: "65%", 
      size: { width: 40, height: 40 }, 
      color: theme.palette.secondary.light,
      delay: 0.7,
      rotate: 35
    },
    { 
      shape: "circle", 
      x: "25%", 
      y: "70%", 
      size: { width: 50, height: 50 }, 
      color: theme.palette.info.main,
      delay: 0.9,
      rotate: 0
    },
  ];

  return (
    <AppTheme>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        {/* Background Circles */}
        <StyledCircle 
          color="primary"
          sx={{
            width: { xs: 300, md: 600 },
            height: { xs: 300, md: 600 },
            top: "10%",
            right: "-5%",
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <StyledCircle 
          color="secondary"
          sx={{
            width: { xs: 250, md: 500 },
            height: { xs: 250, md: 500 },
            bottom: "5%",
            left: "-10%",
            opacity: 0.2,
          }}
          animate={{
            y: [0, 30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Theme Toggle Button */}
       <ColorModeIconDropdown
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            m: 2,
            zIndex: 10,
          }}
       />

        <Container 
          maxWidth="md"
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            textAlign: "center",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 4,
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div variants={itemVariants}>
            <Styled404Text variant="h1">404</Styled404Text>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h2" 
              fontWeight="bold" 
              sx={{ mb: 2 }}
            >
              Oops! Page Not Found
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4, 
                maxWidth: "500px", 
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.125rem" }
              }}
            >
              The page you're looking for doesn't exist or has been moved. 
              Perhaps you mistyped the URL or the page has been removed.
            </Typography>
          </motion.div>
          
          {/* Abstract Illustration */}
          <motion.div variants={itemVariants}>
            <StyledIllustrationWrapper>
              <Box
                component={motion.svg}
                viewBox="0 0 200 100"
                width="100%"
                height="100%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {/* Decorative paths */}
                <motion.path
                  d="M20,50 C20,20 50,20 50,50 C50,80 80,80 80,50 C80,20 110,20 110,50 C110,80 140,80 140,50 C140,20 170,20 170,50"
                  stroke={theme.palette.primary.main}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M30,70 C30,40 60,40 60,70 C60,100 90,100 90,70 C90,40 120,40 120,70 C120,100 150,100 150,70 C150,40 180,40 180,70"
                  stroke={theme.palette.secondary.main}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
                />
              </Box>
              
              {/* Animated shapes */}
              {illustrationElements.map((el, i) => (
                <Box 
                  component={motion.div}
                  key={i}
                  sx={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.size.width,
                    height: el.size.height,
                    backgroundColor: el.shape !== "triangle" ? el.color : "transparent",
                    borderRadius: el.shape === "circle" ? "50%" : el.shape === "box" ? "8px" : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 32px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.15)"}`,
                    ...(el.shape === "triangle" && {
                      width: 0,
                      height: 0,
                      borderLeft: "20px solid transparent",
                      borderRight: "20px solid transparent",
                      borderBottom: `35px solid ${el.color}`,
                      backgroundColor: "transparent",
                    }),
                  }}
                  initial={{ opacity: 0, scale: 0, rotate: el.rotate * 2 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: el.rotate,
                    y: ["0%", "-15%", "0%"]
                  }}
                  transition={{
                    delay: el.delay,
                    duration: 0.8,
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }
                  }}
                />
              ))}
            </StyledIllustrationWrapper>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants} 
            style={{ display: "flex", gap: "16px", justifyContent: "center", flexDirection: isMobile ? "column" : "row" }}
          >
            <StyledButton
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
              sx={{ 
                borderWidth: "2px",
                "&:hover": {
                  borderWidth: "2px"
                }
              }}
            >
              Go Back
            </StyledButton>
            
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
            >
              Back to Home
            </StyledButton>
          </motion.div>
        </Container>

        {/* Footer */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          sx={{
            py: 2,
            textAlign: "center",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Replai.tech • All rights reserved
          </Typography>
        </Box>
      </Box>
    </AppTheme>
  );
}
