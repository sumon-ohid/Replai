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
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

// Components
import SideMenuMobile from "./SideMenuMobile";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import { useAuth } from "../../../AuthContext";
import Logo from "../../../../logo/logo_light.png";

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
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "email" | "alert" | "warning" | "success";
}

export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationsAnchor, setNotificationsAnchor] =
    React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
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

   // Sample notifications
   const notifications = [
    {
      id: 1,
      title: "Welcome to Replai",
      message: "You have successfully signed up",
      time: "Just now",
      read: true,
      type: "success",
    },
    {
      id: 2,
      title: "System update",
      message: "New features are available",
      time: "Just now",
      read: true,
      type: "info",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "email":
        return <MarkEmailReadRoundedIcon fontSize="small" color="primary" />;
      case "alert":
        return <CampaignRoundedIcon fontSize="small" color="info" />;
      case "warning":
        return <WarningAmberRoundedIcon fontSize="small" color="warning" />;
      case "success":
        return <CheckCircleRoundedIcon fontSize="small" color="success" />;
      default:
        return <MarkEmailReadRoundedIcon fontSize="small" />;
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

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

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
        // borderRadius: 2,
        // border: 1,
        // borderColor: "divider",
      }}
    >
      <Toolbar variant="regular">
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={Logo} alt="Replai" style={{ height: 36, maxWidth: 110 }} />
        </Box>

        {/* Search Bar */}
        {/* <SearchWrapper>
          <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 1 }}>
            <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Box>
          <StyledInputBase
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
          />
        </SearchWrapper> */}

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
              badgeContent={unreadCount}
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
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {user?.profilePicture ? (
                <Avatar
                  src={user.profilePicture}
                  alt={user.name || "User"}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "2px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              )}
              <Box>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                  {user?.name.substring(0, 15) || "Guest User"}
                </Typography>
                <Typography variant="caption" noWrap color="text.secondary">
                  {user?.email.substring(0, 15) || "user@example.com"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <MenuItem
            onClick={() => handleNavigate("/settings")}
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: "0.875rem" }}
            />
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: theme.palette.error.main,
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "inherit",
              }}
            />
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
