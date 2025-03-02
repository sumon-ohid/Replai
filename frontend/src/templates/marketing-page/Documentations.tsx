import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Footer from './components/Footer';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

// Icons
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SupportOutlinedIcon from '@mui/icons-material/SupportOutlined';
import CodeIcon from '@mui/icons-material/Code';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


// Syntax Highlighting
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Grid2 } from '@mui/material';

// Documentation Content Structure
const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <RocketLaunchOutlinedIcon />,
    subsections: [
      { id: 'introduction', title: 'Introduction', href: '#introduction' },
      { id: 'quick-setup', title: 'Quick Setup', href: '#quick-setup' },
      { id: 'system-requirements', title: 'System Requirements', href: '#system-requirements' },
    ],
  },
  {
    id: 'core-features',
    title: 'Core Features',
    icon: <AutoAwesomeOutlinedIcon />,
    subsections: [
      { id: 'email-processing', title: 'Email Processing', href: '#email-processing' },
      { id: 'ai-responses', title: 'AI Responses', href: '#ai-responses' },
      { id: 'templates', title: 'Templates & Customization', href: '#templates' },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: <KeyOutlinedIcon />,
    subsections: [
      { id: 'oauth-setup', title: 'OAuth Setup', href: '#oauth-setup' },
      { id: 'permissions', title: 'Required Permissions', href: '#permissions' },
      { id: 'security-best-practices', title: 'Security Best Practices', href: '#security-best-practices' },
    ],
  },
  {
    id: 'account-management',
    title: 'Account Management',
    icon: <AccountBoxOutlinedIcon />,
    subsections: [
      { id: 'profile-settings', title: 'Profile Settings', href: '#profile-settings' },
      { id: 'subscription-plans', title: 'Subscription Plans', href: '#subscription-plans' },
      { id: 'team-management', title: 'Team Management', href: '#team-management' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: <IntegrationInstructionsOutlinedIcon />,
    subsections: [
      { id: 'api-overview', title: 'API Overview', href: '#api-overview' },
      { id: 'endpoints', title: 'Endpoints', href: '#endpoints' },
      { id: 'rate-limits', title: 'Rate Limits', href: '#rate-limits' },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: <SupportOutlinedIcon />,
    subsections: [
      { id: 'common-issues', title: 'Common Issues', href: '#common-issues' },
      { id: 'faq', title: 'FAQ', href: '#faq' },
      { id: 'support-contact', title: 'Support Contact', href: '#support-contact' },
    ],
  },
];

export default function DocumentationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { scrollY } = useScroll();
  const ref = useRef(null);
  
  // State for active section and tab
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  // For scroll-based animations
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
        delay: i * 0.15,
        duration: 0.7,
        ease: "easeOut"
      }
    })
  };
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Example code snippets
  const codeExamples = {
    oauth: `// Example OAuth configuration
const oauthConfig = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'https://yourapp.com/oauth/callback',
  scope: 'email profile https://www.googleapis.com/auth/gmail.modify'
};

// Initialize the OAuth client
const oauthClient = new Replai.OAuth(oauthConfig);
const authUrl = oauthClient.getAuthorizationUrl();

// Redirect user to authUrl for authorization`,

    apiUsage: `// Example API usage
import { ReplaiClient } from 'replai-sdk';

// Initialize client with your API key
const client = new ReplaiClient({
  apiKey: 'YOUR_API_KEY'
});

// Process an email
async function processIncomingEmail(emailData) {
  try {
    const response = await client.emails.analyze({
      subject: emailData.subject,
      content: emailData.body,
      sender: emailData.from
    });
    
    console.log('Analysis results:', response.analysis);
    console.log('Suggested reply:', response.suggestedReply);
    
    return response;
  } catch (error) {
    console.error('Error processing email:', error);
  }
}`
  };
  
  // Section refs for scroll tracking
  const sectionRefs: { [key: string]: React.RefObject<null> } = {
    'getting-started': useRef(null),
    'core-features': useRef(null),
    'authentication': useRef(null),
    'account-management': useRef(null), 
    'api-reference': useRef(null),
    'troubleshooting': useRef(null),
  };
  
  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Find which section is currently in view
      Object.keys(sectionRefs).forEach((section) => {
        const element = sectionRefs[section].current;
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppTheme>
      <CssBaseline />
      
      {/* Main background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -4,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha('#101630', 0.97)} 0%, ${alpha('#050b1f', 0.98)} 100%)`
            : `linear-gradient(135deg, ${alpha('#f8faff', 0.97)} 0%, ${alpha('#ffffff', 0.98)} 100%)`
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
            ? 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.15) 0%, rgba(0, 0, 0, 0) 50%)'
            : 'radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 50%)',
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
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, ${alpha(theme.palette.primary.dark, 0.25)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.18)} 0%, transparent 70%)`,
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
            ? `radial-gradient(circle, ${alpha(theme.palette.secondary.dark, 0.25)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.15)} 0%, transparent 70%)`,
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
          opacity: theme.palette.mode === 'dark' ? 0.07 : 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Grid pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          opacity: theme.palette.mode === 'dark' ? 0.4 : 0.25,
          backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.3)} 1px, transparent 1px), 
                           linear-gradient(90deg, ${alpha(theme.palette.divider, 0.3)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
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
          pb: { xs: 6, sm: 8 },
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
                Documentation
              </Typography>
            </Breadcrumbs>
            </Box>          
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
            Documentation
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: 750, 
              mb: 4,
              lineHeight: 1.6
            }}
          >
            Welcome to the Replai documentation. Learn how to integrate our AI email assistant into your workflow and get the most out of our features.
          </Typography>
          
          {/* Search bar */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            sx={{ 
              maxWidth: 650, 
              mb: 6 
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
              }}
            >
              <IconButton sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search documentation..."
                inputProps={{ 'aria-label': 'search documentation' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Paper>
          </Box>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Box
        ref={ref}
        sx={{ 
          pb: { xs: 10, md: 15 },
          position: 'relative',
        }}
      >
      </Box>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Sidebar Navigation */}
            {!isMobile && (
              <Grid item xs={12} md={3} lg={2.5}>
                <Box 
                  sx={{ 
                    position: 'sticky',
                    top: 100,
                    maxHeight: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    pr: 2,
                    pb: 4,
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      textTransform: 'uppercase',
                      fontWeight: 700, 
                      fontSize: '0.75rem',
                      letterSpacing: 0.5,
                      mb: 2
                    }}
                  >
                    Documentation
                  </Typography>
                  
                  <List component="nav" dense disablePadding>
                    {documentationSections.map((section) => (
                      <React.Fragment key={section.id}>
                        <ListItem 
                          component="div"
                          button
                          disablePadding
                          onClick={() => handleSectionChange(section.id)}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            backgroundColor: activeSection === section.id 
                              ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.1)
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05)
                            },
                            pl: 1,
                            pr: 1,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: activeSection === section.id ? 'primary.main' : 'text.secondary' }}>
                            {section.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={section.title} 
                            primaryTypographyProps={{ 
                              fontWeight: activeSection === section.id ? 600 : 400,
                              color: activeSection === section.id ? 'primary.main' : 'text.primary'
                            }}
                          />
                        </ListItem>
                        
                        {activeSection === section.id && (
                          <List 
                            component="div" 
                            dense 
                            disablePadding
                            sx={{ ml: 4, mb: 1.5, mt: 0.5 }}
                          >
                            {section.subsections.map((subsection) => (
                              <ListItem 
                                component="a"
                                href={subsection.href}
                                key={subsection.id}
                                disablePadding
                                sx={{
                                  borderRadius: 1,
                                  mb: 0.3,
                                  fontSize: '0.875rem',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05)
                                  },
                                  pl: 1,
                                  pr: 1,
                                }}
                              >
                                <ListItemText 
                                  primary={subsection.title} 
                                  primaryTypographyProps={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}
            
            {/* Documentation Content */}
            <Grid item xs={12} md={9} lg={9.5}>
              {/* Getting Started Section */}
              <Box 
                ref={sectionRefs['getting-started']}
                component={motion.div}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={0}
                sx={{ mb: 8 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                  <RocketLaunchOutlinedIcon 
                    color="primary" 
                    fontSize="large"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h3" fontWeight={700} id="getting-started">
                    Getting Started
                  </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="introduction">
                  Introduction
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    lineHeight: 1.8,
                    mb: 3
                  }}
                >
                  Replai is an AI-powered email assistant that helps you manage your inbox efficiently. It processes incoming emails, 
                  suggests appropriate responses, and even handles routine correspondence automatically. This documentation will guide 
                  you through setting up and using Replai to streamline your email workflow.
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05),
                      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LightbulbOutlinedIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Pro Tip
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        Before you begin, make sure you have a Google account with Gmail enabled. Replai currently supports Gmail as its 
                        primary email provider, with more providers coming soon.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 5 }} id="quick-setup">
                  Quick Setup
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ lineHeight: 1.8 }}
                >
                  Getting started with Replai is simple. Follow these steps to set up your account and connect your email:
                </Typography>
                
                <Box 
                  sx={{ 
                    ml: 2, 
                    pl: 2, 
                    borderLeft: `2px solid ${theme.palette.divider}`,
                    mb: 4 
                  }}
                >
                  <Typography
                    component="div" 
                    variant="body1" 
                    sx={{ mb: 2 }}
                  >
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>1.</Box> Sign up for a Replai account at <Link href="https://replai.tech/signup" target="_blank">replai.tech/signup</Link>
                  </Typography>
                  
                  <Typography
                    component="div" 
                    variant="body1" 
                    sx={{ mb: 2 }}
                  >
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>2.</Box> Complete the onboarding process by connecting your Gmail account
                  </Typography>
                  
                  <Typography
                    component="div" 
                    variant="body1" 
                    sx={{ mb: 2 }}
                  >
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>3.</Box> Review and adjust the default settings for AI email processing
                  </Typography>
                  
                  <Typography
                    component="div" 
                    variant="body1"
                  >
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>4.</Box> Start using Replai to manage your inbox!
                  </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 5 }} id="system-requirements">
                  System Requirements
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ lineHeight: 1.8, mb: 2 }}
                >
                  Replai is a cloud-based solution that works with modern web browsers. Here are the minimum requirements:
                </Typography>
                
                <Box sx={{ mb: 6 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Supported Browsers
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label="Chrome 70+" size="small" />
                            <Chip label="Firefox 68+" size="small" />
                            <Chip label="Safari 14+" size="small" />
                            <Chip label="Edge 79+" size="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Email Providers
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label="Gmail" color="primary" size="small" />
                            <Chip label="Google Workspace" size="small" />
                            <Chip label="Outlook (Coming Soon)" size="small" variant="outlined" />
                            <Chip label="Exchange (Coming Soon)" size="small" variant="outlined" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              
              {/* Core Features Section */}
              <Box 
                ref={sectionRefs['core-features']}
                component={motion.div}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                sx={{ mb: 8 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                  <AutoAwesomeOutlinedIcon 
                    color="primary" 
                    fontSize="large"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h3" fontWeight={700} id="core-features">
                    Core Features
                  </Typography>
                </Box>
                  
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="email-processing">
                  Email Processing
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ lineHeight: 1.8, mb: 3 }}
                >
                  Replai's email processing engine analyzes incoming emails to understand their context and suggest appropriate responses. 
                  It uses a combination of machine learning algorithms and natural language processing to provide accurate and relevant suggestions.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="ai-responses">
                  AI Responses
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ lineHeight: 1.8, mb: 3 }}
                >   
                    Replai's AI responses are generated based on the content and context of the incoming email. The system learns from user interactions 
                    and feedback to improve the quality and relevance of its suggestions over time. Users can accept, modify, or reject the suggested 
                    responses to customize their email replies.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="templates">
                  Templates & Customization
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ lineHeight: 1.8 }}
                >
                    Replai allows users to create and manage email templates for common responses and queries. Templates can be customized with 
                    placeholders for dynamic content and personalized messages. Users can also define rules and triggers to automate the application 
                    of templates based on specific conditions.
                </Typography>
                </Box>
                
                {/* Authentication Section */}
                <Box
                  ref={sectionRefs['authentication']}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={2}
                  sx={{ mb: 8 }}
                >   

                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                    <KeyOutlinedIcon 
                        color="primary" 
                        fontSize="large"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="h3" fontWeight={700} id="authentication">
                        Authentication
                    </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="oauth-setup">
                    OAuth Setup
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    Replai uses OAuth 2.0 for secure authentication and authorization with email providers. To set up OAuth for your application, 
                    follow these steps:
                </Typography>

                <Box 
                    sx={{ 
                        ml: 2, 
                        pl: 2, 
                        borderLeft: `2px solid ${theme.palette.divider}`,
                        mb: 4 
                    }}
                >
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>1.</Box> Register your application with the email provider's developer console
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>2.</Box> Obtain the client ID and client secret for your application
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>3.</Box> Configure the OAuth redirect URI for authorization callbacks
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1"
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>4.</Box> Use the client ID and secret to initialize the OAuth client in your application
                    </Typography>
                </Box>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 5 }} id="permissions">
                    Required Permissions
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    When setting up OAuth for Replai, make sure to request the necessary permissions to access and manage user emails. The required 
                    permissions may vary based on the email provider and the scope of functionality you want to enable.
                </Typography>   

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2, mt: 5 }} id="security-best-practices">
                    Security Best Practices
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8 }}
                >
                    To ensure the security of user data and prevent unauthorized access to email accounts, follow these best practices when implementing 
                    authentication and authorization in your application:
                </Typography>

                <Box 
                    sx={{ 
                        ml: 2, 
                        pl: 2, 
                        borderLeft: `2px solid ${theme.palette.divider}`,
                        mb: 4 
                    }}
                >
                
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>1.</Box> Use secure HTTPS connections for all OAuth interactions
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>2.</Box> Store and transmit client secrets securely to prevent exposure
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1" 
                        sx={{ mb: 2 }}
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>3.</Box> Implement token validation and expiration checks to prevent misuse
                    </Typography>
                    
                    <Typography
                        component="div" 
                        variant="body1"
                    >
                        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>4.</Box> Regularly review and update OAuth configurations to maintain security
                    </Typography>
                </Box>
                </Box>
                
                {/* Account Management Section */}
                <Box
                  ref={sectionRefs['account-management']}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={3}
                  sx={{ mb: 8 }}
                >

                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                    <AccountBoxOutlinedIcon 
                        color="primary" 
                        fontSize="large"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="h3" fontWeight={700} id="account-management">
                        Account Management
                    </Typography>
                </Box>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="profile-settings">
                    Profile Settings
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    Manage your Replai account settings and preferences from the Profile section. Update your personal information, change your 
                    password, and adjust notification settings to suit your workflow.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="subscription-plans">
                    Subscription Plans
                </Typography>

                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    Replai offers flexible subscription plans to meet the needs of individuals, teams, and organizations. Choose a plan that fits your 
                    usage requirements and upgrade or downgrade as needed to access additional features and resources.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="team-management">
                    Team Management
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8 }}
                >
                    Collaborate with your team members by inviting them to join your Replai workspace. Assign roles and permissions to control access 
                    to features and data, and streamline communication and workflow management within your organization.
                </Typography>
                </Box>

                {/* API Reference Section */}

                <Box
                  ref={sectionRefs['api-reference']}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={4}
                  sx={{ mb: 8 }}
                >   

                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                    <IntegrationInstructionsOutlinedIcon 
                        color="primary" 
                        fontSize="large"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="h3" fontWeight={700} id="api-reference">
                        API Reference
                    </Typography>
                </Box>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="api-overview">
                    API Overview
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    Replai provides a RESTful API for integrating email processing and AI responses into your applications. The API allows you to 
                    interact with the Replai platform programmatically and leverage its features to enhance your email workflow.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="endpoints">
                    Endpoints
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    The Replai API offers various endpoints for processing emails, retrieving analysis results, and managing templates and settings. 
                    Each endpoint serves a specific purpose and requires appropriate authentication and permissions to access.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="rate-limits">
                    Rate Limits
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8 }}
                >   

                    To ensure fair usage and prevent abuse of the API, Replai enforces rate limits on API requests. The rate limits define the number 
                    of requests that can be made within a specific time period and help maintain the stability and performance of the platform.
                </Typography>
                </Box>

                {/* Troubleshooting Section */}
                <Box
                  ref={sectionRefs['troubleshooting']}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={5}
                  sx={{ mb: 8 }}
                >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                  }}
                >
                    <SupportOutlinedIcon 
                        color="primary" 
                        fontSize="large"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="h3" fontWeight={700} id="troubleshooting">
                        Troubleshooting
                    </Typography>
                </Box>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="common-issues">
                    Common Issues
                </Typography>
                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8, mb: 3 }}
                >
                    If you encounter any issues or errors while using Replai, refer to the troubleshooting guide for solutions and workarounds. 
                    Common issues related to email processing, AI responses, and API interactions are addressed with step-by-step instructions.
                </Typography>

                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }} id="support-resources">
                    Support Resources
                </Typography>   

                <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ lineHeight: 1.8 }}
                >
                    For additional assistance and support, reach out to the Replai team through the support portal. Submit a ticket, request a 
                    callback, or explore the knowledge base for answers to frequently asked questions and troubleshooting tips.
                </Typography>
                </Box>
                </Grid>
            </Grid>
        </Container>
        <Footer />
    </AppTheme>
  );
}
