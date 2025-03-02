import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import LogoCollection from "./components/LogoCollection";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import "./style.css";
import { 
  Policy, Speed, Extension, AccessTime, Email, Computer, 
  Notifications, ChevronRight, PlayArrow, ArticleOutlined,
  CheckCircleOutline, ForumOutlined, AutoFixHighOutlined,
  SecurityOutlined, SettingsSuggestOutlined
} from "@mui/icons-material";
import { Box } from "@mui/system";
import Grid from "@mui/material/Grid"; // Use the newer Grid for better responsive control
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { alpha, useTheme } from "@mui/material/styles";
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import useMediaQuery from '@mui/material/useMediaQuery';
import Lottie from "react-lottie-player";

// Import lottie animations
import emailAnimationData from "../../assets/animations/email-recieved.json";
import aiProcessingData from "../../assets/animations/ai-proccess.json";
import successAnimationData from "../../assets/animations/email-sent.json";

// Custom cursor effect component
const CustomCursor = () => {

  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [hidden, setHidden] = React.useState(true);
  const [clicked, setClicked] = React.useState(false);
  const theme = useTheme();
  
  React.useEffect(() => {
    interface MousePosition {
      x: number;
      y: number;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };
    
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);
  
  // Don't show custom cursor on touch devices
  const isTouchDevice = useMediaQuery('(hover: none)');
  if (isTouchDevice) return null;
  
  return (
    <Box
      component={motion.div}
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: clicked ? 0.8 : 1,
        opacity: hidden ? 0 : 0.6
      }}
      transition={{
        type: "spring",
        mass: 0.3,
        stiffness: 200,
        damping: 20
      }}
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        border: `2px solid ${theme.palette.primary.main}`,
        mixBlendMode: 'difference',
        display: { xs: 'none', md: 'block' }
      }}
    />
  );
};

// Enhanced animated component with variants
type AnimationType = "fadeInUp" | "fadeIn" | "scaleUp" | "slideInLeft" | "slideInRight";

interface AnimatedBoxProps {
  children: React.ReactNode;
  delay?: number;
  animation?: AnimationType;
  threshold?: number;
  [key: string]: any;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({ 
  children, 
  delay = 0, 
  animation = "fadeInUp" as AnimationType, 
  threshold = 0.1,
  ...props 
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold,
  });
  
  const variants = {
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 }
    },
    slideInRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 }
    }
  };
  const selectedVariant = variants[animation];

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={selectedVariant}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Modern feature card with enhanced hover effects
interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  delay?: number;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0, index }) => {
  const theme = useTheme();
  const isEven = index % 2 === 0;
  
  return (
    <AnimatedBox 
      delay={delay} 
      animation={isEven ? "slideInLeft" : "slideInRight"}
      sx={{ height: '100%' }}
    >
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          height: '100%',
          borderRadius: 4,
          transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 15px 35px -10px ${alpha(theme.palette.primary.main, 0.3)}` 
              : '0 20px 40px -15px rgba(0, 0, 0, 0.2)',
            '& .feature-bg': {
              transform: 'scale(1.1)'
            }
          }
        }}
      >
        <Box 
          className="feature-bg"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: 'url(https://cdn.dribbble.com/userupload/10552986/file/original-c945550d20d9d0cd08540828b80006dc.jpg?resize=2400x1800&vertical=center)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            transition: 'transform 0.5s ease-out',
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              p: 2,
              width: 70,
              height: 70,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { style: { fontSize: 32, color: 'white' } })}
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: `linear-gradient(90deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Box>
      </Paper>
    </AnimatedBox>
  );
};

// Modern stats counter
interface StatCounterProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  delay?: number;
}

const StatCounter: React.FC<StatCounterProps> = ({ value, label, icon, suffix = "", delay = 0 }) => {
  const theme = useTheme();
  const [count, setCount] = React.useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  
  React.useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value.toString());
      const duration = 2000;
      const increment = end / (duration / 16); // 60fps
      
      const timer = setInterval(() => {
        start += increment;
        setCount(Math.floor(start));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, value]);
  
  return (
    <AnimatedBox delay={delay} animation="scaleUp">
      <Box
        ref={ref}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {icon && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              color: 'white'
            }}
          >
            {icon}
          </Box>
        )}
        
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {count}{suffix}
        </Typography>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
      </Box>
    </AnimatedBox>
  );
};

// Interactive workflow section with animations
// Interactive workflow section with enhanced scroll animations
// Interactive workflow section with scroll-triggered transitions
const WorkflowSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = React.useState(0);
  const controls = useAnimation();
  const scrollRef = React.useRef<HTMLElement | null>(null);
  const [inViewRef, inView] = useInView({
    threshold: 0.2,
  });
  
  // Create refs for each step
  const stepRefs = React.useRef<React.RefObject<HTMLElement>[]>(Array(3).fill(null).map(() => React.createRef<HTMLElement>()) as React.RefObject<HTMLElement>[]);
  
  // Combine multiple refs
  interface SetRefs {
    (element: HTMLElement | null): void;
  }

  const setRefs: SetRefs = React.useCallback(
    (element) => {
      scrollRef.current = element;
      inViewRef(element);
    },
    [inViewRef],
  );
  
  // Track scroll position to determine active step
  React.useEffect(() => {
    if (!scrollRef.current) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.5;
      
      // Find which step is in view based on scroll position
      for (let i = 0; i < stepRefs.current.length; i++) {
        const ref = stepRefs.current[i];
        if (ref.current) {
          const { top, bottom } = ref.current.getBoundingClientRect();
          const offsetTop = window.scrollY + top;
          const offsetBottom = window.scrollY + bottom;
          
          if (scrollPosition >= offsetTop && scrollPosition <= offsetBottom) {
            setActiveStep(i);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Start animations when section comes into view
  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);
  
  const steps = [
    {
      title: "Email Arrives",
      description: "Replai monitors your inbox and detects incoming emails that need attention",
      animation: emailAnimationData
    },
    {
      title: "AI Analysis",
      description: "Our intelligent AI analyzes the content, context, and intent of the email",
      animation: aiProcessingData
    },
    {
      title: "Smart Response",
      description: "Replai drafts the perfect response in your tone and style for quick review",
      animation: successAnimationData
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  interface StepRef {
    current: HTMLElement | null;
  }

  interface HandleStepClick {
    (index: number): void;
  }

  const handleStepClick: HandleStepClick = (index) => {
    setActiveStep(index);
    const targetRef = stepRefs.current[index];
    let offset = targetRef.current?.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
    if (targetRef && targetRef.current) {
      if (targetRef.current instanceof HTMLElement) {
        offset = targetRef.current.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };
  
  return (
    <Box 
      ref={setRefs}
      sx={{ 
        py: { xs: 10, md: 15 },
        overflow: 'hidden',
        position: 'relative',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha('#000', 0)} 100%)`
          : `linear-gradient(180deg, ${alpha('#fff', 0)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha('#fff', 0)} 100%)`
      }}
    >
      {/* Background gradients */}
      <Box 
        component="div" 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(0, 0, 0, 0) 25%)'
            : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.05) 0%, rgba(255, 255, 255, 0) 25%)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          sx={{ mb: { xs: 6, md: 10 } }}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="overline"
              align="center"
              display="block"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: theme.palette.primary.main,
                letterSpacing: 2
              }}
            >
              HOW IT WORKS
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.75rem' },
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Seamless Email Automation
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
                mb: 4,
              }}
            >
              Replai transforms how you handle business email with a sophisticated yet simple 
              automated workflow that saves hours every day.
            </Typography>
          </motion.div>
        </Box>
        
        {/* Steps navigation - Always visible and fixed on scroll on desktop */}
        {!isMobile && (
          <Box sx={{ 
            position: 'sticky', 
            top: 80, 
            zIndex: 100,
            mb: 4, 
            px: 2,
            py: 1.5, 
            mx: 'auto', 
            maxWidth: 'md',
            borderRadius: 3,
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            boxShadow: `0 4px 30px ${alpha(theme.palette.common.black, 0.1)}`,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1)
          }}>
            <Grid container spacing={2}>
              {steps.map((step, index) => (
                <Grid item xs={4} key={`nav-${step.title}`}>
                  <Box
                    onClick={() => handleStepClick(index)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      backgroundColor: activeStep === index 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'transparent',
                      border: '1px solid',
                      borderColor: activeStep === index 
                        ? alpha(theme.palette.primary.main, 0.3)
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: activeStep === index 
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.action.hover, 0.1),
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box 
                        sx={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          backgroundColor: activeStep === index 
                            ? 'primary.main'
                            : alpha(theme.palette.action.selected, 0.12),
                          color: activeStep === index ? 'white' : 'text.secondary',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {index + 1}
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 600,
                            color: activeStep === index ? 'primary.main' : 'text.primary',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          {step.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Step content with scroll detection */}
        {steps.map((step, index) => (
          <Box 
            key={`step-${step.title}`}
            ref={stepRefs.current[index]}
            sx={{ 
              minHeight: { xs: 'auto', md: '80vh' },
              py: { xs: 6, md: 12 },
              scrollMarginTop: '80px'
            }}
          >
            <Grid 
              container 
              spacing={{ xs: 4, md: 8 }} 
              alignItems="center"
              direction={{ xs: 'column-reverse', md: index % 2 === 0 ? 'row' : 'row-reverse' }}
            >
              {/* Text Content */}
              <Grid item xs={12} md={5}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ 
                    opacity: activeStep === index ? 1 : 0.4,
                    x: 0
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Box
                    sx={{
                      mb: { xs: 2, md: 4 },
                      display: { xs: 'flex', md: 'block' },
                      alignItems: { xs: 'center' },
                      justifyContent: { xs: 'center' }
                    }}
                  >
                    <Box 
                      sx={{
                        width: { xs: 50, md: 80 },
                        height: { xs: 50, md: 80 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        mb: { md: 4 },
                        mr: { xs: 3, md: 0 }
                      }}
                    >
                      {index + 1}
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: { xs: 2, md: 3 },
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    {step.title}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.8,
                      mb: 4,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    {step.description}
                  </Typography>
                  
                  {/* Only show on mobile as an indicator of more content */}
                  {isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box 
                        component={motion.div}
                        animate={{ y: [0, 8, 0] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: "loop" 
                        }}
                      >
                        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M1 1L10 10L19 1" 
                            stroke={theme.palette.text.secondary} 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                          />
                        </svg>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Animation Content */}
              <Grid item xs={12} md={7}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: activeStep === index ? 1 : 0.3,
                    scale: activeStep === index ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    p: { xs: 2, md: 4 },
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(145deg, ${alpha('#121212', 0.7)}, ${alpha('#272727', 0.7)})`
                      : `linear-gradient(145deg, ${alpha('#ffffff', 0.7)}, ${alpha('#f5f5f5', 0.7)})`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 20px 80px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.25 : 0.1)}`,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.divider, 0.1)
                      : theme.palette.divider,
                    transition: 'all 0.5s ease-in-out',
                    overflow: 'hidden',
                    height: { xs: 280, sm: 350, md: 400 }
                  }}
                >
                  {/* Decorative gradients */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-30%',
                      left: '-20%',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                      filter: 'blur(30px)',
                      opacity: activeStep === index ? 0.8 : 0.3,
                      transition: 'opacity 0.5s ease-in-out'
                    }}
                  />
                  
                  <Lottie
                    loop
                    animationData={step.animation}
                    play={activeStep === index}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      maxHeight: 400,
                      margin: '0 auto'
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
        
        {/* Completion indicator */}
        <Box sx={{ 
          py: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', 
              gap: 2, 
              mb: 4 
            }}
          >
            {steps.map((_, i) => (
              <Box
                key={i}
                component={motion.div}
                animate={{
                  scale: activeStep === i ? 1.2 : 1,
                  opacity: activeStep === i ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                onClick={() => handleStepClick(i)}
                sx={{
                  width: activeStep === i ? 30 : 12,
                  height: 12,
                  borderRadius: 6,
                  bgcolor: activeStep === i ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'width 0.3s ease',
                }}
              />
            ))}
          </Box>
          
          <Button
            variant="contained"
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.5)}`
              }
            }}
          >
            Get Started with Replai
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Benefits section with floating elements and responsive design
const BenefitsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // For mobile slide view
  const [activeSlide, setActiveSlide] = React.useState(0);
  const slideRef = React.useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: <Speed />,
      title: "Smart Replies",
      description: "AI analyzes email context and crafts perfect responses, saving hours each day."
    },
    {
      icon: <AccessTime />,
      title: "Follow-up Automation",
      description: "Set intelligent reminders and let AI create timely follow-ups to increase response rates."
    },
    {
      icon: <Extension />,
      title: "Seamless Integration",
      description: "Works with Gmail, Outlook, and other major providers with no complicated setup."
    },
    {
      icon: <Notifications />,
      title: "Priority Inbox",
      description: "AI sorts your emails by importance, so you never miss critical messages."
    },
    {
      icon: <Computer />,
      title: "Cross-device Sync",
      description: "Access your intelligent inbox from anywhere with all your AI settings synchronized."
    },
    {
      icon: <Email />,
      title: "Template Library",
      description: "Access hundreds of AI-optimized templates customized to match your writing style."
    }
  ];

  // Handle next/prev for mobile slides
  const handleSlideChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setActiveSlide(prev => (prev + 1) % features.length);
    } else {
      setActiveSlide(prev => (prev - 1 + features.length) % features.length);
    }
  };

  const handleDotClick = (index: number) => {
    setActiveSlide(index);
  };
  
  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 15 },
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, ${alpha('#0a0a0a', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.07)} 50%, ${alpha('#0a0a0a', 0)} 100%)`
          : `linear-gradient(180deg, ${alpha('#fafafa', 0)} 0%, ${alpha(theme.palette.primary.light, 0.06)} 50%, ${alpha('#fafafa', 0)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background gradient elements */}
      <Box
        component={motion.div}
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: { xs: 60, md: 120 },
          height: { xs: 60, md: 120 },
          borderRadius: '30%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Box
        component={motion.div}
        animate={{ 
          y: [0, 20, 0],
          x: [0, -15, 0],
          rotate: [0, -8, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          width: { xs: 80, md: 160 },
          height: { xs: 80, md: 160 },
          borderRadius: '40%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.25)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          sx={{ mb: { xs: 8, md: 10 } }}
        >
          <Typography
            variant="overline"
            align="center"
            display="block"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: theme.palette.primary.main,
              letterSpacing: 2
            }}
          >
            POWERFUL FEATURES
          </Typography>
          
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.75rem' },
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.2
            }}
          >
            Why Choose <Box 
              component="span" 
              sx={{ 
                color: 'primary.main',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -3,
                  left: 0,
                  right: 0,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  opacity: 0.4
                }
              }}
            >
              Replai
            </Box>
          </Typography>
          
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              mb: 8,
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}
          >
            Experience a new era of email productivity with powerful features designed
            to transform how you handle business communication.
          </Typography>
        </Box>
        
        {/* Desktop & Tablet View - Grid Layout */}
        {!isSmall && (
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  sx={{ height: '100%' }}
                >
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(8px)',
                      backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.9),
                      '&:hover': {
                        boxShadow: theme.palette.mode === 'dark' 
                          ? `0 15px 35px -10px ${alpha(theme.palette.primary.main, 0.3)}` 
                          : '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      }
                    }}
                  >
                    {/* Feature background pattern */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        background: `radial-gradient(circle at 70% 20%, ${theme.palette.primary.main} 0%, transparent 70%)`,
                        zIndex: 0
                      }}
                    />
                    
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box
                        className="feature-icon"
                        sx={{
                          p: 2,
                          width: 70,
                          height: 70,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transition: 'transform 0.3s ease-out'
                        }}
                      >
                        {React.cloneElement(feature.icon as React.ReactElement<any>, { style: { fontSize: 32, color: 'white' } })}
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2,
                          fontSize: { xs: '1.25rem', sm: '1.4rem' },
                          color: theme.palette.text.primary
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.7,
                          fontSize: { xs: '0.95rem', sm: '1rem' }
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Mobile View - Carousel/Slider */}
        {isSmall && (
          <Box sx={{ position: 'relative', mb: 8, py: 2 }}>
            {/* Slider Container */}
            <Box
              ref={slideRef}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                height: 380,
                width: '100%',
                mb: 3
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                <Box
                  component={motion.div}
                  key={`slide-${activeSlide}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  sx={{ height: '100%', width: '100%' }}
                >
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.9)
                    }}
                  >
                    {/* Background pattern */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        background: `radial-gradient(circle at 70% 20%, ${theme.palette.primary.main} 0%, transparent 70%)`,
                        zIndex: 0
                      }}
                    />
                    
                    <Box sx={{ 
                      position: 'relative', 
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center' 
                    }}>
                      <Box
                        sx={{
                          p: 2.5,
                          width: 90,
                          height: 90,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transition: 'transform 0.3s ease-out'
                        }}
                      >
                        {React.cloneElement(features[activeSlide].icon as React.ReactElement<any>, { style: { fontSize: 42, color: 'white' } })}
                      </Box>
                      
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 3,
                          fontSize: '1.75rem',
                          color: theme.palette.text.primary
                        }}
                      >
                        {features[activeSlide].title}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.7,
                          maxWidth: 300,
                          mx: 'auto',
                          fontSize: '1.1rem'
                        }}
                      >
                        {features[activeSlide].description}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </AnimatePresence>
              
              {/* Navigation Arrows */}
              <Box
                onClick={() => handleSlideChange('prev')}
                component={motion.div}
                whileTap={{ scale: 0.9 }}
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.2) 
                }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 10,
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M15 18L9 12L15 6" 
                    stroke={theme.palette.text.primary} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
              
              <Box
                onClick={() => handleSlideChange('next')}
                component={motion.div}
                whileTap={{ scale: 0.9 }}
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.2) 
                }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 10,
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 18L15 12L9 6" 
                    stroke={theme.palette.text.primary} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
            </Box>
            
            {/* Dots Indicator */}
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1.5,
                mb: 2
              }}
            >
              {features.map((_, index) => (
                <Box
                  key={`dot-${index}`}
                  component={motion.div}
                  animate={{
                    scale: activeSlide === index ? 1.2 : 1,
                    opacity: activeSlide === index ? 1 : 0.5,
                    width: activeSlide === index ? 24 : 8
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleDotClick(index)}
                  sx={{
                    height: 8,
                    width: 8, // Will be animated
                    borderRadius: 4,
                    backgroundColor: activeSlide === index 
                      ? 'primary.main' 
                      : alpha(theme.palette.text.secondary, 0.3),
                    cursor: 'pointer',
                    transition: 'width 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* CTA Button */}
        <Box 
          sx={{ 
            mt: { xs: 4, md: 6 }, 
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                borderRadius: 3,
                px: { xs: 4, md: 6 },
                py: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}
              endIcon={<ChevronRight />}
            >
              Start Your Free Trial
            </Button>
          </Box>
          
          {/* Decorative circles */}
          <Box
            component={motion.div}
            animate={{
              scale: [0.9, 1.1, 0.9],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "loop"
            }}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 200, md: 280 },
              height: { xs: 50, md: 70 },
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
              filter: 'blur(10px)',
              zIndex: -1
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

// Statistics section with animated counters
const StatsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSlide, setActiveSlide] = React.useState(0);
  
  const stats = [
    {
      value: "80",
      suffix: "%",
      label: "Reduction in Email Time",
      icon: <AccessTime fontSize="large" />,
      description: "Users report spending significantly less time managing their inbox"
    },
    {
      value: "10000",
      suffix: "+",
      label: "Business Users",
      icon: <ForumOutlined fontSize="large" />,
      description: "Trusted by companies of all sizes around the world"
    },
    {
      value: "98",
      suffix: "%",
      label: "Customer Satisfaction",
      icon: <CheckCircleOutline fontSize="large" />,
      description: "Our users love how Replai transforms their workflow"
    },
    {
      value: "3",
      suffix: "+",
      label: "Hours Saved Daily",
      icon: <AutoFixHighOutlined fontSize="large" />,
      description: "Free up your day for more important tasks and projects"
    }
  ];
  
  // Controls for mobile slider
  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % stats.length);
  };
  
  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + stats.length) % stats.length);
  };
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        py: { xs: 10, md: 15 },
        overflow: 'hidden'
      }}
    >
      {/* Enhanced background with layered gradients */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.15)} 50%, ${alpha('#000', 0)} 100%)`
            : `linear-gradient(180deg, ${alpha('#fff', 0)} 0%, ${alpha(theme.palette.primary.light, 0.12)} 50%, ${alpha('#fff', 0)} 100%)`,
          zIndex: 0
        }}
      />
      
      {/* Decorative background shapes */}
      <Box
        component={motion.div}
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: { xs: 80, md: 180 },
          height: { xs: 80, md: 180 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Box
        component={motion.div}
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -8, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Box sx={{ mb: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              variant="overline"
              align="center"
              display="block"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: theme.palette.primary.main,
                letterSpacing: 2
              }}
            >
              BY THE NUMBERS
            </Typography>
            
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.75rem' },
                maxWidth: 700,
                mx: 'auto',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Impactful Results That Speak For Themselves
            </Typography>
            
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                mb: { xs: 4, md: 6 },
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              See why thousands of businesses trust Replai to transform their email workflow 
              and deliver measurable productivity improvements.
            </Typography>
          </Box>
        </Box>
        
        {/* Desktop and Tablet View */}
        {!isMobile && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            sx={{ position: 'relative' }}
          >
            <Paper
              elevation={0}
              sx={{
                py: { sm: 4, md: 6 },
                px: { sm: 2, md: 4 },
                borderRadius: 6,
                background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.6),
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.divider, 0.1)
                  : theme.palette.divider,
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 25px 80px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 25px 80px ${alpha(theme.palette.common.black, 0.06)}`
              }}
            >
              <Grid 
                container 
                spacing={4} 
                alignItems="center"
                justifyContent="center"
              >
                {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={stat.label}>
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      sx={{
                        height: '100%',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                          '& .stat-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          }
                        }
                      }}
                    >
                      {/* Highlight glow effect */}
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: -60,
                          left: -60,
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                          opacity: 0.7,
                          filter: 'blur(25px)',
                        }}
                      />
                      
                      {/* Icon */}
                      <Box
                        className="stat-icon"
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
                          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                          color: '#fff',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.5)',
                          zIndex: 2
                        }}
                      >
                        {stat.icon}
                      </Box>
                      
                      {/* Value */}
                      <Box
                        component={motion.div}
                        initial={{ scale: 0.8 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 200, 
                          damping: 10,
                          delay: index * 0.1 + 0.2
                        }}
                      >
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 900,
                            mb: 0.5,
                            fontSize: { xs: '2.5rem', sm: '2.2rem', md: '3.2rem', lg: '3.7rem' },
                            lineHeight: 1.1,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {stat.value}{stat.suffix}
                        </Typography>
                      </Box>
                      
                      {/* Label */}
                      <Typography
                        variant="h6"
                        sx={{ 
                          fontWeight: 700,
                          mb: 1.5,
                          fontSize: { sm: '1rem', md: '1.1rem', lg: '1.25rem' },
                          color: theme.palette.text.primary,
                        }}
                      >
                        {stat.label}
                      </Typography>
                      
                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { sm: '0.825rem', md: '0.875rem' },
                          opacity: 0.85,
                          lineHeight: 1.6
                        }}
                      >
                        {stat.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
        
        {/* Mobile View with Carousel */}
        {isMobile && (
          <Box sx={{ position: 'relative', mx: -2 }}>
            {/* Main Carousel */}
            <Box
              sx={{
                position: 'relative',
                px: 2,
                pb: 6
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                <Box
                  key={`stat-slide-${activeSlide}`}
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.92, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: -50 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30
                  }}
                  sx={{ width: '100%' }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      py: 5,
                      px: 3,
                      borderRadius: 4,
                      background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.7),
                      backdropFilter: 'blur(12px)',
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.divider, 0.1)
                        : theme.palette.divider,
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 20px 60px ${alpha(theme.palette.common.black, 0.25)}`
                        : `0 20px 60px ${alpha(theme.palette.common.black, 0.08)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%'
                    }}
                  >
                    {/* Highlight glow effect */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -80,
                        left: -60,
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 70%)`,
                        opacity: 0.7,
                        filter: 'blur(25px)',
                      }}
                    />
                    
                    {/* Icon */}
                    <Box
                      sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                        color: '#fff',
                        zIndex: 2
                      }}
                    >
                      {React.cloneElement(stats[activeSlide].icon as React.ReactElement, { 
                        style: { fontSize: 40 } 
                      })}
                    </Box>
                    
                    {/* Value */}
                    <Typography
                      variant="h1"
                      sx={{
                        fontWeight: 900,
                        mb: 1,
                        fontSize: '4.2rem',
                        lineHeight: 1,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stats[activeSlide].value}{stats[activeSlide].suffix}
                    </Typography>
                    
                    {/* Label */}
                    <Typography
                      variant="h5"
                      sx={{ 
                        fontWeight: 700,
                        mb: 2.5,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {stats[activeSlide].label}
                    </Typography>
                    
                    {/* Description */}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: '1rem',
                        opacity: 0.9,
                        lineHeight: 1.6,
                        maxWidth: 280,
                        mx: 'auto'
                      }}
                    >
                      {stats[activeSlide].description}
                    </Typography>
                  </Paper>
                </Box>
              </AnimatePresence>
              
              {/* Navigation controls */}
              <Box
                component={motion.div}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 10,
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.15)}`,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M15 18L9 12L15 6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
              
              <Box
                component={motion.div}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 10,
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.15)}`,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 18L15 12L9 6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
            </Box>
            
            {/* Navigation dots */}
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1.5
              }}
            >
              {stats.map((_, index) => (
                <Box
                  key={`dot-${index}`}
                  component={motion.div}
                  animate={{
                    scale: activeSlide === index ? 1.3 : 1,
                    opacity: activeSlide === index ? 1 : 0.5
                  }}
                  onClick={() => setActiveSlide(index)}
                  sx={{
                    width: activeSlide === index ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: activeSlide === index 
                      ? 'primary.main' 
                      : alpha(theme.palette.text.secondary, 0.3),
                    cursor: 'pointer',
                    transition: 'width 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Additional CTA */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          sx={{ 
            mt: { xs: 6, md: 8 },
            textAlign: 'center'
          }}
        >
          <Button
            variant="outlined"
            size="large"
            endIcon={<ChevronRight />}
            sx={{
              borderRadius: 4,
              borderWidth: 2,
              py: 1.2,
              px: 3.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              color: theme.palette.primary.main,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              '&:hover': {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            View Case Studies
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Modern CTA Section
const CtaSection = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ my: { xs: 10, md: 15 } }}>
      <AnimatedBox animation="scaleUp" threshold={0.4}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 6,
            overflow: 'hidden',
            py: { xs: 6, md: 10 },
            px: { xs: 3, md: 8 },
          }}
        >
          {/* Background with blur effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(120deg, ${alpha(theme.palette.primary.dark, theme.palette.mode === 'dark' ? 0.8 : 0.9)} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.8 : 0.9)} 100%)`,
              zIndex: 0
            }}
          />
          
          {/* Decorative elements */}
          <Box
            component={motion.div}
            animate={{
              rotate: [0, 360],
              x: [0, 10, -10, 0],
              y: [0, 15, -5, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            sx={{
              position: 'absolute',
              top: '10%',
              right: '5%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
              zIndex: 1
            }}
          />
          
          <Box
            component={motion.div}
            animate={{
              rotate: [0, -360],
              x: [0, -20, 20, 0],
              y: [0, -10, 20, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            sx={{
              position: 'absolute',
              bottom: '15%',
              left: '8%',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#ffffff', 0.08)} 0%, transparent 70%)`,
              zIndex: 1
            }}
          />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Ready to Transform Your Email Experience?
            </Typography>
            
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                mb: 5,
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              Join thousands of businesses already saving hours every day with Replai's
              intelligent email automation.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  py: 1.8,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Start Your Free Trial
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  py: 1.8,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                  }
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Container>
        </Box>
      </AnimatedBox>
    </Container>
  );
}

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme>
      <CssBaseline />
      <CustomCursor />
      <AppAppBar />
      <Hero />
      <WorkflowSection />
      {/* <LogoCollection /> */}
      {/* <Features /> */}
      {/* <Testimonials /> */}
      <BenefitsSection />
      <StatsSection />
      <CtaSection />
      <FAQ />
      <Box
          sx={{
            pt: 6,
            pb: 6,
            m: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            <Policy sx={{ fontSize: 40 }} />
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            We take your privacy seriously. We do not share your data with third
            parties.
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Check our{" "}
            <a href="/privacy" style={{ textDecoration: "underline" }}>
              Privacy Policy{" "}
            </a>
            for more information.
          </Typography>
        </Box>
      <Footer />
    </AppTheme>
  );
}
