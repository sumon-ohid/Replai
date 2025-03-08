import * as React from "react";
import { alpha, useTheme, darken, lighten, styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppTheme from "../shared-theme/AppTheme";
import {
  Typography,
  Card,
  Grid,
  Container,
  Paper,
  useMediaQuery,
  Chip,
  Link,
  TextField,
  Button,
  InputAdornment,
  Divider,
  MenuItem,
  FormControl,
  Select,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  Breadcrumbs,
} from "@mui/material";
import Footer from "./components/Footer";
import { motion } from "framer-motion";

// Icons
import EmailIcon from "@mui/icons-material/Email";
import BoltIcon from "@mui/icons-material/Bolt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CodeIcon from "@mui/icons-material/Code";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SendIcon from "@mui/icons-material/Send";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import emailpic from "../../assets/Contact-us.svg";
import AppAppBar from "./components/AppAppBar";
import FAQ from "./components/FAQ";

// Define animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// Styled components
const ContactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.palette.mode === "dark" ? "0 16px 32px rgba(0, 77, 210, 0.31)" : "0 16px 32px rgba(0, 0, 0, 0.42)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
  transition: "all 0.3s ease",
}));

const ContactMethod = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  padding: theme.spacing(1.5, 3),
  minWidth: 120,
  [theme.breakpoints.down("sm")]: {
    minWidth: "auto",
    fontSize: "0.875rem",
    padding: theme.spacing(1, 1.5),
  },
}));

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
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContactUsPage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [tabValue, setTabValue] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    department: "general",
  });
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Generate theme-specific colors
  const primaryColor = theme.palette.primary.main;
  const primaryLight = alpha(theme.palette.primary.main, 0.2);
  const primaryGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${
    theme.palette.mode === "dark"
      ? darken(primaryColor, 0.2)
      : lighten(primaryColor, 0.2)
  } 100%)`;

  const cardBackground =
    theme.palette.mode === "dark"
      ? `linear-gradient(to bottom, ${alpha(
          theme.palette.background.default,
          0
        )} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
      : `linear-gradient(to bottom, ${alpha(
          theme.palette.background.default,
          0
        )} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`;

  const highlightColor =
    theme.palette.mode === "dark"
      ? lighten(theme.palette.primary.main, 0.3)
      : theme.palette.primary.main;

  // Handle tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle department change
  const handleDepartmentChange = (e: any) => {
    setFormData((prev) => ({ ...prev, department: e.target.value }));
  };

  const isDarkMode = theme.palette.mode === "dark";

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSnackbarOpen(true);
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      department: "general",
    });
  };

  // Contact information for different departments
  const contactDepartments = [
    {
      id: "support",
      name: "Customer Support",
      description:
        "Get help with your account, subscription, or general product questions.",
      icon: <SupportAgentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      email: "support@replai.tech",
      responseTime: "2 hours",
      lightColor: alpha(theme.palette.primary.main, 0.15),
    },
    {
      id: "technical",
      name: "Technical Support",
      description: "Technical issues, bug reports, or help with integrations.",
      icon: <CodeIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
      email: "tech@replai.tech",
      responseTime: "3 hours",
      lightColor: alpha(theme.palette.secondary.main, 0.15),
    },
    {
      id: "general",
      name: "General Inquiries",
      description:
        "Partnership opportunities, press inquiries, or general questions.",
      icon: <InfoOutlinedIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
      email: "hello@replai.tech",
      responseTime: "12 hours",
      lightColor: alpha(theme.palette.info.main, 0.15),
    },
    {
      id: "billing",
      name: "Billing & Payments",
      description:
        "Questions about billing, invoices, payments, or subscription changes.",
      icon: <PaymentsOutlinedIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      email: "billing@replai.tech",
      responseTime: "24-48 hours",
      lightColor: alpha(theme.palette.success.main, 0.15),
    },
  ];

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      {/* Main background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
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

      <AppAppBar />
      <Box sx={{ display: "flex" }}>
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            overflow: "auto",
            minHeight: "100vh",
          })}
        >
          
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              mt: { xs: 8, md: 0 },
            }}
          ></Stack>

          {/* Main content area */}
          <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            mt={isMobile ? 5 : 12}
          >
            
            {/* Hero Section */}
              <Container maxWidth="lg">         
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
    
                    <Box
                      component={motion.div}
                      variants={itemVariants}
                      sx={{ position: "relative", mt: 3, ml: { xs: 0, md: 3 } }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          color: highlightColor,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontSize: "0.9rem",
                          mb: 2,
                          display: "block",
                        }}
                      >
                        We're here to help
                      </Typography>

                      <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          background: primaryGradient,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: { xs: "2.5rem", md: "3.5rem" },
                        }}
                      >
                        Get in Touch <br /> With Our Team
                      </Typography>

                      <Typography
                        variant="h6"
                        component="p"
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          maxWidth: 600,
                          lineHeight: 1.6,
                          opacity: 0.9,
                        }}
                      >
                        Have questions about Replai or need help with your
                        account? Our support team is ready to assist you with
                        any inquiries you may have.
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mt: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1.2,
                            fontSize: "1rem",
                          }}
                          endIcon={<SendIcon />}
                          onClick={() => {
                            const contactFormElement =
                              document.getElementById("contact-form");
                            contactFormElement?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }}
                        >
                          Contact Us
                        </Button>

                        <Button
                          variant="outlined"
                          size="large"
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1.2,
                            fontSize: "1rem",
                          }}
                          endIcon={<QuestionAnswerIcon />}
                          href="#faq"
                        >
                          View FAQs
                        </Button>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Box
                      component={motion.div}
                      variants={itemVariants}
                      sx={{
                        display: { xs: "none", md: "block" },
                        position: "relative",
                        ml: { xs: 0, md: 6 },
                        mt: { xs: 3, md: 10 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 300,
                          height: 400,
                          borderRadius: 4,
                          backgroundImage: `url(${emailpic})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: { xs: "none", md: "block" },
                          transform: "perspective(1000px) rotateY(-5deg)",
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Container>

            {/* Contact Departments Section */}
            <Container maxWidth="lg">
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{ mb: 8, mt: 10 }}
              >
                <Box sx={{ textAlign: "center", mb: 5 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: highlightColor,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    Our Departments
                  </Typography>

                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    How Can We Help You?
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 700,
                      mx: "auto",
                      mb: 3,
                      fontSize: "1.1rem",
                    }}
                  >
                    Choose the right department to get the fastest response to
                    your inquiries
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {contactDepartments.map((department) => (
                    <Grid item xs={12} sm={6} md={3} key={department.id}>
                      <ContactCard>
                        <Box sx={{ p: 3 }}>
                          <IconWrapper
                            sx={{
                              bgcolor: department.lightColor,
                              color: department.color,
                            }}
                          >
                            {department.icon}
                          </IconWrapper>

                          <Typography
                            variant="h6"
                            component="h3"
                            gutterBottom
                            sx={{ fontWeight: 700 }}
                          >
                            {department.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, minHeight: 60 }}
                          >
                            {department.description}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <ContactMethod>
                            <EmailIcon
                              sx={{ color: department.color, mr: 1.5 }}
                              fontSize="small"
                            />
                            <Typography variant="body2" fontWeight={500}>
                              <Link
                                href={`mailto:${department.email}`}
                                underline="hover"
                                sx={{ color: "inherit" }}
                              >
                                {department.email}
                              </Link>
                            </Typography>
                          </ContactMethod>
                          <ContactMethod>
                            <AccessTimeIcon
                              sx={{ color: department.color, mr: 1.5 }}
                              fontSize="small"
                            />
                            <Typography variant="body2" fontWeight={500}>
                              Response time: {department.responseTime}
                            </Typography>
                          </ContactMethod>
                        </Box>
                      </ContactCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Contact Form Section */}
              <Box
                component={motion.div}
                variants={itemVariants}
                sx={{
                  mb: 10,
                  backgroundColor:
                     `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
                  borderRadius: 4,
                  border: 1,
                  borderColor: "divider",
                  p: 3,
                }}
                id="contact-form"
              >
                <Box sx={{ textAlign: "center", mb: 5 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: highlightColor,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    Send us a message
                  </Typography>

                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    Contact Form
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 700,
                      mx: "auto",
                      mb: 5,
                      fontSize: "1.1rem",
                    }}
                  >
                    Fill out the form below and we'll get back to you as soon as
                    possible
                  </Typography>
                </Box>

                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            placeholder="Your Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            variant="outlined"
                            fullWidth
                            required
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            placeholder="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            variant="outlined"
                            fullWidth
                            required
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            placeholder="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            variant="outlined"
                            fullWidth
                            required
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <textarea
                            placeholder="Your Message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={4}
                            required
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 5,
                              border: ".5px solid rgba(142, 142, 142, 0.48)",
                              resize: "none",
                              fontSize: "1rem",
                              backgroundColor: "transparent",
                            }}
                          >
                            {formData.message}
                          </textarea>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl variant="outlined" fullWidth>
                            <Select
                              label="Department"
                              name="department"
                              value={formData.department}
                              onChange={handleDepartmentChange}
                              fullWidth
                            >
                              {contactDepartments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            sx={{
                              borderRadius: 2,
                              px: 3,
                              py: 1.2,
                              fontSize: "1rem",
                            }}
                            endIcon={<ArrowForwardIcon />}
                          >
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Box>
                </Grid>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
      <FAQ />
      <Footer />

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Your message has been sent successfully!
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}
