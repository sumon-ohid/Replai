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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LanguageIcon from "@mui/icons-material/Language";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppTheme from "../shared-theme/AppTheme";
import Footer from "./components/Footer";
import AppAppBar from "./components/AppAppBar";
import { useState, useRef, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
  },
}));

// Add this new component for the colored header section
const ColorBlock = styled(Box)<{ color?: string }>`
  height: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme, color }) =>
    color || theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};
  position: relative;
  overflow: hidden;
  border-radius: 6px;
`;

// Array of colors for the blog post backgrounds
const blockColors = [
  "#2196F3", // Bright Blue
];

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
  imageUrl:
    "https://img.freepik.com/free-photo/robot-handshake-human-background-futuristic-digital-age_53876-129770.jpg?t=st=1741419874~exp=1741423474~hmac=ea5e6223c557bb74d794481686125d19854f3fa50e014353d0eaf0d86b7d51cb&w=2000",
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
    imageUrl:
      "https://img.freepik.com/free-vector/robotic-artificial-intelligence-technology-smart-lerning-from-bigdata_1150-48136.jpg?t=st=1741419434~exp=1741423034~hmac=6fe412c0c6fe89d677058dc158a55f4eaa6a931c0fa21c9a5ecf2f3bca57ff25&w=1800",
    date: "February 28, 2025",
    content: `<p>In today's fast-paced business environment, the ability to train AI systems with custom data has become a crucial competitive advantage. This comprehensive guide will walk you through the process of optimizing Replai's performance using your organization's unique data.</p>

    <h3>Understanding the Importance of Custom Training</h3>
    <p>While Replai comes pre-trained with extensive knowledge of email communication best practices, customizing it with your company's specific data can significantly improve its effectiveness. This includes:</p>
    <ul>
      <li>Company-specific terminology and jargon</li>
      <li>Brand voice and communication style</li>
      <li>Industry-specific knowledge and regulations</li>
      <li>Common customer inquiries and preferred responses</li>
    </ul>

    <h3>Step-by-Step Training Process</h3>
    <p>Follow these steps to effectively train your AI assistant:</p>
    <ol>
      <li>Data Collection: Gather relevant email threads, documentation, and communication guidelines</li>
      <li>Data Preparation: Clean and format your training data</li>
      <li>Training Configuration: Set up your custom training parameters</li>
      <li>Validation: Test and refine the AI's responses</li>
      <li>Deployment: Implement the trained model in your workflow</li>
    </ol>

    <h3>Best Practices for Training</h3>
    <p>To achieve optimal results, consider these best practices:</p>
    <ul>
      <li>Regular updates with new data to keep the model current</li>
      <li>Balanced dataset representation across different types of communications</li>
      <li>Clear documentation of training procedures and outcomes</li>
      <li>Continuous monitoring and refinement of responses</li>
    </ul>`,
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
    imageUrl:
      "https://img.freepik.com/free-photo/ai-cloud-concept-with-robot-hand_23-2149739751.jpg?t=st=1741420331~exp=1741423931~hmac=01371157963ac1f4821bbed2f26102fc1ea3c821efc3c7d82fd7da6b9dd9a503&w=2000",
    date: "February 21, 2025",
    content: `<p>Calendar integration is one of Replai's most powerful features for boosting productivity. Learn how to leverage this integration to streamline your scheduling and maximize your workday efficiency.</p>

    <h3>Key Benefits of Calendar Integration</h3>
    <p>When you connect Replai with your Google Calendar, you unlock several powerful capabilities:</p>
    <ul>
      <li>Automated meeting scheduling based on email conversations</li>
      <li>Smart availability detection and suggestion</li>
      <li>Time zone aware scheduling assistance</li>
      <li>Meeting preparation reminders and briefings</li>
    </ul>

    <h3>Advanced Features</h3>
    <p>Discover these advanced calendar integration features:</p>
    <ul>
      <li>AI-powered meeting duration recommendations</li>
      <li>Automatic follow-up scheduling</li>
      <li>Meeting agenda generation</li>
      <li>Calendar analytics and optimization suggestions</li>
    </ul>

    <h3>Implementation Tips</h3>
    <p>Follow these tips to get the most out of your calendar integration:</p>
    <ol>
      <li>Keep your calendar up to date with accurate availability</li>
      <li>Set up preferred meeting times and buffer periods</li>
      <li>Configure custom meeting templates for different types of appointments</li>
      <li>Regularly review and adjust your scheduling preferences</li>
    </ol>`,
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
    imageUrl:
      "https://img.freepik.com/free-photo/glass-smartphone-high-tech-innovation-ai-technology_53876-129775.jpg?t=st=1741420448~exp=1741424048~hmac=5704a50e8196f82366cafa9df535ace1d4c340758b91c7071576423267fe0782&w=1480",
    date: "February 18, 2025",
    content: `<p>Web crawling capabilities empower Replai to gather contextual information from trusted sources, enabling more informed and accurate responses to emails. This article explores how to effectively utilize this feature.</p>

    <h3>Understanding Web Crawling in Replai</h3>
    <p>Replai's web crawling feature enables:</p>
    <ul>
      <li>Real-time information gathering from specified websites</li>
      <li>Automated fact-checking and verification</li>
      <li>Dynamic content generation with current information</li>
      <li>Contextual understanding of industry trends</li>
    </ul>

    <h3>Setting Up Web Crawling</h3>
    <p>Configure your web crawling preferences with these steps:</p>
    <ol>
      <li>Define trusted information sources</li>
      <li>Set up crawling parameters and frequency</li>
      <li>Configure data extraction rules</li>
      <li>Establish verification protocols</li>
    </ol>

    <h3>Best Practices</h3>
    <p>Maximize the effectiveness of web crawling with these practices:</p>
    <ul>
      <li>Regular updates of trusted source lists</li>
      <li>Balanced crawling frequency to maintain data freshness</li>
      <li>Clear documentation of information sources</li>
      <li>Regular auditing of gathered information</li>
    </ul>`,
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
    imageUrl:
      "https://img.freepik.com/free-photo/hands-multitasking-with-laptop-notebook_23-2149311907.jpg?t=st=1741420387~exp=1741423987~hmac=9c50987ee3412d681a59304e35efbc67c01a0fe914ff5cf40b9123531b3394ce&w=2000",
    date: "February 10, 2025",
    content: `<p>Looking to streamline your email workflow? Here are five proven automation techniques that can help you save valuable time and improve your email management efficiency.</p>

    <h3>1. Smart Email Classification</h3>
    <p>Let Replai automatically categorize your incoming emails:</p>
    <ul>
      <li>Priority-based sorting</li>
      <li>Custom folder organization</li>
      <li>Automated labeling system</li>
      <li>Context-aware filtering</li>
    </ul>

    <h3>2. Template Management</h3>
    <p>Leverage dynamic templates for common responses:</p>
    <ul>
      <li>AI-powered template suggestions</li>
      <li>Context-aware personalization</li>
      <li>Multi-language support</li>
      <li>Team-wide template sharing</li>
    </ul>

    <h3>3. Follow-up Automation</h3>
    <p>Never forget to follow up on important emails:</p>
    <ul>
      <li>Smart reminder scheduling</li>
      <li>Response tracking</li>
      <li>Priority-based follow-ups</li>
      <li>Custom follow-up sequences</li>
    </ul>

    <h3>4. Meeting Coordination</h3>
    <p>Streamline your meeting scheduling process:</p>
    <ul>
      <li>Automated availability checks</li>
      <li>Calendar integration</li>
      <li>Time zone management</li>
      <li>Meeting prep automation</li>
    </ul>

    <h3>5. Analytics and Reporting</h3>
    <p>Gain insights from your email patterns:</p>
    <ul>
      <li>Response time tracking</li>
      <li>Productivity analytics</li>
      <li>Communication patterns</li>
      <li>Team performance metrics</li>
    </ul>`,
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
    imageUrl:
      "https://img.freepik.com/free-photo/hands-holding-neon-sign_23-2151922470.jpg?t=st=1741420575~exp=1741424175~hmac=f0b2b7c7f5605096339465d6d410bff82c731b9d74bf30baade68bedd9e6e3c9&w=2000",
    date: "January 30, 2025",
    content: `<p>As we look ahead to 2026, the landscape of email communication continues to evolve rapidly. Our team of experts has analyzed current trends and emerging technologies to predict the future of AI-powered email management.</p>

    <h3>Key Trends for 2026</h3>
    <p>Here are the major developments we expect to see:</p>
    <ul>
      <li>Advanced natural language processing capabilities</li>
      <li>Predictive response generation</li>
      <li>Enhanced security and privacy features</li>
      <li>Deeper integration with workflow tools</li>
    </ul>

    <h3>Emerging Technologies</h3>
    <p>Watch for these technologies to make a significant impact:</p>
    <ul>
      <li>Quantum computing applications in email security</li>
      <li>Advanced sentiment analysis</li>
      <li>Multimodal AI understanding</li>
      <li>Blockchain-based email verification</li>
    </ul>

    <h3>Future of Email Communication</h3>
    <p>Expected changes in how we handle emails:</p>
    <ol>
      <li>More intelligent automation and filtering</li>
      <li>Enhanced privacy controls and encryption</li>
      <li>Seamless cross-platform integration</li>
      <li>Context-aware response suggestions</li>
    </ol>

    <h3>Preparing for the Future</h3>
    <p>Steps organizations should take to stay ahead:</p>
    <ul>
      <li>Invest in AI-powered email solutions</li>
      <li>Train staff on new technologies</li>
      <li>Update security protocols</li>
      <li>Implement data governance policies</li>
    </ul>`,
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
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentPost, setCurrentPost] = React.useState<any>(null);
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

  const handleOpenDialog = (post: any) => {
    setCurrentPost(post);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPost(null);
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
      {/* Main background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -4,
          backgroundImage:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(0, 0, 0, 0) 25%)"
              : "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.05) 0%, rgba(255, 255, 255, 0) 25%)",
        }}
      />

      {/* Background radial gradient */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -3,
          backgroundImage:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.15) 0%, rgba(0, 0, 0, 0) 50%)"
              : "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 50%)",
        }}
      />

      {/* Animated gradient circles */}
      <Box
        component={motion.div}
        style={{ y: 0, opacity: 1 }}
        sx={{
          position: "fixed",
          top: "5%",
          right: "10%",
          width: { xs: 200, md: 400, lg: 600 },
          height: { xs: 200, md: 400, lg: 600 },
          borderRadius: "50%",
          zIndex: -3,
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(circle, ${alpha(
                  theme.palette.primary.dark,
                  0.25
                )} 0%, transparent 70%)`
              : `radial-gradient(circle, ${alpha(
                  theme.palette.primary.light,
                  0.18
                )} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      <Box
        component={motion.div}
        style={{ y: 0 }}
        sx={{
          position: "fixed",
          bottom: "10%",
          left: "5%",
          width: { xs: 150, md: 300, lg: 500 },
          height: { xs: 150, md: 300, lg: 500 },
          borderRadius: "50%",
          zIndex: -3,
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(circle, ${alpha(
                  theme.palette.secondary.dark,
                  0.25
                )} 0%, transparent 70%)`
              : `radial-gradient(circle, ${alpha(
                  theme.palette.secondary.light,
                  0.15
                )} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -12,
          opacity: theme.palette.mode === "dark" ? 0.07 : 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

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
          sx={{
            textAlign: "center",
            mb: 8,
            position: "relative",
            zIndex: 1,
            mt: isMobile ? 8 : 10,
          }}
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

        {/* Category Tabs */}
        <Box sx={{ mb: 6, mt: 2 }}>
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
                border: 1,
                borderColor: "divider",
                backgroundColor: theme.palette.primary.main,
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
        {/* Blog Posts Grid */}
        <AnimatePresence mode="wait">
          <Grid container spacing={4}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                // Get a color from the array based on the post ID
                const bgColor = blockColors[post.id % blockColors.length];

                return (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <StyledCard>
                        <CardActionArea
                          onClick={() => handleOpenDialog(post)}
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            height: "100%",
                          }}
                        >
                          {/* Colored block with centered headline */}
                          <ColorBlock color={bgColor}>
                            {/* Pattern overlay for visual interest */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.1,
                                // backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            />
                            <Box sx={{ zIndex: 1, textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                component="h3"
                                fontWeight="bold"
                                sx={{
                                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  wordBreak: "break-word",
                                }}
                              >
                                {post.title}
                              </Typography>
                            </Box>

                            {/* Icon in corner */}
                            {/* <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: "50%",
                                p: 1,
                                display: "flex",
                              }}
                            >
                              {post.icon}
                            </Box> */}
                          </ColorBlock>

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
                                sx={{ mt: 0.5 }}
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
                                {/* {post.readTime} */}
                              </Typography>
                            </Box>
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
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </StyledCard>
                    </motion.div>
                  </Grid>
                );
              })
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
      {/* Blog Post Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
            maxHeight: "90vh",
          },
        }}
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexGrow: 1, ml: 1 }}
          >
            {currentPost?.category}
          </Typography>

          <IconButton
            onClick={handleCloseDialog}
            color="inherit"
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon />
          </IconButton>
          
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
          {currentPost && (
            <Box>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {currentPost.title}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4, alignItems: "center" }}>
                <Grid item>
                  <Avatar
                    src={currentPost.author.avatar}
                    alt={currentPost.author.name}
                    sx={{ width: 48, height: 48 }}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="body1" fontWeight={600}>
                    {currentPost.author.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        "& svg": {
                          fontSize: "0.9rem",
                          mr: 0.5,
                        },
                      }}
                    >
                      <CalendarTodayIcon /> {currentPost.date}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        "& svg": {
                          fontSize: "0.9rem",
                          mr: 0.5,
                        },
                      }}
                    >
                      <AccessTimeIcon />
                      {/* {currentPost.readTime} */}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mb: 4,
                  width: "100%",
                  height: { xs: 200, sm: 300, md: 400 },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: theme.shadows[4],
                }}
              >
                <img
                  src={currentPost.imageUrl}
                  alt={currentPost.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Box
                sx={{
                  "& p": {
                    mb: 2,
                    lineHeight: 1.7,
                  },
                  "& h3": {
                    mt: 4,
                    mb: 2,
                    fontWeight: 700,
                  },
                  "& ul, & ol": {
                    pl: 2,
                    mb: 3,
                  },
                  "& li": {
                    mb: 1,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </AppTheme>
  );
}
