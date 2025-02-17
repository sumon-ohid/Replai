import * as React from "react";
import { useState } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import {
  Typography,
  Card,
  CardContent,
  Paper,
  Button,
  TextField,
  Rating,
  FormControl,
  FormLabel,
} from "@mui/material";
import Footer from "../marketing-page/components/Footer";
import FeedbackIcon from "@mui/icons-material/Feedback";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function FeedbackPage(props: { disableCustomTheme?: boolean }) {
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Process form submission, e.g., send the data to an API
    console.log({ name, email, rating, comments });
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* Main Content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
            minHeight: "100vh",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>
          <Typography variant="h4" align="center" sx={{ mt: 3 }}>
            Feedback Form
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            We value your feedback
          </Typography>
          <Box sx={{ mx: 3, mb: 3 }}>
            <Card sx={{ maxWidth: 600, height: 500, mx: "auto", p: 2, overflow: "auto" }}>
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FeedbackIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h5">
                      We'd love to hear from you!
                    </Typography>
                  </Stack>
                  <Typography variant="body1">
                    Please share your thoughts and suggestions to help us
                    improve.
                  </Typography>
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          placeholder="Name"
                          variant="outlined"
                          fullWidth
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          placeholder="Email"
                          variant="outlined"
                          fullWidth
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl component="fieldset" fullWidth>
                          <FormLabel component="legend">Rating</FormLabel>
                          <Rating
                            name="feedback-rating"
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <textarea
                          name="textarea"
                          id="textarea"
                          rows="6"
                          cols="65"
                          required=""
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: ".5px solid rgba(142, 142, 142, 0.48)",
                          }}
                          placeholder="Comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        >
                          {comments}
                        </textarea>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                        >
                          Submit Feedback
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
