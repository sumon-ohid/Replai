import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/X";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion } from 'framer-motion';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportOutlinedIcon from '@mui/icons-material/SupportOutlined';
import logo from "../../../../logo/logo_light.png";
import DocumentIcon from '@mui/icons-material/DescriptionOutlined';

function Copyright() {
  return (
    <Typography 
      variant="body2" 
      sx={{ 
        color: "text.secondary",
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        fontWeight: 400
      }}
    >
      {"© "}
      <Link 
        color="inherit" 
        href="https://replai.tech"
        sx={{
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            color: 'primary.main',
          }
        }}
      >
        Replai
      </Link>
      {" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function DashboardFooter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Quick access links for dashboard context
  const quickLinks = [
    { name: "Documentation", href: "/docs", icon: <DocumentIcon fontSize="small" /> },
    { name: "Support", href: "/contact", icon: <SupportOutlinedIcon fontSize="small" /> }
  ];
  
  // Legal links
  const legalLinks = [
    { name: "Terms", href: "/privacy" },
    { name: "Privacy", href: "/privacy" },
    { name: "Security", href: "/privacy" }
  ];
  
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
        mt: 'auto',
        pt: { xs: 2, sm: 3 },
        pb: { xs: 2, sm: 3 },
        overflow: 'hidden',
        background: "transparent",
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: 'blur(8px)',
        width: '90%',
        margin: 'auto',
      }}
    >
      {/* Subtle background glow effect */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: '-30%',
          right: '-5%',
          width: { xs: 180, sm: 250 },
          height: { xs: 180, sm: 250 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          {/* Logo and copyright */}
          <Grid item xs={12} sm={4}>
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'center', sm: 'flex-start' },
                mb: { xs: 2, sm: 0 }
              }}
            >
              <Box 
                component="img" 
                src={logo}
                alt="Replai" 
                sx={{ 
                  height: 28,
                  mr: { xs: 0, sm: 1.5 },
                  mb: { xs: 1, sm: 0 },
                  filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none'
                }}
              />
              
              {!isMobile && <Copyright />}
            </Box>
          </Grid>
          
          {/* Quick links */}
          <Grid item xs={12} sm={4}>
            <Stack 
              direction="row" 
              spacing={{ xs: 1.5, sm: 3 }}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              {quickLinks.map((link, index) => (
                <Link
                  key={`quick-link-${index}`}
                  href={link.href}
                  component={motion.a}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  {link.icon && <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{link.icon}</Box>}
                  {link.name}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          {/* Social and scroll to top */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: { xs: 'center', sm: 'flex-end' },
            }}>
              <Stack direction="row" spacing={1} sx={{ mr: { xs: 1, sm: 2 } }}>
                {[
                  { icon: <TwitterIcon fontSize="small" />, label: "Twitter", href: "https://twitter.com/replaitech" },
                  { icon: <LinkedInIcon fontSize="small" />, label: "LinkedIn", href: "https://linkedin.com/company/replaitech" },
                  { icon: <GitHubIcon fontSize="small" />, label: "GitHub", href: "https://github.com/replaitech" },
                ].map((social, index) => (
                  <IconButton
                    key={`social-${index}`}
                    component={motion.a}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    size="small"
                    aria-label={social.label}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
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
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  }
                }}
              >
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        {/* Mobile copyright and legal links */}
        {isMobile && (
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Stack 
              direction="row" 
              spacing={2}
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
              sx={{ mb: 1 }}
            >
              {legalLinks.map((link, index) => (
                <Link
                  key={`legal-link-${index}`}
                  href={link.href}
                  color="text.secondary"
                  variant="body2"
                  underline="none"
                  sx={{ 
                    fontSize: '0.75rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
            
            <Copyright />
          </Box>
        )}
        
        {/* Desktop legal links */}
        {!isMobile && (
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
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
              {legalLinks.map((link, index) => (
                <Link
                  key={`legal-link-${index}`}
                  href={link.href}
                  color="text.secondary"
                  variant="body2"
                  underline="none"
                  sx={{ 
                    fontSize: '0.75rem',
                    transition: 'color 0.2s',
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
      </Container>
    </Box>
  );
}