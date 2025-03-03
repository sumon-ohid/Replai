import * as React from 'react';
import { styled, alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import Sitemark from './SitemarkIcon';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { Card, Stack, Avatar, Paper } from '@mui/material';
import SitemarkIcon from './SitemarkIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import SupportOutlinedIcon from '@mui/icons-material/SupportOutlined';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.65),
  boxShadow: theme.shadows[2],
  padding: '8px 12px',
}));

// Navigation links
const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'FAQ', href: '#faq' }
];

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Add scroll listener to change nav appearance
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const handleSignUpClick = () => { 
    navigate('/signup');
  };

  return (
    <AppBar
      component={motion.div}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
        transition: 'all 0.3s ease',
        transform: scrolled ? 'translateY(-12px)' : 'translateY(0)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar 
          variant="dense" 
          disableGutters
          sx={{
            py: scrolled ? 1 : { xs: 1, md: 1.5 },
            transition: 'all 0.3s ease',
            boxShadow: scrolled 
              ? `0 8px 20px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.06)}`
              : 'none',
            background: alpha(
              theme.palette.background.default,
              scrolled ? (theme.palette.mode === 'dark' ? 0.8 : 0.9) : 0.65
            ),
            backdropFilter: 'blur(24px)',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              px: 0,
              gap: 0.5
            }}
          >
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            >
              <Sitemark />
            </Box>

            {/* Desktop navigation */}
            <Box 
              sx={{ 
                display: { xs: 'none', lg: 'flex' },
                ml: 4,
                gap: 1
              }}
            >
              {navItems.map((item) => (
                <Button 
                  key={item.label}
                  variant="text" 
                  color="inherit"
                  component={motion.button}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  href={item.href}
                  sx={{
                    px: 1.5,
                    fontSize: '0.95rem',
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      background: 'transparent'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Desktop actions */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <Button 
              onClick={handleSignInClick} 
              color="inherit" 
              variant="text" 
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              size="medium" 
              sx={{
                borderRadius: 3,
                px: 2,
                py: 1,
                color: theme.palette.text.secondary,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              Sign in
            </Button>

            <Button 
              onClick={handleSignUpClick} 
              color="primary" 
              variant="contained" 
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              size="medium" 
              sx={{
                borderRadius: 3,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              Try for free
            </Button>

            <ColorModeIconDropdown />
          </Box>

          {/* Mobile action buttons */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1.5 }}>
            <Button
              onClick={handleSignInClick}
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                borderRadius: 2.5,
                px: 2,
                py: 0.8,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5
                }
              }}
            >
              Sign in
            </Button>

            <ColorModeIconDropdown size="medium" />

            <IconButton 
              aria-label="Menu button" 
              onClick={toggleDrawer(true)}
              sx={{
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.divider, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.divider, 0.2),
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile drawer */}
            <Drawer
              anchor="right"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  width: { xs: '100%', sm: 400 },
                  backgroundImage: theme.palette.mode === 'dark'
                    ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
                    : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
                  backdropFilter: 'blur(20px)',
                },
              }}
            >
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Drawer header */}
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SitemarkIcon />
                  </Box>
                  
                  <IconButton 
                    onClick={toggleDrawer(false)}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.text.primary,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                      }
                    }}
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                
                {/* Drawer content - Mobile navigation */}
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      mb: 1.5,
                    }}
                  >
                    NAVIGATION
                  </Typography>
                  
                  <Stack spacing={0.5}>
                    {navItems.map((item, index) => (
                      <Button
                        key={`mobile-${item.label}`}
                        component={motion.button}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        href={item.href}
                        onClick={toggleDrawer(false)}
                        variant="text"
                        color="inherit"
                        fullWidth
                        sx={{
                          py: 1.5,
                          px: 1.5,
                          justifyContent: 'flex-start',
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Stack>
                  
                  <Divider sx={{ my: 3, opacity: 0.6 }} />
                  
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      mb: 1.5,
                    }}
                  >
                    RESOURCES
                  </Typography>
                  
                  <Stack spacing={0.5}>
                    {[
                      { icon: <ArticleOutlinedIcon fontSize="small" />, label: 'Documentation', href: '/docs' },
                      { icon: <SupportOutlinedIcon fontSize="small" />, label: 'Support' },
                      { icon: <MailOutlinedIcon fontSize="small" />, label: 'Contact us' },
                    ].map((item) => (
                      <Button
                        key={`resource-${item.label}`}
                        component={motion.button}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        variant="text"
                        color="inherit"
                        fullWidth
                        startIcon={item.icon}
                        onClick={item.href ? () => navigate(item.href) : undefined}
                        sx={{
                          py: 1.2,
                          px: 1.5,
                          justifyContent: 'flex-start',
                          color: theme.palette.text.secondary,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                {/* Drawer footer */}
                <Box sx={{ p: 2, mt: 'auto' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      mb: 2,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mb: 1.5
                      }}
                    >
                      <DashboardOutlinedIcon />
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5
                      }}
                    >
                      Try Replai for Free
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2
                      }}
                    >
                      Get started with our 14-day free trial. No credit card required.
                    </Typography>

                    <Button
                      onClick={handleSignUpClick}
                      variant="contained"
                      color="primary"
                      component={motion.button}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      fullWidth
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderRadius: 2.5,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      Start Free Trial
                    </Button>
                  </Paper>

                  <Button
                    onClick={handleSignInClick}
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    startIcon={<LockOutlinedIcon />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      borderWidth: 1.5,
                      borderColor: alpha(theme.palette.divider, 0.8),
                      color: theme.palette.text.secondary,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: theme.palette.divider,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                      }
                    }}
                  >
                    Sign in to your account
                  </Button>
                </Box>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}