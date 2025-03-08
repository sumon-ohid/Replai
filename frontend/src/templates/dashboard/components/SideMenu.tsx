import * as React from "react";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@mui/material/Avatar";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { useAuth } from "../../../AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TuneIcon from "@mui/icons-material/Tune";
import StorageIcon from "@mui/icons-material/Storage";
import { drawerClasses } from "@mui/material/Drawer";
import { useNavigate } from "react-router-dom";
import ReplaiIcon from "../../../assets/logoIcon.png";

// Two drawer widths for expanded and collapsed states
const drawerWidthExpanded = 280;
const drawerWidthCollapsed = 80;

interface OpenedMixinProps {
  theme: any;
}

const openedMixin = ({ theme }: OpenedMixinProps) => ({
  width: drawerWidthExpanded,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

interface DrawerMixinProps {
  theme: any;
}

const closedMixin = ({ theme }: DrawerMixinProps) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `${drawerWidthCollapsed}px`,
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexShrink: 0,
  boxSizing: "border-box",
  position: "relative",
  whiteSpace: "nowrap",
  "& .MuiDrawer-paper": {
    boxSizing: "border-box",
    borderRight: "none",
    background: theme.palette.background.default,
    boxShadow:
      theme.palette.mode === "dark"
        ? `1px 0 20px 0 ${alpha("#000", 0.3)}`
        : `1px 0 20px 0 ${alpha("#000", 0.06)}`,
    ...(open ? openedMixin({ theme }) : closedMixin({ theme })),
  },
}));

// Component for the toggle button
const DrawerToggleButton = styled(IconButton)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  top: 10,
  overflow: "hidden",
  width: 32,
  height: 32,
  borderRadius: "50%",
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.background.default,
  },
}));

export default function SideMenu() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(() => {
    // Read the saved collapsed state from localStorage
    // Default to true (expanded) if no saved state exists
    const savedState = localStorage.getItem("sideMenuCollapsed");
    return savedState === null ? true : savedState !== "true";
  });
  const navigate = useNavigate();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const handleToggleDrawer = () => {
    setExpanded(!expanded);
  };

  const handleLogout = () => {
    // Add confirmation dialog here if needed
    logout();
  };

  const userInitials = React.useMemo(() => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0];
  }, [user?.name]);

  if (user?.name) {
    localStorage.setItem("username", user.name);
  }

  const planColor =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  return (
    <Box
      sx={{
        position: "relative",

        // Shift the content when expanded
        marginLeft: expanded ? 35 : 10,
        transition: theme.transitions.create("margin"),

        // Hide the drawer on mobile
        display: { xs: "none", md: "block" },
        backgroundColor: "background.default",
      }}
    >
      <Drawer
        variant="permanent"
        open={expanded}
        sx={{
          mb: (isExpanded) => (isExpanded ? 0 : 2),
          display: { xs: "none", md: "block" },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: "background.default",
          },
          backgroundColor: "background.default",
        }}
      >
        {/* Logo and Brand Area */}
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent: expanded ? 'flex-start' : 'center',
            alignItems: 'center',
            mt: 'calc(var(--template-frame-height, 0px) + 4px)',
            pt: 2,
            px: expanded ? 2 : 1,
            height: 64,
            transition: theme => theme.transitions.create('all'),
          }}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Stack 
            direction="row" 
            spacing={expanded ? 2 : 0} 
            alignItems="center"
            justifyContent={expanded ? 'flex-start' : 'center'}
            sx={{ 
              py: 1, 
              px: expanded ? 1.5 : 0,
              width: '100%' 
            }}
            component={motion.div}
            variants={itemVariants}
          >
            <Box 
              component={motion.div}
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                p: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Box component={motion.img} src={ReplaiIcon} alt="Replai Logo" sx={{ width: 32, height: 32 }} />
            </Box>
            
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'nowrap',
                  }}>
                    Replai<Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 300 }}>.tech</Box>
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Box> */}

        {/* User Profile Card */}
        <Box sx={{ px: expanded ? 1 : 0.5, py: 1 }}>
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{
              p: expanded ? 1 : 0.5,
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: expanded ? "stretch" : "center",
              justifyContent: "center",
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(145deg, ${alpha(
                      theme.palette.background.default,
                      0.8
                    )}, ${alpha(theme.palette.grey[900], 0.9)})`
                  : `linear-gradient(145deg, ${alpha(
                      theme.palette.background.default,
                      0.8
                    )}, ${alpha(theme.palette.grey[100], 0.9)})`,
              border: "1px solid",
              borderColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.divider, 0.1)
                  : alpha(theme.palette.divider, 0.2),
              boxShadow:
                theme.palette.mode === "dark"
                  ? `0 4px 20px ${alpha("#000", 0.2)}`
                  : `0 4px 20px ${alpha("#000", 0.06)}`,
              transition: theme.transitions.create(["padding"]),
            }}
          >
            {/* Decorative background elements */}
            {expanded && (
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )} 0%, transparent 70%)`,
                  opacity: 0.6,
                  zIndex: 0,
                }}
              />
            )}

            <Stack
              direction={expanded ? "row" : "column"}
              spacing={expanded ? 2 : 1}
              alignItems="center"
              sx={{ position: "relative", zIndex: 1, width: "100%" }}
            >
              <Box position="relative">
                <Tooltip title={!expanded ? user?.name || "User" : ""} placement="right">
                  <Box>
                    {user?.profilePicture ? (
                      <Avatar
                        alt={user?.name || "User"}
                        src={user.profilePicture}
                        sx={{
                          width: 48,
                          height: 48,
                          border: "2px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.6),
                          boxShadow: `0 0 0 2px ${alpha(
                            theme.palette.background.paper,
                            0.8
                          )}`,
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          fontWeight: 600,
                          fontSize: "1.2rem",
                          border: "2px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.6),
                          boxShadow: `0 0 0 2px ${alpha(
                            theme.palette.background.paper,
                            0.8
                          )}`,
                        }}
                      >
                        {userInitials}
                      </Avatar>
                    )}

                    {/* Status indicator */}
                    <Box
                      component={motion.div}
                      animate={{
                        boxShadow: [
                          `0 0 0 0px ${alpha(theme.palette.success.main, 0.4)}`,
                          `0 0 0 4px ${alpha(theme.palette.success.main, 0)}`,
                          `0 0 0 0px ${alpha(theme.palette.success.main, 0.4)}`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.success.main,
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>

              {/* User info - only shown when expanded */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, overflow: "hidden" }}
                  >
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.3,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: 140,
                        }}
                      >
                        {user?.name || "Guest User"}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.8),
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: 140,
                          display: "block",
                        }}
                      >
                        {user?.email || "user@example.com"}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons - show both in expanded mode, only logout in collapsed */}
              <Stack
                direction={expanded ? "row" : "column"}
                spacing={0.5}
                sx={{ mt: expanded ? 0 : 1 }}
              >
                {expanded && (
                  <Tooltip title="Settings" >
                    <IconButton
                      size="small"
                      component={motion.button}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      sx={{
                        color: alpha(theme.palette.text.primary, 0.6),
                        backgroundColor: alpha(
                          theme.palette.action.selected,
                          0.1
                        ),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.selected,
                            0.2
                          ),
                        },
                      }}
                      onClick={() => navigate("/settings")}
                    >
                      <TuneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Logout">
                  <IconButton
                    size="small"
                    onClick={handleLogout}
                    component={motion.button}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    sx={{
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.15),
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Subscription plan badge - only shown when expanded */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.1),
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        background: `linear-gradient(45deg, ${alpha(
                          planColor,
                          0.2
                        )}, ${alpha(planColor, 0.1)})`,
                        border: "1px solid",
                        borderColor: alpha(planColor, 0.2),
                        color: planColor,
                      }}
                    >
                      Pro Plan
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha(theme.palette.text.secondary, 0.7),
                        fontSize: "0.75rem",
                      }}
                    >
                      18 days remaining
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        <Divider sx={{ mx: expanded ? 2 : 0.5, opacity: 0.6 }} />

        {/* Main menu content */}
        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          component={motion.div}
          variants={itemVariants}
        >
          <MenuContent collapsed={!expanded} />
        </Box>
          
        {/* Footer - simplified when collapsed */}
        <Box
          sx={{
            mb: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.primary, 0.6),
              fontWeight: 500,
              letterSpacing: 0.5,
              display: expanded ? "block" : "none",
              px: 2,
              mr: 5,
              mt: 2,
            }}
          >
            &copy; {new Date().getFullYear()} Replai.tech
          </Typography>
          <DrawerToggleButton onClick={handleToggleDrawer}>
          <Tooltip title={expanded ? "Collapse" : "Expand"} placement="right">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {expanded ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </motion.div>
          </Tooltip>
        </DrawerToggleButton>
          {/* Toggle Button */}
        </Box>
      </Drawer>
    </Box>
  );
}
