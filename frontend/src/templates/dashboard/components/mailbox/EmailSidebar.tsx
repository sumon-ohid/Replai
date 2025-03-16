import * as React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Menu,
  MenuItem,
  ListItemAvatar
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import InboxIcon from '@mui/icons-material/Inbox';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import LabelIcon from '@mui/icons-material/Label';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';

import { EmailAccount } from './useEmailClient';

interface EmailSidebarProps {
  accounts: EmailAccount[];
  selectedAccount: string;
  currentFolder: string;
  unreadCounts: Record<string, number>;
  onAccountChange: (accountId: string) => void;
  onFolderChange: (folder: string) => void;
  onCompose: () => void;
  onCloseMobileSidebar: () => void;
  onComposeClick: () => void;
  isMobile: boolean;
}

export default function EmailSidebar({
  accounts,
  selectedAccount,
  currentFolder,
  unreadCounts,
  onAccountChange,
  onFolderChange,
  onCompose,
  onCloseMobileSidebar,
  isMobile
}: EmailSidebarProps) {
  const theme = useTheme();
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<HTMLElement | null>(null);
  
  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleAccountSelect = (accountId: string) => {
    onAccountChange(accountId);
    handleAccountMenuClose();
  };

  const folderItems = [
    { 
      id: 'inbox',
      label: 'Inbox',
      icon: <InboxIcon color={currentFolder === 'inbox' ? 'primary' : 'inherit'} />,
      count: unreadCounts.inbox || 0
    },
    { 
      id: 'drafts',
      label: 'Drafts', 
      icon: <DraftsIcon color={currentFolder === 'drafts' ? 'primary' : 'inherit'} />,
      count: unreadCounts.drafts || 0
    },
    { 
      id: 'sent',
      label: 'Sent', 
      icon: <SendIcon color={currentFolder === 'sent' ? 'primary' : 'inherit'} />
    },
    { 
      id: 'starred',
      label: 'Starred', 
      icon: <StarIcon color={currentFolder === 'starred' ? 'primary' : 'inherit'} sx={{ color: currentFolder !== 'starred' ? theme.palette.warning.main : undefined }} />,
      count: unreadCounts.starred || 0
    },
    { 
      id: 'trash',
      label: 'Trash', 
      icon: <DeleteIcon color={currentFolder === 'trash' ? 'primary' : 'inherit'} />
    }
  ];

  // Labels data
  const labels = [
    { id: 'work', name: 'Work', color: theme.palette.success.main },
    { id: 'personal', name: 'Personal', color: theme.palette.info.main },
    { id: 'important', name: 'Important', color: theme.palette.warning.main },
    { id: 'urgent', name: 'Urgent', color: theme.palette.error.main },
  ];

  return (
    <Box 
      component={motion.div}
      initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: isMobile ? 0 : 2,
        pt: 1,
        pb: 2,
        px: 2,
        mr: isMobile ? 0 : 1,
        backgroundColor: 'background.default'
      }}
    >
      {/* Mobile close button */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton onClick={onCloseMobileSidebar} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, backgroundColor: 'background.default', borderRadius: 2, px: 2, py: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}
        >
          Mailbox
        </Typography>
        
        <Button
          variant="contained"
          disableElevation
          startIcon={<CreateIcon />}
          onClick={onCompose}
          sx={{
            borderRadius: 8,
            px: 2,
            py: 1,
            textTransform: 'none',
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
            }
          }}
        >
          Compose
        </Button>
      </Box>

      {/* Account selector */}
      <Button
        fullWidth
        onClick={handleAccountMenuOpen}
        sx={{
          justifyContent: 'flex-start',
          borderRadius: 2,
          py: 1,
          px: 1.5,
          mb: 2,
          border: '1px solid',
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          textTransform: 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: theme.palette.primary.main,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              mr: 1.5
            }}
          >
            {selectedAccountData?.avatar || selectedAccountData?.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 500, color: 'text.primary' }}
            >
              {/* {selectedAccountData?.name} */}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ display: 'block', color: 'text.secondary' }}
            >
              {selectedAccountData?.email}
            </Typography>
          </Box>
          <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary', ml: 0.5 }} />
        </Box>
      </Button>

      {/* Folders list */}
      <List disablePadding sx={{ mb: 2 }}>
        {folderItems.map((folder) => (
          <ListItemButton
            key={folder.id}
            selected={currentFolder === folder.id}
            onClick={() => {
              onFolderChange(folder.id);
              if (isMobile) onCloseMobileSidebar();
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              px: 1.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: currentFolder === folder.id ? theme.palette.primary.main : 'inherit' }}>
              {folder.icon}
            </ListItemIcon>
            <ListItemText 
              primary={folder.label}
              primaryTypographyProps={{
                fontWeight: currentFolder === folder.id ? 600 : 400,
                color: currentFolder === folder.id ? theme.palette.primary.main : 'text.primary'
              }}
            />
            {typeof folder.count === 'number' && folder.count > 0 && (
              <Chip
                label={folder.count}
                size="small"
                color={currentFolder === folder.id ? "primary" : "default"}
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Labels section */}
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 0.5,
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        Labels
      </Typography>

      <List disablePadding>
        {labels.map((label) => (
          <ListItemButton
            key={label.id}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 0.75,
              px: 1.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LabelIcon sx={{ color: label.color }} />
            </ListItemIcon>
            <ListItemText 
              primary={label.name}
              primaryTypographyProps={{
                fontSize: '0.875rem'
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Account switcher menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        sx={{
          '& .MuiPaper-root': {
            width: 250,
            maxWidth: '100%',
            borderRadius: 2,
            mt: 1
          }
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            pt: 1.5,
            pb: 1,
            fontWeight: 600
          }}
        >
          Switch account
        </Typography>
        
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            selected={account.id === selectedAccount}
            onClick={() => handleAccountSelect(account.id)}
            sx={{
              py: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              }
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  mr: 1.5
                }}
              >
                {account.avatar || account.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={account.name}
              primaryTypographyProps={{
                fontWeight: account.id === selectedAccount ? 600 : 400
              }}
              secondary={account.email}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
