import * as React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import { motion } from "framer-motion";
// Notistack import
import { SnackbarProvider, useSnackbar } from "notistack";

// Icons
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SyncIcon from "@mui/icons-material/SyncRounded";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DraftsIcon from "@mui/icons-material/Drafts";
import RobotIcon from "@mui/icons-material/SmartToy";

import axios from "axios";
import { useAuth } from "../../../AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface EmailAccount {
  id: number;
  _id: string;
  email: string;
  provider: string;
  status?: "active" | "error" | "syncing" | "paused" | "deactivated";
  lastSync?: string;
  type?: "personal" | "work";
  autoReplyEnabled?: boolean;
  aiEnabled?: boolean;
  mode?: "draft" | "normal" | "auto";
  syncEnabled?: boolean;
  picture?: string | null;
  name?: string;
  connected?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, y: 10 },
};

function ConnectedEmailsContent() {
  const { user } = useAuth();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [connectedEmails, setConnectedEmails] = React.useState<EmailAccount[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState<string>("");
  const [actionEmail, setActionEmail] = React.useState<EmailAccount | null>(
    null
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const fetchConnectedEmails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", {
        variant: "error",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/api/emails/connection`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract connected emails from response
      let responseData = response.data;
      console.log("Raw connection response data:", responseData);

      // Handle different response formats
      if (responseData && typeof responseData === "object") {
        // If response is an object with emails property, extract it
        if ("emails" in responseData) {
          responseData = responseData.emails;
          console.log("Extracted emails from object:", responseData);
        }
        // If response is an object with connectedEmails property, extract it
        else if ("connectedEmails" in responseData) {
          responseData = responseData.connectedEmails;
          console.log("Extracted connectedEmails from object:", responseData);
        }
      }

      // Ensure responseData is an array
      if (!Array.isArray(responseData)) {
        console.error("Response data is not an array:", responseData);
        setError("Invalid response format from server");
        setLoading(false);
        return;
      }

      console.log("Normalized response data (array):", responseData);

      // Map response data to our EmailAccount interface and assign IDs
      // Filter out disconnected or deactivated accounts
      const emails = responseData
        .filter((email: any) => {
          // Keep accounts that are not explicitly disconnected or deactivated
          return (
            email.status !== "disconnected" && email.status !== "deactivated"
          );
        })
        .map((email: any, index: number) => {
          // Debug individual email mapping
          console.log(`Mapping email ${index}:`, email);

          // Determine the mode based on aiEnabled and aiMode
          let mode: "auto" | "draft" | "normal" = "draft"; // Default to draft

          if (
            email.aiMode &&
            ["auto", "draft", "normal"].includes(email.aiMode)
          ) {
            // If aiMode is valid, use it directly
            mode = email.aiMode as "auto" | "draft" | "normal";
          } else if (email.aiEnabled) {
            // If aiMode is missing but aiEnabled is true, default to auto
            mode = "auto";
          }

          return {
            id: index, // Use index as ID
            _id: email._id || `temp-id-${index}`,
            email: email.email || "",
            provider: email.provider || "google",
            status: email.status || "active",
            lastSync: formatLastSync(email.lastSync),
            type: email.type || "personal",
            autoReplyEnabled: email.aiEnabled || false, // Map aiEnabled to autoReplyEnabled
            aiEnabled: email.aiEnabled || false,
            mode: email.aiMode || "auto",
            syncEnabled: email.syncEnabled !== false, // Default to true if not specified
            picture: email.picture || null,
            name: email.name || "",
            connected: email.connected !== false, // Default to true if not specified
          };
        });

      console.log("Processed emails:", emails);
      setConnectedEmails(emails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching connected emails:", error);
      setError("Error fetching connected emails");
      enqueueSnackbar("Failed to load email accounts", { variant: "error" });
      setLoading(false);
    }
  };

  // Helper function to format last sync time in a human-readable way
  const formatLastSync = (timestamp: string | undefined): string => {
    if (!timestamp) return "Never";

    try {
      const syncDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - syncDate.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24)
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7)
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

      return syncDate.toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  // Function to disconnect an email account
  const handleDeleteEmail = async (email: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", {
        variant: "error",
      });
      return;
    }

    try {
      await axios.post(
        `${apiBaseUrl}/api/emails/auth/disconnect`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Immediately remove from UI
      setConnectedEmails(
        connectedEmails.filter((account) => account.email !== email)
      );

      enqueueSnackbar(`Email ${email} disconnected successfully`, {
        variant: "success",
      });
      handleCloseMenu();
    } catch (error) {
      console.error("Error disconnecting email:", error);
      enqueueSnackbar("Failed to disconnect email", { variant: "error" });
    }
  };

  // For Auto Reply toggle (which also handles AI)
  const handleToggleAutoReply = async (email: EmailAccount) => {
    if (!email) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", { variant: "error" });
      return;
    }
  
    // Toggle the current value
    const newValue = !email.autoReplyEnabled;
    
    // Determine new mode based on toggled value
    const newMode = newValue ? "auto" as const : "draft" as const;
    
    // Optimistic update
    const updatedEmails = connectedEmails.map((acc) =>
      acc.id === email.id ? { 
        ...acc, 
        autoReplyEnabled: newValue,
        aiEnabled: newValue, // AI is enabled when auto is on
        mode: newMode
      } : acc
    );
    setConnectedEmails(updatedEmails);
  
    try {
      // Update the server
      const response = await axios.post(
        `${apiBaseUrl}/api/emails/connection/${email.email}/mode-switch`,
        { 
          enabled: newValue,
          mode: newMode // Send the mode explicitly
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Check for success
      if (response.status !== 200) throw new Error("Failed to update auto settings");
  
      // Extract relevant data from response
      const data = response.data as { aiEnabled?: boolean, mode?: string };
      
      // Update action email if it's the same
      if (actionEmail && actionEmail.id === email.id) {
        // Validate mode or fall back to our determined mode
        const responseMode = data.mode && ["auto", "draft", "normal"].includes(data.mode)
          ? (data.mode as "auto" | "draft" | "normal")
          : newMode;
          
        setActionEmail({ 
          ...actionEmail, 
          autoReplyEnabled: data.aiEnabled ?? newValue,
          aiEnabled: data.aiEnabled ?? newValue,
          mode: responseMode
        });
      }
  
      enqueueSnackbar(`${newValue ? "Auto" : "Draft"} mode activated`, { variant: "success" });
      handleCloseMenu();
    } catch (error) {
      console.error("Error toggling auto:", error);
      
      // Revert optimistic update on failure
      setConnectedEmails(connectedEmails);
      enqueueSnackbar("Failed to update auto settings", { variant: "error" });
    }
  };

  // For Pause/Resume Sync
  const handleToggleSync = async (email: EmailAccount) => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", {
        variant: "error",
      });
      return;
    }

    // Toggle the current value
    const newValue = !email.syncEnabled;

    // Optimistic update
    const updatedEmails = connectedEmails.map((acc) =>
      acc.id === email.id
        ? {
            ...acc,
            syncEnabled: newValue,
            status: newValue ? "active" : ("paused" as "active" | "paused"),
          }
        : acc
    );
    setConnectedEmails(updatedEmails);

    try {
      // Update the server
      const response = await axios.post(
        `${apiBaseUrl}/api/emails/connection/${email.email}/toggle-connection`,
        { enabled: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for success
      if (response.status !== 200)
        throw new Error("Failed to update sync settings");

      // Update action email if it's the same
      if (actionEmail && actionEmail.id === email.id) {
        setActionEmail({
          ...actionEmail,
          syncEnabled: newValue,
          status: newValue ? "active" : "paused",
        });
      }

      enqueueSnackbar(`Service ${newValue ? "resumed" : "paused"}`, {
        variant: "success",
      });
      handleCloseMenu();
    } catch (error) {
      console.error("Error toggling sync:", error);

      // Revert optimistic update on failure
      setConnectedEmails(connectedEmails);
      enqueueSnackbar("Failed to update sync settings", { variant: "error" });
    }
  };

  // Improved refresh account function
  const handleRefreshAccount = async (email: EmailAccount) => {
    if (!email) return;

    // Set specific account to syncing status (optimistic update)
    const updatedEmails = connectedEmails.map((acc) =>
      acc.id === email.id
        ? { ...acc, status: "syncing" as "syncing", lastSync: "syncing..." }
        : acc
    );
    setConnectedEmails(updatedEmails);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", {
        variant: "error",
      });
      return;
    }

    try {
      // Use POST instead of PATCH for refresh with proper error handling
      const response = await axios.post(
        `${apiBaseUrl}/api/emails/connection/${email.email}/refresh/`,
        {}, // Empty body
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000, // 30 second timeout for potentially long operation
        }
      );

      // Get last sync time from response
      const data = response.data as { lastSync?: string; aiEnabled?: boolean };
      const lastSync = data.lastSync
        ? formatLastSync(data.lastSync)
        : "Just now";

      // Update with new last sync time
      const newEmails = connectedEmails.map((acc) =>
        acc.id === email.id
          ? {
              ...acc,
              status: "active" as "active",
              lastSync,
              // Update aiEnabled if returned from server
              ...(data.aiEnabled !== undefined
                ? { aiEnabled: data.aiEnabled }
                : {}),
            }
          : acc
      );
      setConnectedEmails(newEmails);

      enqueueSnackbar("Account refreshed successfully", { variant: "success" });
    } catch (error) {
      console.error("Error refreshing account:", error);

      // Show error state
      const errorEmails = connectedEmails.map((acc) =>
        acc.id === email.id ? { ...acc, status: "error" as "error" } : acc
      );

      setConnectedEmails(errorEmails);
      enqueueSnackbar("Failed to refresh account", { variant: "error" });
    }

    handleCloseMenu();
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    email: EmailAccount
  ) => {
    setActionEmail(email);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    fetchConnectedEmails();
  }, []);

  const filteredEmails = connectedEmails.filter((emailAccount) =>
    emailAccount.email.toLowerCase().includes(search.toLowerCase())
  );

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
      case "gmail":
        return <GoogleIcon sx={{ fontSize: 18 }} />;
      default:
        return <AlternateEmailIcon sx={{ fontSize: 18 }} />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <CheckCircleIcon
            sx={{ color: theme.palette.success.main, fontSize: 16 }}
          />
        );
      case "error":
        return (
          <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
        );
      case "syncing":
        return (
          <SyncIcon
            sx={{
              color: theme.palette.info.main,
              fontSize: 16,
              animation: "spin 1.5s linear infinite",
            }}
          />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "error":
        return theme.palette.error.main;
      case "syncing":
        return theme.palette.info.main;
      case "paused":
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleCreateBot = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      enqueueSnackbar("Authentication error. Please log in again.", {
        variant: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/api/emails/auth/google`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const authUrl = (response.data as { authUrl: string }).authUrl;
      console.log("Auth URL:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error creating bot:", error);
      enqueueSnackbar("Failed to start Google authentication", {
        variant: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: theme.palette.divider,
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Search and actions bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 3,
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search email accounts"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.divider, 0.6),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
            sx={{
              width: { xs: "100%", sm: 300 },
              "& .MuiInputBase-root": {
                borderRadius: 2,
              },
            }}
          />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchConnectedEmails()}
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              Refresh All
            </Button>
          </Stack>
        </Box>

        {/* Email accounts list */}
        {loading ? (
          <Box sx={{ mt: 3 }}>
            {[1, 2, 3].map((_, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={180} height={24} />
                      <Skeleton variant="text" width={120} height={20} />
                    </Box>
                  </Stack>
                  <Skeleton variant="rounded" width={100} height={36} />
                </Stack>
              </Paper>
            ))}
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: alpha(theme.palette.error.main, 0.2),
              bgcolor: alpha(theme.palette.error.main, 0.05),
            }}
          >
            <ErrorOutlineIcon
              color="error"
              sx={{ fontSize: 40, opacity: 0.8, mb: 1 }}
            />
            <Typography color="error.main" variant="h6" gutterBottom>
              Error Loading Accounts
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {error || "Failed to load your connected email accounts"}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchConnectedEmails}
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        ) : filteredEmails.length === 0 ? (
          search ? (
            <Box textAlign="center" py={4}>
              <SearchIcon
                sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
              />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                No matching accounts
              </Typography>
              <Typography color="text.secondary">
                No email accounts match your search query
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                textAlign: "center",
                border: "1px dashed",
                borderColor: theme.palette.divider,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <AlternateEmailIcon
                  sx={{ fontSize: 30, color: theme.palette.primary.main }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                No Email Accounts Connected
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 400, mx: "auto", mb: 3 }}
              >
                Connect your email accounts to start automating responses and
                get analytics
              </Typography>
            </Paper>
          )
        ) : (
          <Box>
            {filteredEmails.map((email, index) => (
              <Box
                component={motion.div}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                key={email.id}
                sx={{ mb: 2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.8),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 4px 12px ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 0 }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        badgeContent={
                          email.status && (
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: getStatusColor(email.status),
                                border: `2px solid ${theme.palette.background.paper}`,
                              }}
                            />
                          )
                        }
                      >
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            color: theme.palette.primary.main,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          }}
                          src={email.picture || undefined}
                        >
                          {!email.picture && getProviderIcon(email.provider)}
                        </Avatar>
                      </Badge>

                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, lineHeight: 1.2 }}
                        >
                          {email.email}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          {email.type && (
                            <Chip
                              label={email.type}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                backgroundColor: alpha(
                                  theme.palette.action.selected,
                                  0.1
                                ),
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: getStatusColor(email.status),
                            }}
                          >
                            {getStatusIcon(email.status)}
                            {email.status === "active"
                              ? "Active"
                              : email.status === "error"
                              ? "Connection error"
                              : email.status === "syncing"
                              ? "Syncing..."
                              : email.status === "paused"
                              ? "Paused"
                              : ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: { xs: "none", sm: "block" } }}
                          >
                            Last synced: {email.lastSync || "Never"}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={email.autoReplyEnabled ? "success" : "info"}
                            label={
                              email.autoReplyEnabled
                                ? "auto enabled"
                                : "draft mode enabled"
                            }
                            icon={
                              email.autoReplyEnabled ? (
                                <AutoFixHighIcon fontSize="small" />
                              ) : (
                                <DraftsIcon fontSize="small" />
                              )
                            }
                            sx={{
                              "& .MuiChip-icon": { mr: 0 },
                              px: 1,
                            }}
                          />

                          {email.aiEnabled && (
                            <Chip
                              size="small"
                              variant="outlined"
                              color="secondary"
                              label="AI Enabled"
                              icon={<RobotIcon fontSize="small" />}
                              sx={{
                                "& .MuiChip-icon": { mr: 0 },
                                px: 1,
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignSelf: { xs: "flex-end", sm: "center" },
                        mt: { xs: 1, sm: 0 },
                      }}
                    >
                      <Tooltip title="Sync account">
                        <IconButton
                          size="small"
                          onClick={() => handleRefreshAccount(email)}
                          disabled={email.status === "syncing"}
                          sx={{
                            color: theme.palette.text.secondary,
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.1
                            ),
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          <SyncIcon
                            fontSize="small"
                            sx={
                              email.status === "syncing"
                                ? {
                                    animation: "spin 1.5s linear infinite",
                                    "@keyframes spin": {
                                      "0%": {
                                        transform: "rotate(0deg)",
                                      },
                                      "100%": {
                                        transform: "rotate(360deg)",
                                      },
                                    },
                                  }
                                : {}
                            }
                          />
                        </IconButton>
                      </Tooltip>

                      <Box>
                        <Tooltip title="More options">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, email)}
                            sx={{
                              color: theme.palette.text.secondary,
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.1
                              ),
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleCloseMenu}
                          elevation={2}
                          sx={{
                            mt: 1,
                            "& .MuiPaper-root": {
                              borderRadius: 2,
                              boxShadow:
                                theme.palette.mode === "dark"
                                  ? "0 4px 20px rgba(0,0,0,0.4)"
                                  : "0 4px 20px rgba(0,0,0,0.1)",
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem
                            onClick={() =>
                              actionEmail && handleToggleAutoReply(actionEmail)
                            }
                            disabled={!actionEmail}
                          >
                            <ListItemIcon>
                              {actionEmail?.autoReplyEnabled ? (
                                <DraftsIcon fontSize="small" />
                              ) : (
                                <AutoFixHighIcon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText>
                              Switch to{" "}
                              {actionEmail?.autoReplyEnabled ? "Draft" : "Auto"}{" "}
                              Mode
                            </ListItemText>
                          </MenuItem>
                          <MenuItem
                            onClick={() =>
                              actionEmail && handleToggleSync(actionEmail)
                            }
                            disabled={!actionEmail}
                          >
                            <ListItemIcon>
                              {actionEmail?.syncEnabled === false ? (
                                <RefreshIcon fontSize="small" />
                              ) : (
                                <VisibilityOffIcon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText>
                              {actionEmail?.syncEnabled === false
                                ? "Resume"
                                : "Pause"}{" "}
                              Service
                            </ListItemText>
                          </MenuItem>

                          <Divider />

                          <MenuItem
                            onClick={() =>
                              actionEmail &&
                              handleDeleteEmail(actionEmail.email)
                            }
                            disabled={!actionEmail}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <ListItemIcon>
                              <DeleteIcon
                                fontSize="small"
                                sx={{ color: theme.palette.error.main }}
                              />
                            </ListItemIcon>
                            <ListItemText>Disconnect</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Box>
        )}

        {/* Status summary */}
        {filteredEmails.length > 0 && !loading && !error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: theme.palette.divider,
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {filteredEmails.length} active account
              {filteredEmails.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Wrap with SnackbarProvider
export default function GetConnectedEmails() {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      autoHideDuration={5000}
    >
      <ConnectedEmailsContent />
    </SnackbarProvider>
  );
}
