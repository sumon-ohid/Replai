import * as React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface EmailHeaderProps {
  currentFolder: string;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  isLoading: boolean;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function EmailHeader({
  currentFolder,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onRefresh,
  onMarkAllRead,
  isLoading,
  onToggleSidebar,
  isSidebarCollapsed = false,
}: EmailHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Format folder name for display
  const formattedFolderName = React.useMemo(() => {
    return currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1);
  }, [currentFolder]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "row", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {onToggleSidebar && (
        <IconButton
          onClick={onToggleSidebar}
          size="small"
          sx={{
            bgcolor: alpha(
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[50],
              0.6
            ),
            borderRadius: 2,
            "&:hover": {
              bgcolor: alpha(
                theme.palette.mode === "dark"
                  ? theme.palette.grey[800]
                  : theme.palette.grey[50],
                0.8
              ),
            },
          }}
        >
          {isSidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      )}

      {/* Folder title - only shown on desktop */}
      {!isMobile && (
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexShrink: 0,
            display: { xs: "none", sm: "none", md: "block" },
          }}
        >
          {formattedFolderName}
        </Typography>
      )}

      {/* Search field */}
      <TextField
        placeholder="Search emails..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={onClearSearch}
                edge="end"
                aria-label="clear search"
                sx={{ height: "80%", p: 0 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          },
        }}
        sx={{
          flexGrow: 1,
          maxWidth: { xs: "100%", md: 400 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Refresh">
          <IconButton
            onClick={onRefresh}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: theme.palette.divider,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              animation: isLoading ? "spin 1.5s linear infinite" : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {currentFolder === "inbox" && (
          <Button
            variant="contained"
            disableElevation
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={onMarkAllRead}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              display: { xs: "none", sm: "flex" },
              "&:hover": {
                boxShadow: theme.shadows[1],
              },
            }}
          >
            Mark All Read
          </Button>
        )}
      </Box>
    </Box>
  );
}
