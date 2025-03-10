import * as React from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";

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

export function DataPreview({ selectedSources, config, onConfigChange }: DataPreviewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [previewType, setPreviewType] = React.useState("summary");

  // Mock data for preview
  const previewData = {
    textData: {
      count: 3,
      characters: 5240,
      samples: [
        "Our company focuses on delivering exceptional customer experiences through innovative software solutions...",
        "The quarterly financial report shows a 15% increase in revenue compared to last year's projections..."
      ]
    },
    pdfData: {
      count: 2,
      pages: 24,
      fileNames: ["company_handbook.pdf", "technical_documentation.pdf"]
    },
    websiteData: {
      count: 3,
      urls: ["https://example.com/about", "https://example.com/services", "https://example.com/blog"],
      pageCount: 12
    }
  };

  // Summary of training data
  const dataStats = {
    totalSources: selectedSources.length,
    totalDocuments: previewData.textData.count + previewData.pdfData.count + previewData.websiteData.count,
    estimatedTokens: 45000,
    estimatedTrainingTime: "3-5 minutes"
  };

  const handleConfigChange = (key: string, value: number) => {
    const updatedConfig = { ...config, [key]: value };
    onConfigChange(updatedConfig);
  };

  const renderSourcePreview = (source: string) => {
    switch (source) {
      case "text":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextSnippetIcon color="primary" fontSize="small" /> Text Data
            </Typography>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>{previewData.textData.count}</strong> text entries with <strong>{previewData.textData.characters}</strong> characters
              </Typography>
              <Box sx={{ mt: 2 }}>
                {previewData.textData.samples.map((sample, index) => (
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
                      <FormatQuoteIcon sx={{ color: alpha(theme.palette.text.secondary, 0.6), transform: 'rotate(180deg)', fontSize: '1.2rem' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', flex: 1 }}>
                        {sample.length > 100 ? `${sample.substring(0, 100)}...` : sample}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Box>
        );
      
      case "file":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PictureAsPdfIcon color="error" fontSize="small" /> PDF Documents
            </Typography>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>{previewData.pdfData.count}</strong> files with <strong>{previewData.pdfData.pages}</strong> total pages
              </Typography>
              
              <List dense disablePadding>
                {previewData.pdfData.fileNames.map((file, index) => (
                  <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PictureAsPdfIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: 500
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        );

      case "website":
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageIcon color="info" fontSize="small" /> Website Data
            </Typography>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>{previewData.websiteData.count}</strong> websites with <strong>{previewData.websiteData.pageCount}</strong> total pages
              </Typography>
              
              <List dense disablePadding>
                {previewData.websiteData.urls.map((url, index) => (
                  <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LanguageIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={url} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: 500
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
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
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Data Preview & Training Configuration
        </Typography>
      </Box>

      {/* Training Summary Card */}
      <Card 
        component={motion.div}
        variants={itemVariants}
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.5)})`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SummarizeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Training Data Summary
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {dataStats.totalSources}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Sources
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {dataStats.totalDocuments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Documents
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {dataStats.estimatedTokens.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tokens
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {dataStats.estimatedTrainingTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Est. Training Time
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Sources Preview */}
      <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h6" fontWeight={600}>
            Data Source Preview
          </Typography>
          
          <Box>
            <Button 
              variant={previewType === "summary" ? "contained" : "outlined"} 
              size="small"
              onClick={() => setPreviewType("summary")}
              sx={{ 
                mr: 1,
                borderRadius: '20px',
                fontSize: '0.75rem',
                py: 0.5
              }}
            >
              Summary
            </Button>
            <Button 
              variant={previewType === "raw" ? "contained" : "outlined"}
              size="small"
              onClick={() => setPreviewType("raw")}
              sx={{ 
                borderRadius: '20px',
                fontSize: '0.75rem',
                py: 0.5
              }}
            >
              Raw Data
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {selectedSources.map((source) => (
            <Grid item xs={12} md={source === "website" ? 12 : 6} key={source}>
              {renderSourcePreview(source)}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Training Configuration */}
      <Box component={motion.div} variants={itemVariants}>
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            mb: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon color="secondary" />
                <span>Training Configuration</span>
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ borderRadius: 2 }}
              >
                {showAdvanced ? "Basic" : "Advanced"}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Learning Rate</span>
                  <Tooltip title="Controls how quickly the model adapts to new data">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    value={config.learningRate}
                    min={0.0001}
                    max={0.01}
                    step={0.0001}
                    onChange={(_, value) => handleConfigChange("learningRate", value as number)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(4)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    value={config.learningRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleConfigChange("learningRate", value);
                      }
                    }}
                    InputProps={{
                      sx: { 
                        width: 100, 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Epochs</span>
                  <Tooltip title="Number of complete passes through the training dataset">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    value={config.epochs}
                    min={1}
                    max={20}
                    step={1}
                    onChange={(_, value) => handleConfigChange("epochs", value as number)}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    value={config.epochs}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleConfigChange("epochs", value);
                      }
                    }}
                    InputProps={{
                      sx: { 
                        width: 100, 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Batch Size</span>
                  <Tooltip title="Number of training examples used in one iteration">
                    <IconButton size="small">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    value={config.batchSize}
                    min={8}
                    max={128}
                    step={8}
                    onChange={(_, value) => handleConfigChange("batchSize", value as number)}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    value={config.batchSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleConfigChange("batchSize", value);
                      }
                    }}
                    InputProps={{
                      sx: { 
                        width: 100, 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }
                    }}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              {showAdvanced && (
                <React.Fragment>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Chip label="Advanced Options" size="small" />
                    </Divider>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
                      Optimizer
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      defaultValue="adam"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="adam">Adam</option>
                      <option value="sgd">SGD</option>
                      <option value="rmsprop">RMSprop</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
                      Loss Function
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      defaultValue="categorical_crossentropy"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="categorical_crossentropy">Categorical Crossentropy</option>
                      <option value="binary_crossentropy">Binary Crossentropy</option>
                      <option value="mse">Mean Squared Error</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
                      Data Split (Train/Validation)
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      defaultValue="80_20"
                      size="small"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="80_20">80% / 20%</option>
                      <option value="70_30">70% / 30%</option>
                      <option value="90_10">90% / 10%</option>
                    </TextField>
                  </Grid>
                </React.Fragment>
              )}
            </Grid>
            
            {/* Expected Outcomes */}
            {showAdvanced && (
              <Box sx={{ mt: 3 }}>
                <Card 
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InsightsIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Expected Model Performance
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Expected Accuracy
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        85% - 95%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Response Quality
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        High
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Contextual Understanding
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        Very Good
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Style Adaptation
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        Excellent
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Ready to Train Notice */}
      <Box component={motion.div} variants={itemVariants}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CheckCircleIcon color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Your data and configuration are ready. Click "Start Training" to continue.
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}