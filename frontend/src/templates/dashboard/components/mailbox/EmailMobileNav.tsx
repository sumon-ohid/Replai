import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import StarIcon from "@mui/icons-material/Star";
import CreateIcon from "@mui/icons-material/Create";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

interface EmailMobileNavProps {
  currentFolder: string;
  onOpenSidebar: () => void;
  unreadCount: number;
  onCompose?: () => void;
}

export default function EmailMobileNav({
  currentFolder,
  onOpenSidebar,
  unreadCount,
  onCompose,
}: EmailMobileNavProps) {
  const theme = useTheme();

  // Map folders to display names and icons
  const folderData = React.useMemo(
    () => ({
      inbox: { name: "Inbox", icon: InboxIcon },
      drafts: { name: "Drafts", icon: DraftsIcon },
      sent: { name: "Sent", icon: SendIcon },
      starred: { name: "Starred", icon: StarIcon },
    }),
    []
  );

  const currentFolderData =
    folderData[currentFolder as keyof typeof folderData] || folderData.inbox;
  const FolderIcon = currentFolderData.icon;

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        borderRadius: 2,
      }}
    >
      <Toolbar
        sx={{
          px: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onOpenSidebar}
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
          <FolderIcon
            sx={{
              ml: 2,
              color:
                currentFolder === "starred"
                  ? theme.palette.warning.main
                  : "inherit",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 2 }}>
            {currentFolderData.name}
            {currentFolder === "inbox" && unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="primary"
                sx={{
                  ml: 3,
                  "& .MuiBadge-badge": {
                    fontSize: "0.75rem",
                    height: 18,
                    minWidth: 18,
                  },
                }}
              />
            )}
          </Typography>
        </Box>
        {/* Compose button */}
        {onCompose && (
          <Tooltip title="Compose new email" placement="right">
            <Button
              variant="outlined"
              disableElevation
              startIcon={<CreateIcon />}
              onClick={onCompose}
              sx={{
                borderRadius: 8,
                px: 2,
                py: 0.75,
                display: "flex",
                textTransform: "none",
                justifyContent: "right",
                alignItems: "right",
                minWidth: 0,
                [theme.breakpoints.down("sm")]: {
                  px: 1.5,
                  "& .MuiButton-startIcon": {
                    mr: 0,
                  },
                  "& .MuiButton-startIcon>*:nth-of-type(1)": {
                    fontSize: "1.2rem",
                  },
                  "& .MuiButton-endIcon>*:nth-of-type(1)": {
                    fontSize: "1rem",
                  },
                },
              }}
            >
              <Box sx={{ display: { xs: "none", sm: "block" } }}>Compose</Box>
            </Button>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
}
