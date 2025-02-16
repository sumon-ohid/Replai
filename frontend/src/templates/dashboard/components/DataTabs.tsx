import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import { styled } from "@mui/material/styles";
import { Divider, useMediaQuery } from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    width: 1,
    borderRadius: 2,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 56,
  minWidth: 110,
  margin: 10,
  textTransform: "none",
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  border: "0.1px solid",
  borderColor: "divider",
  position: "relative",
  justifyContent: "center",
    alignItems: "center",
}));

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3, width: "100%" }}>{children}</Box>
      )}
    </div>
  );
}

export default function DataTabs() {
  const [value, setValue] = React.useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 900px)");

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
}

const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
};

  return (
    <Box sx={{ display: "flex", flexDirection: 'column', m: 3, gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          bgcolor: "background.default",
          border: "2px solid",
          borderColor: "divider",
          borderRadius: 2,
          width: isSmallScreen ? "100%" : "auto",
        //   gap: isSmallScreen ? 0 : 3,
        }}
      >
        <StyledTabs
          orientation={isSmallScreen ? "horizontal" : "vertical"}
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{borderRight: isSmallScreen ? 0 : 1, borderBottom: isSmallScreen ? 1 : 0, borderColor: "divider", p: 1, width: isSmallScreen ? "100%" : 200 }}
        >
          <StyledTab icon={<TextFieldsIcon />} label="Text" />
          <StyledTab icon={<UploadFileIcon />} label="File" />
          <StyledTab icon={<LanguageIcon />} label="Website" />
          <StyledTab icon={<EmailIcon />} label="Mail" />
        </StyledTabs>

        <TabPanel value={value} index={0}>
          <TextField label="Text Input" variant="outlined" fullWidth multiline sx={{ width: "100%" }} />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, mb: 1, color: "text.secondary" }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              Drag and drop files here
            </Typography>
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
              Browse Files
              <input type="file" hidden />
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <TextField variant="outlined" fullWidth placeholder="https://example.com" sx={{ width: "100%" }} />
        </TabPanel>

        <TabPanel value={value} index={3}>
          <TextField label="Subject" variant="outlined" fullWidth sx={{ mb: 2 }} />
          <TextField label="Email Content" variant="outlined" fullWidth multiline rows={4} />
        </TabPanel>
      </Box>

      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          border: "1px solid",
          borderRadius: 2,
          borderColor: "divider",
          width: "100%",
        }}
      >
        <SettingsSuggestIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI Training Section
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            After providing data, train your AI model to improve its performance.
        </Typography>
        <Divider sx={{ width: "100%", my: 2 }} />
        <Button variant="outlined" startIcon={<SettingsSuggestIcon />} sx={{ borderRadius: 2, px: 4, py: 1.5 }}>
          Train AI Model
        </Button>
      </Box>
    </Box>
  );
}
