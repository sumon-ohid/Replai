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
import TuneIcon from "@mui/icons-material/Tune";
import StorageIcon from "@mui/icons-material/Storage";
import { drawerClasses } from "@mui/material/Drawer";
import { useNavigate } from "react-router-dom";

const drawerWidth = 280;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  position: "relative",
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    borderRight: "none",
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, ${alpha(
            theme.palette.background.paper,
            0.96
          )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`
        : `linear-gradient(180deg, ${alpha(
            theme.palette.background.paper,
            0.96
          )} 0%, ${alpha("#f8f9fa", 0.98)} 100%)`,
    boxShadow:
      theme.palette.mode === "dark"
        ? `1px 0 20px 0 ${alpha("#000", 0.3)}`
        : `1px 0 20px 0 ${alpha("#000", 0.06)}`,
  },
}));

export default function SideMenu() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const navigate = useNavigate();

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

  const planColor =
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Logo and Brand Area */}
      {/* <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          pt: 2,
          px: 2,
        }}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
          sx={{ py: 1, px: 1.5 }}
          component={motion.div}
          variants={itemVariants}
        >
          <Box 
            component={motion.div}
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            sx={{ 
              bgcolor: 'primary.main', 
              borderRadius: 2, 
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <StorageIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Replai<Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 300 }}>.tech</Box>
          </Typography>
        </Stack>
      </Box> */}

      {/* User Profile Card */}
      <Box sx={{ px: 1, py: 1 }}>
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            p: 1,
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(8px)",
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
          }}
        >
          {/* Decorative background elements */}
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

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box position="relative">
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

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  component={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  sx={{
                    color: alpha(theme.palette.text.primary, 0.6),
                    backgroundColor: alpha(theme.palette.action.selected, 0.1),
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

          {/* Subscription plan badge */}
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
        </Box>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.6 }} />

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
        <MenuContent />

        {/* Alert card with animation
        <Box sx={{ p: 2 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(145deg, ${alpha(theme.palette.info.dark, 0.2)}, ${alpha(theme.palette.info.main, 0.15)})`,
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.2),
              boxShadow: `0 4px 20px ${alpha(theme.palette.info.dark, 0.15)}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, mb: 0.5, fontWeight: 600 }}>
              Need Help?
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: alpha(theme.palette.text.primary, 0.7) }}>
              Check our knowledge base or contact support for assistance.
            </Typography>
            <Button 
              size="small" 
              variant="contained"
              disableElevation
              sx={{ 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.9),
                '&:hover': {
                  bgcolor: theme.palette.info.main,
                }
              }}
            >
              View Documentation
            </Button>
          </Box>
        </Box> */}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mb: 2,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="caption"
          color={alpha(theme.palette.text.secondary, 0.6)}
          sx={{ fontSize: "0.7rem" }}
        >
          Replai © 2025 | v1.2.0
        </Typography>

        <Box
          component={motion.div}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.palette.success.main,
            boxShadow: `0 0 8px ${theme.palette.success.main}`,
          }}
        />
      </Box>
    </Drawer>
  );
}
