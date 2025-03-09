import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import { useAuth } from "../../../AuthContext";
import axios from "axios";
import logo from "../../../../logo/logo_light.png";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();

  // Animation variants
  const drawerVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      // transition: {
      //   type: "spring",
      //   stiffness: 300,
      //   damping: 30,
      //   when: "beforeChildren",
      //   staggerChildren: 0.1,
      // },
    },
    exit: {
      x: "100%",
      // transition: {
      //   type: "spring",
      //   stiffness: 400,
      //   damping: 40,
      //   when: "afterChildren",
      //   staggerChildren: 0.05,
      //   staggerDirection: -1,
      // },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  const userInitials = React.useMemo(() => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0];
  }, [user?.name]);

  return (
    <AnimatePresence>
      {open && (
        <Drawer
          anchor="right"
          open={open}
          onClose={toggleDrawer(false)}
          PaperProps={{
            component: motion.div,
            variants: drawerVariants,
            initial: "hidden",
            animate: "visible",
            exit: "exit",
            sx: {
              width: "80vw",
              maxWidth: 300,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              background: 
                theme.palette.mode === "dark"
                  ? `linear-gradient(145deg, ${alpha(
                      theme.palette.background.default,
                      0.8
                    )}, ${alpha("#121212", 0.3)})`
                  : `linear-gradient(145deg, ${alpha(
                      theme.palette.background.default,
                      0.8
                    )}, ${alpha("#e3f2fd", 0.3)})`,
              backdropFilter: "blur(10px)",
              border: "none",
              boxShadow:
                theme.palette.mode === "dark"
                  ? `-5px 0 25px ${alpha("#000", 0.3)}`
                  : `-5px 0 25px ${alpha("#000", 0.1)}`,
            },
          }}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            "& .MuiBackdrop-root": {
              backdropFilter: "blur(4px)",
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            },
          }}
        >
          <Stack sx={{ height: "100%" }}>
            {/* Header with user info and close button */}
            <motion.div variants={itemVariants}>
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box 
                      component={motion.img}
                      src={logo}
                      alt="Replai"
                      sx={{ width: 110, height: 40 }}
                    />
                  </Box>

                  <IconButton
                    edge="end"
                    onClick={toggleDrawer(false)}
                    size="small"
                    component={motion.button}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ rotate: 90 }}
                    sx={{
                      bgcolor: alpha(theme.palette.divider, 0.1),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.divider, 0.2),
                      },
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </motion.div>

            {/* User profile card */}
            <motion.div variants={itemVariants}>
              <Box sx={{ px: 2, pb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.action.hover, 0.1),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.07),
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background decoration */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${alpha(
                        theme.palette.primary.main,
                        0.15
                      )} 0%, transparent 70%)`,
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
                          src={user?.profilePicture}
                          sx={{
                            width: 44,
                            height: 44,
                            border: "2px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            border: "2px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          }}
                        >
                          {userInitials}
                        </Avatar>
                      )}

                      {/* Online indicator */}
                      <Box
                        component={motion.div}
                        animate={{
                          boxShadow: [
                            `0 0 0 0px ${alpha(
                              theme.palette.success.main,
                              0.4
                            )}`,
                            `0 0 0 3px ${alpha(theme.palette.success.main, 0)}`,
                            `0 0 0 0px ${alpha(
                              theme.palette.success.main,
                              0.4
                            )}`,
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
                          width: 8,
                          height: 8,
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
                          lineHeight: 1.2,
                        }}
                      >
                        {user?.name || "Guest User"}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.8),
                        }}
                      >
                        {user?.email || "user@example.com"}
                      </Typography>

                      {/* Pro badge */}
                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          }}
                        >
                          Pro
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.65rem" }}
                        >
                          18 days left
                        </Typography>
                      </Box>
                    </Box>

                    {/* <IconButton
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                        position: "relative",
                      }}
                    >
                      <NotificationsRoundedIcon fontSize="small" />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 3,
                          right: 3,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: theme.palette.error.main,
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    </IconButton> */}
                  </Stack>
                </Box>
              </Box>
            </motion.div>

            <Divider sx={{ opacity: 0.6 }} />

            {/* Menu content */}
            <Box
              sx={{ flexGrow: 1, overflow: "auto" }}
              component={motion.div}
              variants={itemVariants}
            >
              <MenuContent collapsed={false} />
            </Box>

            {/* View Documentation */}

            {/* Footer with logout */}
            <motion.div variants={itemVariants}>
              <Box sx={{ p: 2, pt: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LogoutRoundedIcon />}
                  onClick={logout}
                  disableElevation
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    background:
                      theme.palette.mode === "dark"
                        ? `linear-gradient(45deg, ${alpha(
                            theme.palette.error.dark,
                            0.8
                          )}, ${alpha(theme.palette.error.main, 0.8)})`
                        : `linear-gradient(45deg, ${alpha(
                            theme.palette.error.main,
                            0.9
                          )}, ${alpha(theme.palette.error.light, 0.9)})`,
                    color: "#fff",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark"
                          ? `linear-gradient(45deg, ${alpha(
                              theme.palette.error.dark,
                              1
                            )}, ${alpha(theme.palette.error.main, 1)})`
                          : `linear-gradient(45deg, ${alpha(
                              theme.palette.error.main,
                              1
                            )}, ${alpha(theme.palette.error.light, 1)})`,
                    },
                  }}
                >
                  Logout
                </Button>

                {/* Version info */}
                <Box
                  sx={{
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
                    Replai v1.2.0 &copy; {new Date().getFullYear()}
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
              </Box>
            </motion.div>
          </Stack>
        </Drawer>
      )}
    </AnimatePresence>
  );
}
