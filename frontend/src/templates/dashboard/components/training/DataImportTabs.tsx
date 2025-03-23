import * as React from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  useMediaQuery,
  CircularProgress,
  Fade,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Icons
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LanguageIcon from "@mui/icons-material/Language";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import BookIcon from "@mui/icons-material/Book";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`data-import-tabpanel-${index}`}
      aria-labelledby={`data-import-tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ pt: 3 }}>{children}</Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `data-import-tab-${index}`,
    "aria-controls": `data-import-tabpanel-${index}`,
  };
}

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  "&:hover": {
    color: theme.palette.primary.main,
    opacity: 1,
  },
}));

const ProgressBox = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-flex",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  color: theme.palette.success.main,
  fontWeight: 500,
  fontSize: "0.8rem",
  alignItems: "center",
  gap: theme.spacing(1),
}));

interface DataImportTabsProps {
  selectedSources: string[];
  onDataPreviewReady: () => void;
}

export const DataImportTabs: React.FC<DataImportTabsProps> = ({
  selectedSources,
  onDataPreviewReady,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const [value, setValue] = React.useState(0);
  const [textData, setTextData] = React.useState("");
  const [textAlert, setTextAlert] = React.useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileAlert, setFileAlert] = React.useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [url, setUrl] = React.useState("");
  const [urlAlert, setUrlAlert] = React.useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analyzedUrls, setAnalyzedUrls] = React.useState<
    { url: string; charCount: number }[]
  >([]);
  
  // Track data readiness for each tab
  const [readiness, setReadiness] = React.useState({
    text: false,
    file: false,
    website: false,
  });

  const showAlert = (
    type: "text" | "file" | "website",
    alertType: "success" | "error",
    message: string
  ) => {
    const setAlertFunc =
      type === "text"
        ? setTextAlert
        : type === "file"
        ? setFileAlert
        : setUrlAlert;

    setAlertFunc({ type: alertType, message });
    setTimeout(() => setAlertFunc({ type: "", message: "" }), 4000);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(e.target.value);
    
    // Update readiness if text has content
    if (e.target.value.trim().length > 0) {
      setReadiness(prev => ({ ...prev, text: true }));
      onDataPreviewReady();
    } else {
      setReadiness(prev => ({ ...prev, text: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is PDF and under 4MB
      if (file.type !== "application/pdf") {
        showAlert("file", "error", "Only PDF files are supported.");
        return;
      }
      
      if (file.size > 4 * 1024 * 1024) {
        showAlert("file", "error", "File size must be less than 4MB.");
        return;
      }
      
      setSelectedFile(file);
      setReadiness(prev => ({ ...prev, file: true }));
      onDataPreviewReady();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSaveText = async () => {
    if (!textData.trim()) {
      showAlert("text", "error", "Please enter some text data.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("text", "error", "Authentication token not found.");
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/data/save-text`,
        { text: textData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        showAlert("text", "success", "Text data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving text data:", error);
      showAlert("text", "error", "Failed to save text data. Please try again.");
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      showAlert("file", "error", "Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("file", "error", "Authentication token not found.");
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/data/upload-file`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        showAlert("file", "success", "File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showAlert(
        "file",
        "error",
        "Failed to upload file. Please check file format and size."
      );
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!url) {
      showAlert("website", "error", "Please enter a URL.");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      showAlert("website", "error", "Please enter a valid URL.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("website", "error", "Authentication token not found.");
        setIsAnalyzing(false);
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/data/analyze-url`,
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const { charCount } = response.data as { charCount: number };
        setAnalyzedUrls((prev) => [...prev, { url, charCount }]);
        setUrl("");
        showAlert(
          "website",
          "success",
          `Website analyzed successfully! ${charCount.toLocaleString()} characters extracted.`
        );
        
        // Update readiness
        setReadiness(prev => ({ ...prev, website: true }));
        onDataPreviewReady();
      }
    } catch (error) {
      console.error("Error analyzing URL:", error);
      showAlert(
        "website",
        "error",
        "Failed to analyze website. Please check the URL or try again later."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteUrl = async (urlToDelete: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("website", "error", "Authentication token not found.");
        return;
      }

      const response = await axios.delete(
        `${apiBaseUrl}/api/data/delete-url/${encodeURIComponent(urlToDelete)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = response.data as { urls: { url: string; charCount: number }[] } | undefined;
        setAnalyzedUrls(
          (data?.urls ?? analyzedUrls.filter((item) => item.url !== urlToDelete))
        );
        
        // Update readiness
        if ((data?.urls || []).length === 0) {
          setReadiness(prev => ({ ...prev, website: false }));
        }
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      showAlert("website", "error", "Failed to delete URL. Please try again.");
    }
  };

  const tabInfo = [
    {
      label: "Text Data",
      icon: <TextSnippetIcon />,
      isEnabled: selectedSources.includes("text")
    },
    {
      label: "PDF Documents",
      icon: <PictureAsPdfIcon />,
      isEnabled: selectedSources.includes("pdf")
    },
    {
      label: "Website Crawling",
      icon: <LanguageIcon />,
      isEnabled: selectedSources.includes("website")
    }
  ];

  // Filter enabled tabs and dynamically set active tab to first enabled one
  React.useEffect(() => {
    const enabledTabs = tabInfo.filter(tab => tab.isEnabled);
    if (enabledTabs.length > 0) {
      const firstEnabledIndex = tabInfo.findIndex(tab => tab.isEnabled);
      if (firstEnabledIndex !== -1) {
        setValue(firstEnabledIndex);
      }
    }
  }, [selectedSources]);

  // fetch text data if available
  React.useEffect(() => {
    const fetchTextData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await axios.get<{ text: string }>(`${apiBaseUrl}/api/data/get-text`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setTextData(response.data.text);
        }
      } catch (error) {
        console.error("Error fetching text data:", error);
      }
    };

    fetchTextData();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="data import tabs"
          sx={{
            ".MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
          }}
        >
          {tabInfo.map((tab, index) => (
            <StyledTab
              key={index}
              disabled={!tab.isEnabled}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Text Data Tab */}
      <TabPanel value={value} index={0}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Import Text Data
            </Typography>
            <Tooltip title="Recommended: 100-1000 words of high-quality text">
              <IconButton size="small" color="primary">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Alert variant="filled" severity="info" sx={{ mb: 2 }}>
            Please note that new text data, will overwrite previous data.
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste or type text that represents your preferred writing style or domain-specific knowledge.
          </Typography>

          {textAlert.type && (
            <Alert 
              severity={textAlert.type} 
              variant="filled"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(
                  textAlert.type === "error" ? theme.palette.error.main : theme.palette.success.main, 
                  0.2
                )}`
              }}
            >
              {textAlert.message}
            </Alert>
          )}

          
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ position: "relative", p: 0 }}>
                <textarea
                  placeholder="Enter your text data here..."
                  value={textData}
                  onChange={handleTextChange}
                  style={{
                    width: "100%",
                    minHeight: 240,
                    padding: "16px",
                    borderRadius: "8px",
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.4),
                    color: theme.palette.text.primary,
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
                <Typography
                  variant="caption"
                  color={textData.length > 2000 ? "error" : "text.secondary"}
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                  }}
                >
                  {textData.length}/2000
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                <Chip
                  icon={<TextFieldsIcon />}
                  label="Text Data"
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: "8px", py: 2, px: 1 }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  endIcon={<KeyboardArrowRightIcon />}
                  onClick={handleSaveText}
                  disabled={!textData.trim()}
                  sx={{ borderRadius: "8px" }}
                >
                  Save Data
                </Button>
              </Box>
            </CardContent>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Tips for Quality Text Data:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use real examples of your writing or communication style<br />
              • Include domain-specific terminology and phrases<br />
              • Mix formal and casual content if your communication style varies
            </Typography>
          </Box>

          {readiness.text && (
            <ProgressBox sx={{ mt: 3 }}>
              <CheckCircleIcon fontSize="small" />
              Text data ready for training
            </ProgressBox>
          )}
        </Box>
      </TabPanel>

      {/* PDF Documents Tab */}
      <TabPanel value={value} index={1}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Upload PDF Documents
            </Typography>
            <Tooltip title="Maximum file size: 4MB">
              <IconButton size="small" color="primary">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload PDF documents containing text that represents your writing style or knowledge base.
          </Typography>

          {fileAlert.type && (
            <Alert 
              severity={fileAlert.type} 
              variant="filled"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(
                  fileAlert.type === "error" ? theme.palette.error.main : theme.palette.success.main, 
                  0.2
                )}`
              }}
            >
              {fileAlert.message}
            </Alert>
          )}

          <Box
            component={motion.div}
            whileHover={{ boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` }}
            sx={{
              border: `2px dashed ${selectedFile ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 3,
              p: { xs: 3, md: 6 },
              minHeight: 240,
              textAlign: "center",
              transition: "all 0.3s ease",
              backgroundColor: selectedFile ? 
                alpha(theme.palette.primary.main, 0.05) : 
                alpha(theme.palette.background.paper, 0.4),
              mb: 3,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer"
              }}
            />
            
            {selectedFile ? (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2
                  }}
                >
                  <PictureAsPdfIcon
                    sx={{
                      fontSize: 40,
                      color: theme.palette.primary.main
                    }}
                  />
                </Box>
                
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {selectedFile.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                
                <Button 
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setSelectedFile(null)}
                  sx={{ mt: 2, borderRadius: "8px" }}
                >
                  Remove
                </Button>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 40,
                      color: alpha(theme.palette.primary.main, 0.8)
                    }}
                  />
                </Box>
                
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  Drag & Drop or Click to Upload
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  PDF files only (max 4MB)
                </Typography>
              </>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth={isMobile}
            size="large"
            disabled={!selectedFile}
            startIcon={<UploadFileIcon />}
            onClick={handleUploadFile}
            sx={{ 
              borderRadius: "8px",
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            Upload PDF
          </Button>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              PDF Best Practices:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use text-based PDFs rather than scanned documents<br />
              • Ensure PDFs don't contain sensitive or confidential information<br />
              • Choose documents that represent your communication style
            </Typography>
          </Box>

          {readiness.file && (
            <ProgressBox sx={{ mt: 3 }}>
              <CheckCircleIcon fontSize="small" />
              PDF document ready for training
            </ProgressBox>
          )}
        </Box>
      </TabPanel>

      {/* Website Tab */}
      <TabPanel value={value} index={2}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Website Content Crawling
            </Typography>
            <Tooltip title="Ensure you have permission to crawl the website">
              <IconButton size="small" color="primary">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Extract and analyze content from websites to train your AI model with relevant information.
          </Typography>

          {urlAlert.type && (
            <Alert 
              severity={urlAlert.type} 
              variant="filled"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(
                  urlAlert.type === "error" ? theme.palette.error.main : theme.palette.success.main, 
                  0.2
                )}`
              }}
            >
              {urlAlert.message}
            </Alert>
          )}

          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              mb: 3,
              overflow: "hidden"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ position: "relative", py: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={handleUrlChange}
                  disabled={isAnalyzing}
                  InputProps={{
                    startAdornment: (
                      <LanguageIcon 
                        sx={{ 
                          color: "action.active", 
                          mr: 1 
                        }} 
                      />
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Box>

              <Divider />

              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: isMobile ? "center" : "space-between",
                  alignItems: "center",
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                  flexDirection: isMobile ? "column" : "row",
                  gap: 2
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Note: Only crawls publicly accessible content
                </Typography>
                <Button
                  variant="contained"
                  disableElevation
                  endIcon={isAnalyzing ? <CircularProgress size={16} color="inherit" /> : <KeyboardArrowRightIcon />}
                  onClick={handleAnalyzeUrl}
                  disabled={!url || isAnalyzing}
                  sx={{ borderRadius: "8px", px: 4 }}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {isAnalyzing && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <LinearProgress 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.15)
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Analyzing website content, this may take a few moments...
              </Typography>
            </Box>
          )}

          {analyzedUrls.length > 0 && (
            <Box 
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{ mt: 4 }}
            >
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <BookIcon fontSize="small" color="primary" />
                Analyzed Websites ({analyzedUrls.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analyzedUrls.map((item, index) => (
                  <Card
                    key={index}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    elevation={0}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LanguageIcon color="primary" />
                      </Box>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: { xs: 160, sm: 200, md: 320, lg: 400 } }}>
                          {item.url}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.charCount.toLocaleString()} characters extracted
                        </Typography>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUrl(item.url)}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Website Crawling Guidelines:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Only crawl public websites with permission<br />
              • Avoid crawling sensitive or private content<br />
              • Analyze websites with relevant information
            </Typography>
          </Box>

            {readiness.website && (
                <ProgressBox sx={{ mt: 3 }}>
                <CheckCircleIcon fontSize="small" />
                Website content ready for training
                </ProgressBox>
            )}
        </Box>
      </TabPanel>
    </Box>
  );
}
