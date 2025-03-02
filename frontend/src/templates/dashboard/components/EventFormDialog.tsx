import * as React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  Stack, 
  IconButton, 
  Typography,
  Box,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Alert,
  Tooltip,
  Divider,
  MenuItem,
  Switch
} from '@mui/material';
import { 
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Place as PlaceIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Videocam as VideocamIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';

// Event form props interface
interface EventFormProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    start: string | null;
    end: string | null;
    allDay?: boolean;
    attendees?: Array<{
      email: string;
      name?: string;
      status?: string;
    }>;
  };
  onSave: (eventData: any) => void;
  isNew: boolean;
}

// Interface for email validation state
interface EmailValidationState {
  email: string;
  valid: boolean;
  error: string;
}

// Google Calendar color options
interface ColorOption {
  id: string;
  name: string;
  color: string;
}

// Calendar color options (matching Google Calendar)
const colorOptions: ColorOption[] = [
  { id: '0', name: 'Default', color: '#039be5' },
  { id: '1', name: 'Lavender', color: '#7986cb' },
  { id: '2', name: 'Sage', color: '#33b679' },
  { id: '3', name: 'Grape', color: '#8e24aa' },
  { id: '4', name: 'Flamingo', color: '#e67c73' },
  { id: '5', name: 'Banana', color: '#f6bf26' },
  { id: '6', name: 'Tangerine', color: '#f4511e' },
  { id: '7', name: 'Peacock', color: '#039be5' },
  { id: '8', name: 'Graphite', color: '#616161' },
  { id: '9', name: 'Blueberry', color: '#3f51b5' },
  { id: '10', name: 'Basil', color: '#0b8043' },
  { id: '11', name: 'Tomato', color: '#d60000' }
];

export default function EventFormDialog({ open, onClose, event, onSave, isNew }: EventFormProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = localStorage.getItem('mui-mode') === 'dark';
  
  // Form state
  const [title, setTitle] = React.useState(event.title);
  const [description, setDescription] = React.useState(event.description || '');
  const [location, setLocation] = React.useState(event.location || '');
  const [startTime, setStartTime] = React.useState<Dayjs | null>(event.start ? dayjs(event.start) : null);
  const [endTime, setEndTime] = React.useState<Dayjs | null>(event.end ? dayjs(event.end) : null);
  const [allDay, setAllDay] = React.useState(event.allDay || false);
  const [attendeeEmail, setAttendeeEmail] = React.useState('');
  const [attendees, setAttendees] = React.useState(event.attendees || []);
  const [colorId, setColorId] = React.useState('0'); // Default color
  const [enableMeet, setEnableMeet] = React.useState(false);
  const [notifyAttendees, setNotifyAttendees] = React.useState(true);
  const [formErrors, setFormErrors] = React.useState<{ [key: string]: string }>({});
  const [emailValidation, setEmailValidation] = React.useState<EmailValidationState>({
    email: '',
    valid: true,
    error: ''
  });

  // Reset form when event changes
  React.useEffect(() => {
    if (open) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartTime(event.start ? dayjs(event.start) : null);
      setEndTime(event.end ? dayjs(event.end) : null);
      setAllDay(event.allDay || false);
      setAttendeeEmail('');
      setAttendees(event.attendees || []);
      setColorId('0'); // Reset color to default
      setEnableMeet(false);
      setNotifyAttendees(true);
      setFormErrors({});
      setEmailValidation({ email: '', valid: true, error: '' });
    }
  }, [event, open]);

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!allDay && !endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (endTime && startTime && endTime.isBefore(startTime)) {
      errors.endTime = 'End time must be after start time';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    const eventData = {
      title,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      start: startTime?.toISOString(),
      end: endTime?.toISOString() || (startTime ? startTime.add(1, 'hour').toISOString() : undefined),
      allDay,
      attendees: attendees.length > 0 ? attendees : undefined,
      colorId: colorId !== '0' ? colorId : undefined,
      enableMeet,
      notifyAttendees
    };

    onSave(eventData);
  };

  // Add attendee to the list
  const addAttendee = () => {
    // Validate email before adding
    if (!emailValidation.valid || !attendeeEmail) return;
    
    // Check if attendee already exists
    if (attendees.some(a => a.email === attendeeEmail)) {
      setEmailValidation({
        email: attendeeEmail,
        valid: false,
        error: 'This email has already been added'
      });
      return;
    }
    
    const newAttendee = { email: attendeeEmail };
    setAttendees([...attendees, newAttendee]);
    setAttendeeEmail('');
    setEmailValidation({ email: '', valid: true, error: '' });
  };

  // Remove attendee from the list
  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };

  // Validate email with debounce
  const validateEmail = React.useCallback(
    debounce((email: string) => {
      if (!email) {
        setEmailValidation({ email, valid: true, error: '' });
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(email);
      
      setEmailValidation({
        email,
        valid,
        error: valid ? '' : 'Please enter a valid email address'
      });
    }, 300),
    []
  );

  // Update email validation when email changes
  React.useEffect(() => {
    validateEmail(attendeeEmail);
    return () => {
      validateEmail.cancel();
    };
  }, [attendeeEmail, validateEmail]);

  // Handle date or time changes
  const handleStartChange = (newValue: Dayjs | null) => {
    setStartTime(newValue);
    
    if (newValue && (!endTime || endTime.isBefore(newValue))) {
      // If end time is before start time or not set, adjust it
      if (allDay) {
        setEndTime(newValue);
      } else {
        setEndTime(newValue.add(1, 'hour'));
      }
    }
    
    if (formErrors.startTime) {
      setFormErrors({ ...formErrors, startTime: '' });
    }
  };

  const handleEndChange = (newValue: Dayjs | null) => {
    setEndTime(newValue);
    
    if (formErrors.endTime) {
      if (newValue && startTime && newValue.isAfter(startTime)) {
        setFormErrors({ ...formErrors, endTime: '' });
      }
    }
  };

  // Toggle all-day event
  const handleAllDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAllDay = event.target.checked;
    setAllDay(isAllDay);
    
    if (isAllDay && startTime) {
      // For all-day events, clear the time part
      const startDate = startTime.startOf('day');
      setStartTime(startDate);
      
      if (endTime) {
        setEndTime(endTime.startOf('day'));
      } else {
        setEndTime(startDate);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography variant="h6">
            {isNew ? 'Create Event' : 'Edit Event'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, backgroundColor: theme.palette.background.paper }}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {/* Title */}
            <TextField
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) {
                  setFormErrors({ ...formErrors, title: '' });
                }
              }}
              fullWidth
              required
              placeholder="Add title"
              variant="outlined"
              error={!!formErrors.title}
              helperText={formErrors.title}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Date & Time Selector */}
            <Box>
              <FormControlLabel
                control={
                  <Switch 
                    checked={allDay} 
                    onChange={handleAllDayChange} 
                    color="primary" 
                  />
                }
                label="All day"
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.6rem', ml: 1 }}>
                {allDay ? 'All-day event' : 'Start & end date'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {allDay ? (
                  // Date picker for all-day events
                  <DatePicker
                    value={startTime}
                    onChange={handleStartChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.startTime,
                        helperText: formErrors.startTime,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                ) : (
                  // Date & time picker for regular events
                  <DateTimePicker
                    value={startTime}
                    onChange={handleStartChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.startTime,
                        helperText: formErrors.startTime,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                )}

                {allDay ? (
                  // Date picker for all-day events
                  <DatePicker
                    value={endTime}
                    onChange={handleEndChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: false,
                        error: !!formErrors.endTime,
                        helperText: formErrors.endTime,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                ) : (
                  // Date & time picker for regular events
                  <DateTimePicker
                    value={endTime}
                    onChange={handleEndChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!formErrors.endTime,
                        helperText: formErrors.endTime,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="action" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                )}
              </Stack>
            </Box>
            
            {/* Location */}
            <TextField
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              placeholder="Add location"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add description"
              style={{
                width: "100%",
                height: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: ".2px solid rgba(255, 255, 255, 0.21)",
                backgroundColor: isDarkMode ? "black" : "white",
                resize: "none",
              }}
            >
                {description}
            </textarea>
            
            {/* Color selection */}
            <TextField
              select
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ColorLensIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              {colorOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        backgroundColor: option.color,
                        mr: 1
                      }} 
                    />
                    {option.name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            
            {/* Google Meet integration */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={enableMeet} 
                    onChange={(e) => setEnableMeet(e.target.checked)} 
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VideocamIcon fontSize="small" />
                    <Typography>Add Google Meet video conference</Typography>
                  </Stack>
                }
              />
              
              {enableMeet && (
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 0.5 }}>
                  A video meeting link will be generated and added to the event
                </Typography>
              )}
            </Box>
            
            {/* Attendees */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                Attendees
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value.trim())}
                  placeholder="email@example.com"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!emailValidation.valid && !!emailValidation.email}
                  helperText={!emailValidation.valid && emailValidation.error}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && emailValidation.valid && attendeeEmail) {
                      e.preventDefault();
                      addAttendee();
                    }
                  }}
                />
                <Button 
                  variant="outlined"
                  onClick={addAttendee}
                  disabled={!emailValidation.valid || !attendeeEmail}
                  sx={{ minWidth: '100px' }}
                >
                  Add
                </Button>
              </Stack>
              
              {attendees.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {attendees.map((attendee) => (
                    <Chip
                      key={attendee.email}
                      label={attendee.email}
                      onDelete={() => removeAttendee(attendee.email)}
                      size="medium"
                    />
                  ))}
                </Box>
              )}
            </Box>
            
            {/* Notification option */}
            {attendees.length > 0 && (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={notifyAttendees} 
                      onChange={(e) => setNotifyAttendees(e.target.checked)} 
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <NotificationsIcon fontSize="small" />
                      <Typography>Notify attendees</Typography>
                    </Stack>
                  }
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 3, py: 2, backgroundColor: theme.palette.background.paper }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleSubmit}
            disabled={!title || !startTime}
          >
            {isNew ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}