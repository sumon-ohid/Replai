import * as React from "react";
import { useNavigate } from "react-router-dom";
import { styled, alpha, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";

// Icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';

// Components
import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import { useAuth } from "../../../AuthContext";
import Logo from "../../../../logo/logo_light.png";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(0.75, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.background.default, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.default, 1),
    borderColor: alpha(theme.palette.primary.main, 0.25),
  },
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "100%",
    maxWidth: 250,
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(2.5)})`,
    fontSize: "0.875rem",
    width: "100%",
  },
}));

// Define notification types for better type safety
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  read: boolean;
  email?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  errors: number;
  warnings: number;
}

export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationsAnchor, setNotificationsAnchor] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [notificationStats, setNotificationStats] = React.useState<NotificationStats>({
    total: 0,
    unread: 0,
    errors: 0,
    warnings: 0
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications when notification menu opens
  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      interface NotificationsResponse {
        success: boolean;
        data: Notification[];
        stats: NotificationStats;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get<NotificationsResponse>(`${apiBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 5
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setNotificationStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.post(`${apiBaseUrl}/api/notifications/mark-read/${notificationId}`,{}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setNotificationStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.post(`${apiBaseUrl}/api/notifications/mark-all-read` ,{}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setNotificationStats(prev => ({
        ...prev,
        unread: 0
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Format the notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If less than 24 hours ago, show relative time
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show the date
    return format(date, 'MMM d, yyyy');
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleUserMenuClose();
  };

  // Refresh notifications periodically when user is active
  React.useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();
    
    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningAmberRoundedIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'success':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'info':
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Generate user initials
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const NotificationItem = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.background.paper, 0.3)
          : alpha(theme.palette.background.paper, 0.8),
    },
    cursor: "pointer",
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  }));

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: "auto", md: "none" },
        boxShadow: theme.shadows[2],
        bgcolor: "background.paper",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        backgroundImage: "none",
        top: "var(--template-frame-height, 0px)",
      }}
    >
      <Toolbar variant="regular">
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={Logo} alt="Replai" style={{ height: 36, maxWidth: 110 }} />
        </Box>

        {/* Right side actions */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Help button */}
          <IconButton
            size="small"
            onClick={() =>
              (window.location.href = "mailto:support@replai.tech")
            }
            sx={{
              fontSize: "1.25rem",
              borderRadius: 1,
              color:
                theme.palette.mode === "dark"
                  ? "text.secondary"
                  : "text.primary",
            }}
          >
            <HelpOutlineRoundedIcon fontSize="inherit" />
          </IconButton>

          {/* Notifications button */}
          <IconButton
            size="small"
            onClick={handleNotificationsOpen}
            sx={{
              fontSize: "1.25rem",
              borderRadius: 1,
              color:
                theme.palette.mode === "dark"
                  ? "text.secondary"
                  : "text.primary",
            }}
          >
            <Badge
              badgeContent={notificationStats.unread}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  height: 16,
                  minWidth: 16,
                },
              }}
            >
              <NotificationsRoundedIcon fontSize="inherit" />
            </Badge>
          </IconButton>

          {/* Theme toggle */}
          <ColorModeIconDropdown />

          {/* User profile */}
          <IconButton
            size="small"
            onClick={handleUserMenuOpen}
            sx={{ ml: 0.5 }}
          >
            {user?.profilePicture ? (
              <Avatar
                src={user.profilePicture}
                alt={user.name.substring(0, 15) || "User"}
                sx={{
                  width: 32,
                  height: 32,
                  border: "2px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {getUserInitials()}
              </Avatar>
            )}
          </IconButton>

          {/* Menu button */}
          <MenuButton
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ ml: 0.5 }}
          >
            <MenuRoundedIcon />
          </MenuButton>
        </Stack>

        {/* Mobile sidebar */}
        <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />

        {/* Notifications menu */}
        <Menu
          anchorEl={notificationsAnchor}
          id="notifications-menu"
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
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
              label={`${notificationStats.unread} new`} 
              size="small"
              color="primary"
              sx={{ height: 22, fontWeight: 500 }}
            />
          </Box>
          
          <Divider />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
              <Button 
                size="small" 
                onClick={fetchNotifications}
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Box>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id}
                  onClick={() => markAsRead(notification._id)}
                  sx={{
                    backgroundColor: !notification.read 
                      ? alpha(theme.palette.primary.main, 0.05) 
                      : 'transparent'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        mr: 1.5, 
                        backgroundColor: notification.type === 'success' 
                          ? alpha(theme.palette.success.main, 0.1) 
                          : notification.type === 'error' 
                            ? alpha(theme.palette.error.main, 0.1) 
                            : notification.type === 'warning'
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(theme.palette.info.main, 0.1),
                        color: notification.type === 'success' 
                          ? theme.palette.success.main
                          : notification.type === 'error' 
                            ? theme.palette.error.main 
                            : notification.type === 'warning'
                              ? theme.palette.warning.main
                              : theme.palette.info.main,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
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
                      {notification.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {notification.email}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatNotificationTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </NotificationItem>
              ))}
              <Box sx={{ 
                py: 1.5, 
                px: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Button 
                  size="small" 
                  onClick={markAllAsRead}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 500
                  }}
                >
                  Mark All as Read
                </Button>
                <Button 
                  size="small" 
                  onClick={() => navigate('/notifications')}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 500, 
                    color: theme.palette.primary.main 
                  }}
                >
                  View All
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

        {/* User Profile Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              overflow: "visible",
              borderRadius: 2,
              width: 220,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              },
            },
          }}
        >
          {/* User profile menu content */}
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
      </Toolbar>
    </AppBar>
  );
}

export function CustomIcon() {
  return (
    <Box
      sx={{
        width: "1.5rem",
        height: "1.5rem",
        bgcolor: "black",
        borderRadius: "999px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        backgroundImage:
          "linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)",
        color: "hsla(210, 100%, 95%, 0.9)",
        border: "1px solid",
        borderColor: "hsl(210, 100%, 55%)",
        boxShadow: "inset 0 2px 5px rgba(255, 255, 255, 0.3)",
      }}
    >
      <DashboardRoundedIcon color="inherit" sx={{ fontSize: "1rem" }} />
    </Box>
  );
}