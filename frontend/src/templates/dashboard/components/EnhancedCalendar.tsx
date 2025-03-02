import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
  Stack,
  Divider,
  useMediaQuery,
  alpha,
  Alert,
} from "@mui/material";
import { 
  LocalizationProvider, 
  DateCalendar,
  PickersDay,
  PickersDayProps,
  DayCalendarSkeleton
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import GoogleIcon from "@mui/icons-material/Google";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TodayIcon from '@mui/icons-material/Today';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import Badge from '@mui/material/Badge';
import dayjs, { Dayjs } from "dayjs";
import EventFormDialog from "./EventFormDialog";


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
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
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
  colorId?: string;
}

// Define view types
type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

// Custom component for days with events
function ServerDay(props: PickersDayProps<Dayjs> & { 
  highlightedDays?: Record<string, GoogleEventType[]>,
  onDayClick?: (day: Dayjs, events: GoogleEventType[]) => void 
}) {
  const {
    highlightedDays = {},
    day,
    outsideCurrentMonth,
    onDayClick,
    ...other
  } = props;

  const dateStr = day.format('YYYY-MM-DD');
  const hasEvents = highlightedDays[dateStr]?.length > 0;
  const eventsForDay = highlightedDays[dateStr] || [];
  
  // Handle click on a day
  const handleClick = () => {
    if (onDayClick && hasEvents) {
      onDayClick(day, eventsForDay);
    }
  };

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={hasEvents ? eventsForDay.length : 0}
      color="primary"
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        onClick={handleClick}
        sx={{
          ...(hasEvents && {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }
          })
        }}
      />
    </Badge>
  );
}

export default function EnhancedCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [events, setEvents] = React.useState<GoogleEventType[]>([]);
  const [eventsByDay, setEventsByDay] = React.useState<Record<string, GoogleEventType[]>>({});
  const [eventFormOpen, setEventFormOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventDetails | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = React.useState<Dayjs>(dayjs());
  const [calendarView, setCalendarView] = React.useState<CalendarViewType>('month');
  const [selectedDay, setSelectedDay] = React.useState<Dayjs | null>(null);
  const [dayEventsOpen, setDayEventsOpen] = React.useState(false);
  const [eventsForSelectedDay, setEventsForSelectedDay] = React.useState<GoogleEventType[]>([]);

  // Check connection status on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/calendar/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data as { connected: boolean };
        setIsConnected(data.connected);
        if (data.connected) {
          fetchEvents();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
        setIsConnected(false);
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Organize events by day when events change
  React.useEffect(() => {
    const eventMap: Record<string, GoogleEventType[]> = {};
    
    events.forEach(event => {
      // Handle both date and dateTime formats
      const startDate = event.start.date || event.start.dateTime?.split('T')[0];
      
      if (startDate) {
        if (!eventMap[startDate]) {
          eventMap[startDate] = [];
        }
        eventMap[startDate].push(event);
      }
    });
    
    setEventsByDay(eventMap);
  }, [events]);

  // Fetch calendar events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      // Calculate time range for fetching events
      const startOfMonth = dayjs(currentMonth).startOf('month').subtract(1, 'week');
      const endOfMonth = dayjs(currentMonth).endOf('month').add(1, 'week');
      
      const response = await axios.get(
        `${API_URL}/api/calendar/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            timeMin: startOfMonth.toISOString(),
            timeMax: endOfMonth.toISOString()
          }
        }
      );

      const data = response.data as { events: GoogleEventType[] };
      setEvents(data.events);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setError("Failed to load calendar events. Please try again later.");
      setIsLoading(false);
    }
  };

  // Connect to Google Calendar
  const handleConnectCalendar = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/calendar/auth/google`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Open Google auth URL in a new window
      const data = response.data as { authUrl: string };
      window.open(data.authUrl, "_blank");

      // Poll for connection status
      const checkInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_URL}/api/calendar/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const statusData = statusRes.data as { connected: boolean };
          if (statusData.connected) {
            setIsConnected(true);
            fetchEvents();
            clearInterval(checkInterval);
            setSuccessMessage("Google Calendar connected successfully!");
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
        }
      }, 3000); // Check every 3 seconds

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 2 * 60 * 1000);
    } catch (error) {
      console.error("Error initiating Google Calendar connection:", error);
      setError("Failed to connect to Google Calendar. Please try again.");
    }
  };

  // Handle day click to show events for that day
  const handleDayClick = (day: Dayjs, events: GoogleEventType[]) => {
    setSelectedDay(day);
    setEventsForSelectedDay(events);
    setDayEventsOpen(true);
  };

  // Handle month change
  const handleMonthChange = (date: Dayjs) => {
    setCurrentMonth(date);
    // Refetch events when month changes
    fetchEvents();
  };
  
  // Handle calendar view change
  const handleViewChange = (view: CalendarViewType) => {
    setCalendarView(view);
  };

  // Handle event click
  const handleEventClick = (event: GoogleEventType) => {
    const eventDetails: EventDetails = {
      id: event.id,
      title: event.summary,
      description: event.description,
      location: event.location,
      start: event.start.dateTime || event.start.date || null,
      end: event.end.dateTime || event.end.date || null,
      url: event.htmlLink,
      allDay: !event.start.dateTime,
      colorId: event.colorId,
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
      creator: {
        email: event.creator?.email,
        name: event.creator?.displayName,
      },
      conferenceLink: event.conferenceData?.entryPoints?.[0]?.uri,
    };

    setSelectedEvent(eventDetails);
    setEventDetailsOpen(true);
    setDayEventsOpen(false);
  };

  // Create a new event
  const handleCreateEvent = async (eventData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/calendar/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEvents();
      setEventFormOpen(false);
      setSuccessMessage("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event. Please try again.");
      setIsLoading(false);
    }
  };

  // Update an existing event
  const handleUpdateEvent = async (eventId: string, eventData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/calendar/events/${eventId}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEvents();
      setEventFormOpen(false);
      setSuccessMessage("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event. Please try again.");
      setIsLoading(false);
    }
  };

  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/calendar/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEventDetailsOpen(false);
      fetchEvents();
      setSuccessMessage("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
      setIsLoading(false);
    }
  };

  // Get event color based on Google colorId or fallback to theme
  const getEventColor = (colorId?: string): string => {
    // Define a mapping from Google Calendar color IDs to colors that fit in both light and dark theme
    const colorMap: Record<string, string> = {
      "1": "#7986cb", // Lavender
      "2": "#33b679", // Sage
      "3": "#8e24aa", // Grape
      "4": "#e67c73", // Flamingo
      "5": "#f6bf26", // Banana
      "6": "#f4511e", // Tangerine
      "7": "#039be5", // Peacock
      "8": "#616161", // Graphite
      "9": "#3f51b5", // Blueberry
      "10": "#0b8043", // Basil
      "11": "#d60000", // Tomato
    };

    return colorId
      ? colorMap[colorId] || theme.palette.primary.main
      : theme.palette.primary.main;
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

  // Handle creating an event from day selection
  const handleCreateFromDay = () => {
    if (selectedDay) {
      const startTime = selectedDay.startOf('day').add(9, 'hour'); // Default to 9 AM
      
      const newEventDetails: EventDetails = {
        id: "",
        title: "",
        start: startTime.toISOString(),
        end: startTime.add(1, 'hour').toISOString(),
        allDay: false,
      };

      setSelectedEvent(newEventDetails);
      setEventFormOpen(true);
      setDayEventsOpen(false);
    }
  };

  return (
    <Box
      sx={{
        pb: 10,
        pr: 3,
        pl: 3,
        pt: 2,
        width: "95%",
        height: isMobile ? "75vh" : "80vh",
        mx: "auto",
        mt: 2,
        mb: 10,
        borderRadius: 1,
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Header with controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          
          <Tooltip title="Previous month">
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange(currentMonth.subtract(1, 'month'))}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Today">
            <IconButton 
              size="small" 
              onClick={() => {
                setCurrentMonth(dayjs());
                fetchEvents();
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Next month">
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange(currentMonth.add(1, 'month'))}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Tooltip>
          
          {!isMobile && (
            <Box sx={{ ml: 2, display: 'flex', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Tooltip title="Month view">
                <IconButton 
                  size="small" 
                  color={calendarView === 'month' ? 'primary' : 'default'}
                  onClick={() => handleViewChange('month')}
                >
                  <ViewDayIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Week view">
                <IconButton 
                  size="small"
                  color={calendarView === 'week' ? 'primary' : 'default'}
                  onClick={() => handleViewChange('week')}
                >
                  <ViewWeekIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Day view">
                <IconButton 
                  size="small"
                  color={calendarView === 'day' ? 'primary' : 'default'}
                  onClick={() => handleViewChange('day')}
                >
                  <ViewDayIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Agenda view">
                <IconButton 
                  size="small"
                  color={calendarView === 'agenda' ? 'primary' : 'default'}
                  onClick={() => handleViewChange('agenda')}
                >
                  <ViewDayIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          {isConnected ? (
            <>
              <Tooltip title="Refresh calendar" placement="top">
                <IconButton size="small" color="primary" onClick={fetchEvents}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add new event" placement="top">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedEvent({
                      id: "",
                      title: "",
                      start: dayjs().toISOString(),
                      end: dayjs().add(1, "hour").toISOString(),
                      allDay: false,
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <EventIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Google Calendar
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500, mb: 3 }}
          >
            Link your Google Calendar to view, create, and manage your events
            directly from this dashboard.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleConnectCalendar}
            size="large"
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect with Google Calendar"}
          </Button>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            height: "100%",
            position: "relative",
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.background.default,
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {calendarView === 'month' && (
              <DateCalendar
                value={currentMonth}
                onChange={(newValue) => {
                  if (newValue) {
                    setCurrentMonth(newValue);
                  }
                }}
                onMonthChange={handleMonthChange}
                slots={{
                  day: ServerDay
                }}
                slotProps={{
                  day: {
                    highlightedDays: eventsByDay,
                    onDayClick: handleDayClick
                  } as any
                }}
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  '& .MuiPickersCalendarHeader-root': {
                    display: 'none', // Hide the default header since we have our own
                  },
                  '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
                    justifyContent: 'space-around'
                  }
                }}
              />
            )}
            
            {calendarView !== 'month' && (
              <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  {calendarView === 'week' 
                    ? `Week of ${currentMonth.startOf('week').format('MMMM D')}` 
                    : calendarView === 'day'
                    ? currentMonth.format('dddd, MMMM D, YYYY')
                    : 'Upcoming Events'}
                </Typography>
                
                {/* This is a placeholder for other views - would need full implementation */}
                <Box sx={{ 
                  p: 4, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '80%',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Typography color="text.secondary">
                    {calendarView.charAt(0).toUpperCase() + calendarView.slice(1)} view implementation would go here
                  </Typography>
                </Box>
              </Box>
            )}
          </LocalizationProvider>
        </Paper>
      )}

      {/* Events for Selected Day Dialog */}
      <Dialog
        open={dayEventsOpen}
        onClose={() => setDayEventsOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ backdropFilter: "blur(5px)"}}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Typography variant="h6" component="div">
            Events for {selectedDay?.format('MMMM D, YYYY')}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setDayEventsOpen(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper, pt: 2 }}>
          {eventsForSelectedDay.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No events scheduled for this day
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {eventsForSelectedDay.map((event) => (
                <Paper
                  key={event.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    },
                    borderLeft: '4px solid',
                    borderLeftColor: getEventColor(event.colorId)
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {event.summary}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {event.start.dateTime 
                      ? `${dayjs(event.start.dateTime).format('h:mm A')} - ${dayjs(event.end.dateTime).format('h:mm A')}`
                      : 'All day'}
                  </Typography>
                  
                  {event.location && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      📍 {event.location}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            px: 3,
            py: 2,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateFromDay}
          >
            Add Event
          </Button>
          <Button
            variant="contained"
            onClick={() => setDayEventsOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog
        open={eventDetailsOpen}
        onClose={() => setEventDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ backdropFilter: "blur(5px)"}}
      >
        {selectedEvent && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                borderLeft: '4px solid',
                borderLeftColor: selectedEvent.colorId 
                  ? getEventColor(selectedEvent.colorId) 
                  : theme.palette.primary.main
              }}
            >
              <Typography variant="h6" component="div" sx={{ pr: 2 }}>
                {selectedEvent.title}
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setEventDetailsOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
              <Stack spacing={2} sx={{ pt: 2 }}>
                {/* Date & Time */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedEvent.allDay ? "Date" : "Date & Time"}
                  </Typography>
                  <Typography variant="body1">
                    {selectedEvent.allDay
                      ? dayjs(selectedEvent.start).format("dddd, MMMM D, YYYY")
                      : `${dayjs(selectedEvent.start).format(
                          "dddd, MMMM D, YYYY, h:mm A"
                        )} - 
                         ${dayjs(selectedEvent.end).format("h:mm A")}`}
                  </Typography>
                </Box>

                {/* Location if available */}
                {selectedEvent.location && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {/* Description if available */}
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                )}

                {/* Attendees if available */}
                {selectedEvent.attendees &&
                  selectedEvent.attendees.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Attendees ({selectedEvent.attendees.length})
                      </Typography>
                      <Box sx={{ maxHeight: 120, overflowY: "auto", mt: 1 }}>
                        {selectedEvent.attendees.map((attendee, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            {attendee.name || attendee.email}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
              </Stack>
            </DialogContent>
            <DialogActions
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                px: 3,
                py: 2,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditEvent}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Delete
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
      <EventFormDialog  
        open={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent || { id: "", title: "", start: null, end: null }}
        isNew={!selectedEvent?.id}
      />

      {/* Snackbar for errors */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}

      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar for success messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      > 
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
