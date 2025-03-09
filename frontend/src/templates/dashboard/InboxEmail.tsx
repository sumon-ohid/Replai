import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";

// Icons
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import FilterListIcon from "@mui/icons-material/FilterListRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";
import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import InboxIcon from "@mui/icons-material/InboxRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import SendIcon from "@mui/icons-material/SendRounded";
import AttachmentIcon from "@mui/icons-material/AttachFileRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArchiveIcon from "@mui/icons-material/ArchiveRounded";
import LabelImportantIcon from "@mui/icons-material/LabelImportantRounded";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import SortIcon from "@mui/icons-material/SortRounded";
import AddIcon from "@mui/icons-material/AddRounded";

// Components
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import Footer from "./components/Footer";
import CustomizedDataGrid from "./components/CustomizedDataGrid";

// Email components
const EmailToolbar = ({ onRefresh }: { onRefresh: () => void }) => {
  const theme = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: { xs: "wrap", md: "nowrap" },
        justifyContent: { xs: "center", sm: "flex-start" },
        mb: 2,
        p: 1,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Refresh">
          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton size="small">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Archive">
          <IconButton size="small">
            <ArchiveIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Mark as important">
          <IconButton size="small">
            <LabelImportantIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Mark as unread">
          <IconButton size="small">
            <MarkEmailUnreadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 1, display: { xs: "none", sm: "block" } }}
      />
      <Divider
        sx={{ my: 1, width: "100%", display: { xs: "block", sm: "none" } }}
      />

      <Box sx={{ display: "flex", gap: 1, ml: { xs: 0, sm: "auto" } }}>
        <Button
          startIcon={<SortIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 1.5,
            color: theme.palette.text.secondary,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          Sort
        </Button>

        <Button
          startIcon={<FilterListIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 1.5,
            color: theme.palette.text.secondary,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          Filter
        </Button>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          },
        }}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All emails</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Unread</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          With attachments
        </MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Starred</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Important</MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          },
        }}
      >
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          Date (Newest first)
        </MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>
          Date (Oldest first)
        </MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>Sender (A-Z)</MenuItem>
        <MenuItem onClick={() => setSortAnchorEl(null)}>Subject (A-Z)</MenuItem>
      </Menu>
    </Box>
  );
};

const EmailProvider = ({
  provider,
  icon,
  connected,
  count = 0,
  onConnect,
  isActive,
}: {
  provider: string;
  icon: React.ReactNode;
  connected: boolean;
  count?: number;
  onConnect: () => void;
  isActive: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        borderRadius: 3,
        border: `1px solid ${
          isActive
            ? alpha(theme.palette.primary.main, 0.6)
            : alpha(theme.palette.divider, 0.6)
        }`,
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha(theme.palette.background.paper, 0.5),
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          transform: "translateY(-2px)",
        },
      }}
      component={motion.div}
      whileHover={{ y: -2 }}
    >
      <Badge
        badgeContent={connected ? count : 0}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            top: 4,
            right: 4,
            display: connected ? "flex" : "none",
          },
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            mb: 1,
            bgcolor: connected
              ? `${
                  isActive
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.7)
                }`
              : alpha(theme.palette.divider, 0.6),
            color: connected ? "#fff" : theme.palette.text.secondary,
          }}
        >
          {icon}
        </Avatar>
      </Badge>

      <Typography
        variant="body2"
        sx={{
          fontWeight: isActive ? 600 : 400,
          color: isActive ? theme.palette.primary.main : "text.primary",
          mb: 0.5,
        }}
      >
        {provider}
      </Typography>

      {!connected && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onConnect}
          sx={{
            mt: 1,
            borderRadius: 1.5,
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        >
          Connect
        </Button>
      )}

      {connected && (
        <Chip
          label="Connected"
          size="small"
          color={isActive ? "primary" : "default"}
          variant={isActive ? "filled" : "outlined"}
          sx={{
            mt: 0.5,
            height: 20,
            fontSize: "0.625rem",
          }}
        />
      )}
    </Box>
  );
};

const EmailCategory = ({
  icon,
  label,
  count,
  color = "default",
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color?: "primary" | "secondary" | "success" | "warning" | "info" | "default";
  active?: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 2,
        border: `1px solid ${
          active
            ? alpha(
                theme.palette[color === "default" ? "primary" : color].main,
                0.6
              )
            : alpha(theme.palette.divider, 0.7)
        }`,
        bgcolor: active
          ? alpha(
              theme.palette[color === "default" ? "primary" : color].main,
              0.08
            )
          : theme.palette.background.paper,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: alpha(
            theme.palette[color === "default" ? "primary" : color].main,
            0.05
          ),
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            mr: 1.5,
            bgcolor: alpha(
              theme.palette[color === "default" ? "primary" : color].main,
              active ? 0.2 : 0.1
            ),
            color: theme.palette[color === "default" ? "primary" : color].main,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: active ? 600 : 400,
            color: active
              ? theme.palette[color === "default" ? "primary" : color].main
              : "text.primary",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Chip
        label={count}
        size="small"
        color={active ? (color === "default" ? "primary" : color) : "default"}
        variant={active ? "filled" : "outlined"}
        sx={{
          minWidth: 30,
          height: 20,
          fontSize: "0.625rem",
        }}
      />
    </Paper>
  );
};

// Main component
export default function InboxEmail(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [activeProvider, setActiveProvider] = React.useState(0);
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");

  const providers = [
    { name: "Gmail", icon: <GoogleIcon />, connected: true, count: 0 },
    { name: "Outlook", icon: <MicrosoftIcon />, connected: false },
    { name: "Custom", icon: <AlternateEmailIcon />, connected: false },
  ];

  const categories = [
    {
      icon: <InboxIcon fontSize="small" />,
      label: "Inbox",
      count: 0,
      color: "primary" as const,
    },
    {
      icon: <StarIcon fontSize="small" />,
      label: "Starred",
      count: 0,
      color: "warning" as const,
    },
    {
      icon: <SendIcon fontSize="small" />,
      label: "Sent",
      count: 0,
      color: "success" as const,
    },
    {
      icon: <AttachmentIcon fontSize="small" />,
      label: "Attachments",
      count: 0,
      color: "info" as const,
    },
  ];

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);
  const handleConnect = (index: number) => setActiveProvider(index);

  const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />

        {/* Main content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
            minHeight: "100vh",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: { xs: 2, sm: 3 },
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>

          {/* Main email interface */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              mb: 4,
              maxWidth: 1400,
              mx: "auto",
            }}
          >
            {/* Header with search */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "column" },
                alignItems: { xs: "stretch", md: "left" },
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
                backgroundColor: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                mt: 2,
              }}
            >
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Email Inbox
              </Typography>

              <Typography variant="body1" color="text.secondary" mt={-1}>
                View and manage your emails from different providers. Connect
                your accounts to get started.
              </Typography>

              {/* <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 0.5,
                  px: 1.5,
                  maxWidth: 400,
                  width: "100%",
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                }}
              >
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                <InputBase
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    ml: 1,
                    flex: 1,
                    "& .MuiInputBase-input": { py: 1 },
                  }}
                />
              </Paper> */}
            </Box>

            {/* Email providers selector */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {providers.map((provider, index) => (
                <Grid item xs={4} sm={4} md={4} key={index}>
                  <EmailProvider
                    provider={provider.name}
                    icon={provider.icon}
                    connected={provider.connected}
                    count={provider.count}
                    onConnect={() => handleConnect(index)}
                    isActive={activeProvider === index}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2}>
              {/* Left sidebar with categories */}
              <Grid item xs={12} sm={4} md={3}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1.5,
                      px: 1.5,
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    CATEGORIES
                  </Typography>

                  <Stack spacing={1}>
                    {categories.map((category, index) => (
                      <EmailCategory
                        key={index}
                        icon={category.icon}
                        label={category.label}
                        count={category.count}
                        color={category.color}
                        active={activeCategory === index}
                        onClick={() => setActiveCategory(index)}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>

              {/* Main email content */}
              <Grid item xs={12} sm={8} md={9}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: 1,
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      // borderBottom: `1px solid ${alpha(
                      //   theme.palette.divider,
                      //   0.7
                      // )}`,
                    }}
                  >
                    <EmailToolbar onRefresh={handleRefresh} />
                  </Box>

                  <Box sx={{ p: 0, height: "calc(100% - 68px)" }}>
                    {activeProvider === 0 && providers[0].connected ? (
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          border: 1,
                          borderColor: "divider",
                          height: "100%",
                        }}
                      >
                        <Box sx={{ p: 3 }}>
                          <CustomizedDataGrid />
                        </Box>
                      </Paper>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 6,
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            mb: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {providers[activeProvider].icon}
                        </Avatar>

                        <Typography variant="h6" gutterBottom>
                          {providers[activeProvider].connected
                            ? "No emails to display"
                            : `Connect ${providers[activeProvider].name}`}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3, maxWidth: 400 }}
                        >
                          {providers[activeProvider].connected
                            ? "Your inbox is empty or emails are still loading"
                            : `To access your ${providers[activeProvider].name} emails, you need to connect your account`}
                        </Typography>

                        {!providers[activeProvider].connected && (
                          <Button
                            variant="contained"
                            startIcon={providers[activeProvider].icon}
                            disableElevation
                            sx={{
                              borderRadius: 2,
                              py: 1,
                              px: 3,
                              textTransform: "none",
                              fontWeight: 600,
                              color: theme.palette.primary.main,
                            }}
                            onClick={() => {}}
                          >
                            Connect {providers[activeProvider].name}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
