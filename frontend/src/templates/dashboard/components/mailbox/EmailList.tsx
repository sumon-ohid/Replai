import * as React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Skeleton,
  useTheme,
  alpha,
  CircularProgress,
  TablePagination,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AttachmentIcon from "@mui/icons-material/AttachmentOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import LabelIcon from "@mui/icons-material/Label";
import { motion } from "framer-motion";

// Import your email data type
import { EmailData } from "./useEmailClient";

interface EmailListProps {
  emails: EmailData[];
  loading: boolean;
  onEmailSelect: (emailId: string) => void;
  onToggleStar: (emailId: string, starred: boolean) => void;
  onToggleRead: (emailId: string, read: boolean) => void;
  onDelete: (emailId: string) => void;
  searchTerm: string;
  currentFolder: string;
  onEmailClick: (emailId: string) => void;
  selectedEmailId: string | null;
  // New pagination props
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EmailList({
  emails,
  loading,
  onEmailSelect,
  onToggleStar,
  onToggleRead,
  onDelete,
  searchTerm,
  currentFolder,
  onEmailClick,
  selectedEmailId,
  // Default values for pagination props
  totalCount = 0,
  page = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
}: EmailListProps) {
  const theme = useTheme();
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeEmailId, setActiveEmailId] = React.useState<string | null>(null);
  
  // Use onEmailClick as a fallback for onEmailSelect if it exists
  const handleEmailSelect = React.useCallback((emailId: string) => {
    if (onEmailSelect) {
      onEmailSelect(emailId);
    } else if (onEmailClick) {
      onEmailClick(emailId);
    }
  }, [onEmailSelect, onEmailClick]);

  // Handle context menu opening
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    emailId: string
  ) => {
    event.stopPropagation();
    setActiveEmailId(emailId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveEmailId(null);
  };

  // Handle checkbox selection
  const handleSelectEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
    emailId: string
  ) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedEmails((prev) => [...prev, emailId]);
    } else {
      setSelectedEmails((prev) => prev.filter((id) => id !== emailId));
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp: number): string => {
    const now = new Date().getTime();
    const diff = now - timestamp;

    // Less than a minute
    if (diff < 60000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Otherwise return the date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Empty state
  if (!loading && emails.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          height: "100%",
          color: theme.palette.text.secondary,
        }}
      >
        <Box
          component={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          sx={{
            fontSize: "3rem",
            mb: 2,
            color: theme.palette.action.disabled,
          }}
        >
          {searchTerm ? "🔍" : currentFolder === "inbox" ? "📭" : "📪"}
        </Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ wordBreak: "break-word", textAlign: "center" }}
        >
          {searchTerm
            ? "No emails found matching your search"
            : `No emails in ${currentFolder}`}
        </Typography>
        <Typography
          variant="body2"
          sx={{ wordBreak: "break-word", textAlign: "center" }}
        >
          {searchTerm
            ? "Try using different keywords"
            : currentFolder === "inbox"
            ? "Your inbox is empty. Time to celebrate!"
            : `There are no emails in your ${currentFolder} folder.`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List disablePadding>
          {loading
            ? // Loading skeletons
              Array.from(new Array(10)).map((_, index) => (
                <ListItem key={index} disablePadding divider>
                  <Box sx={{ width: "100%", display: "flex", py: 1, px: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mr: 2,
                        width: 24,
                      }}
                    >
                      <Skeleton variant="circular" width={20} height={20} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mr: 2,
                        width: 40,
                      }}
                    >
                      <Skeleton variant="circular" width={40} height={40} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="90%" height={20} />
                    </Box>
                    <Box
                      sx={{
                        width: 100,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                  </Box>
                </ListItem>
              ))
            : // Actual email list
              emails.map((email) => (
                <ListItem
                  key={email.id}
                  disablePadding
                  divider
                  component={motion.li}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  sx={{
                    bgcolor: !email.isRead
                      ? alpha(theme.palette.primary.light, 0.08)
                      : "inherit",
                  }}
                >
                  <ListItemButton
                    onClick={() => handleEmailSelect(email.id)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        mr: 2,
                      }}
                    >
                      <Checkbox
                        checked={selectedEmails.includes(email.id)}
                        onChange={(e) => handleSelectEmail(e, email.id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{ p: 0.5 }}
                      />
                    </Box>

                    <ListItemAvatar>
                      <Avatar
                        alt={email.from.name}
                        src={email.from.avatar}
                        sx={{
                          bgcolor: !email.isRead
                            ? theme.palette.primary.main
                            : theme.palette.mode === "dark"
                            ? theme.palette.grey[700]
                            : theme.palette.grey[400],
                          width: 40,
                          height: 40,
                        }}
                      >
                        {email.from.name[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="body1"
                            component="span"
                            sx={{
                              fontWeight: !email.isRead ? 600 : 400,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: !email.isRead
                                ? theme.palette.text.primary
                                : theme.palette.text.secondary,
                            }}
                          >
                            {currentFolder === "sent"
                              ? email.to[0].name || email.to[0].email
                              : email.from.name || email.from.email}
                          </Typography>

                          {email.hasAttachments && (
                            <AttachmentIcon
                              fontSize="small"
                              sx={{
                                ml: 1,
                                color: theme.palette.text.secondary,
                                fontSize: 16,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              fontWeight: !email.isRead ? 600 : 400,
                              color: !email.isRead
                                ? theme.palette.text.primary
                                : theme.palette.text.secondary,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {email.subject}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              display: "block",
                              color: theme.palette.text.secondary,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {email.preview}
                          </Typography>
                        </React.Fragment>
                      }
                    />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        minWidth: "90px",
                        ml: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          whiteSpace: "nowrap",
                          mb: 0.5,
                        }}
                      >
                        {getRelativeTime(email.timestamp)}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(email.id, !email.isStarred);
                          }}
                          sx={{
                            p: 0.5,
                            color: email.isStarred ? "warning.main" : "inherit",
                          }}
                        >
                          {email.isStarred ? (
                            <StarIcon fontSize="small" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, email.id)}
                          sx={{ p: 0.5 }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
        </List>
      </Box>

      {/* Pagination */}
      {!loading && totalCount > 0 && onPageChange && onRowsPerPageChange && (
        <Paper 
          elevation={0}
          sx={{ 
            borderTop: 1, 
            borderColor: 'divider', 
            borderRadius: 0,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            sx={{
              '.MuiTablePagination-toolbar': {
                minHeight: 52,
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.775rem',
              }
            }}
          />
        </Paper>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeEmailId) {
              const email = emails.find((e) => e.id === activeEmailId);
              if (email) {
                onToggleRead(activeEmailId, !email.isRead);
              }
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {emails.find((e) => e.id === activeEmailId)?.isRead ? (
              <MarkEmailUnreadIcon fontSize="small" />
            ) : (
              <MarkEmailReadIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {emails.find((e) => e.id === activeEmailId)?.isRead
              ? "Mark as unread"
              : "Mark as read"}
          </ListItemText>
        </MenuItem>

        <Divider />
        
        <MenuItem
          onClick={() => {
            if (activeEmailId) {
              onDelete(activeEmailId);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}