import * as React from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, CircularProgress, useTheme, Alert, IconButton, Tooltip, Snackbar,
  Stack, Divider, useMediaQuery, alpha } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { EventSourceInput, DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VideocamIcon from '@mui/icons-material/Videocam';
import dayjs from 'dayjs';
import EventFormDialog from './EventFormDialog.tsx';

// API URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface GoogleEventType {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  creator?: {
    email?: string;
    displayName?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  htmlLink?: string;
  conferenceData?: any;
}

interface EventDetails {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string | null;
  end: string | null;
  url?: string;
  allDay?: boolean;
  attendees?: Array<{
    email: string;
    name?: string;
    status?: string;
  }>;
  creator?: {
    email?: string;
    name?: string;
  };
  conferenceLink?: string;
}

export default function EnhancedCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const calendarRef = React.useRef<FullCalendar | null>(null);
  
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [events, setEvents] = React.useState<GoogleEventType[]>([]);
  const [eventFormOpen, setEventFormOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventDetails | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  // Check connection status on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/calendar/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data as { connected: boolean };
        setIsConnected(data.connected);
        if (data.connected) {
          fetchEvents();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking Google Calendar connection:', error);
        setIsConnected(false);
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);
  
  // Fetch calendar events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/calendar/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data as { events: GoogleEventType[] };
      setEvents(data.events);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setError('Failed to load calendar events. Please try again later.');
      setIsLoading(false);
    }
  };
  
  // Connect to Google Calendar
  const handleConnectCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/calendar/auth/google`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Open Google auth URL in a new window
      const data = response.data as { authUrl: string };
      window.open(data.authUrl, '_blank');
      
      // Poll for connection status
      const checkInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_URL}/api/calendar/status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const statusData = statusRes.data as { connected: boolean };
          if (statusData.connected) {
            setIsConnected(true);
            fetchEvents();
            clearInterval(checkInterval);
            setSuccessMessage('Google Calendar connected successfully!');
          }
        } catch (error) {
          console.error('Error checking connection status:', error);
        }
      }, 3000); // Check every 3 seconds
      
      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 2 * 60 * 1000);
      
    } catch (error) {
      console.error('Error initiating Google Calendar connection:', error);
      setError('Failed to connect to Google Calendar. Please try again.');
    }
  };
  
  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id) || null;
    
    if (event) {
      const eventDetails: EventDetails = {
        id: event.id,
        title: event.summary,
        description: event.description,
        location: event.location,
        start: event.start.dateTime || event.start.date || null,
        end: event.end.dateTime || event.end.date || null,
        url: event.htmlLink,
        allDay: !event.start.dateTime,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          name: a.displayName,
          status: a.responseStatus
        })),
        creator: {
          email: event.creator?.email,
          name: event.creator?.displayName
        },
        conferenceLink: event.conferenceData?.entryPoints?.[0]?.uri
      };
      
      setSelectedEvent(eventDetails);
      setEventDetailsOpen(true);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startTime = dayjs(selectInfo.start);
    const endTime = dayjs(selectInfo.end);
    
    const newEventDetails: EventDetails = {
      id: '',
      title: '',
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      allDay: selectInfo.allDay
    };
    
    setSelectedEvent(newEventDetails);
    setEventFormOpen(true);
  };
  
  // Create a new event
  const handleCreateEvent = async (eventData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/calendar/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchEvents();
      setEventFormOpen(false);
      setSuccessMessage('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Update an existing event
  const handleUpdateEvent = async (eventId: string, eventData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/calendar/events/${eventId}`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchEvents();
      setEventFormOpen(false);
      setSuccessMessage('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/calendar/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEventDetailsOpen(false);
      fetchEvents();
      setSuccessMessage('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Format events for FullCalendar
  const getFormattedEvents = (): EventInput[] => {
    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      allDay: !event.start.dateTime,
      backgroundColor: getEventColor(event.colorId),
      borderColor: getEventColor(event.colorId),
      textColor: theme.palette.getContrastText(getEventColor(event.colorId)),
      extendedProps: {
        description: event.description,
        location: event.location,
        attendees: event.attendees
      }
    }));
  };
  
  // Get event color based on Google colorId or fallback to theme
  const getEventColor = (colorId?: string): string => {
    // Define a mapping from Google Calendar color IDs to colors that fit in both light and dark theme
    const colorMap: Record<string, string> = {
      '1': '#7986cb', // Lavender
      '2': '#33b679', // Sage
      '3': '#8e24aa', // Grape
      '4': '#e67c73', // Flamingo
      '5': '#f6bf26', // Banana
      '6': '#f4511e', // Tangerine
      '7': '#039be5', // Peacock
      '8': '#616161', // Graphite
      '9': '#3f51b5', // Blueberry
      '10': '#0b8043', // Basil
      '11': '#d60000', // Tomato
    };
    
    return colorId ? colorMap[colorId] || theme.palette.primary.main : theme.palette.primary.main;
  };
  
  // Handle edit event from details dialog
  const handleEditEvent = () => {
    if (selectedEvent) {
      setEventDetailsOpen(false);
      setEventFormOpen(true);
    }
  };
  
  // Handle save event from form dialog
  const handleSaveEvent = (eventData: any) => {
    if (selectedEvent?.id) {
      // Update existing event
      handleUpdateEvent(selectedEvent.id, eventData);
    } else {
      // Create new event
      handleCreateEvent(eventData);
    }
  };
  
  return (
    <Box sx={{ width: '100%', height: isMobile ? '75vh' : '80vh' }}>
      {/* Header with controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Calendar
        </Typography>
        
        <Stack direction="row" spacing={1}>
          {isConnected ? (
            <>
              <Tooltip title="Refresh calendar">
                <IconButton size="small" color="primary" onClick={fetchEvents}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add new event">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedEvent({
                      id: '',
                      title: '',
                      start: dayjs().toISOString(),
                      end: dayjs().add(1, 'hour').toISOString(),
                      allDay: false
                    });
                    setEventFormOpen(true);
                  }}
                >
                  Add Event
                </Button>
              </Tooltip>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={handleConnectCalendar}
              disabled={isLoading}
            >
              Connect Google Calendar
            </Button>
          )}
        </Stack>
      </Box>

      {/* Main Calendar */}
      {!isConnected ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            borderRadius: 1,
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.background.default
          }}
        >
          <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Google Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
            Link your Google Calendar to view, create, and manage your events directly from this dashboard.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleConnectCalendar}
            size="large"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect with Google Calendar'}
          </Button>
        </Paper>
      ) : (
        <Paper 
          variant="outlined"
          sx={{ 
            height: '100%', 
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : theme.palette.background.default 
          }}
        >
          {isLoading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 10
            }}>
              <CircularProgress />
            </Box>
          )}
          
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, googleCalendarPlugin]}
            initialView={isMobile ? "listWeek" : "dayGridMonth"}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={getFormattedEvents()}
            eventClick={handleEventClick}
            select={handleDateSelect}
            selectable={true}
            height="100%"
            nowIndicator={true}
            navLinks={true}
            dayMaxEvents={true}
            themeSystem="standard"
            firstDay={1} // Monday as first day
            showNonCurrentDates={false}
            dayMaxEventRows={3}
            moreLinkClick="popover"
            longPressDelay={1000}
            handleWindowResize={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </Paper>
      )}
      
      {/* Event Details Dialog */}
      <Dialog 
        open={eventDetailsOpen} 
        onClose={() => setEventDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" component="div" sx={{ pr: 2 }}>
                {selectedEvent.title}
              </Typography>
              <IconButton edge="end" color="inherit" onClick={() => setEventDetailsOpen(false)} aria-label="close">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 2 }}>
                {/* Date & Time */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedEvent.allDay ? 'Date' : 'Date & Time'}
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.allDay 
                      ? dayjs(selectedEvent.start).format('dddd, MMMM D, YYYY') 
                      : `${dayjs(selectedEvent.start).format('dddd, MMMM D, YYYY, h:mm A')} - 
                         ${dayjs(selectedEvent.end).format('h:mm A')}`
                    }
                  </Typography>
                </Box>
                
                {/* Location if available */}
                {selectedEvent.location && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{selectedEvent.location}</Typography>
                  </Box>
                )}
                
                {/* Description if available */}
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word' 
                      }}
                    >
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}
                
                {/* Attendees if available */}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Attendees ({selectedEvent.attendees.length})
                    </Typography>
                    <Box sx={{ maxHeight: 120, overflowY: 'auto', mt: 1 }}>
                      {selectedEvent.attendees.map((attendee, idx) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                          {attendee.name || attendee.email}
                          {attendee.status && (
                            <Box component="span" sx={{ 
                              ml: 1, 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1, 
                              fontSize: '0.75rem',
                              backgroundColor: 
                                attendee.status === 'accepted' ? alpha(theme.palette.success.main, 0.1) :
                                attendee.status === 'tentative' ? alpha(theme.palette.warning.main, 0.1) :
                                attendee.status === 'declined' ? alpha(theme.palette.error.main, 0.1) :
                                alpha(theme.palette.grey[500], 0.1),
                              color:
                                attendee.status === 'accepted' ? theme.palette.success.main :
                                attendee.status === 'tentative' ? theme.palette.warning.main :
                                attendee.status === 'declined' ? theme.palette.error.main :
                                theme.palette.grey[500],
                            }}>
                              {attendee.status === 'needsAction' ? 'Pending' : 
                               attendee.status ? attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1) : 'Unknown'}
                            </Box>
                          )}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Conference link if available */}
                {selectedEvent.conferenceLink && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Video Conference</Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<VideocamIcon />}
                      href={selectedEvent.conferenceLink}
                      target="_blank"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                )}
                
                {/* Creator info if available */}
                {selectedEvent.creator && (selectedEvent.creator.email || selectedEvent.creator.name) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Organizer</Typography>
                    <Typography variant="body2">
                      {selectedEvent.creator.name || selectedEvent.creator.email}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 3, py: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Delete
              </Button>
              <Button 
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditEvent}
              >
                Edit
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setEventDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Event Form Dialog */}
      {selectedEvent && (
        <EventFormDialog
          open={eventFormOpen}
          onClose={() => setEventFormOpen(false)}
          event={selectedEvent}
          onSave={handleSaveEvent}
          isNew={!selectedEvent.id}
        />
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        action={
          <IconButton size="small" color="inherit" onClick={() => setError(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSuccessMessage(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}
