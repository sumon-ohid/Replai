import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  useTheme, 
  Box,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Stack, 
  Tooltip,
  Tab,
  Tabs,
  alpha
} from '@mui/material';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import AttachmentIcon from '@mui/icons-material/AttachmentOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
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

export default EmailDetailsModal;