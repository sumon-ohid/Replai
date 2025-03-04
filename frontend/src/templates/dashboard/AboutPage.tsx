import * as React from 'react';
import { alpha, useTheme, darken, lighten } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button,
  Container,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  Chip,
  Link
} from '@mui/material';
import Footer from '../marketing-page/components/Footer';
import { motion } from 'framer-motion';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BoltIcon from '@mui/icons-material/Bolt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Define animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Update team members data with more details
const teamMembers = [
  {
    name: 'Md Ohiduzzaman Sumon',
    role: 'Founder & Lead Developer',
    image: 'https://img.freepik.com/premium-photo/3d-portrait-businessman_849407-6268.jpg',
    bio: 'Great problem solver, passionate about technology, and always eager to learn new things.',
    quote: '"The best way to predict the future is to create it."',
    website: "https://msumon.vercel.app/",
    skills: ['Full-Stack Development'],
    socialLinks: {
      linkedin: 'https://linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/'
    }
  },
  // You can uncomment and add more team members when needed
];

// Company values
const companyValues = [
  {
    title: 'Innovation',
    description: 'Continuously exploring new technologies and approaches to solve email challenges',
    icon: <LightbulbIcon fontSize="large" />
  },
  {
    title: 'Excellence',
    description: 'Committed to delivering the highest quality solutions in everything we do',
    icon: <AutoAwesomeIcon fontSize="large" />
  },
  {
    title: 'Collaboration',
    description: 'Working closely with our customers to understand their needs and provide tailored solutions',
    icon: <HandshakeIcon fontSize="large" />
  },
  {
    title: 'Trust',
    description: 'Building secure, reliable services that our customers can depend on',
    icon: <SmartToyIcon fontSize="large" />
  }
];

export default function AboutPage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Generate theme-specific colors
  const primaryColor = theme.palette.primary.main;
  const primaryLight = alpha(theme.palette.primary.main, 0.2);
  const primaryGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${
    theme.palette.mode === 'dark' 
      ? darken(primaryColor, 0.2) 
      : lighten(primaryColor, 0.2)
  } 100%)`;
  
  const cardBackground = theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.6)
    : theme.palette.background.paper;
  
  const highlightColor = theme.palette.mode === 'dark'
    ? lighten(theme.palette.primary.main, 0.3)
    : theme.palette.primary.main;

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              mt: { xs: 8, md: 0 },
            }}
          >
            {/* <Header /> */}
          </Stack>
          
          {/* Main content area */}
          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hero Section */}
            <Box 
              sx={{
                position: 'relative',
                overflow: 'hidden',
                py: { xs: 6, md: 10 },
                mb: 6,
              }}
            >
              {/* Background decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 400,
                  height: 400,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                  zIndex: 0
                }}
              />
              
              <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Box component={motion.div} variants={itemVariants}>
                      <Typography 
                        variant="h2" 
                        component="h1"
                        sx={{ 
                          fontWeight: 800,
                          mb: 2,
                          background: primaryGradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: { xs: '2.5rem', md: '3.5rem' }
                        }}
                      >
                        Revolutionizing Email <br /> With AI
                      </Typography>
                      
                      <Typography 
                        variant="h6" 
                        component="p"
                        color="text.secondary" 
                        sx={{ 
                          mb: 3,
                          maxWidth: 600,
                          lineHeight: 1.6,
                        }}
                      >
                        At Replai, we're building the future of intelligent email management. 
                        Our platform learns, adapts, and helps you focus on what matters most.
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={5}>
                    <Box 
                      component={motion.div} 
                      variants={itemVariants}
                      sx={{ 
                        display: { xs: 'none', md: 'block' },
                        position: 'relative'
                      }}
                    >
                      
                      {/* Can be replaced with an actual image file */}
                      <Box 
                        sx={{
                          width: '100%',
                          height: 300,
                          borderRadius: 4,
                          background: `url('https://img.freepik.com/premium-vector/aioptimized-communication-channels-abstract-concept-vector-illustration_107173-97809.jpg') center/cover`,
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          display: { xs: 'none', md: 'block' }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            </Box>
            
            {/* About Us Section */}
            <Container maxWidth="lg">
              <Box 
                component={motion.div} 
                variants={itemVariants}
                sx={{ mb: 8 }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: highlightColor,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.9rem'
                    }}
                  >
                    About Us
                  </Typography>
                  
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mt: 1,
                      mb: 3
                    }}
                  >
                    Our Story
                  </Typography>
                </Box>
                
                <Paper 
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decoration element */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: alpha(primaryColor, 0.15),
                      zIndex: 0
                    }}
                  />
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        mb: 3
                      }}
                    >
                      Replai is an AI-driven email automation platform that helps businesses manage their email communication more effectively. 
                      Our platform leverages advanced machine learning algorithms to analyze incoming emails, generate intelligent responses, 
                      and automate repetitive tasks.
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        fontWeight: 400
                      }}
                    >
                      By integrating with your existing email client, Replai enables you to respond to emails faster,
                      reduce manual effort, and improve customer satisfaction. We're passionate about helping businesses 
                      reclaim their time and focus on what truly matters.
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        mt: 4,
                        flexWrap: 'wrap'
                      }}
                    >
                      {['AI-Powered', 'Time-Saving', 'Seamless Integration', 'Secure'].map((tag) => (
                        <Chip 
                          key={tag}
                          label={tag}
                          size="medium"
                          icon={<BoltIcon fontSize="small" />}
                          sx={{
                            backgroundColor: alpha(primaryColor, 0.1),
                            color: highlightColor,
                            fontWeight: 500,
                            borderRadius: 2,
                            '& .MuiChip-icon': {
                              color: highlightColor
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
              
              {/* Our Mission Section */}
              <Box 
                component={motion.div} 
                variants={itemVariants}
                sx={{ mb: 8 }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                      <Typography
                        component="span"
                        sx={{ 
                          color: highlightColor,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontSize: '0.9rem',
                          display: 'block',
                          mb: 1
                        }}
                      >
                        Our Mission
                      </Typography>
                      
                      <Typography 
                        variant="h3" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 3,
                          fontSize: { xs: '2rem', sm: '2.5rem' }
                        }}
                      >
                        Why We Do What We Do
                      </Typography>
                      
                      <Box 
                        sx={{
                          width: 80,
                          height: 4,
                          borderRadius: 2,
                          background: primaryGradient,
                          mb: 3
                        }}
                      />
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                          mb: 3
                        }}
                      >
                        At Replai, we empower developers and businesses to streamline email communication with AI-driven automation.
                        Our goal is to provide intelligent, efficient, and personalized email responses that save time, 
                        enhance productivity, and drive success.
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          lineHeight: 1.8, 
                          fontSize: '1.1rem'
                        }}
                      >
                        With cutting-edge AI technology, seamless integration, and dedicated support, 
                        we help you stay ahead by transforming the way you manage your emails.
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: '100%' }}>
                      <Paper 
                        elevation={0}
                        sx={{
                          p: 4,
                          height: '100%',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.1),
                          background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Box 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 4
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: primaryGradient,
                              mr: 3
                            }}
                          >
                            <RocketLaunchIcon 
                              sx={{ 
                                fontSize: 30, 
                                color: theme.palette.common.white 
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="h5" fontWeight={700}>
                            Our Vision
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body1"
                          color="text.secondary"
                          sx={{ 
                            lineHeight: 1.8,
                            mb: 3,
                            fontSize: '1.05rem'
                          }}
                        >
                          To be the leading provider of AI-driven email automation solutions that revolutionize 
                          the way businesses communicate. We aim to deliver innovative, reliable, 
                          and scalable products that transform the email experience for users worldwide.
                        </Typography>
                        
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 4,
                            mt: 2
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: primaryGradient,
                              mr: 3
                            }}
                          >
                            <VisibilityIcon 
                              sx={{ 
                                fontSize: 30, 
                                color: theme.palette.common.white 
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="h5" fontWeight={700}>
                            Our Values
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          {['Innovation', 'Excellence', 'Integrity', 'Customer Focus'].map((value, index) => (
                            <Chip
                              key={value}
                              label={value}
                              sx={{
                                mr: 1,
                                mb: 1,
                                backgroundColor: alpha(primaryColor, 0.1),
                                color: highlightColor,
                                fontWeight: 500
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Values Cards */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 10 }}
              >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 2 
                    }}
                  >
                    What We Believe In
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      maxWidth: 700, 
                      mx: 'auto',
                      fontSize: '1.1rem'
                    }}
                  >
                    Our core values drive everything we do and shape the solutions we build.
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {companyValues.map((value, index) => (
                    <Grid item xs={12} sm={6} md={3} key={value.title}>
                      <Card 
                        elevation={0}
                        component={motion.div}
                        whileHover={{ 
                          y: -10, 
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 15px 30px rgba(0,0,0,0.3)'
                            : '0 15px 30px rgba(0,0,0,0.1)'
                        }}
                        transition={{ duration: 0.3 }}
                        sx={{ 
                          height: '100%',
                          borderRadius: 4,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                          p: 3
                        }}
                      >
                        <Box 
                          sx={{ 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            backgroundColor: alpha(primaryColor, 0.1),
                            color: highlightColor,
                          }}
                        >
                          {value.icon}
                        </Box>
                        
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {value.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {value.description}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              {/* Team Section */}
              <Box 
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 10 }}
                id="team"
              >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: highlightColor,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.9rem'
                    }}
                  >
                    The People
                  </Typography>
                  
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mt: 1,
                      mb: 2
                    }}
                  >
                    Meet Our Team
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      maxWidth: 700, 
                      mx: 'auto',
                      mb: 5,
                      fontSize: '1.1rem'
                    }}
                  >
                    The passionate individuals bringing Replai to life.
                  </Typography>
                </Box>
                
                <Grid container spacing={4} justifyContent="center">
                  {teamMembers.map((member) => (
                    <Grid item xs={12} sm={8} md={6} key={member.name}>
                      <Card 
                        elevation={0}
                        component={motion.div}
                        whileHover={{ 
                          y: -8, 
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 20px 40px rgba(0,0,0,0.3)'
                            : '0 20px 40px rgba(0,0,0,0.1)'  
                        }}
                        transition={{ duration: 0.3 }}
                        sx={{ 
                          overflow: 'hidden',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                          height: '100%',
                          position: 'relative'
                        }}
                      >
                        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ position: 'relative' }}>
                            <Box
                              component="img"
                              src={member.image}
                              alt={member.name}
                              sx={{
                                width: '100%',
                                height: '90%',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 100,
                                zIndex: 1
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ p: 3, flexGrow: 1 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                              {member.name}
                            </Typography>
                            
                            <Typography 
                              variant="subtitle1" 
                              color={highlightColor}
                              sx={{ 
                                fontWeight: 600,
                                mb: 2
                              }}
                            >
                              {member.role}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {member.bio}
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                              {member.skills.map((skill) => (
                                <Chip
                                  key={skill}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    mr: 1,
                                    mb: 1,
                                    backgroundColor: alpha(theme.palette.grey[500], 0.1)
                                  }}
                                />
                              ))}
                            </Box>
                            
                            <Typography 
                              variant="body1"
                              sx={{ 
                                fontStyle: 'italic',
                                fontWeight: 500,
                                color: 'text.secondary',
                                mb: 3
                              }}
                            >
                              {member.quote}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                {member.socialLinks && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {member.socialLinks.linkedin && (
                                      <Tooltip title="LinkedIn">
                                        <IconButton 
                                          size="small" 
                                          component={Link} 
                                          href={member.socialLinks.linkedin}
                                          target="_blank"
                                          rel="noopener"
                                          sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { color: '#0077b5' }
                                          }}
                                        >
                                          <LinkedInIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {member.socialLinks.github && (
                                      <Tooltip title="GitHub">
                                        <IconButton 
                                          size="small" 
                                          component={Link} 
                                          href={member.socialLinks.github}
                                          target="_blank"
                                          rel="noopener"
                                          sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { color: theme.palette.mode === 'dark' ? '#fff' : '#333' }
                                          }}
                                        >
                                          <GitHubIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {member.socialLinks.twitter && (
                                      <Tooltip title="Twitter">
                                        <IconButton 
                                          size="small" 
                                          component={Link} 
                                          href={member.socialLinks.twitter}
                                          target="_blank"
                                          rel="noopener"
                                          sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { color: '#1DA1F2' }
                                          }}
                                        >
                                          <TwitterIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                )}
                              </Box>
                              
                              {member.website && (
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  href={member.website} 
                                  target="_blank"
                                  rel="noopener"
                                  endIcon={<ArrowForwardIcon />}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  Portfolio
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              {/* Contact Section */}
              <Box 
                component={motion.div} 
                variants={itemVariants}
                sx={{ mb: 10 }}
                id="contact"
              >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: highlightColor,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.9rem'
                    }}
                  >
                    Get In Touch
                  </Typography>
                  
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mt: 1,
                      mb: 2
                    }}
                  >
                    Contact Us
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      maxWidth: 700, 
                      mx: 'auto',
                      mb: 5,
                      fontSize: '1.1rem'
                    }}
                  >
                    Have a question or want to learn more about our services? Reach out to us today!
                  </Typography>
                </Box>
                
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} md={6}>
                    <Card 
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                        p: 3,
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ 
                          fontWeight: 600
                        }}
                      >
                        Email Us
                      </Typography> 

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ color: highlightColor, mr: 2 }} />
                        <Typography variant="body1">
                          <Link 
                            href="mailto:hello@replai.tech"
                            color="inherit"
                            sx={{ fontWeight: 500 }}
                          >
                            <Typography variant="body1" color="inherit">
                              hello@replai.tech
                              </Typography>
                        </Link>
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                {/* // complete code */}
                </Grid>
              </Box>
            </Container>
          </Box>
          
          {/* Footer */}
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
