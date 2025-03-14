import * as React from 'react';
import { DataGrid, GridColDef, GridRowsProp, gridClasses } from '@mui/x-data-grid';
import axios from 'axios';
import { 
  Button, 
  Typography, 
  useTheme, 
  TextField, 
  Box,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Paper,
  Stack, 
  Tooltip,
  Tab,
  Tabs,
  Badge,
  Divider,
  Fade,
  Skeleton,
  alpha,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import AttachmentIcon from '@mui/icons-material/AttachmentOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import LabelIcon from '@mui/icons-material/Label';
import SettingsIcon from '@mui/icons-material/Settings';
import CreateIcon from '@mui/icons-material/Create';

import EmailDetailsModal from './EmailDetails';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface EmailRow {
  id: number;
  subject: string;
  status: string;
  to: string;
  dateSent: string;
  from: string;
  content: string;
  isRead?: boolean;
  hasAttachment?: boolean;
  isStarred?: boolean;
  avatar?: string;
  preview?: string;
  folder?: string;
}

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface EmailDetailsModalProps {
  open: boolean;
  onClose: () => void;
  email: EmailRow | null;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Mock email accounts for demo
const emailAccounts: EmailAccount[] = [
  { id: '1', name: 'Work', email: 'work@example.com', avatar: '👔' },
  { id: '2', name: 'Personal', email: 'personal@example.com', avatar: '🏠' },
  { id: '3', name: 'Business', email: 'business@example.com', avatar: '💼' },
];

// Custom styled components
const SidebarItem = ({ icon, label, count, selected, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  count?: number, 
  selected?: boolean,
  onClick?: () => void
}) => {
  const theme = useTheme();
  
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 1,
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        color: selected ? theme.palette.primary.main : theme.palette.text.primary,
        '&:hover': {
          backgroundColor: selected 
            ? alpha(theme.palette.primary.main, 0.15) 
            : alpha(theme.palette.action.hover, 0.8),
        }
      }}
    >
      <ListItemIcon sx={{ 
        minWidth: 36,
        color: selected ? theme.palette.primary.main : theme.palette.text.secondary
      }}>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={label} 
        primaryTypographyProps={{ 
          fontWeight: selected ? 600 : 500,
          fontSize: '0.875rem',
        }}
      />
      {count !== undefined && (
        <Chip
          label={count}
          size="small"
          color={selected ? "primary" : "default"}
          sx={{ 
            height: 22,
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      )}
    </ListItemButton>
  );
};

export default function CustomizedDataGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [rows, setRows] = React.useState<EmailRow[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<EmailRow[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState<EmailRow | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentFolder, setCurrentFolder] = React.useState<string>('inbox');
  const [selectedAccount, setSelectedAccount] = React.useState<string>(emailAccounts[0].id);
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = React.useState<null | HTMLElement>(null);
  
  // Handle account menu
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  
  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };
  
  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    handleAccountMenuClose();
    fetchEmails(accountId, currentFolder);
  };

  const selectedAccountData = emailAccounts.find(acc => acc.id === selectedAccount);

  // Filter menu handling
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
    fetchEmails(selectedAccount, folder);
    setMobileMenuOpen(false);
  };

  const fetchEmails = async (accountId: string = selectedAccount, folder: string = currentFolder) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      // Simulate different folders for demo
      let endpoint = `${apiBaseUrl}/api/emails/get-emails`;
      if (folder !== 'inbox') {
        // In a real app, you would have different endpoints or query params
        endpoint = `${apiBaseUrl}/api/emails/${folder}`;
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          accountId,
          folder
        }
      });
      
      const emails: any[] = response.data as any[];

      const formattedEmails = emails.map((email: any, index: number) => ({
        id: index + 1,
        subject: email.subject || 'No subject',
        status: folder === 'sent' ? 'Sent' : (folder === 'drafts' ? 'Draft' : 'Received'),
        from: email.sender || 'No sender',
        to: email.receiver || 'No receiver',
        content: email.bodyPreview || 'No content',
        dateSent: new Date(email.timeSent).toLocaleString() || 'No date',
        isRead: folder === 'inbox' ? Math.random() > 0.4 : true,
        hasAttachment: Math.random() > 0.7,
        isStarred: Math.random() > 0.8,
        preview: email.bodyPreview?.substring(0, 100) + '...' || 'No preview available...',
        folder
      }));

      setRows(formattedEmails);
      setFilteredRows(formattedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      
      // Demo data for offline testing
      const demoEmails: EmailRow[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        subject: folder === 'drafts' 
          ? `Draft: Meeting agenda for next week ${i + 1}` 
          : `${folder === 'sent' ? 'RE: ' : ''}Important update about the project ${i + 1}`,
        status: folder === 'sent' ? 'Sent' : (folder === 'drafts' ? 'Draft' : 'Received'),
        from: folder === 'sent' ? selectedAccountData?.email || 'me@example.com' : `contact${i+1}@example.com`,
        to: folder === 'sent' ? `client${i+1}@example.com` : selectedAccountData?.email || 'me@example.com',
        content: `This is a sample email content. It contains information about the project update ${i + 1}.`,
        dateSent: new Date(Date.now() - i * 3600000 * 24).toLocaleString(),
        isRead: folder === 'inbox' ? Math.random() > 0.4 : true,
        hasAttachment: Math.random() > 0.7,
        isStarred: Math.random() > 0.8,
        preview: `This is a sample email content preview. It contains information about the project update ${i + 1}...`,
        folder
      }));
      
      setRows(demoEmails);
      setFilteredRows(demoEmails);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmails();
  }, []);

  const handleRowClick = (params: any) => {
    const index = filteredRows.findIndex(row => row.id === params.id);
    const email = filteredRows.find(row => row.id === params.id);
    setSelectedEmail(email || null);
    setSelectedIndex(index);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmail(null);
  };

  const handlePreviousEmail = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedEmail(filteredRows[newIndex]);
    }
  };
  
  const handleNextEmail = () => {
    if (selectedIndex < filteredRows.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedEmail(filteredRows[newIndex]);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearch(value);
    const filtered = rows.filter(row =>
      row.subject.toLowerCase().includes(value) ||
      row.from.toLowerCase().includes(value) ||
      row.to.toLowerCase().includes(value) ||
      row.content.toLowerCase().includes(value)
    );
    setFilteredRows(filtered);
  };
  
  const handleClearSearch = () => {
    setSearch('');
    setFilteredRows(rows);
  };
  
  const handleRefresh = () => {
    fetchEmails(selectedAccount, currentFolder);
  };

  const handleToggleStarred = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, isStarred: !row.isStarred } : row
    ));
    setFilteredRows(prev => prev.map(row => 
      row.id === id ? { ...row, isStarred: !row.isStarred } : row
    ));
  };

  const handleMarkAsRead = (ids: number[], read: boolean) => {
    setRows(prev => prev.map(row => 
      ids.includes(row.id) ? { ...row, isRead: read } : row
    ));
    setFilteredRows(prev => prev.map(row => 
      ids.includes(row.id) ? { ...row, isRead: read } : row
    ));
  };

  const getUnreadCount = (folder: string): number => {
    return rows.filter(email => email.folder === folder && !email.isRead).length;
  };

  // Enhanced columns with better rendering
  const enhancedColumns: GridColDef[] = [
    { 
      field: 'recipient',
      headerName: 'Recipient', 
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          minWidth: 0, // Fix for text truncation in flexbox
        }}>
          <Avatar 
            sx={{ 
              width: 28, 
              height: 28, 
              fontSize: '0.85rem',
              bgcolor: !params.row.isRead ? theme.palette.primary.main : theme.palette.grey[500]
            }}
          >
            {(params.row.avatar)}
          </Avatar>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: params.row.isRead ? 400 : 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.row.to}
          </Typography>
          {params.row.hasAttachment && (
            <AttachmentIcon 
              fontSize="small" 
              sx={{ ml: 'auto', color: theme.palette.text.secondary, fontSize: 16 }} 
            />
          )}
        </Box>
      )
    },
    { 
      field: 'subject', 
      headerName: 'Subject', 
      flex: 3,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: params.row.isRead ? 400 : 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {params.value}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: params.row.isRead ? 400 : 500,
            }}
          >
            {params.row.preview}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'dateSent', 
      headerName: 'Date', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="body2" color="textSecondary">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Star',
      width: 70,
      flex: 0.5,
      minWidth: 50,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => handleToggleStarred(params.row.id, e)}
            sx={{ color: params.row.isStarred ? theme.palette.warning.main : theme.palette.text.disabled }}
          >
            {params.row.isStarred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      )
    }
  ];

  const navigate = useNavigate();

  // Sidebar content with folders and labels
  const sidebarContent = (
    <Stack spacing={1} sx={{height: {xs: "100%", sm: "auto"},  p: 2, backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
          }}
        >
          Mail
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          disableElevation
          sx={{
            borderRadius: 6,
            px: 2,
            size: 'small',
            textTransform: 'none',
            fontWeight: 400,
            boxShadow: theme.palette.mode === 'dark'
              ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
              : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          Compose
        </Button>
      </Box>
      
      <Button
        onClick={handleAccountMenuOpen}
        variant="outlined"
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          borderRadius: 2,
          mb: 2,
          py: 1,
          borderColor: theme.palette.divider,
          '&:hover': {
            borderColor: theme.palette.primary.main
          }
        }}
        startIcon={
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: theme.palette.primary.main,
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            {selectedAccountData?.avatar || selectedAccountData?.name.charAt(0)}
          </Avatar>
        }
        endIcon={
          <KeyboardArrowRightIcon fontSize="small" sx={{ ml: 'auto', color: theme.palette.action.active }} />
        }
      >
        <Box sx={{ textAlign: 'left', flexGrow: 1, overflow: 'hidden'}}>
          <Typography 
            noWrap 
            variant="body2" 
            fontWeight={600}
            color={theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black}
          >
            {/* {selectedAccountData?.name} */}
          </Typography>
          <Typography 
            noWrap 
            variant="caption" 
            color="text.secondary"
          >
            {selectedAccountData?.email}
          </Typography>
        </Box>
      </Button>
      
      <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto', scrollbarWidth: 'thin'}}>
        <SidebarItem 
          icon={<InboxIcon fontSize="small" />} 
          label="Inbox" 
          count={getUnreadCount('inbox')}
          selected={currentFolder === 'inbox'}
          onClick={() => handleFolderChange('inbox')}
        />
        <SidebarItem 
          icon={<DraftsIcon fontSize="small" />} 
          label="Drafts" 
          count={rows.filter(email => email.folder === 'drafts').length}
          selected={currentFolder === 'drafts'}
          onClick={() => handleFolderChange('drafts')}
        />
        <SidebarItem 
          icon={<SendIcon fontSize="small" />} 
          label="Sent" 
          selected={currentFolder === 'sent'}
          onClick={() => handleFolderChange('sent')}
        />
        <SidebarItem 
          icon={<StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />} 
          label="Starred" 
          count={rows.filter(email => email.isStarred).length}
          selected={currentFolder === 'starred'}
          onClick={() => handleFolderChange('starred')}
        />
        
        <Divider sx={{ my: 2 }} />
        
        {/* Labels section */}
        <Typography 
          variant="overline" 
          sx={{ 
            px: 2, 
            py: 1, 
            display: 'block', 
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          Labels
        </Typography>
        
        <SidebarItem 
          icon={<LabelIcon fontSize="small" sx={{ color: theme.palette.success.main }} />} 
          label="Work" 
        />
        <SidebarItem 
          icon={<LabelIcon fontSize="small" sx={{ color: theme.palette.info.main }} />} 
          label="Personal" 
        />
        <SidebarItem 
          icon={<LabelIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />} 
          label="Important" 
        />
        <SidebarItem 
          icon={<LabelIcon fontSize="small" sx={{ color: theme.palette.error.main }} />} 
          label="Urgent"
        />
      </List>
      
      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          color: theme.palette.text.secondary,
          fontWeight: 500,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.8)
          }
        }}
        onClick={() => navigate('/email-manager')}
      >
        Email settings
      </Button>
    </Stack>
  );

  const mainContent = (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          gap: 2
        }}
      >
        {isMobile && (
          <IconButton 
            edge="start" 
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 1}}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          sx={{ 
            display: { xs: 'block', md: 'none' }, 
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
          }}
        >
          {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
        </Typography>
        
        <TextField
          placeholder="Search emails..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }
            }
          }}
          sx={{ 
            flexGrow: 1,
            maxWidth: { xs: '100%', sm: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Menu options">
            <IconButton
              size="small"
              onClick={handleFilterMenuOpen}
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={handleRefresh}
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                animation: loading ? 'spin 1.5s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            disableElevation
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={() => handleMarkAsRead(filteredRows.filter(r => !r.isRead).map(r => r.id), true)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              display: { xs: 'none', sm: 'flex' },
              boxShadow: theme.palette.mode === 'dark'
                ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            Mark All Read
          </Button>
        </Box>
      </Box>
      
      {/* Email count and filter summary */}
      <Stack 
        direction="row" 
        justifyContent="space-between"
        alignItems="center"
        sx={{ 
          mb: 2,
          px: 2,
          py: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.4),
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {filteredRows.length} email{filteredRows.length !== 1 ? 's' : ''} 
          {search && ` matching "${search}"`}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentFolder === 'inbox' && (
            <Chip
              label={`${filteredRows.filter(row => !row.isRead).length} unread`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 1, fontWeight: 500 }}
            />
          )}
          
          <Chip
            icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
            label={`${filteredRows.filter(row => row.isStarred).length} starred`}
            size="small"
            variant="outlined"
            sx={{ 
              fontWeight: 500, 
              color: theme.palette.warning.dark,
              borderColor: theme.palette.warning.main,
              '& .MuiChip-icon': {
                color: theme.palette.warning.main
              }
            }}
          />
        </Box>
      </Stack>
      
      {/* Email list */}
        <DataGrid
          rows={filteredRows}
          columns={enhancedColumns}
          pagination={true}
          rowCount={filteredRows.length}
          getRowClassName={(params) => {
            const isUnread = !params.row.isRead && currentFolder === 'inbox';
            return `${params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'} ${isUnread ? 'unread-row' : ''}`;
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
          }}
          pageSizeOptions={[10, 15, 25, 50]}
          disableColumnResize
          autoHeight
          density="comfortable"
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
              '&.unread-row': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                }
              },
            },
            '& .MuiDataGrid-cell': {
              py: 1.5,
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeader': {
              py: 1.5,
              px: 2,
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              color: (theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
            },
            border: 'none',
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : theme.palette.background.paper,
            },
            '& .MuiDataGrid-main': {
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            },
            '& .MuiTablePagination-root': {
              color: (theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
            },
            '& .MuiCircularProgress-root': {
              color: (theme) => theme.palette.primary.main,
            },
            '& .MuiDataGrid-selectedRowCount': {
              color: (theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
            },
            '& .MuiCheckbox-root': {
              color: (theme) => theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.secondary,
              marginLeft: 0,
            },
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`
              : `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: 'outlined',
                  size: 'small',
                },
                columnInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                operatorInputProps: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { mt: 'auto' },
                },
              },
            },
            // Improved loading overlay
            loadingOverlay: {
              sx: {
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(4px)',
              }
            },
            // Improved no rows overlay
            noRowsOverlay: {
              sx: {
                padding: 3,
              }
            },
            // Custom toolbar
            toolbar: {
              sx: {
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
              }
            },
            pagination: {
              labelRowsPerPage: 'Emails per page:',
            },
          }}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelectionModel) => {
            const selectedEmails = newSelectionModel as number[];
            console.log('Selected emails:', selectedEmails);
            // You can implement bulk actions for selected emails here
          }}
          localeText={{
            noRowsLabel: 'No emails found',
            footerRowSelected: (count) => `${count} email${count !== 1 ? 's' : ''} selected`,
          }}
        />
    </Box>
  );

  return (
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
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          mb: 4,
          maxWidth: 1400,
          mx: "auto",
        }}
      >

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 280 } }}
        >
          <Box sx={{ width: 280, height: '100%', overflow: 'auto' }}>
            {sidebarContent}
          </Box>
        </Drawer>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280 }}>
            {sidebarContent}
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            {mainContent}
          </Box>
        </Box>
      </Box>
      
      {/* Email details modal */}
      <EmailDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        email={selectedEmail}
        onPrevious={handlePreviousEmail}
        onNext={handleNextEmail}
        hasPrevious={selectedIndex > 0}
        hasNext={selectedIndex < filteredRows.length - 1}
      />
      
      {/* Account menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 220,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {emailAccounts.map((account) => (
          <MenuItem key={account.id} onClick={() => handleAccountChange(account.id)}>
            <ListItemIcon>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {account.avatar || account.name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={account.name} secondary={account.email} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Filter menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 220,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <MenuItem onClick={() => handleFolderChange('inbox')}>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </MenuItem>
        <MenuItem onClick={() => handleFolderChange('drafts')}>
          <ListItemIcon>
            <DraftsIcon />
          </ListItemIcon>
          <ListItemText primary="Drafts" />
        </MenuItem>
        <MenuItem onClick={() => handleFolderChange('sent')}>
          <ListItemIcon>
            <SendIcon />
          </ListItemIcon>
          <ListItemText primary="Sent" />
        </MenuItem>
        <MenuItem onClick={() => handleFolderChange('starred')}>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Starred" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
