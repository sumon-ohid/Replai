import * as React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useMediaQuery,
  Divider,
  Chip,
  Skeleton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";

// Icons
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LanguageIcon from "@mui/icons-material/Language";
import AdjustIcon from "@mui/icons-material/Adjust";
import TuneIcon from "@mui/icons-material/Tune";
import InsightsIcon from "@mui/icons-material/Insights";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import DataUsageIcon from '@mui/icons-material/DataUsage';
import DescriptionIcon from '@mui/icons-material/Description';
import TimerIcon from '@mui/icons-material/Timer';
import FolderIcon from '@mui/icons-material/Folder';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

interface DataPreviewProps {
  selectedSources: string[];
  config: {
    learningRate: number;
    epochs: number;
    batchSize: number;
  };
  onConfigChange: (config: any) => void;
}

// Data interfaces
interface TextData {
  entries: string[];
  charCount: number;
}

interface PDFData {
  files: { name: string; charCount: number; pages?: number }[];
  totalCharCount: number;
}

interface WebsiteData {
  urls: { url: string; title: string; charCount: number }[];
  totalCharCount: number;
}

export function DataPreview({ selectedSources, config, onConfigChange }: DataPreviewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const [loading, setLoading] = React.useState(true);
  const [textData, setTextData] = React.useState<TextData>({ entries: [], charCount: 0 });
  const [pdfData, setPdfData] = React.useState<PDFData>({ files: [], totalCharCount: 0 });
  const [websiteData, setWebsiteData] = React.useState<WebsiteData>({ urls: [], totalCharCount: 0 });
  
  const apiBaseUrl =import.meta.env.VITE_API_BASE_URL || "";

  // Fetch data from backend
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token not found");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${apiBaseUrl}/api/data/get-training-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          const data = response.data;
          
          // Process text data
          if (typeof data === "object" && data !== null && "textData" in data) {
            const textSamples = typeof data.textData === "string" 
              ? data.textData.split(/\n{2,}/).filter((t: string) => t.trim().length > 0).slice(0, 3) 
              : [];
            setTextData({
              entries: textSamples,
              charCount: typeof data.textData === "string" ? data.textData.length : 0
            });
          }
          
          // Process PDF data
          if (typeof data === "object" && data !== null && "fileData" in data) {
            // Extract file information from fileData
            // This assumes fileData has some metadata or structure to identify files
            // You may need to adjust based on actual format
            setPdfData({
              files: Array.isArray(data.fileData) ? data.fileData.map((file: any) => ({
                name: file.name || "Unknown",
                charCount: file.charCount || 0,
                pages: file.pages || undefined
              })) : [],
              totalCharCount: Array.isArray(data.fileData) ? data.fileData.length : 0
            });
          }
          
          // Process website data
          if (typeof data === "object" && data !== null && "webData" in data) {
            // Parse sections divided by separator
            const webSections = typeof data.webData === "string" 
              ? data.webData.split(/===\s*NEW\s*PAGE\s*===/) 
              : [];
            const urls = webSections.map((section: string) => {
              // Extract URL and title from metadata
              const urlMatch = section.match(/URL:\s*(https?:\/\/[^\n]+)/i);
              const titleMatch = section.match(/Page:\s*([^\n]+)/i);
              
              return {
                url: urlMatch ? urlMatch[1] : "Unknown URL",
                title: titleMatch ? titleMatch[1] : "Untitled Page",
                charCount: section.length
              };
            });
            
            setWebsiteData({
              urls,
              totalCharCount: typeof data.webData === "string" ? data.webData.length : 0
            });
          }
        }
      } catch (error) {
        console.error("Error fetching training data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiBaseUrl]);

  // Calculate summary stats
  const calculateDataStats = () => {
    const totalSources = selectedSources.length;
    const totalDocuments = 
      (selectedSources.includes("text") ? textData.entries.length : 0) +
      (selectedSources.includes("file") ? pdfData.files.length : 0) +
      (selectedSources.includes("website") ? websiteData.urls.length : 0);
    
    const totalCharCount = 
      (selectedSources.includes("text") ? textData.charCount : 0) +
      (selectedSources.includes("file") ? pdfData.totalCharCount : 0) +
      (selectedSources.includes("website") ? websiteData.totalCharCount : 0);
    
    // Estimate tokens (roughly 4 chars per token)
    const estimatedTokens = Math.ceil(totalCharCount / 4);
    
    // Always show 10-15 seconds for training time
    const estimatedTrainingTime = "~15 sec";
    
    return {
      totalSources,
      totalDocuments,
      totalCharCount,
      estimatedTokens,
      estimatedTrainingTime
    };
  };

  const dataStats = calculateDataStats();

  // Render skeletons while loading
  const renderSkeletons = () => (
    <Box>
      <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={120} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      </Grid>
    </Box>
  );

  const renderSourcePreview = (source: string) => {
    if (loading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={150} />
        </Box>
      );
    }

    switch (source) {
      case "text":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextSnippetIcon color="primary" fontSize="small" /> Text Data
              <Chip 
                size="small" 
                label={`${textData.charCount.toLocaleString()} characters`} 
                color="primary" 
                variant="outlined" 
                sx={{ ml: 1, height: 20, fontWeight: 500 }}
              />
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.background.paper, 0.6), 
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {textData.entries.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{textData.entries.length}</strong> text entries detected
                  </Typography>
                  <Box sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
                    {textData.entries.map((sample, index) => (
                      <Card 
                        key={index} 
                        elevation={0}
                        sx={{ 
                          mb: 1, 
                          p: 1.5, 
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <FormatQuoteIcon sx={{ color: alpha(theme.palette.text.secondary, 0.6), transform: 'rotate(180deg)', fontSize: '1.2rem', flexShrink: 0, mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', flex: 1 }}>
                            {sample.length > 120 ? `${sample.substring(0, 120)}...` : sample}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                  <TextSnippetIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3) }} />
                  <Typography color="text.secondary" align="center">
                    No text data found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );
      
      case "file":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PictureAsPdfIcon color="error" fontSize="small" /> PDF Documents
              <Chip 
                size="small" 
                label={`${pdfData.totalCharCount.toLocaleString()} characters`} 
                color="error" 
                variant="outlined" 
                sx={{ ml: 1, height: 20, fontWeight: 500 }}
              />
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.background.paper, 0.6), 
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                height: '100%',
                minHeight: 200
              }}
            >
              {pdfData.files.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{pdfData.files.length}</strong> PDF files processed
                  </Typography>
                  
                  <List dense disablePadding sx={{ mt: 1, maxHeight: 220, overflow: 'auto' }}>
                    {pdfData.files.map((file, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 1.5, 
                          py: 1, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <PictureAsPdfIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name} 
                          secondary={file.pages ? `${file.pages} pages • ${file.charCount.toLocaleString()} characters` : `${file.charCount.toLocaleString()} characters`}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontWeight: 500,
                            sx: { wordBreak: 'break-word' }
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            sx: { fontSize: '0.7rem' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                  <PictureAsPdfIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3) }} />
                  <Typography color="text.secondary" align="center">
                    No PDF documents found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );

      case "website":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageIcon color="info" fontSize="small" /> Website Data
              <Chip 
                size="small" 
                label={`${websiteData.totalCharCount.toLocaleString()} characters`} 
                color="info" 
                variant="outlined" 
                sx={{ ml: 1, height: 20, fontWeight: 500 }}
              />
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.background.paper, 0.6), 
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                height: '100%',
                minHeight: 200
              }}
            >
              {websiteData.urls.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{websiteData.urls.length}</strong> websites crawled for content
                  </Typography>
                  
                  <List dense disablePadding sx={{ mt: 1, maxHeight: 220, overflow: 'auto' }}>
                    {websiteData.urls.map((urlData, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 1.5, 
                          py: 1, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LanguageIcon fontSize="small" color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={urlData.title} 
                          secondary={
                            <Tooltip title={urlData.url} placement="bottom">
                              <Typography variant="caption" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                                {urlData.url} • {urlData.charCount.toLocaleString()} characters
                              </Typography>
                            </Tooltip>
                          }
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontWeight: 500,
                            sx: { wordBreak: 'break-word' }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                  <LanguageIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3) }} />
                  <Typography color="text.secondary" align="center">
                    No website data found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box component={motion.div} variants={itemVariants}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
          Data Preview & Training Configuration
        </Typography>
      </Box>

      {loading ? renderSkeletons() : (
        <>
          {/* Training Summary Card */}
          <Card 
            component={motion.div}
            variants={itemVariants}
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              background: isDark 
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.background.paper, 0.5)})`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.5)})`,
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mr: 1.5
                }}>
                  <DataUsageIcon color="primary" />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                  Training Data Summary
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2,
                      height: '100%',
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                      }
                    }}
                  >
                    <FolderIcon sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                      {dataStats.totalSources}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 500 }}>
                      Data Sources
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2,
                      height: '100%',
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                      }
                    }}
                  >
                    <DescriptionIcon sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                      {dataStats.totalDocuments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 500 }}>
                      Documents
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2,
                      height: '100%',
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                      }
                    }}
                  >
                    <SummarizeIcon sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                      {dataStats.estimatedTokens.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 500 }}>
                      Est. Tokens
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2,
                      height: '100%',
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                      }
                    }}
                  >
                    <TimerIcon sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: isMobile ? '1.5rem' : '2rem' }} />
                    <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', whiteSpace: 'nowrap' }}>
                      {dataStats.estimatedTrainingTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 500 }}>
                      Training Time
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2.5, opacity: 0.6 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', flexDirection: isMobile ? 'column' : 'row', textAlign: 'center' }}>
                <HelpOutlineIcon sx={{ fontSize: '1rem', mr: 0.8, color: theme.palette.info.main }} />
                A total of <Box component="span" sx={{ fontWeight: 600, mx: 0.5 }}>{dataStats.totalCharCount.toLocaleString()}</Box> 
                characters will be processed during training to create your custom AI assistant.
              </Typography>
            </CardContent>
          </Card>

          {/* Data Sources Preview */}
          <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              mb: 2
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsightsIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                Data Source Preview
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {selectedSources.map((source) => (
                <Grid item xs={12} md={source === "website" ? 12 : 6} key={source}>
                  {renderSourcePreview(source)}
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Ready to Train Notice */}
          <Box component={motion.div} variants={itemVariants}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.1),
              }}>
                <CheckCircleIcon color="success" />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: alpha(theme.palette.success.main, 0.9), mb: 0.5 }}>
                  Data Processing Complete
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your data has been processed and is ready for training. Click "Start Training" to continue.
                </Typography>
              </Box>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
}