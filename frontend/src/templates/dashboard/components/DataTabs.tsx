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
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";

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

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3, width: "100%" }}>{children}</Box>}
    </div>
  );
}

export default function DataTabs() {
  const [value, setValue] = React.useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", m: 3, gap: 3 }}>
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
          sx={{
            justifyContent: "center",
            borderRight: isSmallScreen ? 0 : 1,
            borderBottom: isSmallScreen ? 1 : 0,
            borderColor: "divider",
            p: 1,
            width: isSmallScreen ? "100%" : 200,
          }}
        >
          <StyledTab icon={<TextFieldsIcon />} label="Text" />
          <StyledTab icon={<UploadFileIcon />} label="File" />
          <StyledTab icon={<LanguageIcon />} label="Website" />
          <StyledTab icon={<EmailIcon />} label="Mail" />
        </StyledTabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h4" sx={{ ml: 2 }}>
            Text data training
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
            Enter the text data you want to use for training.
          </Typography>
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": {
                m: 1,
                width: isSmallScreen ? "100%" : "400px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                padding: 2,
              },
            }}
            noValidate
            autoComplete="off"
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextField
                id="standard-multiline-flexible"
                multiline
                maxRows={8}
                variant="standard"
              />
            </div>
          </Box>
          <Button
              variant="contained"
              size="small"
              color="primary"
              endIcon={<ChevronRightRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{ borderRadius: 2, px: 4, py: 1.5, ml: isSmallScreen ? 1 : 2 }}
            >
              Save Data
        </Button>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Box
            sx={{
              width: isSmallScreen ? "100%" : 500,
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <UploadFileIcon
              sx={{ fontSize: 40, mb: 1, color: "text.secondary" }}
            />
            <Typography variant="body1" sx={{ mb: 2 }}>
              Drag and drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Supported formats: PDF, DOCX, TXT (Max 25MB)
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Browse Files
              <input type="file" hidden />
            </Button>
          </Box>
          <Button
              variant="contained"
              size="small"
              color="primary"
              endIcon={<ChevronRightRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{ borderRadius: 2, px: 4, py: 1.5, ml: isSmallScreen ? 1 : 2, mt: 2 }}
            >
              Save Data
        </Button>
        </TabPanel>

        {/* <TabPanel value={value} index={2}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            <LanguageIcon sx={{ color: "text.secondary", mr: 1 }} />
            Website data training
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column"}}>
            <TextField fullWidth variant="outlined" label="www.example.com" id="fullWidth" />
          </Box>
          <Button
              variant="contained"
              size="small"
              color="primary"
              endIcon={<ChevronRightRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={{ borderRadius: 2, px: 4, py: 1.5 }}
            >
              Extract Data
        </Button>
        </TabPanel> */}

        <TabPanel value={value} index={2}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Website data training
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="https://example.com"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <LanguageIcon sx={{ color: 'action.active', mr: 1 }} />,
              sx: { borderRadius: 2 }
            }}
          />
          <Button 
            variant="contained" 
            size="large"
            startIcon={<LanguageIcon />}
            sx={{ borderRadius: 2 }}
          >
            Analyze Website
          </Button>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Email data training
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comming Soon...
          </Typography>
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
        <SettingsSuggestIcon
          sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI Training Section
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          After providing data, train your AI model to update data and improve its performance.
        </Typography>
        <Alert variant="outlined" severity="info">
          AI Model is not trained yet. Please train the model to use it.
        </Alert>
        <Divider sx={{ width: "100%", my: 2 }} />
        <Button
          variant="outlined"
          startIcon={<SettingsSuggestIcon />}
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          Train AI Model
        </Button>
      </Box>
    </Box>
  );
}
