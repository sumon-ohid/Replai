import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  alpha,
  useTheme,
  Chip,
  Paper,
  InputAdornment,
  Avatar
} from "@mui/material";
import { Delete, Add, Info, FilterList, Email, Language } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BlockListData() {
  const [entries, setEntries] = React.useState<string[]>([]);
  const [newEntry, setNewEntry] = React.useState("");
  const [error, setError] = React.useState("");
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  React.useEffect(() => {
    const fetchBlockList = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiBaseUrl}/api/blocklist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEntries(response.data as string[]);
      } catch (error) {
        console.error('Error fetching block list:', error);
      }
    };

    fetchBlockList();
  }, []);

  const validateEntry = (entry: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainRegex = /^@?(\*\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    
    if (entry.trim() === "") return "Entry cannot be empty";
    if (!emailRegex.test(entry) && !domainRegex.test(entry)) return "Invalid email or domain format";
    if (entries.includes(entry)) return "Entry already exists";
    return null;
  };

  const handleAddEntry = async () => {
    const validationError = validateEntry(newEntry);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiBaseUrl}/api/blocklist`, 
        { entry: newEntry },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries([...entries, newEntry]);
      setNewEntry("");
      setError("");
    } catch (error) {
      console.error('Error adding new entry:', error);
    }
  };

  const handleDeleteEntry = async (entryToDelete: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiBaseUrl}/api/blocklist`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { entry: entryToDelete }
      });
      setEntries(entries.filter((entry) => entry !== entryToDelete));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const isEmailAddress = (entry: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(entry);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflowX: 'hidden',
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper,
        p: { xs: 2, sm: 1 },
        borderRadius: 3,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Block List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Block unwanted emails or entire domains from reaching your inbox
          </Typography>
        </Box>
        <Chip 
          label={`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          color="primary" 
          variant="outlined"
          icon={<FilterList />}
          sx={{ fontWeight: 500 }}
        />
      </Stack>
      
      {/* Add new entry */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          bgcolor: isDarkMode 
            ? alpha(theme.palette.background.paper, 0.3)
            : alpha(theme.palette.background.paper, 1),
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
          Add New Block Entry
          <Tooltip title="Add email addresses or domains to block. Use * for wildcard domains (e.g., *.example.com)">
            <Info sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
          </Tooltip>
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            value={newEntry}
            placeholder="Enter email address or domain to block"
            error={!!error}
            onChange={(e) => {
              setNewEntry(e.target.value);
              if (e.target.value) setError(validateEntry(e.target.value) || "");
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEntry()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEntry}
            disableElevation
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Block Entry
          </Button>
        </Stack>
        
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mt: 2, borderRadius: 2 }}
            variant="outlined"
          >
            {error}
          </Alert>
        </Collapse>
      </Paper>

      {/* Block list entries */}
      {entries.length > 0 ? (
        <AnimatePresence>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              bgcolor: isDarkMode 
                ? 'transparent' 
                : alpha(theme.palette.background.default, 0.5),
            }}
          >
            {entries.map((entry, index) => (
              <Box
                component={motion.div}
                key={entry}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderBottom: index < entries.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                  '&:hover': { 
                    bgcolor: isDarkMode 
                      ? alpha(theme.palette.action.hover, 0.1) 
                      : alpha(theme.palette.action.hover, 0.3) 
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: isEmailAddress(entry) 
                        ? alpha(theme.palette.error.main, isDarkMode ? 0.2 : 0.1)
                        : alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.1),
                      color: isEmailAddress(entry) 
                        ? theme.palette.error.main 
                        : theme.palette.warning.main
                    }}
                  >
                    {isEmailAddress(entry) ? <Email /> : <Language />}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      fontFamily="monospace"
                      sx={{ 
                        fontSize: '0.95rem',
                        color: theme.palette.text.primary
                      }}
                    >
                      {entry}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isEmailAddress(entry) ? "Email Address" : "Domain"}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Remove from block list">
                  <IconButton
                    onClick={() => handleDeleteEntry(entry)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { 
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </AnimatePresence>
      ) : (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            py: 5,
            textAlign: 'center',
            border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.default, 0.4)
          }}
        >
          <Email 
            sx={{ 
              fontSize: 48, 
              color: alpha(theme.palette.text.secondary, 0.5),
              mb: 2
            }} 
          />
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            No Blocked Entries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
            Your block list is empty. Add email addresses or domains above to prevent them from reaching your inbox.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}