import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Chip,
  Stack,
  useMediaQuery,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Collapse,
  Alert,
  alpha,
} from "@mui/material";
import { Delete, Add, Info } from "@mui/icons-material";

export default function BlockListData() {
  const [entries, setEntries] = React.useState<string[]>([]);
  const [newEntry, setNewEntry] = React.useState("");
  const [error, setError] = React.useState("");
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const validateEntry = (entry: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainRegex = /^@?(\*\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    
    if (entry.trim() === "") return "Entry cannot be empty";
    if (!emailRegex.test(entry) && !domainRegex.test(entry)) return "Invalid email or domain format";
    if (entries.includes(entry)) return "Entry already exists";
    return null;
  };

  const handleAddEntry = () => {
    const validationError = validateEntry(newEntry);
    if (validationError) {
      setError(validationError);
      return;
    }
    setEntries([...entries, newEntry]);
    setNewEntry("");
    setError("");
  };

  const handleDeleteEntry = (entryToDelete: string) => {
    setEntries(entries.filter((entry) => entry !== entryToDelete));
  };

  return (
    <Box sx={{
      width: 'auto',
      margin: 2,
      p: 4,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper'
    }}>
      <Stack spacing={3}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Block List Management
          <Tooltip title="Add email addresses or domains to block. Use * for wildcard domains (e.g., *.example.com)">
            <Info sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
          </Tooltip>
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newEntry}
            placeholder="Enter email or domain..."
            error={!!error}
            onChange={(e) => {
              setNewEntry(e.target.value);
              setError(validateEntry(e.target.value) || "");
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEntry()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 50,
                fieldset: { borderColor: 'divider' },
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEntry}
            // disabled={!!error || !newEntry}
            sx={{
              borderRadius: 50,
              px: 4,
              textTransform: 'none',
              color: (theme) => theme.palette.mode === 'dark' ? 'primary.main' : 'primary.contrastText',
            }}
          >
            AddEntry
          </Button>
        </Stack>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ borderRadius: 50 }}>{error}</Alert>
        </Collapse>

        {entries.length > 0 ? (
          <Box sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2
          }}>
            <Stack spacing={1}>
              {entries.map((entry, index) => (
                <Fade in key={index}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, index % 2 ? 0.05 : 0),
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {entry}
                    </Typography>
                    <Tooltip title="Remove entry">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEntry(entry)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Fade>
              ))}
            </Stack>
          </Box>
        ) : (
          <Box sx={{
            py: 4,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              No blocked entries yet. Add your first entry above.
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" textAlign="center">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in block list
        </Typography>
      </Stack>
    </Box>
  );
}
