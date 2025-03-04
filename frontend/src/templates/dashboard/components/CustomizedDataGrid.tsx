import * as React from 'react';
import { DataGrid, GridColDef, GridRowsProp, gridClasses } from '@mui/x-data-grid';
import axios from 'axios';
import { columns } from '../internals/data/gridData';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
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
  alpha
} from '@mui/material';
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

const EmailDetailsModal: React.FC<EmailDetailsModalProps> = ({ 
  open, 
  onClose, 
  email, 
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const [isStarred, setIsStarred] = React.useState(false);
  
  React.useEffect(() => {
    if (email) {
      setIsStarred(email.isStarred || false);
    }
  }, [email]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!email) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getSenderName = (email: string) => {
    const parts = email.split('<');
    if (parts.length > 1) {
      return parts[0].trim();
    }
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formatEmailAddress = (email: string) => {
    const parts = email.split('<');
    if (parts.length > 1) {
      return `${parts[0].trim()} <${parts[1]}`;
    }
    return email;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      sx={{
        backdropFilter: "blur(5px)",
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
            // dark background color for dark mode
          backgroundColor: 'background.paper',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
          <IconButton onClick={onClose} size="small">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Email Details
          </Typography>
          
          <Chip
            label={email.status}
            size="small"
            color={email.status === "Sent" ? "success" : "primary"}
            sx={{ 
              ml: 1,
              fontWeight: 500,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              height: 24
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Previous email">
            <span>
              <IconButton 
                size="small" 
                onClick={onPrevious}
                disabled={!hasPrevious}
              >
                <KeyboardArrowLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Next email">
            <span>
              <IconButton 
                size="small"
                onClick={onNext}
                disabled={!hasNext}
              >
                <KeyboardArrowRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Close">
            <IconButton onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
        <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          {/* Email Header */}
          <Box 
            sx={{ 
              p: 3,
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.4)
                : alpha(theme.palette.background.paper, 0.4)
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  lineHeight: 1.3
                }}
              >
                {email.subject}
              </Typography>
              
              <IconButton 
                onClick={() => setIsStarred(!isStarred)}
                sx={{ 
                  color: isStarred 
                    ? theme.palette.warning.main 
                    : theme.palette.text.secondary 
                }}
              >
                {isStarred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={email.avatar} 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {getInitials(email.from)}
                </Avatar>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {getSenderName(email.from)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatEmailAddress(email.from)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize="small" sx={{ fontSize: 16 }} />
                  {email.dateSent}
                </Typography>
                
                {email.hasAttachment && (
                  <Chip
                    icon={<AttachmentIcon />}
                    label="Attachment"
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Box>
          
          {/* Tabs for Content/Details */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                px: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 100,
                  fontWeight: 500
                }
              }}
            >
              <Tab label="Message" />
              <Tab label="Details" />
            </Tabs>
          </Box>
          
          {/* Email Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, py: 2 }}>
            {tabValue === 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  backgroundColor: theme.palette.background.paper,
                  minHeight: 300
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {email.content}
                </Typography>
              </Paper>
            )}
            
            {tabValue === 1 && (
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    To
                  </Typography>
                  <Typography variant="body1">
                    {formatEmailAddress(email.to)}
                  </Typography>
                </Paper>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Subject
                  </Typography>
                  <Typography variant="body1">
                    {email.subject}
                  </Typography>
                </Paper>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                      Delivery Time
                    </Typography>
                    <Typography variant="body1">
                      {email.dateSent}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={email.status} 
                    color={email.status === "Sent" ? "success" : "primary"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Paper>
              </Stack>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      {/* Action Buttons */}
      <DialogActions 
        sx={{ 
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: theme.palette.divider,
          backgroundColor: 'background.paper'
        }}
      >
        <Box>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            disableElevation
            sx={{
              mb: { xs: 1, sm: 0 },
              borderRadius: 2,
              mr: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Reply
          </Button>
          <Button
            variant="outlined"
            startIcon={<ForwardToInboxIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Forward
          </Button>
        </Box>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CustomizedDataGrid() {
  const theme = useTheme();
  const [rows, setRows] = React.useState<EmailRow[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<EmailRow[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState<EmailRow | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${apiBaseUrl}/api/emails/get-emails`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const emails: any[] = response.data as any[];

      const formattedEmails = emails.map((email: any, index: number) => ({
        id: index + 1,
        subject: email.subject || 'No subject',
        status: 'Sent', // Adjust as needed
        from: email.sender || 'No sender',
        to: email.receiver || 'No receiver',
        content: email.bodyPreview || 'No content',
        dateSent: new Date(email.timeSent).toLocaleString() || 'No date',
        isRead: true, //Math.random() > 0.3, // Mock data
        hasAttachment: false, //Math.random() > 0.7, // Mock data
        isStarred: true, //Math.random() > 0.8, // Mock data
        preview: email.bodyPreview?.substring(0, 100) + '...' || 'No preview available...',
      }));

      setRows(formattedEmails);
      setFilteredRows(formattedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
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
    fetchEmails();
  };

  // Enhanced columns with better rendering
  const enhancedColumns: GridColDef[] = [
    { 
      field: 'from', 
      headerName: 'Sender', 
      flex: 2,
      minWidth: 180,
      renderCell: (params) => {
        const name = params.value.split('<')[0] || params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem'
              }}
            >
              {name.trim().charAt(0).toUpperCase()}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: params.row.isRead ? 400 : 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {name}
            </Typography>
          </Box>
        );
      }
    },
    { 
      field: 'subject', 
      headerName: 'Subject', 
      flex: 3,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
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
              textOverflow: 'ellipsis'
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
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: params.row.isRead ? 400 : 600 }}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          size="small"
          color={params.value === 'Sent' ? 'success' : 'primary'}
          sx={{ 
            fontWeight: 500,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Star">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                const newRows = rows.map(row => 
                  row.id === params.row.id ? { ...row, isStarred: !row.isStarred } : row
                );
                setRows(newRows);
                setFilteredRows(newRows.filter(row =>
                  row.subject.toLowerCase().includes(search.toLowerCase()) ||
                  row.from.toLowerCase().includes(search.toLowerCase()) ||
                  row.to.toLowerCase().includes(search.toLowerCase()) ||
                  row.content.toLowerCase().includes(search.toLowerCase())
                ));
              }}
              sx={{ 
                color: params.row.isStarred 
                  ? theme.palette.warning.main 
                  : theme.palette.text.secondary 
              }}
            >
              {params.row.isStarred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Archive">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Archive logic here
              }}
            >
              <ArchiveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          gap: 2
        }}
      >
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
          <Tooltip title="Filter">
            <IconButton
              size="small"
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2
              }}
            >
              <FilterListIcon fontSize="small" />
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
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
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
        <Typography variant="body2" color="text.secondary">
          {filteredRows.length} email{filteredRows.length !== 1 ? 's' : ''} 
          {search && ` matching "${search}"`}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={`${filteredRows.filter(row => !row.isRead).length} unread`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mr: 1, fontWeight: 500 }}
          />
          
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
      
      <Paper
        elevation={0}
        sx={{ 
          height: 500, 
          width: '100%',
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.divider,
          overflow: 'hidden',
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            py: 1,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          [`& .${gridClasses.row}.even`]: {
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.common.white, 0.02)
              : alpha(theme.palette.common.black, 0.02)
          }
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={enhancedColumns}
          pagination={true}
          rowCount={filteredRows.length}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          }
          getRowHeight={() => 'auto'}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableColumnResize={false}
          density="comfortable"
          onRowClick={handleRowClick}
          loading={loading}
          disableColumnMenu
          slotProps={{
            pagination: {
              sx: { 
                '& .MuiTablePagination-toolbar': { 
                  flexWrap: 'wrap' 
                } 
              }
            }
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              padding: '12px 16px',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '12px 16px',
            }
          }}
        />
      </Paper>
      
      <EmailDetailsModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        email={selectedEmail}
        onPrevious={handlePreviousEmail}
        onNext={handleNextEmail}
        hasPrevious={selectedIndex > 0}
        hasNext={selectedIndex < filteredRows.length - 1}
      />
    </>
  );
}
