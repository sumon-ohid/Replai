import * as React from "react";
import { useState, useEffect } from "react";
import { alpha, useTheme, darken, lighten } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import {
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Rating,
  Avatar,
  IconButton,
  Alert,
  AlertTitle,
  Container,
  Paper,
  Divider,
  Chip,
  useMediaQuery,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Footer from './components/Footer';
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CommentIcon from "@mui/icons-material/Comment";
import SendIcon from "@mui/icons-material/Send";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InsightsIcon from "@mui/icons-material/Insights";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StarIcon from "@mui/icons-material/Star";
import ForumIcon from "@mui/icons-material/Forum";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

type FeedbackComment = {
  _id: string;
  userId: {
    name: string;
    profilePicture: string;
  };
  comment: string;
  createdAt?: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function FeedbackPage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/feedback/all`);
      const data = response.data as { userId: string };
      // if (!data.userId) {
      //   console.log("No feedback found");
      //   return;
      // }

      setFeedbackList(response.data as any[]);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/feedback/submit`,
        { rating, comments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackList((prevList) => [response.data, ...prevList]);
      setRating(null);
      setComments("");
      setAlert({
        type: "success",
        message:
          "Your feedback has been submitted successfully! Thank you for helping us improve.",
      });

      // Auto-dismiss the alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setAlert({
        type: "error",
        message:
          "Please provide both a rating and comment before submitting feedback.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (feedbackId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Don't submit empty comments
      if (!newComments[feedbackId]?.trim()) {
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/feedback/comment/${feedbackId}`,
        { comment: newComments[feedbackId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackList((prevList) =>
        prevList.map((feedback) =>
          feedback._id === feedbackId ? response.data : feedback
        )
      );
      setNewComments((prevComments) => ({
        ...prevComments,
        [feedbackId]: "",
      }));
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleLike = async (feedbackId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.post(
        `${apiBaseUrl}/api/feedback/like/${feedbackId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbackList((prevList) =>
        prevList.map((feedback) =>
          feedback._id === feedbackId ? response.data : feedback
        )
      );
    } catch (error) {
      console.error("Error liking feedback:", error);
    }
  };

  const handleCommentChange = (feedbackId: string, value: string) => {
    setNewComments((prevComments) => ({
      ...prevComments,
      [feedbackId]: value,
    }));
  };

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get gradient colors based on theme
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const gradientBg = `linear-gradient(145deg, ${alpha(
    primaryColor,
    0.15
  )} 0%, ${alpha(secondaryColor, 0.05)} 100%)`;
  const headerGradient = `linear-gradient(90deg, ${primaryColor} 0%, ${
    theme.palette.mode === "dark"
      ? lighten(secondaryColor, 0.1)
      : secondaryColor
  } 100%)`;

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
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
              mx: { xs: 1, sm: 2, md: 3 },
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>

          <Container maxWidth="lg">
            <Box
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              sx={{ px: { xs: 1, sm: 2 }, py: 3 }}
            >
              {/* Page Header */}
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 5, textAlign: "center" }}
              >
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  Your Feedback Matters
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    maxWidth: 700,
                    mx: "auto",
                    mb: 3,
                    px: 2,
                  }}
                >
                  Help us build a better experience by sharing your thoughts and
                  suggestions. Every opinion helps us improve.
                </Typography>

                <Stack
                  direction={{ xs: "row", sm: "row" }} 
                  spacing={{ xs: 1, sm: 3 }}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                  width={1}
                >
                  {[
                    { icon: <EmojiEventsIcon />, label: "Top rated product" },
                    {
                      icon: <ForumIcon />,
                      label: `${feedbackList.length} feedbacks`,
                    },
                    { icon: <InsightsIcon />, label: "Constant improvements" },
                  ].map((item, idx) => (
                    <Chip
                      key={idx}
                      icon={item.icon}
                      label={item.label}
                      variant="outlined"
                      color="primary"
                      sx={{
                        borderRadius: "16px",
                        px: 1,
                        "& .MuiChip-icon": {
                          color: primaryColor,
                        },
                        width: { xs: "30%", sm: "auto" },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Feedback Form */}
              <Box sx={{ mb: 8, alignItems: "center",  background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)` }}>
                <Grid item xs={12} md={7}>
                  <Box component={motion.div} variants={itemVariants} sx={{ background: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)` }}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        border: 1,
                        borderColor: "divider",
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? `0 8px 32px ${alpha(
                                theme.palette.common.black,
                                0.2
                              )}`
                            : `0 8px 32px ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )}`,
                      }}
                    >
                      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        <AnimatePresence mode="wait">
                          {alert && (
                            <motion.div
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              <Alert
                                severity={alert.type}
                                variant="filled"
                                onClose={() => setAlert(null)}
                                sx={{
                                  mb: 3,
                                  borderRadius: 2,
                                  boxShadow: `0 4px 12px ${alpha(
                                    alert.type === "success"
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                    0.2
                                  )}`,
                                }}
                              >
                                <AlertTitle sx={{ fontWeight: 600 }}>
                                  {alert.type === "success"
                                    ? "Thank You!"
                                    : "Action Required"}
                                </AlertTitle>
                                {alert.message}
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Box
                          component="form"
                          onSubmit={handleSubmit}
                          noValidate
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <StarIcon fontSize="small" color="primary" />
                            How would you rate your experience?
                          </Typography>

                          <Box
                            sx={{
                              mb: 4,
                              display: "flex",
                              alignItems: "left",
                              flexDirection: "column",
                              mt: 3,
                            }}
                          >
                            <Rating
                              name="feedback-rating"
                              value={rating}
                              onChange={(_, newValue) => setRating(newValue)}
                              size="large"
                              sx={{
                                mb: 1,
                                "& .MuiRating-iconFilled": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {rating
                                ? rating < 3
                                  ? "We'll work on improving"
                                  : rating < 5
                                  ? "Thanks! We're doing well"
                                  : "Excellent! Thank you"
                                : "Select a rating"}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ChatBubbleOutlineIcon
                              fontSize="small"
                              color="primary"
                            />
                            Tell us more about your experience
                          </Typography>

                          <Grid item xs={12}>
                            <textarea
                              name="textarea"
                              id="textarea"
                              rows={6}
                              cols={65}
                              required
                              style={{
                                width: "100%",
                                height: "100%",
                                padding: "10px",
                                borderRadius: "5px",
                                border: ".5px solid rgba(142, 142, 142, 0.48)",
                                backgroundColor: "transparent",
                                resize: "none",
                              }}
                              placeholder="Comments"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                            >
                              {comments}
                            </textarea>
                          </Grid>

                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            endIcon={<SendIcon />}
                            sx={{
                              mt: 3,
                              fontSize: "1rem",
                              py: 1.2,
                              px: 3,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              boxShadow: `0 4px 14px ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                              background:
                                theme.palette.mode === "dark"
                                  ? `linear-gradient(90deg, ${primaryColor}, ${darken(
                                      primaryColor,
                                      0.2
                                    )})`
                                  : `linear-gradient(90deg, ${primaryColor}, ${lighten(
                                      primaryColor,
                                      0.1
                                    )})`,
                              "&:hover": {
                                boxShadow: `0 6px 20px ${alpha(
                                  theme.palette.primary.main,
                                  0.4
                                )}`,
                              },
                            }}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Box>

              {/* Community Feedback Section */}
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    mb: 4,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      Community Feedback
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      See what others are saying about Replai
                    </Typography>
                  </Box>

                  <Chip
                    label={`${feedbackList.length} Contributions`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      mt: { xs: 2, sm: 0 },
                      fontWeight: 500,
                      px: 1,
                      borderRadius: "12px",
                    }}
                  />
                </Box>

                {/* Feedback Cards */}
                <AnimatePresence>
                  {feedbackList.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 4,
                        border: `1px dashed ${alpha(
                          theme.palette.divider,
                          0.8
                        )}`,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        Be the first to share your thoughts!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No feedback has been submitted yet. Your opinion could
                        be the first.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={3}>
                      {feedbackList.map((feedback, index) => (
                        <Box
                          component={motion.div}
                          key={feedback._id}
                          variants={itemVariants}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: 20 }}
                        >
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: 3,
                              border: `1px solid ${alpha(
                                theme.palette.divider,
                                0.6
                              )}`,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                borderColor: alpha(
                                  theme.palette.primary.main,
                                  0.3
                                ),
                                boxShadow: `0 4px 20px ${alpha(
                                  theme.palette.primary.main,
                                  0.1
                                )}`,
                              },
                            }}
                          >
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                              {/* Header */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  flexDirection: { xs: "column", sm: "row" },
                                  mb: 2,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                  sx={{ mb: { xs: 1, sm: 0 } }}
                                >
                                  <Avatar
                                    alt={feedback.name || "anonymous"}
                                    src={feedback.userId?.profilePicture || ""}
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      border: `2px solid ${alpha(
                                        theme.palette.primary.main,
                                        0.2
                                      )}`,
                                    }}
                                  />
                                  <Box>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight={600}
                                    >
                                      {feedback.name ||
                                        feedback.userId?.name ||
                                        "Anonymous User"}
                                    </Typography>
                                    <Rating
                                      value={feedback.rating}
                                      readOnly
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                    />
                                  </Box>
                                </Stack>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: { xs: 0, sm: 0.5 } }}
                                >
                                  {formatDate(feedback.createdAt) || "Recently"}
                                </Typography>
                              </Box>

                              <Divider sx={{ mb: 2 }} />

                              {/* Feedback Content */}
                              <Box
                                sx={{
                                  py: 1,
                                  px: { xs: 0, sm: 1 },
                                  mb: 3,
                                  minHeight: "60px",
                                }}
                              >
                                <Typography variant="body1">
                                  {feedback.comments}
                                </Typography>
                              </Box>

                              {/* Actions */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 2 }}
                              >
                                <Tooltip title="Like this feedback">
                                  <IconButton
                                    aria-label="like"
                                    onClick={() => handleLike(feedback._id)}
                                    color={
                                      feedback.likes?.includes(
                                        localStorage.getItem("userId") || ""
                                      )
                                        ? "primary"
                                        : "default"
                                    }
                                    sx={{
                                      borderRadius: 2,
                                      transition: "transform 0.2s",
                                      "&:hover": {
                                        transform: "scale(1.1)",
                                      },
                                    }}
                                  >
                                    {feedback.likes?.includes(
                                      localStorage.getItem("userId") || ""
                                    ) ? (
                                      <ThumbUpIcon />
                                    ) : (
                                      <ThumbUpOffAltIcon />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                <Typography variant="body2" fontWeight={500}>
                                  {feedback.likes?.length || 0} likes
                                </Typography>

                                <Box sx={{ flexGrow: 1 }} />

                                <Chip
                                  icon={
                                    <CommentIcon
                                      sx={{ fontSize: "1rem !important" }}
                                    />
                                  }
                                  label={`${
                                    feedback.feedbackComments?.length || 0
                                  } comments`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: "12px",
                                    height: 28,
                                  }}
                                />
                              </Stack>

                              {/* Comments Section */}
                              {feedback.feedbackComments?.length > 0 && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    bgcolor: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                                    p: 2,
                                    borderRadius: 2,
                                    mb: 2,
                                    border: 1,
                                    borderColor: "divider",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      mb: 1.5,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <CommentIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                    Comments
                                  </Typography>

                                  <Stack spacing={1.5} >
                                    {feedback.feedbackComments.map(
                                      (comment: FeedbackComment) => (
                                        <Box
                                          key={comment._id}
                                          sx={{
                                            display: "flex",
                                            gap: 1.5,                                          }}
                                        >
                                          <Avatar
                                            alt={
                                              comment.userId?.name ||
                                              "anonymous"
                                            }
                                            src={
                                              comment.userId?.profilePicture ||
                                              ""
                                            }
                                            sx={{ width: 32, height: 32 }}
                                          />
                                          <Box sx={{ flex: 1 }}>
                                            <Box
                                              sx={{
                                                bgcolor: `radial-gradient(circle, ${alpha(primaryColor, 0.2)} 0%, transparent 70%)`,
                                                p: 1.5,
                                                borderRadius:
                                                  "0 16px 16px 16px",
                                                border: 1,
                                                borderColor: "divider",
                                               
                                              }}
                                            >
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 500,
                                                  mb: 0.5,
                                                }}
                                              >
                                                {comment.userId?.name ||
                                                  "Anonymous"}
                                              </Typography>
                                              <Typography variant="body2">
                                                {comment.comment}
                                              </Typography>
                                            </Box>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{ ml: 1, mt: 0.5 }}
                                            >
                                              {formatDate(comment.createdAt) ||
                                                "Recently"}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )
                                    )}
                                  </Stack>
                                </Paper>
                              )}

                              {/* Add Comment */}
                              <Box
                                component="form"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleCommentSubmit(feedback._id);
                                }}
                                noValidate
                              >
                                <TextField
                                  placeholder="Add a comment..."
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  value={newComments[feedback._id] || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      feedback._id,
                                      e.target.value
                                    )
                                  }
                                  InputProps={{
                                    sx: { borderRadius: 3 },
                                    endAdornment: (
                                      <InputAdornment position="end">
                                          <SendIcon />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </Container>

          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
