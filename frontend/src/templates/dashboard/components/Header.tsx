import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
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
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";

// Icons
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// Components
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import CustomDatePicker from "./CustomDatePicker";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Types for notifications
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
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

// Styled components
// const StyledAppBar = styled(AppBar)(({ theme }) => ({
//   display: 'none',
//   [theme.breakpoints.up('md')]: {
//     display: 'flex',
//   },
//   position: 'sticky',
//   top: 0,
//   zIndex: theme.zIndex.drawer + 1,
//   backgroundColor: "transparent",
//   boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//   borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//   transition: 'all 0.3s ease',
//   backdropFilter: 'blur(10px)',
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.background.paper, 0.8),
//   },
//   mb: 3,
// }));

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "transparent",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.3s ease",
  // borderRadius: '0 0 20px 20px',
  // border: '1px solid',
  // borderColor: theme.palette.divider,
  backdropFilter: "blur(10px)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
  },
  mb: 3,
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "10px",
  backgroundColor: alpha(
    theme.palette.common.white,
    theme.palette.mode === "dark" ? 0.12 : 0.25
  ),
  "&:hover": {
    backgroundColor: alpha(
      theme.palette.common.white,
      theme.palette.mode === "dark" ? 0.08 : 0.15
    ),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
  transition: theme.transitions.create("width"),
  overflow: "hidden",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "28ch",
      "&:focus": {
        width: "36ch",
      },
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.text.secondary,
    opacity: 0.7,
  },
}));

const HeaderButton = styled(IconButton)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.05)
      : alpha(theme.palette.primary.main, 0.08),
  borderRadius: "10px",
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: "all 0.2s",
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
  },
}));

const UserChip = styled(Button)(({ theme }) => ({
  borderRadius: "10px",
  padding: theme.spacing(0.5, 1.5, 0.5, 1),
  fontWeight: 500,
  textTransform: "none",
  color: theme.palette.text.primary,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.1),
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.1),
  },
  boxShadow: "none",
  gap: theme.spacing(1),
}));

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

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("xl"));

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [searchActive, setSearchActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats>(
    {
      total: 0,
      unread: 0,
      errors: 0,
      warnings: 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      interface NotificationsResponse {
        success: boolean;
        data: Notification[];
        stats: NotificationStats;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get<NotificationsResponse>(
        `${apiBaseUrl}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 5,
            skip: 0,
          },
        }
      );

      if ((response.data as NotificationsResponse).success) {
        setNotifications(response.data.data);
        setNotificationStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications when menu opens
  useEffect(() => {
    if (notificationsAnchor) {
      fetchNotifications();
    }
  }, [notificationsAnchor, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {

      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      await axios.post(
        `${apiBaseUrl}/api/notifications/mark-read/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setNotificationStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {

      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      await axios.post(`${apiBaseUrl}/api/notifications/mark-all-read`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      // Update stats
      setNotificationStats((prev) => ({
        ...prev,
        unread: 0,
      }));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
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
    return format(date, "MMM d, yyyy");
  };

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

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return (
          <ErrorIcon
            fontSize="small"
            sx={{ color: theme.palette.error.main }}
          />
        );
      case "warning":
        return (
          <WarningAmberRoundedIcon
            fontSize="small"
            sx={{ color: theme.palette.warning.main }}
          />
        );
      case "success":
        return (
          <CheckCircleIcon
            fontSize="small"
            sx={{ color: theme.palette.success.main }}
          />
        );
      case "info":
      default:
        return (
          <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
        );
    }
  };

  // Fetch unread count for badge on mount
  useEffect(() => {
    if (user) {
      // Just fetch stats for the badge, not full notifications

      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      axios
        .get<{ success: boolean; stats: NotificationStats }>(
          `${apiBaseUrl}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              limit: 5,
              skip: 0,
            },
          }

        )
        .then((response) => {
          if (response.data.success) {
            setNotificationStats(response.data.stats);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch notification stats:", err);
        });
    }
  }, [user]);

  return (
    <StyledAppBar elevation={0}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3, xl: 4 },
          py: 1.5,
        }}
      >
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

          {/* Breadcrumbs navigation */}
          {!isMobile && (
            <Box ml={2} sx={{ display: { xs: "none", md: "block" } }}>
              <NavbarBreadcrumbs />
            </Box>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 0.5, md: 1.5 }}
          alignItems="center"
        >
          {/* Date Picker */}
          {!isMobile && <CustomDatePicker />}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              aria-label="notifications"
              onClick={handleOpenNotifications}
            >
              <Badge badgeContent={notificationStats.unread} color="error">
                <NotificationsRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <ColorModeIconDropdown />

          {/* User profile */}
          <Button
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
                {user?.name.split(" ")[0]}
              </Typography>
            )}
          </Button>
        </Stack>
      </Box>

      {/* User profile menu - keeping unchanged */}
      <Menu
        anchorEl={userMenuAnchor}
        id="user-menu"
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        onClick={handleCloseUserMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            mt: 1.5,
            borderRadius: "10px",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={user?.profilePicture}
            alt={user?.name}
            sx={{
              width: 50,
              height: 50,
              mb: 1,
              boxShadow: `0 0 0 2px ${
                theme.palette.background.paper
              }, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.3)}`,
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
            sx={{ mt: 1, borderRadius: "8px", textTransform: "none" }}
            onClick={() => navigate("/settings")}
          >
            Manage Account
          </Button>
        </Box>

        <Divider />

        <MenuItem onClick={() => navigate("/dashboard")}>
          <ListItemIcon>
            <DashboardRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </MenuItem>

        <MenuItem onClick={() => navigate("/inbox")}>
          <ListItemIcon>
            <EmailRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Emails" />
        </MenuItem>

        <MenuItem onClick={() => navigate("/calendar")}>
          <ListItemIcon>
            <CalendarTodayRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Calender" />
        </MenuItem>

        <MenuItem onClick={() => navigate("/billing")}>
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
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{ color: "error" }}
          />
        </MenuItem>
      </Menu>

      {/* Notifications menu - Updated to use real notifications */}
      <Menu
        anchorEl={notificationsAnchor}
        id="notifications-menu"
        open={Boolean(notificationsAnchor)}
        onClose={handleCloseNotifications}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 360,
            maxHeight: 480,
            overflow: "auto",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            mt: 1.5,
            borderRadius: "10px",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
            <Button size="small" onClick={fetchNotifications} sx={{ mt: 1 }}>
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
                    : "transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      mr: 1.5,
                      backgroundColor:
                        notification.type === "success"
                          ? alpha(theme.palette.success.main, 0.1)
                          : notification.type === "error"
                          ? alpha(theme.palette.error.main, 0.1)
                          : notification.type === "warning"
                          ? alpha(theme.palette.warning.main, 0.1)
                          : alpha(theme.palette.info.main, 0.1),
                      color:
                        notification.type === "success"
                          ? theme.palette.success.main
                          : notification.type === "error"
                          ? theme.palette.error.main
                          : notification.type === "warning"
                          ? theme.palette.warning.main
                          : theme.palette.info.main,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        component="span"
                        sx={{ fontWeight: 600 }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: theme.palette.primary.main,
                            ml: 1,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    {notification.email && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {notification.email}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {formatNotificationTime(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </NotificationItem>
            ))}
            <Box
              sx={{
                py: 1.5,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Mark All as Read
              </Button>
              <Button
                size="small"
                onClick={() => {
                  navigate("/notifications");
                  handleCloseNotifications();
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                View All
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Menu>
    </StyledAppBar>
  );
}
