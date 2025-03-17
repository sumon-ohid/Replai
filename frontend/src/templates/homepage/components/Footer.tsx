import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FacebookIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/X";
import SitemarkIcon from "./SitemarkIcon";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

// Additional icons
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import logo from "../../../../logo/logo_light.png";

function Copyright() {
  return (
    <Typography 
      variant="body2" 
      sx={{ 
        color: "text.secondary",
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        fontWeight: 400,
        opacity: 0.9
      }}
    >
      {"Copyright © "}
      <Link 
        color="inherit" 
        href="#"
        sx={{
          textDecoration: 'none',
          position: 'relative',
          fontWeight: 500,
          '&:hover': {
            color: 'primary.main',
          }
        }}
      >
        replai.tech
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Footer links grouped by category
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Use Cases", href: "#workflow" },
        { name: "Stats", href: "#stats" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Blog", href: "/blog" },
        { name: "Community", href: "/community" },
        { name: "Knowledge Base", href: "/knowledge" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about-us" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Press", href: "/press" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", href: "/privacy" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Cookie Policy", href: "/privacy" },
        { name: "Security", href: "/privacy" },
      ]
    }
  ];

  // Mobile footer section expansion
  const [expandedSection, setExpandedSection] = React.useState<number | null>(null);
  
  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <Box 
      component="footer"
      sx={{
        position: 'relative',
        mt: { xs: 4, md: 8 },
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
          : `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
      }}
    >
      {/* Background decorative elements */}
      <Box 
        component={motion.div}
        animate={{
          y: [10, -10],
          rotate: [0, 5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: 150, md: 240 },
          height: { xs: 150, md: 240 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      
      <Box 
        component={motion.div}
        animate={{
          y: [-5, 15],
          rotate: [0, -3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Main footer content */}
        <Box 
          sx={{ 
            pt: { xs: 6, sm: 8, md: 10 },
            pb: { xs: 4, sm: 6, md: 8 }
          }}
        >
          <Grid container spacing={4}>
            {/* Logo and description column */}
            <Grid item xs={12} md={4}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2.5 
                  }}
                >
                  <Box 
                    component="img" 
                    src={logo}
                    alt="Replai" 
                    sx={{ 
                      height: 36,
                      mr: 1,
                      filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none'
                    }}
                  />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      background: theme.palette.mode === 'dark' 
                        ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                        : 'inherit',
                      WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : 'unset',
                      WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
                    }}
                  >
                    {/* Replai */}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    mb: 3,
                    maxWidth: 300,
                    lineHeight: 1.7,
                  }}
                >
                  Transforming email workflows with AI to help you save time and respond more effectively.
                </Typography>

                {/* Social media icons */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {[
                    { icon: <TwitterIcon fontSize="small" />, label: "Twitter" },
                    { icon: <LinkedInIcon fontSize="small" />, label: "LinkedIn" },
                    { icon: <FacebookIcon fontSize="small" />, label: "GitHub" },
                  ].map((social, index) => (
                    <IconButton
                      key={`social-${index}`}
                      component={motion.button}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }}
                      whileTap={{ scale: 0.95 }}
                      size="small"
                      aria-label={social.label}
                      sx={{
                        color: 'text.secondary',
                        borderRadius: '10px',
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* Desktop footer links - only shown on tablet and larger */}
            {!isMobile && (
              <>
                {footerLinks.map((group, index) => (
                  <Grid item xs={6} sm={3} md={2} key={`group-${index}`}>
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2.5,
                          color: theme.palette.mode === 'dark' ? 'white' : 'text.primary'
                        }}
                      >
                        {group.title}
                      </Typography>
                      
                      <Stack spacing={2}>
                        {group.links.map((link, linkIndex) => (
                          <Link
                            key={`link-${index}-${linkIndex}`}
                            href={link.href}
                            color="text.secondary"
                            variant="body2"
                            underline="none"
                            sx={{ 
                              transition: 'color 0.2s',
                              fontWeight: 500,
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </>
            )}

            {/* Mobile accordion footer links - only shown on mobile */}
            {isMobile && (
              <Grid item xs={12}>
                {footerLinks.map((group, index) => (
                  <Box
                    key={`mobile-group-${index}`}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    sx={{
                      mb: 1.5,
                      borderBottom: expandedSection !== index ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none'
                    }}
                  >
                    <Box
                      onClick={() => toggleSection(index)}
                      sx={{
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: expandedSection === index ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {group.title}
                      </Typography>
                      
                      <Box
                        component={motion.div}
                        animate={{ rotate: expandedSection === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{ color: expandedSection === index ? 'primary.main' : 'text.secondary' }}
                      >
                        <ArrowForwardIcon 
                          sx={{ 
                            fontSize: 18,
                            transform: 'rotate(90deg)'
                          }} 
                        />
                      </Box>
                    </Box>
                    
                    <AnimatePresence>
                      {expandedSection === index && (
                        <Box
                          component={motion.div}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          sx={{ overflow: 'hidden' }}
                        >
                          <Stack spacing={2} sx={{ pb: 2.5 }}>
                            {group.links.map((link, linkIndex) => (
                              <Link
                                key={`mobile-link-${index}-${linkIndex}`}
                                href={link.href}
                                color="text.secondary"
                                variant="body2"
                                underline="none"
                                sx={{ 
                                  transition: 'color 0.2s',
                                  fontWeight: 500,
                                  pl: 1,
                                  '&:hover': {
                                    color: 'primary.main'
                                  }
                                }}
                              >
                                {link.name}
                              </Link>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </AnimatePresence>
                  </Box>
                ))}
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Newsletter subscription */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ mb: { xs: 4, md: 8 } }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.4)
                : alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: theme.palette.divider,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background effect */}
            <Box
              sx={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <EmailOutlinedIcon 
                      color="primary"
                      sx={{ fontSize: 28 }}
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.mode === 'dark' ? 'white' : 'text.primary'
                      }}
                    >
                      Stay up to date
                    </Typography>
                  </Stack>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      mb: { xs: 2, md: 0 },
                      maxWidth: 450,
                      lineHeight: 1.7
                    }}
                  >
                    Subscribe to our newsletter to get the latest updates on feature releases, tips, and special offers.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box
                    component="form"
                    noValidate
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1.5, sm: 1 }
                    }}
                  >
                    <TextField
                      placeholder="Enter your email"
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        }
                      }}
                    />
                    
                    <Button
                      variant="contained"
                      endIcon={<SendOutlinedIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        borderRadius: '8px', 
                        textTransform: 'none',
                        minWidth: 120,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                          : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      Subscribe
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        {/* Bottom bar with copyright info */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 3,
            pb: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Copyright />
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 3 }}
            alignItems="center"
          >
            <Stack 
              direction="row" 
              spacing={3}
              divider={
                <Box 
                  component="span" 
                  sx={{ 
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`, 
                    height: 12, 
                    alignSelf: 'center' 
                  }}
                />
              }
            >
              <Link
                href="#"
                color="text.secondary"
                variant="body2"
                underline="none"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Terms
              </Link>
              <Link
                href="#"
                color="text.secondary"
                variant="body2"
                underline="none"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Privacy
              </Link>
              <Link
                href="#"
                color="text.secondary"
                variant="body2"
                underline="none"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Cookies
              </Link>
            </Stack>
            
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              size="small"
              aria-label="Scroll to top"
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: '8px',
                p: 0.75,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                }
              }}
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}