import * as React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";

// Icons
import TextFieldsIcon from "@mui/icons-material/TextFields";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  tap: { scale: 0.98 },
};

const dataSources = [
  {
    id: "text",
    title: "Text Input",
    description: "Manually enter or paste text data for training",
    icon: <TextFieldsIcon fontSize="large" />,
    benefits: ["Quick setup", "Fine-grained control", "No preprocessing needed"],
  },
  {
    id: "pdf",
    title: "PDF Documents",
    description: "Upload PDF files containing relevant data",
    icon: <UploadFileIcon fontSize="large" />,
    benefits: ["Bulk data import", "Maintain formatting", "Extract structured data"],
  },
  {
    id: "website",
    title: "Website Crawling",
    description: "Extract data from specific websites or webpages",
    icon: <LanguageIcon fontSize="large" />,
    benefits: ["Automate data collection", "Access online resources", "Regular updates"],
  },
  {
    id: "email",
    title: "Email Data",
    description: "Import data from connected email accounts",
    icon: <EmailIcon fontSize="large" />,
    benefits: ["Use real communications", "Personal style analysis", "Context preservation"],
    comingSoon: true,
  },
];

interface DataSourceSelectorProps {
  onSourceSelection: (sources: string[]) => void;
  selectedSources: string[];
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  onSourceSelection,
  selectedSources,
}) => {
  const theme = useTheme();

  const handleToggleSource = (sourceId: string) => {
    const updatedSources = selectedSources.includes(sourceId)
      ? selectedSources.filter((id) => id !== sourceId)
      : [...selectedSources, sourceId];
    
    onSourceSelection(updatedSources);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Select Data Sources
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose one or more data sources to train your AI model. Combined sources provide better results.
      </Typography>

      <Grid container spacing={3}>
        {dataSources.map((source) => (
          <Grid item xs={12} sm={6} key={source.id}>
            <Card
              component={motion.div}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileTap={!source.comingSoon ? "tap" : undefined}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${
                  selectedSources.includes(source.id)
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.8)
                }`,
                backgroundColor: selectedSources.includes(source.id)
                  ? alpha(theme.palette.primary.main, 0.05)
                  : "transparent",
                cursor: source.comingSoon ? "default" : "pointer",
                opacity: source.comingSoon ? 0.7 : 1,
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  borderColor: !source.comingSoon
                    ? theme.palette.primary.main
                    : undefined,
                  backgroundColor: !source.comingSoon
                    ? alpha(theme.palette.primary.main, 0.03)
                    : undefined,
                },
              }}
              onClick={() => !source.comingSoon && handleToggleSource(source.id)}
            >
              {selectedSources.includes(source.id) && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: "0 40px 40px 0",
                    borderColor: `transparent ${theme.palette.primary.main} transparent transparent`,
                    zIndex: 1,
                  }}
                />
              )}

              <CardContent sx={{ p: 3, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    >
                      {source.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {source.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {source.description}
                      </Typography>
                    </Box>
                    {!source.comingSoon && (
                      <Checkbox
                        checked={selectedSources.includes(source.id)}
                        color="primary"
                        sx={{ ml: 1 }}
                        onChange={() => handleToggleSource(source.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: "auto" }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Benefits
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {source.benefits.map((benefit, index) => (
                        <Typography
                          key={index}
                          component="li"
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {benefit}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {source.comingSoon && (
                    <Box
                      sx={{
                        mt: 2,
                        borderRadius: 1,
                        py: 0.5,
                        px: 1.5,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        width: "fit-content",
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        Coming Soon
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};