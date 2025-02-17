import * as React from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function BlockListData() {
  const [entries, setEntries] = React.useState<string[]>([]);
  const [newEntry, setNewEntry] = React.useState("");
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  const handleAddEntry = () => {
    if (newEntry.trim() !== "" && !entries.includes(newEntry)) {
      setEntries([...entries, newEntry]);
      setNewEntry("");
    }
  };

  const handleDeleteEntry = (entryToDelete: string): void => {
    setEntries(entries.filter((entry) => entry !== entryToDelete));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "divider",
        borderRadius: 2,
        width: 'auto',
        mt: 3,
        m: 3,
      }}
    >
      <Box sx={{ maxWidth: isSmallScreen ? 300 : 500, margin: "auto", mt: 4 }}>
        <Typography variant="body1" align="center" mb={1}>
            Add email addresses or domains to block.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddEntry()}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEntry}
          sx={{ mt: 2, mb: 2 }}
          fullWidth
        >
          Add Entry
        </Button>
        <List>
          {entries.map((entry, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{ bgcolor: "background.default", borderRadius: 5, p: 1, mb:2, border: 1, borderColor: "divider" }}
              >
                <ListItemText primary={entry} sx={{ml: 2}} />
                <IconButton edge="end" sx={{m: 1, p: 1}} onClick={() => handleDeleteEntry(entry)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
              {index < entries.length - 1}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
}
