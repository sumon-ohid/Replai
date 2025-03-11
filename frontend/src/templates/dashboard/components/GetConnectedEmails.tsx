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

// Icons
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SyncIcon from "@mui/icons-material/SyncRounded";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DraftsIcon from "@mui/icons-material/Drafts";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";

import axios from "axios";
import { useAuth } from "../../../AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface EmailAccount {
  id: number;
  email: string;
  provider: string;
  status?: "active" | "error" | "syncing" | "paused";
  lastSync?: string;
  type?: "personal" | "work";
  autoReplyEnabled?: boolean;
  mode?: "draft" | "normal";
  syncEnabled?: boolean;
  picture?: string | null;
  name?: string;
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

export default function GetConnectedEmails() {
  const { user } = useAuth();
  const theme = useTheme();
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
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const fetchConnectedEmails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/api/emails/connected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract connected emails from response
      // The backend should return either an array directly or an object with a connectedEmails property
      let responseData = response.data as any[];

      // Handle case where backend returns { connectedEmails: [...] }
      if (
        responseData &&
        typeof responseData === "object" &&
        "connectedEmails" in responseData
      ) {
        responseData = (responseData as { connectedEmails: any[] })
          .connectedEmails;
      }

      // Map response data to our EmailAccount interface and assign IDs
      const emails = responseData.map((email: any, index: number) => ({
        id: index, // Use index as ID
        email: email.email || "",
        provider: email.provider || "google",
        status:
          email.syncEnabled === false ? "paused" : email.status || "active",
        lastSync: formatLastSync(email.lastSync),
        type: email.type || "personal",
        autoReplyEnabled: email.autoReplyEnabled !== false, // Default to true if not specified
        mode: email.mode || "normal",
        syncEnabled: email.syncEnabled !== false, // Default to true if not specified
        picture: email.picture || null,
        name: email.name || "",
      }));
      setConnectedEmails(emails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching connected emails:", error);
      setError("Error fetching connected emails");
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
      return;
    }

    try {
      // Use POST to /disconnect with email in body
      // (as seen in the handleEmails.js file you shared earlier)
      await axios.post(
        `${apiBaseUrl}/api/emails/disconnect`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConnectedEmails(
        connectedEmails.filter((account) => account.email !== email)
      );

      setSnackbar({
        open: true,
        message: `Email ${email} disconnected successfully`,
        severity: "success",
      });

      handleCloseMenu();
    } catch (error) {
      console.error("Error disconnecting email:", error);
      setSnackbar({
        open: true,
        message: "Failed to disconnect email",
        severity: "error",
      });
    }
  };

  // For Draft Mode toggle
  const handleToggleDraftMode = async (email: EmailAccount) => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Determine the new mode (toggle between draft and normal)
    const newMode = email.mode === "draft" ? "normal" : "draft";

    try {
      // Update the server
      await axios.patch(
        `${apiBaseUrl}/api/emails/connected/mode/${email.email}`,
        { mode: newMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedEmails = connectedEmails.map((acc) =>
        acc.id === email.id
          ? { ...acc, mode: newMode as "draft" | "normal" }
          : acc
      );

      setConnectedEmails(updatedEmails);

      // Update action email if it's the same
      if (actionEmail && actionEmail.id === email.id) {
        setActionEmail({ ...actionEmail, mode: newMode });
      }

      // Show notification
      setSnackbar({
        open: true,
        message: `Email set to ${
          newMode === "draft" ? "Draft" : "Normal"
        } mode`,
        severity: "success",
      });

      handleCloseMenu();
    } catch (error) {
      console.error("Error toggling draft mode:", error);
      setSnackbar({
        open: true,
        message: "Failed to update email mode",
        severity: "error",
      });
    }
  };

  // For Auto Reply toggle
  const handleToggleAutoReply = async (email: EmailAccount) => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Toggle the current value
    const newValue = !email.autoReplyEnabled;

    try {
      // Update the server
      await axios.patch(
        `${apiBaseUrl}/api/emails/connected/auto-reply/${email.email}`,
        { enabled: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const updatedEmails = connectedEmails.map((acc) =>
        acc.id === email.id ? { ...acc, autoReplyEnabled: newValue } : acc
      );

      setConnectedEmails(updatedEmails);

      // Update action email if it's the same
      if (actionEmail && actionEmail.id === email.id) {
        setActionEmail({ ...actionEmail, autoReplyEnabled: newValue });
      }

      // Show notification
      setSnackbar({
        open: true,
        message: `${newValue ? "Draft" : "Auto reply"} mode activated`,
        severity: "success",
      });

      handleCloseMenu();
    } catch (error) {
      console.error("Error toggling auto-reply:", error);
      setSnackbar({
        open: true,
        message: "Failed to update auto-reply settings",
        severity: "error",
      });
    }
  };

  // For Pause/Resume Sync
  const handleToggleSync = async (email: EmailAccount) => {
    if (!email) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    // Toggle the current value
    const newValue = !email.syncEnabled;

    try {
      // Update the server
      await axios.patch(
        `${apiBaseUrl}/api/emails/connected/sync/${email.email}`,
        { enabled: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
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

      // Update action email if it's the same
      if (actionEmail && actionEmail.id === email.id) {
        setActionEmail({
          ...actionEmail,
          syncEnabled: newValue,
          status: newValue ? "active" : "paused",
        });
      }

      // Show notification
      setSnackbar({
        open: true,
        message: `Sync ${newValue ? "resumed" : "paused"}`,
        severity: "success",
      });

      handleCloseMenu();
    } catch (error) {
      console.error("Error toggling sync:", error);
      setSnackbar({
        open: true,
        message: "Failed to update sync settings",
        severity: "error",
      });
    }
  };

  // Update the handleRefreshAccount function to use the new endpoint
  const handleRefreshAccount = async (email: EmailAccount) => {
    if (!email) return;

    // Set specific account to syncing status
    const updatedEmails = connectedEmails.map((acc) =>
      acc.id === email.id
        ? { ...acc, status: "syncing" as "syncing", lastSync: "syncing..." }
        : acc
    );
    setConnectedEmails(updatedEmails);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      // Call the sync endpoint (from handleEmails.js)
      const response = await axios.patch(
        `${apiBaseUrl}/api/emails/connected/sync/${email.email}`,
        { enabled: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get last sync time from response
      const data = response.data as { lastSync?: string };
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
            }
          : acc
      );
      setConnectedEmails(newEmails);

      setSnackbar({
        open: true,
        message: "Account refreshed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error refreshing account:", error);

      // Show error state
      const errorEmails = connectedEmails.map((acc) =>
        acc.id === email.id ? { ...acc, status: "error" as "error" } : acc
      );

      setConnectedEmails(errorEmails);

      setSnackbar({
        open: true,
        message: "Failed to refresh account",
        severity: "error",
      });
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
      default:
        return theme.palette.text.secondary;
    }
  };

  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleCreateBot = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
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
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error creating bot:", error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              color="primary"
              disableElevation
              onClick={handleCreateBot}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                    : `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              Add Account
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
                onClick={handleCreateBot}
              >
                Connect Your First Account
              </Button>
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
                        >
                          {getProviderIcon(email.provider)}
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
                        <Chip
                          size="small"
                          variant="outlined"
                          color="primary"
                          label={
                            email.autoReplyEnabled
                              ? " Auto reply mode enabled"
                              : " Draft mode enabled"
                          }
                          icon={
                            email.autoReplyEnabled ? (
                              <AutoFixHighIcon fontSize="small" />
                            ) : (
                              <DraftsIcon fontSize="small" />
                            )
                          }
                          sx={{
                            mt: 0.5,
                            "& .MuiChip-icon": { mr: 0 },
                            px: 1,
                          }}
                        ></Chip>
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
                          <SyncIcon fontSize="small" />
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
                          {/* <MenuItem
                            onClick={() =>
                              actionEmail && handleToggleDraftMode(actionEmail)
                            }
                            disabled={!actionEmail}
                          >
                            <ListItemIcon>
                              <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>
                              {actionEmail?.mode === "draft"
                                ? "Disable"
                                : "Enable"}{" "}
                              Draft Mode
                            </ListItemText>
                          </MenuItem> */}

                          <MenuItem
                            onClick={() =>
                              actionEmail && handleToggleAutoReply(actionEmail)
                            }
                            disabled={!actionEmail}
                          >
                            <ListItemIcon>
                              {actionEmail?.autoReplyEnabled ? (
                                <AutoFixHighIcon fontSize="small" />
                              ) : (
                                <DraftsIcon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText>
                              {actionEmail?.autoReplyEnabled
                                ? "Auto Reply"
                                : "Draft"}{" "}
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
                              Sync
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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}
