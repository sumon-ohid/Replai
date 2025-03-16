import * as React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Button,
  Tooltip,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AttachmentIcon from '@mui/icons-material/AttachmentOutlined';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import { motion } from 'framer-motion';
import { EmailData } from './useEmailClient';

interface EmailDetailViewProps {
  email: EmailData;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onReply: (email: EmailData) => void;
  onForward: (email: EmailData) => void;
  onDelete: (emailId: string) => void;
  onToggleStar: (emailId: string, starred: boolean) => void;
  onToggleRead: (emailId: string, read: boolean) => void;
}

export default function EmailDetailView({
  email,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onReply,
  onForward,
  onDelete,
  onToggleStar,
  onToggleRead,
}: EmailDetailViewProps) {
  const theme = useTheme();

  // Mark as read when opened
  React.useEffect(() => {
    if (!email.isRead) {
      onToggleRead(email.id, true);
    }
  }, [email.id, email.isRead, onToggleRead]);
  
  // Format date for display
  const formattedDate = React.useMemo(() => {
    const date = new Date(email.timestamp);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [email.timestamp]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header with controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onClose} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {email.subject}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={email.isRead ? 'Mark as unread' : 'Mark as read'}>
            <IconButton onClick={() => onToggleRead(email.id, !email.isRead)}>
              {email.isRead ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(email.id)} color="error">
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={hasPrevious ? 'Previous email' : 'No more emails'}>
            <span>
              <IconButton onClick={onPrevious} disabled={!hasPrevious}>
                <KeyboardArrowLeftIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={hasNext ? 'Next email' : 'No more emails'}>
            <span>
              <IconButton onClick={onNext} disabled={!hasNext}>
                <KeyboardArrowRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Email content area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* Subject and actions */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[900],
            }}
          >
            {email.subject}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small"
                onClick={() => onToggleStar(email.id, !email.isStarred)}
                sx={{ color: email.isStarred ? theme.palette.warning.main : theme.palette.text.disabled }}
              >
                {email.isStarred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
              
              {email?.labels?.map(label => (
                <Chip 
                  key={label} 
                  label={label} 
                  size="small"
                  sx={{ 
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))}
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {formattedDate}
            </Typography>
          </Box>
        </Box>
        
        {/* Sender information */}
        <Paper
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={email.from.avatar}
              alt={email.from.name}
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {email.from.name ? email.from.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {email.from.name || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {email.from.email}
              </Typography>
            </Box>
            
            <Box>
              <Button
                variant="contained"
                startIcon={<ReplyIcon />}
                onClick={() => onReply(email)}
                sx={{ mr: 1, borderRadius: 8 }}
                size="small"
              >
                Reply
              </Button>
              <Button
                variant="outlined"
                startIcon={<ForwardIcon />}
                onClick={() => onForward(email)}
                sx={{ borderRadius: 8 }}
                size="small"
              >
                Forward
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To: {email.to.map(recipient => `${recipient.name} <${recipient.email}>`).join(', ')}
            </Typography>
            {email.cc && email.cc.length > 0 && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                CC: {email.cc.map(recipient => `${recipient.name} <${recipient.email}>`).join(', ')}
              </Typography>
            )}
          </Box>
        </Paper>
        
        {/* Email content */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="body1"
            sx={{ 
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
            }}
          >
            {email.content}
          </Typography>
        </Box>
        
        {/* Attachments */}
        {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Attachments ({email.attachments.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {email.attachments.map((attachment) => (
                <Paper
                  key={attachment.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33% - 10px)' },
                  }}
                >
                  <AttachmentIcon fontSize="small" />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography noWrap variant="body2" sx={{ fontWeight: 500 }}>
                      {attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <Tooltip title="Download">
                    <IconButton size="small" href={attachment.url} download>
                      <ArrowBackIcon sx={{ transform: 'rotate(-90deg)' }} fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Quick reply buttons at bottom */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={() => onReply(email)}
            sx={{ borderRadius: 8 }}
          >
            Reply
          </Button>
          <Button
            variant="outlined"
            startIcon={<ForwardIcon />}
            onClick={() => onForward(email)}
            sx={{ borderRadius: 8 }}
          >
            Forward
          </Button>
        </Box>
      </Box>
    </Box>
  );
}