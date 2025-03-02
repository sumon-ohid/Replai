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
import { motion, AnimatePresence } from "framer-motion";
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
const WorkflowSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = React.useState(0);
  
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
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [steps.length]);
  
  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 15 },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box 
        component="div" 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.1) 0%, rgba(0, 0, 0, 0) 25%)'
            : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 25%)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedBox sx={{ mb: 8 }}>
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
          
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.8,
              mb: 8,
            }}
          >
            Replai transforms how you handle business email with a sophisticated yet simple 
            automated workflow that saves hours every day.
          </Typography>
        </AnimatedBox>
      <Grid 
          container 
          spacing={{ xs: 3, sm: 4, md: 5 }} 
          alignItems="center"
          direction={{ xs: 'column-reverse', md: 'row' }}
        >
          <Grid item xs={12} md={5}>
            <Box>
              {steps.map((step, index) => (
                <Box
                  key={step.title}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: activeStep === index ? 1 : 0.4,
                    y: 0,
                    x: activeStep === index ? 0 : isMobile ? 0 : -20
                  }}
                  transition={{ duration: 0.5 }}
                  onClick={() => setActiveStep(index)}
                  sx={{
                    mr: { xs: 0, md: 2 },
                    mb: 4,
                    p: { xs: 2, sm: 3 },
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: activeStep === index ? 'primary.main' : 'divider',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    backgroundColor: activeStep === index 
                      ? alpha(theme.palette.primary.main, 0.08)
                      : 'transparent',
                    width: { xs: '100%', md: 'auto' }
                  }}
                >
                  <Stack 
                    direction={{ xs: 'row', md: 'column' }} 
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                    spacing={{ xs: 2, md: 0 }}
                  >
                    <Box 
                      component="span"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: activeStep === index ? 'primary.main' : 'action.hover',
                        color: activeStep === index ? 'white' : 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mb: { xs: 0, md: 2 },
                        flexShrink: 0
                      }}
                    >
                      {index + 1}
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          color: activeStep === index ? 'primary.main' : 'text.primary',
                          fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                        }}
                      >
                        {step.title}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          display: { xs: 'none', sm: 'block' } 
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <AnimatePresence mode="wait">
              <Box
                key={`animation-${activeStep}`}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 4,
                  background: theme.palette.background.paper,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.1)}`,
                  border: '1px solid',
                  borderColor: 'divider',
                  width: '100%',
                  height: { xs: 250, sm: 320, md: 'auto' },
                  aspectRatio: { md: '4/3' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  mx: 'auto'
                }}
              >
                <Lottie
                  loop
                  animationData={steps[activeStep].animation}
                  play
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    maxWidth: '90%',
                    maxHeight: 400 
                  }}
                />
              </Box>
            </AnimatePresence>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Benefits section with floating elements
const BenefitsSection = () => {
  const theme = useTheme();
  
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
  
  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 15 },
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.6)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`
          : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.6)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative floating elements */}
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 60%)`,
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedBox sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.75rem' }
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
              lineHeight: 1.8
            }}
          >
            Experience a new era of email productivity with powerful features designed
            to transform how you handle business communication.
          </Typography>
        </AnimatedBox>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid xs={12} sm={6} md={4} key={feature.title}>
              <FeatureCard 
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
                index={index}
              />
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <AnimatedBox delay={0.6}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                borderRadius: 3,
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}
              endIcon={<ChevronRight />}
            >
              Start Your Free Trial
            </Button>
          </AnimatedBox>
        </Box>
      </Container>
    </Box>
  );
};

// Statistics section with animated counters
const StatsSection = () => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.03)
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={4} 
          alignItems="center"
          justifyContent="center"
        >
          <Grid xs={12} sm={6} md={3}>
            <StatCounter 
              value="80" 
              suffix="%" 
              label="Reduction in Email Time" 
              icon={<AccessTime fontSize="large" />}
              delay={0.1}
            />
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <StatCounter 
              value="10000" 
              suffix="+" 
              label="Business Users" 
              icon={<ForumOutlined fontSize="large" />}
              delay={0.2}
            />
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <StatCounter 
              value="98" 
              suffix="%" 
              label="Customer Satisfaction" 
              icon={<CheckCircleOutline fontSize="large" />}
              delay={0.3}
            />
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <StatCounter 
              value="3" 
              suffix="+" 
              label="Hours Saved Daily" 
              icon={<AutoFixHighOutlined fontSize="large" />}
              delay={0.4}
            />
          </Grid>
        </Grid>
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
