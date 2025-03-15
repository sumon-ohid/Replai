import React from 'react';
import { Box, Button, Container, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Speed, AccessTime, Extension, Notifications, Computer, Email, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
    
    const navigate = useNavigate();
  
    return (
      <Box 
        id="features"
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
                // onclick go to signup page
                onClick={() => navigate('/signup')}
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

export default BenefitsSection;