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
        field: 'recipient',
        headerName: 'Recipient',
        flex: 1.5,
        minWidth: 150,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonOutlineIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography 
              variant="body2" 
              color="text.primary"
              sx={{ fontWeight: params.row.isRead ? 500 : 600 }}
            >
              {params.row.to}
            </Typography>
          </Box>
        )
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
          <Tooltip title="Filter" sx={{ display: { xs: 'none', sm: 'block' } }}>
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
          
          <Tooltip title="Refresh" sx={{ display: { xs: 'none', sm: 'block' } }}>
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
