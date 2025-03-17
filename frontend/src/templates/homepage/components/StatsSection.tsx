import React from 'react';
import { alpha, Box, Button, Container, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AccessTime, AutoFixHighOutlined, CheckCircleOutline, ChevronRight, ForumOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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
        value: "100",
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
        id="stats"
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
                          {React.cloneElement(stats[activeSlide].icon as React.ReactElement<any>, { 
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

export default StatsSection;