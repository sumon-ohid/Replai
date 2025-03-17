import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { Box } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import useMediaQuery from '@mui/material/useMediaQuery';
import WorkflowSection from "./components/WorkflowSection";
import Pricing from "./components/Pricing";

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


import BenefitsSection from "./components/BenefitsSection";
import StatsSection from "./components/StatsSection";
import PrivacyPolicySection from "./components/PrivacyPolicySection";

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme>
      <CssBaseline />
      <CustomCursor />
      <AppAppBar />
      <Hero />
      <WorkflowSection />
      <BenefitsSection />
      <Pricing />
      <StatsSection />
      <FAQ />
      <PrivacyPolicySection />
      <Footer />
    </AppTheme>
  );
}
