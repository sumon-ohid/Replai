import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Footer from './components/Footer';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, useScroll, useTransform } from 'framer-motion';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Lottie from "react-lottie-player";
import SecurityAnimation from '../../assets/animations/data-privacy.json';

export default function PrivacyTermsPage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { scrollY } = useScroll();
  const ref = useRef(null);
  
  // Parallax effect for background elements
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0.6]);
  
  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.7,
        ease: "easeOut"
      }
    })
  };
  
  const iconBoxVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <AppTheme>
      <CssBaseline />
      
      {/* Main background with improved styling matching the provided design */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -4,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha('#000', 0)} 100%)`
            : `linear-gradient(180deg, ${alpha('#fff', 0)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha('#fff', 0)} 100%)`
        }}
      />
      
      {/* Background radial gradient */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -3,
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(0, 0, 0, 0) 25%)'
            : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.05) 0%, rgba(255, 255, 255, 0) 25%)',
        }}
      />
      
      {/* Animated gradient circles */}
      <Box
        component={motion.div}
        style={{ y: y1, opacity: opacity1 }}
        sx={{
          position: 'fixed',
          top: '5%',
          right: '10%',
          width: { xs: 200, md: 400, lg: 600 },
          height: { xs: 200, md: 400, lg: 600 },
          borderRadius: '50%',
          zIndex: -3,
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(0, 0, 0, 0) 25%)'
            : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.05) 0%, rgba(255, 255, 255, 0) 25%)',
          filter: 'blur(60px)',
        }}
      />
      
      <Box
        component={motion.div}
        style={{ y: y2 }}
        sx={{
          position: 'fixed',
          bottom: '10%',
          left: '5%',
          width: { xs: 150, md: 300, lg: 500 },
          height: { xs: 150, md: 300, lg: 500 },
          borderRadius: '50%',
          zIndex: -3,
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, ${alpha(theme.palette.secondary.dark, 0.2)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 70%)`,
          filter: 'blur(70px)',
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          opacity: theme.palette.mode === 'dark' ? 0.03 : 0.02,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha('#000', 0)} 100%)`
            : `linear-gradient(180deg, ${alpha('#fff', 0)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha('#fff', 0)} 100%)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Grid pattern with improved styling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: theme.palette.mode === 'dark' ? 0.3 : 0.2,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha('#000', 0)} 100%)`
            : `linear-gradient(180deg, ${alpha('#fff', 0)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha('#fff', 0)} 100%)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '-1px -1px',
          mask: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
        }}
      />
      
      <AppAppBar />
      
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        sx={{ 
          pt: { xs: 15, sm: 18, md: 20 },
          pb: { xs: 8, sm: 10, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />} 
              aria-label="breadcrumb"
            >
              <Link 
                underline="hover" 
                color="inherit" 
                href="/"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                }}
              >
                Home
              </Link>
              <Typography 
                color="text.primary"
                sx={{ 
                  fontWeight: 500,
                }}
              >
                Legal Information
              </Typography>
            </Breadcrumbs>
          </Box>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1"
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Privacy & Terms
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 600, 
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                We value your privacy and are committed to protecting your personal information.
                Learn about our data practices and how we ensure your information remains secure.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: { xs: 4, md: 0 } }}>
                <Paper
                  component={motion.div}
                  variants={iconBoxVariants}
                  initial="rest"
                  whileHover="hover"
                  elevation={2}
                  sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ShieldOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
                </Paper>
                
                <Paper
                  component={motion.div}
                  variants={iconBoxVariants}
                  initial="rest"
                  whileHover="hover"
                  elevation={2}
                  sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <GppGoodOutlinedIcon color="secondary" sx={{ fontSize: 28 }} />
                </Paper>
                
                <Paper
                  component={motion.div}
                  variants={iconBoxVariants}
                  initial="rest"
                  whileHover="hover"
                  elevation={2}
                  sx={{ 
                    p: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.3 : 0.2),
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <LockOutlinedIcon color="info" sx={{ fontSize: 28 }} />
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 450,
                  height: 350,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundImage: theme.palette.mode === 'dark' 
                      ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(0, 0, 0, 0) 25%)'
                      : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.05) 0%, rgba(255, 255, 255, 0) 25%)',
                    filter: 'blur(60px)',
                    zIndex: -1,
                  }}
                />
                
                <Lottie
                  loop
                  animationData={SecurityAnimation}
                  play
                  style={{ width: '100%', height: '100%' }}
                />
                
                {/* Enhanced glow effect */}
                <Box
                  component={motion.div}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70%',
                    height: 30,
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    background: theme.palette.mode === 'dark'
                      ? `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.7)}, transparent 70%)`
                      : `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.3)}, transparent 70%)`,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Box
        ref={ref}
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
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card 
                component={motion.div}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  mb: 4,
                  borderRadius: 3,
                  backdropFilter: 'blur(16px)',
                  background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.divider, 0.4)
                    : alpha(theme.palette.divider, 0.6),
                  boxShadow: theme.palette.mode === 'dark' 
                    ? `0 20px 60px -20px ${alpha('#000000', 0.5)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.1)}`
                    : `0 20px 60px -20px ${alpha(theme.palette.primary.main, 0.1)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.03)}`,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                      : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      mr: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`
                        : 'none',
                    }}
                  >
                    <ShieldOutlinedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    Privacy Policy
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    Our AI Email Agent requires access to your Google account for reading and sending emails on your behalf, but only if you grant permission. 
                    We strictly follow Google OAuth security guidelines to protect your data. We do not store, share, or misuse your emails. Your access can be revoked anytime via Google account settings.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    We collect minimal data necessary for functionality, such as your email content and sender details. This data is processed in real-time and is not retained beyond its intended use.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                component={motion.div}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  mb: 4,
                  borderRadius: 3,
                  backdropFilter: 'blur(16px)',
                  background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.divider, 0.4)
                    : alpha(theme.palette.divider, 0.6),
                  boxShadow: theme.palette.mode === 'dark' 
                    ? `0 20px 60px -20px ${alpha('#000000', 0.5)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.1)}`
                    : `0 20px 60px -20px ${alpha(theme.palette.primary.main, 0.1)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.03)}`,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(90deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`
                      : `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      mr: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      color: theme.palette.secondary.main,
                      display: 'flex',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 0 20px ${alpha(theme.palette.secondary.main, 0.2)}`
                        : 'none',
                    }}
                  >
                    <GppGoodOutlinedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    GDPR Compliance
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    If you are located in the European Union, we process your personal data in accordance with the General Data Protection Regulation (GDPR). 
                    You have the right to access, rectify, or delete your personal data. You can also request restrictions on processing or object to data processing.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    If you wish to exercise any of these rights or have concerns regarding your data, please contact us at <Link href="mailto:support@replai.tech" color="primary" sx={{ fontWeight: 600 }}>support@replai.tech</Link>.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    We ensure appropriate security measures to protect your data and comply with applicable legal requirements.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                component={motion.div}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backdropFilter: 'blur(16px)',
                  background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.divider, 0.4)
                    : alpha(theme.palette.divider, 0.6),
                  boxShadow: theme.palette.mode === 'dark' 
                    ? `0 20px 60px -20px ${alpha('#000000', 0.5)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.1)}`
                    : `0 20px 60px -20px ${alpha(theme.palette.primary.main, 0.1)}, 0 2px 20px 0 ${alpha(theme.palette.common.black, 0.03)}`,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(90deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`
                      : `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      mr: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      color: theme.palette.info.main,
                      display: 'flex',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 0 20px ${alpha(theme.palette.info.main, 0.2)}`
                        : 'none',
                    }}
                  >
                    <GavelOutlinedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    Terms & Conditions
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    By using our AI Email Agent, you agree to grant necessary access to your email account for automated replies. You are responsible for reviewing AI-generated responses before sending.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    You must not use the service for illegal or unethical activities. We reserve the right to suspend access if misuse is detected.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                    }}
                  >
                    We may update these terms from time to time. Continued use of the service implies acceptance of the latest version.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <FAQ />
      <Footer />
    </AppTheme>
  );
}