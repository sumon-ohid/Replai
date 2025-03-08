import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  List,
  Typography,
  Tooltip,
  Divider,
  alpha,
  Badge,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import StorageIcon from "@mui/icons-material/Storage";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import { useTheme } from "@mui/material/styles";
import { Button } from "@mui/material";
import DraftsIcon from '@mui/icons-material/Drafts';

interface MenuContentProps {
  collapsed: boolean;
}

// Main navigation items
const mainNavItems = [
  {
    text: "Home",
    icon: <HomeRoundedIcon />,
    path: "/dashboard",
    description: "Dashboard overview",
  },
  {
    text: "Inbox",
    icon: <DraftsIcon />,
    path: "/inbox",
    description: "Email inbox",
    badge: 2,
  },
  {
    text: "Email Manager",
    icon: <AttachEmailIcon />,
    path: "/email-manager",
    description: "Connected email accounts",
    // badge: 1,
  },
  {
    text: "Data",
    icon: <StorageIcon />,
    path: "/data",
    description: "Data management",
  },
  {
    text: "Blocklist",
    icon: <CancelScheduleSendIcon />,
    path: "/blocklist",
    description: "Email blocklist settings",
  },
  {
    text: "Plan & Billing",
    icon: <CreditCardIcon />,
    path: "/billing",
    description: "Subscription management",
  },
  {
    text: "Calendar",
    icon: <CalendarMonthIcon />,
    path: "/calendar",
    description: "Schedule overview",
    // badge: 2
  },
];

// Secondary navigation items
const secondaryNavItems = [
  {
    text: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/settings",
    description: "Account settings",
  },
  {
    text: "About",
    icon: <InfoRoundedIcon />,
    path: "/about",
    description: "About Replai",
  },
  {
    text: "Feedback",
    icon: <HelpRoundedIcon />,
    path: "/feedback",
    description: "Send us your feedback",
  },
];

export default function MenuContent({ collapsed }: MenuContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      // Close the drawer when navigation is performed on mobile
      const event = new CustomEvent("close-drawer");
      window.dispatchEvent(event);
    } 
  };

  // Animation variants
  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -10,
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
      },
    }),
    hover: {
      scale: collapsed ? 1.1 : 1.03,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: collapsed ? 0.9 : 0.97,
      transition: { duration: 0.1 },
    },
  };

  // Menu item component
  const NavItem = ({
    item,
    index,
    isActive,
  }: {
    item: {
      text: string;
      icon: React.ReactNode;
      path: string;
      description?: string;
      badge?: number;
    };
    index: number;
    isActive: boolean;
  }) => {
    const activeGradient = `linear-gradient(90deg, ${alpha(
      theme.palette.primary.main,
      collapsed ? 0.2 : 0.1
    )} 0%, ${alpha(theme.palette.primary.light, collapsed ? 0.1 : 0.05)} 100%)`;

    return (
      <Tooltip 
        title={collapsed ? item.text : item.description || item.text} 
        placement={isMobile ? "top" : "right"}
        arrow
      >
        <Box
          component={motion.div}
          custom={index}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleNavigation(item.path)}
          sx={{
            mb: 0.5,
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Active indicator */}
          <AnimatePresence>
            {isActive && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: collapsed ? 3 : 4 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: "0 4px 4px 0",
                  background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 0 8px ${alpha(
                    theme.palette.primary.main,
                    0.6
                  )}`,
                }}
              />
            )}
          </AnimatePresence>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 0.5 : 2,
              py: collapsed ? 1 : 1.5,
              backgroundColor: isActive ? activeGradient : "transparent",
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isActive
                  ? activeGradient
                  : theme.palette.mode === "dark"
                  ? alpha(theme.palette.action.hover, 0.15)
                  : alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            {/* Icon */}
            <Box
              component={motion.div}
              animate={
                isActive
                  ? {
                      scale: [1, 1.15, 1],
                      transition: { duration: 0.4, times: [0, 0.5, 1] },
                    }
                  : {}
              }
              sx={{
                mr: collapsed ? 0 : 2,
                width: collapsed ? 36 : 40,
                height: collapsed ? 36 : 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                backgroundColor: isActive
                  ? alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.15 : 0.1
                    )
                  : "transparent",
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              {item.icon}
              {/* Badge in collapsed mode */}
              {collapsed && item.badge && (
                <Box
                  component={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  sx={{
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    top: -2,
                    right: -2,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </Box>

            {/* Text and badge - only when not collapsed */}
            {!collapsed && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.text}
                </Typography>

                {item.badge && (
                  <Box
                    component={motion.div}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    sx={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.error.contrastText,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ml: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: collapsed ? 0.5 : 1.5,
        pt: collapsed ? 2 : 3,
        pb: collapsed ? 2 : 4,
        borderRadius: "16px 16px 0 0",
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.background.default, 0.8),
        backdropFilter: "blur(8px)",
        overflow: collapsed ? "visible" : "auto",
        transition: "all 0.3s ease",
      }}
    >
      {/* Main navigation */}
      <Box>
        {!collapsed && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 2,
              mb: 1.5,
              display: "block",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Main
          </Typography>
        )}

        <List sx={{ p: 0 }}>
          {mainNavItems.map((item, index) => (
            <NavItem
              key={item.text}
              item={item}
              index={index}
              isActive={location.pathname === item.path}
            />
          ))}
        </List>
      </Box>

      {/* Divider */}
      <Box sx={{ py: collapsed ? 1 : 2 }}>
        <Divider sx={{ opacity: 0.6, mx: collapsed ? 1 : 0 }} />
      </Box>

      {/* Secondary navigation */}
      <Box mt={collapsed ? 0 : "auto"}>
        {!collapsed && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 2,
              mb: 1.5,
              display: "block",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Support
          </Typography>
        )}

        <List sx={{ p: 0 }}>
          {secondaryNavItems.map((item, index) => (
            <NavItem
              key={item.text}
              item={item}
              index={index}
              isActive={location.pathname === item.path}
            />
          ))}
        </List>
      </Box>

      {/* View documentations - only when not collapsed */}
      {!collapsed && (
        <Box
          sx={{
            mt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ p: 2}}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background:
                    theme.palette.mode === "dark"
                      ? `linear-gradient(145deg, ${alpha(
                          theme.palette.info.dark,
                          0.15
                        )}, ${alpha("#121212", 0.3)})`
                      : `linear-gradient(145deg, ${alpha(
                          theme.palette.info.light,
                          0.15
                        )}, ${alpha("#e3f2fd", 0.3)})`,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.info.main,
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Need some help?
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 1.5 }}>
                  Check our documentation or contact <br/> support team
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.info.main, 0.5),
                    color: theme.palette.info.main,
                    "&:hover": {
                      borderColor: theme.palette.info.main,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                    },
                  }}
                  onClick={() => handleNavigation("/docs")}
                >
                  View Documentation
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
}