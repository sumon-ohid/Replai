import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { alpha, useTheme, styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CssBaseline from "@mui/material/CssBaseline";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LanguageIcon from "@mui/icons-material/Language";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import AppTheme from "../shared-theme/AppTheme";
import Footer from "./components/Footer";
import AppAppBar from "./components/AppAppBar";
import { useState, useRef, useEffect } from "react";

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  transition: "all 0.3s ease-in-out",
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
  },
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
  padding: theme.spacing(3),
  transition: "all 0.3s ease",
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 30,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s",
    "&:hover": {
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    },
    "&.Mui-focused": {
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
    },
  },
}));

const FeaturedPostCard = styled(Card)(({ theme }) => ({
  position: "relative",
  height: 500,
  borderRadius: 24,
  backgroundPosition: "center",
  backgroundSize: "cover",
  overflow: "hidden",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
  [theme.breakpoints.down("md")]: {
    height: 400,
  },
  [theme.breakpoints.down("sm")]: {
    height: 300,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

// Mock data
const featuredPost = {
  id: 1,
  title: "How AI is Revolutionizing Email Management in 2025",
  excerpt:
    "Discover how AI-powered email agents are transforming productivity and communication for businesses worldwide.",
  imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
  date: "March 4, 2025",
  author: {
    name: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  category: "AI Technology",
  readTime: "8 min read",
};

const blogCategories = [
  { id: "all", label: "All Posts" },
  { id: "ai", label: "AI Technology" },
  { id: "automation", label: "Automation" },
  { id: "productivity", label: "Productivity" },
  { id: "integration", label: "Integrations" },
  { id: "tutorials", label: "Tutorials" },
];

const blogPosts = [
  {
    id: 2,
    title: "Training Your AI Email Assistant with Custom Data",
    excerpt:
      "Learn how to optimize your email responses by training Replai with your company's unique data.",
    imageUrl: "https://images.unsplash.com/photo-1555212697-194d092e3b8f",
    date: "February 28, 2025",
    author: {
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    category: "Tutorials",
    readTime: "5 min read",
    featured: false,
    icon: <InsertDriveFileIcon />,
  },
  {
    id: 3,
    title: "Maximizing Productivity with Calendar Integration",
    excerpt:
      "See how Replai's Google Calendar integration helps you manage meetings and optimize your schedule.",
    imageUrl: "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02",
    date: "February 21, 2025",
    author: {
      name: "Mike Chen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    category: "Productivity",
    readTime: "6 min read",
    featured: false,
    icon: <CalendarMonthIcon />,
  },
  {
    id: 4,
    title: "Web Crawling for Smarter AI Responses",
    excerpt:
      "Explore how Replai can crawl websites to gather information and provide more accurate responses.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    date: "February 18, 2025",
    author: {
      name: "David Wilson",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    category: "AI Technology",
    readTime: "7 min read",
    featured: false,
    icon: <LanguageIcon />,
  },
  {
    id: 5,
    title: "5 Ways to Automate Your Email Workflow",
    excerpt:
      "Discover practical automation techniques to reduce manual email handling and save hours every week.",
    imageUrl: "https://images.unsplash.com/photo-1591017403286-fd8493524e1e",
    date: "February 10, 2025",
    author: {
      name: "Emma Davis",
      avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    },
    category: "Automation",
    readTime: "4 min read",
    featured: false,
    icon: <AutoAwesomeIcon />,
  },
  {
    id: 6,
    title: "The Future of Email: AI Predictions for 2026",
    excerpt:
      "Our experts share insights on upcoming trends and developments in AI email management technology.",
    imageUrl: "https://images.unsplash.com/photo-1496096265110-f83ad7f96608",
    date: "January 30, 2025",
    author: {
      name: "James Roberts",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    category: "AI Technology",
    readTime: "9 min read",
    featured: false,
    icon: <TipsAndUpdatesIcon />,
  },
];

// Main component
export default function BlogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(1);

  const ref = useRef(null);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setActiveCategory(newValue);
    setPage(1);
  };

  const handleBookmark = (postId: number) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter((id) => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Filter posts based on search and category
  const filteredPosts = React.useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === "all" ||
        post.category.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchTerm, activeCategory]);

  return (
    <AppTheme>
      <CssBaseline />

      
      {/* Grid pattern */}
      {/* <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -11,
          opacity: theme.palette.mode === 'dark' ? 0.4 : 0.25,
          backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.3)} 1px, transparent 1px), 
                           linear-gradient(90deg, ${alpha(theme.palette.divider, 0.3)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '-1px -1px',
          mask: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
        }}
      />
       */}
      <AppAppBar />
      {/* Main Content */}
      <Box
        ref={ref}
        sx={{
          pb: { xs: 10, md: 15 },
          position: "relative",
        }}
      ></Box>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          sx={{ textAlign: "center", mb: 8, position: "relative", zIndex: 1, mt: isMobile ? 8 : 10 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              component="span"
              variant="overline"
              color="primary"
              fontWeight="bold"
              sx={{ mb: 1, display: "block" }}
            >
              BLOG & INSIGHTS
            </Typography>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Latest from Our Blog
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: "auto",
                mb: 4,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              Stay updated with the latest insights, tutorials, and news about
              AI email management, automation, and productivity techniques.
            </Typography>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Box sx={{ maxWidth: 600, mx: "auto", mb: { xs: 4, md: 6 } }}>
              <SearchField
                fullWidth
                placeholder="Search articles..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { py: 1.5, px: 2 },
                }}
              />
            </Box>
          </motion.div>
        </Box>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Box sx={{ mb: { xs: 6, md: 10 }, position: "relative" }}>
            <FeaturedPostCard>
              <CardMedia
                component="img"
                image={featuredPost.imageUrl}
                alt={featuredPost.title}
                sx={{
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <CardOverlay>
                <Box sx={{ maxWidth: 600, color: "white" }}>
                  <CategoryChip
                    label={featuredPost.category}
                    size="small"
                    variant="filled"
                    sx={{
                      mb: 2,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.25)",
                      },
                    }}
                  />
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component="h2"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {featuredPost.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    {featuredPost.excerpt}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {featuredPost.author.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {featuredPost.date}
                        </Typography>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            bgcolor: "white",
                            opacity: 0.8,
                          }}
                        />
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {featuredPost.readTime}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      sx={{
                        color: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                      }}
                      onClick={() => handleBookmark(featuredPost.id)}
                    >
                      {bookmarkedPosts.includes(featuredPost.id) ? (
                        <BookmarkIcon />
                      ) : (
                        <BookmarkBorderIcon />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </CardOverlay>
            </FeaturedPostCard>
          </Box>
        </motion.div>

        {/* Category Tabs */}
        <Box sx={{ mb: 6 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            allowScrollButtonsMobile
            centered={!isMobile}
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 3,
              },
            }}
          >
            {blogCategories.map((category) => (
              <StyledTab
                key={category.id}
                value={category.id}
                label={category.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Blog Posts Grid */}
        <AnimatePresence mode="wait">
          <Grid container spacing={4}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <StyledCard>
                      <CardActionArea
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          height: "100%",
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={post.imageUrl}
                          alt={post.title}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            sx={{
                              mb: 1.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <CategoryChip
                              label={post.category}
                              size="small"
                              icon={post.icon}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon fontSize="inherit" />
                              {post.readTime}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {post.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, flexGrow: 1 }}
                          >
                            {post.excerpt}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Avatar
                                src={post.author.avatar}
                                alt={post.author.name}
                                sx={{ width: 32, height: 32 }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                >
                                  {post.author.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  {post.date}
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton
                              size="small"
                              color={
                                bookmarkedPosts.includes(post.id)
                                  ? "primary"
                                  : "default"
                              }
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBookmark(post.id);
                              }}
                            >
                              {bookmarkedPosts.includes(post.id) ? (
                                <BookmarkIcon />
                              ) : (
                                <BookmarkBorderIcon />
                              )}
                            </IconButton>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box
                  sx={{
                    py: 10,
                    textAlign: "center",
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No posts found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try changing your search or filter settings
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </AnimatePresence>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={Math.ceil(filteredPosts.length / 6)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
      <Footer />
    </AppTheme>
  );
}
