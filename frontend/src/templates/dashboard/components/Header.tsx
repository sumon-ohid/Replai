import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Stack, 
  Box, 
  Typography, 
  IconButton, 
  Badge, 
  Avatar, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  InputBase,
  Button,
  Chip,
  useMediaQuery
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Icons
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';

// Components
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import CustomDatePicker from './CustomDatePicker';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { useAuth } from "../../../AuthContext";
import { useNavigate } from 'react-router-dom';

// Logo
import logo from '../../../../logo/logo_light.png';
import { CreditCard } from '@mui/icons-material';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
  position: 'sticky',
  top: 10,
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "transparent",
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  borderRadius: '20px',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
  },
  mb: 3,
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '10px',
  backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.12 : 0.25),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 0.15),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  transition: theme.transitions.create('width'),
  overflow: 'hidden',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '28ch',
      '&:focus': {
        width: '36ch',
      },
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 0.7,
  }
}));

const HeaderButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.main, 0.05)
    : alpha(theme.palette.primary.main, 0.08),
  borderRadius: '10px',
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: 'all 0.2s',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
  }
}));

const UserChip = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: theme.spacing(0.5, 1.5, 0.5, 1),
  fontWeight: 500,
  textTransform: 'none',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.mode === 'dark' 
  ? alpha(theme.palette.primary.main, 0.15)
  : alpha(theme.palette.primary.main, 0.1),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.1),
  },
  boxShadow: 'none',
  gap: theme.spacing(1),
}));

const NotificationItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.3)
      : alpha(theme.palette.background.paper, 0.8),
  },
  cursor: 'pointer',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  
  // Sample notifications
  const notifications = [
    { 
      id: 1, 
      title: "Welcome to Replai",
      message: "You have successfully signed up", 
      time: "Just now", 
      read: true,
      type: "success"
    },
    { 
      id: 2, 
      title: "System update", 
      message: "New features are available",
      time: "Just now", 
      read: true,
      type: "info"
    }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };
  
  const toggleSearch = () => {
    setSearchActive(!searchActive);
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navigate = useNavigate();
  
  return (
    <StyledAppBar elevation={0}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, xl: 4 },
        py: 1.5,
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 0.5 }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          {/* <Box
            component={motion.img}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={logo}
            alt="Replai"
            sx={{ 
              height: 28,
              filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none',
              display: { xs: 'none', sm: 'block' }
            }}
          /> */}
          
          {/* Breadcrumbs navigation */}
          {!isMobile && (
            <Box ml={2} sx={{ display: { xs: 'none', md: 'block' } }}>
              <NavbarBreadcrumbs />
            </Box>
          )}
        </Stack>
        
        <Stack 
          direction="row" 
          spacing={{ xs: 0.5, md: 1.5 }}
          alignItems="center"
        >
          {/* Search */}
          {/* {!isMobile ? (
            <Search>
              <SearchIconWrapper>
                <SearchRoundedIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          ) : searchActive ? (
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.palette.background.paper,
                px: 2
              }}
            >
              <IconButton onClick={toggleSearch} sx={{ mr: 1 }}>
                <CloseRounded fontSize="small" />
              </IconButton>
              <StyledInputBase
                autoFocus
                fullWidth
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>
          ) : (
            <HeaderButton 
              aria-label="search" 
              onClick={toggleSearch}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <SearchRoundedIcon fontSize="small" />
            </HeaderButton>
          )} */}
          
          {/* Date Picker */}
          {!isMobile && <CustomDatePicker />}
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <HeaderButton 
              aria-label="notifications" 
              onClick={handleOpenNotifications}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsRoundedIcon fontSize="small" />
              </Badge>
            </HeaderButton>
          </Tooltip>
          
          {/* Theme toggle */}
          <ColorModeIconDropdown />
          
          {/* User profile */}
          <UserChip
            onClick={handleOpenUserMenu}
            endIcon={<KeyboardArrowDownIcon fontSize="small" />}
            variant="outlined"
            disableElevation
          >
            <Avatar
              src={user?.profilePicture}
              alt={user?.name}
              sx={{ width: 28, height: 28 }}
            />
            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                {user?.name.split(' ')[0]}
              </Typography>
            )}
          </UserChip>
        </Stack>
      </Box>
      
      {/* User profile menu */}
      <Menu
        anchorEl={userMenuAnchor}
        id="user-menu"
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        onClick={handleCloseUserMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            borderRadius: '10px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            src={user?.profilePicture}
            alt={user?.name}
            sx={{ 
              width: 50, 
              height: 50,
              mb: 1,
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1, borderRadius: '8px', textTransform: 'none' }}
            onClick={() => navigate('/settings')}
          >
            Manage Account
          </Button>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <DashboardRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </MenuItem>
        
        <MenuItem onClick={() => navigate('/inbox')}>
          <ListItemIcon>
            <EmailRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Emails" />
        </MenuItem>
        
        <MenuItem onClick={() => navigate('/calendar')}>
          <ListItemIcon>
            <CalendarTodayRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Calender" />
        </MenuItem>
        
        <MenuItem onClick={() => navigate('/billing')}>
          <ListItemIcon>
            <CreditCardRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Plan & Billings" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        anchorEl={notificationsAnchor}
        id="notifications-menu"
        open={Boolean(notificationsAnchor)}
        onClose={handleCloseNotifications}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 360,
            maxHeight: 480,
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            borderRadius: '10px',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Chip 
            label={`${unreadNotifications} new`} 
            size="small"
            color="primary"
            sx={{ height: 22, fontWeight: 500 }}
          />
        </Box>
        
        <Divider />
        
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      mr: 1.5, 
                      backgroundColor: notification.type === 'success' 
                        ? alpha(theme.palette.success.main, 0.1) 
                        : notification.type === 'important' 
                          ? alpha(theme.palette.error.main, 0.1) 
                          : alpha(theme.palette.info.main, 0.1),
                      color: notification.type === 'success' 
                        ? theme.palette.success.main
                        : notification.type === 'important' 
                          ? theme.palette.error.main 
                          : theme.palette.info.main,
                    }}
                  >
                    {notification.type === 'success' && <CheckCircleIcon />}
                    {notification.type === 'important' && <NotificationImportantIcon />}
                    {notification.type === 'info' && <EmailRoundedIcon />}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: theme.palette.primary.main,
                            ml: 1
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </NotificationItem>
            ))}
            <Box sx={{ py: 1, textAlign: 'center' }}>
              <Button 
                size="small" 
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 500, 
                  color: theme.palette.primary.main 
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Menu>
    </StyledAppBar>
  );
}
