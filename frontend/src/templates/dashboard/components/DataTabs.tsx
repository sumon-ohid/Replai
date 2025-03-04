import * as React from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import { 
  Tabs, Tab, Typography, Box, TextField, Button, Divider, 
  useMediaQuery, IconButton, Alert, CircularProgress, Paper,
  Chip, Card, CardContent, Fade, Backdrop, LinearProgress
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArticleIcon from "@mui/icons-material/Article";
import { motion } from "framer-motion";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Styled components with enhanced visual design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    width: 3,
    borderRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 64,
  margin: 8,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
  borderRadius: 12,
  transition: "all 0.2s",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 600,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  padding: "12px 20px",
  "& .MuiTab-iconWrapper": {
    marginBottom: 8,
  }
}));

// Enhanced TabPanel for consistent styling
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ 
        width: "100%", 
        height: "100%",
        px: { xs: 2, sm: 3 },
        py: 3
      }}
    >
      {value === index && (
        <Fade in={value === index}>
          <div>{children}</div>
        </Fade>
      )}
    </Box>
  );
}

export default function DataTabs() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [value, setValue] = React.useState(0);
  const [textData, setTextData] = React.useState("");
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [error, setError] = React.useState("");
  const [dataPrompt, setDataPrompt] = React.useState("");
  const [isTraining, setIsTraining] = React.useState(false);
  const [trainingCompleted, setTrainingCompleted] = React.useState(false);
  const [trainingProgress, setTrainingProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [fileSize, setFileSize] = React.useState(0);
  const [url, setUrl] = React.useState("");
  const [urlList, setUrlList] = React.useState<{ url: string; charCount: number }[]>([]);
  const [charCount, setCharCount] = React.useState(0);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleTrainAI = async () => {
    setIsTraining(true);
    setTrainingCompleted(false);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newValue = prev + Math.random() * 15;
        return newValue > 100 ? 100 : newValue;
      });
    }, 300);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTrainingCompleted(true);
      clearInterval(progressInterval);
      setTrainingProgress(100);
    } catch (error) {
      console.error("Error training AI:", error);
    } finally {
      setIsTraining(false);
    }
  };

  React.useEffect(() => {
    const fetchDataPrompt = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${apiBaseUrl}/api/data/get-text`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setDataPrompt((response.data as { text: string }).text);
        }
      } catch (error) {
        console.error("Error fetching data prompt:", error);
      }
    };

    const fetchUrlList = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${apiBaseUrl}/api/data/get-urls`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setUrlList((response.data as { urls: { url: string; charCount: number }[] }).urls);
        }
      } catch (error) {
        console.error("Error fetching URL list:", error);
      }
    };

    fetchDataPrompt();
    fetchUrlList();
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleTextDataChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const showSuccessAlert = () => {
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };

  const showErrorAlert = (message: string) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleSaveData = async () => {
    if (!textData) {
      showErrorAlert("Text data cannot be empty.");
      return;
    }

    if (textData.length > 1000) {
      showErrorAlert("Text data cannot exceed 1000 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/data/save-text`,
        { text: textData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        showSuccessAlert();
      }
    } catch (error) {
      console.error("Error saving text data:", error);
      showErrorAlert("Error saving text data.");
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      showErrorAlert("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(`${apiBaseUrl}/api/data/upload-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        showSuccessAlert();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showErrorAlert("Only Max 4 MB size and *.pdf file is allowed. Please try again.");
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!url) {
      showErrorAlert("URL cannot be empty.");
      return;
    }
    
    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${apiBaseUrl}/api/data/analyze-url`,
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const { charCount } = response.data as { charCount: number };
        setCharCount(charCount);
        setUrlList((prevList) => [...prevList, { url, charCount }]);
        setUrl("");
      }
    } catch (error) {
      console.error("Error analyzing URL:", error);
      showErrorAlert("Error analyzing URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteUrl = async (urlToDelete: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.delete(`${apiBaseUrl}/api/data/delete-url/${encodeURIComponent(urlToDelete)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUrlList((response.data as { urls: { url: string; charCount: number }[] }).urls);
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      showErrorAlert("Error deleting URL.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 4,
      }}
    >
      {/* Main Tabs Container */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        {/* Tabs Navigation */}
        <Box sx={{ 
          borderRight: isSmallScreen ? 0 : `1px solid ${theme.palette.divider}`,
          borderBottom: isSmallScreen ? `1px solid ${theme.palette.divider}` : 0,
          backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.3) : alpha(theme.palette.background.default, 0.5),
          pt: 2
        }}>
          <StyledTabs
            orientation={isSmallScreen ? "horizontal" : "vertical"}
            variant="scrollable"
            scrollButtons="auto"
            value={value}
            onChange={handleChange}
            sx={{
              minWidth: isSmallScreen ? "auto" : 180,
              "& .MuiTabs-flexContainer": {
                gap: 1,
                px: 2,
              },
            }}
          >
            <StyledTab 
              icon={<TextFieldsIcon fontSize="medium" />} 
              label="Text"
              sx={{ width: isXsScreen ? "auto" : (isSmallScreen ? 110 : 160) }}
            />
            <StyledTab 
              icon={<UploadFileIcon fontSize="medium" />} 
              label="File" 
              sx={{ width: isXsScreen ? "auto" : (isSmallScreen ? 110 : 160) }}
            />
            <StyledTab 
              icon={<LanguageIcon fontSize="medium" />} 
              label="Website"
              sx={{ width: isXsScreen ? "auto" : (isSmallScreen ? 110 : 160) }}
            />
            <StyledTab 
              icon={<EmailIcon fontSize="medium" />} 
              label="Mail"
              sx={{ width: isXsScreen ? "auto" : (isSmallScreen ? 110 : 160) }}
            />
          </StyledTabs>
        </Box>
        
        {/* Tab Content Area */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Text Tab */}
          <TabPanel value={value} index={0}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              Text Data Training
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the text data you want to use for training. Maximum 1000 characters.
            </Typography>
            
            {(alertVisible || error) && (
              <Alert 
                severity={error ? "error" : "success"} 
                variant="filled"
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(
                    error ? theme.palette.error.main : theme.palette.success.main, 0.2
                  )}`
                }}
              >
                {error || "Data saved successfully"}
              </Alert>
            )}
            
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: -8, right: 0, mb: -1 }}>
                    {textData.length}/1000
                  </Typography>
                  <textarea
                    name="textarea"
                    rows={8}
                    required
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "12px",
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      color: theme.palette.text.primary,
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                    placeholder={dataPrompt || "Enter your training data here..."}
                    value={textData}
                    onChange={handleTextDataChange}
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              size="large"
              endIcon={<ChevronRightRoundedIcon />}
              sx={{ 
                borderRadius: 2, 
                py: 1.2, 
                px: 4,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
              onClick={handleSaveData}
            >
              Save Data
            </Button>
          </TabPanel>

          {/* File Tab */}
          <TabPanel value={value} index={1}>
            {(alertVisible || error) && (
              <Alert 
                severity={error ? "error" : "success"} 
                variant="filled"
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(
                    error ? theme.palette.error.main : theme.palette.success.main, 0.2
                  )}`
                }}
              >
                {error || "File uploaded successfully"}
              </Alert>
            )}
            
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              File Upload
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload files to train your AI model. Supported formats: PDF (Max 4MB).
            </Typography>
            
            <Paper
              elevation={0}
              component={motion.div}
              whileHover={{ boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}` }}
              sx={{
                border: `2px dashed ${selectedFile ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 4,
                p: 6,
                textAlign: "center",
                transition: "all 0.3s ease",
                backgroundColor: selectedFile ? 
                  alpha(theme.palette.primary.main, 0.05) : 
                  alpha(theme.palette.background.paper, 0.5),
                mb: 3,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <input
                type="file"
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
              
              <CloudUploadIcon
                sx={{ 
                  fontSize: 60, 
                  mb: 2, 
                  color: selectedFile ? theme.palette.primary.main : theme.palette.text.secondary,
                  opacity: selectedFile ? 0.8 : 0.5
                }}
              />
              
              {selectedFile ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    File Selected
                  </Typography>
                  <Box sx={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2
                  }}>
                    <ArticleIcon color="primary" />
                    <Typography variant="body1" fontWeight={500}>
                      {fileName}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${(fileSize / 1024 / 1024).toFixed(2)} MB`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Drop files here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: PDF (Max 4MB)
                  </Typography>
                </>
              )}
            </Paper>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<UploadFileIcon />}
              fullWidth={isXsScreen}
              sx={{ 
                borderRadius: 2, 
                py: 1.2,
                px: 4,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
              onClick={handleUploadFile}
            >
              Upload File
            </Button>
          </TabPanel>

          {/* Website Tab */}
          <TabPanel value={value} index={2}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              Website Data Training
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Extract and analyze content from websites to train your AI model.
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                }}
              >
                {error}
              </Alert>
            )}
            
            <Box 
              component="form" 
              sx={{ mb: 3 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyzeUrl();
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                placeholder="https://example.com"
                value={url}
                onChange={handleUrlChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <LanguageIcon sx={{ color: "action.active", mr: 1 }} />
                  ),
                  sx: { borderRadius: 2, py: 0.5 }
                }}
              />
              
              <Button
                variant="contained"
                size="large"
                type="submit"
                startIcon={<LanguageIcon />}
                disabled={isAnalyzing}
                sx={{ 
                  borderRadius: 2, 
                  py: 1.2, 
                  px: 4,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
                }}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Website"}
              </Button>
              
              {isAnalyzing && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}
            </Box>
            
            {/* URL List */}
            {urlList.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    pb: 1, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1 
                  }}
                >
                  <LanguageIcon fontSize="small" color="primary" />
                  Analyzed URLs <Chip label={urlList.length} size="small" color="primary" sx={{ ml: 1 }} />
                </Typography>
                
                <Box 
                  component={motion.div}
                  transition={{ staggerChildren: 0.07 }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {urlList.map((item, index) => (
                    <Card
                      key={index}
                      component={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      elevation={0}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.action.hover, 0.1)
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex'
                          }}
                        >
                          <LanguageIcon fontSize="small" color="primary" />
                        </Box>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: { xs: 150, sm: 250, md: 400 } }}>
                            {item.url}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.charCount.toLocaleString()} characters extracted
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDeleteUrl(item.url)}
                        sx={{ 
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1)
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
          </TabPanel>

          {/* Email Tab */}
          <TabPanel value={value} index={3}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <EmailIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Email Data Training
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Coming Soon...
              </Typography>
              <Chip 
                label="Feature in development" 
                color="secondary" 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              />
            </Box>
          </TabPanel>
        </Box>
      </Paper>

      {/* AI Training Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          textAlign: "center",
          background: isDark 
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.6)}, ${alpha(theme.palette.background.default, 0.3)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.default, 0.5)})`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: isDark 
              ? alpha(theme.palette.primary.main, 0.15) 
              : alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            {isTraining ? (
              <CircularProgress 
                variant="determinate" 
                value={trainingProgress} 
                size={50}
                sx={{ color: theme.palette.primary.main }}
              />
            ) : trainingCompleted ? (
              <CheckCircleIcon sx={{ fontSize: 50, color: theme.palette.success.main }} />
            ) : (
              <SettingsSuggestIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
            )}
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {isTraining ? "Training in Progress" : trainingCompleted ? "Training Complete" : "AI Training Section"}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            After providing data, train your AI model to update data and improve its performance.
            This process may take a few moments to complete.
          </Typography>
          
          {trainingCompleted ? (
            <Alert 
              variant="outlined" 
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                maxWidth: 500,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                AI Model trained successfully with new data!
              </Typography>
            </Alert>
          ) : (
            <Alert 
              variant="outlined" 
              severity="info"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                maxWidth: 500,
                mx: 'auto',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2">
                AI Model is not trained yet. Please train the model to use it.
              </Typography>
            </Alert>
          )}
          
          <Divider sx={{ width: "100%", my: 3 }} />
          
          <Button
            variant="contained"
            color={trainingCompleted ? "success" : "primary"}
            startIcon={trainingCompleted ? <CheckCircleIcon /> : <SettingsSuggestIcon />}
            disabled={isTraining}
            onClick={handleTrainAI}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: trainingCompleted
                ? `0 4px 14px ${alpha(theme.palette.success.main, 0.3)}`
                : `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {isTraining ? `Training... ${Math.round(trainingProgress)}%` : trainingCompleted ? "Model Trained" : "Train AI Model"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}