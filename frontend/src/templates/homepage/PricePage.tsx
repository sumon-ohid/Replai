import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import useMediaQuery from "@mui/material/useMediaQuery";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import SwitchAccessShortcutIcon from "@mui/icons-material/SwitchAccessShortcut";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import WorkflowSection from "./components/WorkflowSection";

// Custom cursor effect component
const CustomCursor = () => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [hidden, setHidden] = React.useState(true);
  const [clicked, setClicked] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    interface MousePosition {
      x: number;
      y: number;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Don't show custom cursor on touch devices
  const isTouchDevice = useMediaQuery("(hover: none)");
  if (isTouchDevice) return null;

  return (
    <Box
      component={motion.div}
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: clicked ? 0.8 : 1,
        opacity: hidden ? 0 : 0.6,
      }}
      transition={{
        type: "spring",
        mass: 0.3,
        stiffness: 200,
        damping: 20,
      }}
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        border: `2px solid ${theme.palette.primary.main}`,
        mixBlendMode: "difference",
        display: { xs: "none", md: "block" },
      }}
    />
  );
};

const GlowingTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  position: "relative",
  display: "inline-block",
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
      : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "inherit",
    WebkitBackgroundClip: "text",
    filter: "blur(20px)",
    opacity: 0.3,
    zIndex: -1,
  },
}));

// Enhanced animated component with variants
type AnimationType =
  | "fadeInUp"
  | "fadeIn"
  | "scaleUp"
  | "slideInLeft"
  | "slideInRight";

interface AnimatedBoxProps {
  children: React.ReactNode;
  delay?: number;
  animation?: AnimationType;
  threshold?: number;
  [key: string]: any;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  children,
  delay = 0,
  animation = "fadeInUp" as AnimationType,
  threshold = 0.1,
  ...props
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold,
  });

  const variants = {
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 },
    },
  };
  const selectedVariant = variants[animation];

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={selectedVariant}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Styled components
const StyledPricingCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  transition: "all 0.3s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[10],
  },
}));

interface FeatureRowProps {
  feature: string;
  included: boolean;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ feature, included }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 1.5,
        opacity: included ? 1 : 0.7,
      }}
    >
      {included ? (
        <CheckIcon
          sx={{
            color: "success.main",
            mr: 1.5,
            fontSize: "1.2rem",
          }}
        />
      ) : (
        <CloseIcon
          sx={{
            color: "text.disabled",
            mr: 1.5,
            fontSize: "1.2rem",
          }}
        />
      )}
      <Typography
        variant="body2"
        color={included ? "text.primary" : "text.secondary"}
      >
        {feature}
      </Typography>
    </Box>
  );
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 30,
  "& .MuiToggleButtonGroup-grouped": {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: 24,
    padding: theme.spacing(1, 3),
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

// Section container with gradient background
const SectionWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(12, 0),
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
          theme.palette.primary.dark,
          0.15
        )} 50%, ${alpha("#000", 0)} 100%)`
      : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
          theme.palette.primary.light,
          0.12
        )} 50%, ${alpha("#fff", 0)} 100%)`,
  overflow: "hidden",
  color: theme.palette.common.white,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
            theme.palette.primary.dark,
            0.15
          )} 50%, ${alpha("#000", 0)} 100%)`
        : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
            theme.palette.primary.light,
            0.12
          )} 50%, ${alpha("#fff", 0)} 100%)`,
  },
}));

// Main component
export default function PricePage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [billingCycle, setBillingCycle] = React.useState("monthly");

  type BillingCycle = "monthly" | "annually";

  const handleBillingChange = (
    event: React.MouseEvent<HTMLElement>,
    newBillingCycle: BillingCycle | null
  ): void => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  // Pricing plans data with annual discount
  const plans = [
    {
      title: "Free",
      price: { monthly: 0, annually: 0 },
      description: "Perfect for exploring Replai",
      features: [
        { text: "50 AI-generated emails per month", included: true },
        { text: "Connect 1 email account", included: true },
        { text: "Basic email analytics", included: true },
        { text: "Standard response time", included: true },
        { text: "Community support", included: true },
        { text: "Priority support", included: false },
        { text: "Custom AI training", included: false },
        { text: "Team collaboration", included: false },
      ],
      highlight: false,
      buttonText: "Get Started",
      buttonVariant: "outlined" as "text" | "outlined" | "contained",
    },
    {
      title: "Pro",
      price: { monthly: 15, annually: 144 }, // 20% discount for annual
      description: "Enhanced features for individuals",
      features: [
        { text: "500 AI-generated emails per month", included: true },
        { text: "Connect up to 3 email accounts", included: true },
        { text: "Advanced email analytics", included: true },
        { text: "Faster response time", included: true },
        { text: "Priority support", included: true },
        { text: "Custom AI training", included: true },
        { text: "Team collaboration", included: false },
        { text: "API access", included: false },
      ],
      highlight: true,
      buttonText: "Subscribe Now",
      buttonVariant: "contained" as "text" | "outlined" | "contained",
      badge: "Popular",
    },
    {
      title: "Business",
      price: { monthly: 39, annually: 388 }, // 20% discount and rounded
      description: "Powerful tools for growing businesses",
      features: [
        { text: "Unlimited AI-generated emails", included: true },
        { text: "Connect unlimited email accounts", included: true },
        { text: "Advanced analytics & reporting", included: true },
        { text: "Fastest response time", included: true },
        { text: "Dedicated support", included: true },
        { text: "Custom AI training", included: true },
        { text: "Team collaboration", included: true },
        { text: "API access", included: true },
      ],
      highlight: false,
      buttonText: "Contact Sales",
      buttonVariant: "contained",
    },
  ];

  // Calculate the savings when paying annually
  interface PlanPrice {
    monthly: number;
    annually: number;
  }

  interface Plan {
    price: PlanPrice;
  }

  interface Savings {
    amount: number;
    percentage: number;
  }

  const calculateSavings = (plan: Plan): Savings | null => {
    if (plan.price.annually === 0) return null;

    const monthlyCost = plan.price.monthly * 12;
    const annualCost = plan.price.annually;
    const savings = monthlyCost - annualCost;
    const savingsPercentage = Math.round((savings / monthlyCost) * 100);

    return { amount: savings, percentage: savingsPercentage };
  };

  return (
    <AppTheme>
      <CssBaseline />
      <CustomCursor />
      <AppAppBar />

      {/* Hero Section for Pricing */}
      <Box
        sx={{
          position: "relative",
          padding: theme.spacing(12, 0),
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.15
                )} 50%, ${alpha("#000", 0)} 100%)`
              : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                  theme.palette.primary.light,
                  0.12
                )} 50%, ${alpha("#fff", 0)} 100%)`,
          overflow: "hidden",
          color: theme.palette.common.white,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                    theme.palette.primary.dark,
                    0.15
                  )} 50%, ${alpha("#000", 0)} 100%)`
                : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                    theme.palette.primary.light,
                    0.12
                  )} 50%, ${alpha("#fff", 0)} 100%)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <AnimatedBox animation="fadeInUp" delay={0.1}>
            <GlowingTitle
              variant={isMobile ? "h3" : "h1"}
              sx={{
                mt: { xs: 5, sm: 2 },
                mb: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              Simple, Transparent Pricing
            </GlowingTitle>
          </AnimatedBox>

          <AnimatedBox animation="fadeInUp" delay={0.2}>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              sx={{
                maxWidth: 700,
                mx: "auto",
                mb: 4,
                px: 2,
                fontWeight: 400,
              }}
            >
              Choose the perfect plan to power your email productivity with
              Replai's AI assistant
            </Typography>
          </AnimatedBox>

          {/* Billing Toggle */}
          <AnimatedBox
            animation="fadeInUp"
            delay={0.3}
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 6,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
            }}
          >
            <StyledToggleButtonGroup
              value={billingCycle}
              exclusive
              onChange={handleBillingChange}
              aria-label="billing cycle"
              size={isMobile ? "small" : "medium"}
              sx={{
                mb: { xs: 2, sm: 0 },
                boxShadow: theme.shadows[3],
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <ToggleButton value="monthly">Monthly Billing</ToggleButton>
              <ToggleButton value="annually">Annual Billing</ToggleButton>
            </StyledToggleButtonGroup>

            {billingCycle === "annually" && (
              <Chip
                icon={<LocalOfferIcon />}
                label="Save up to 20%"
                color="success"
                variant="filled"
                size="small"
                sx={{
                  ml: { sm: 2 },
                  fontWeight: 500,
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.4)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(76, 175, 80, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)" },
                  },
                }}
              />
            )}
          </AnimatedBox>
        </Container>
      </Box>

      {/* Pricing Cards Section */}
      <Box
        sx={{
          position: "relative",
          padding: theme.spacing(12, 0),
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.15
                )} 50%, ${alpha("#000", 0)} 100%)`
              : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                  theme.palette.primary.light,
                  0.12
                )} 50%, ${alpha("#fff", 0)} 100%)`,
          overflow: "hidden",
          color: theme.palette.common.white,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                    theme.palette.primary.dark,
                    0.15
                  )} 50%, ${alpha("#000", 0)} 100%)`
                : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                    theme.palette.primary.light,
                    0.12
                  )} 50%, ${alpha("#fff", 0)} 100%)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => {
              const savings = calculateSavings(plan);
              const isPopular = plan.highlight;

              return (
                <Grid item xs={12} md={4} key={plan.title}>
                  <AnimatedBox
                    animation="scaleUp"
                    delay={0.1 + index * 0.1}
                    sx={{ height: "100%" }}
                  >
                    <StyledPricingCard
                      elevation={isPopular ? 6 : 3}
                      sx={{
                        border: isPopular
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {isPopular && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            zIndex: 2,
                          }}
                        >
                          <Chip
                            icon={<StarIcon />}
                            label={plan.badge}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      )}

                      <Box
                        sx={{
                          bgcolor: isPopular
                            ? "rgba(25, 118, 210, 0.05)"
                            : "background.paper",
                          p: { xs: 3, md: 4 },
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="h2"
                          gutterBottom
                          sx={{
                            fontWeight: 700,
                            color: isPopular ? "primary.main" : "inherit",
                          }}
                        >
                          {plan.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 3 }}
                        >
                          {plan.description}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h3"
                            component="span"
                            sx={{
                              fontWeight: 700,
                              color: isPopular
                                ? "primary.main"
                                : "text.primary",
                            }}
                          >
                            $
                            {billingCycle === "monthly"
                              ? plan.price.monthly
                              : Math.round(plan.price.annually / 12)}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            component="span"
                            sx={{ ml: 1 }}
                          >
                            /month
                          </Typography>
                        </Box>

                        {billingCycle === "annually" &&
                          plan.price.annually > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: "success.main",
                                  fontWeight: 500,
                                }}
                              >
                                <LocalOfferIcon
                                  sx={{ fontSize: "1rem", mr: 0.5 }}
                                />
                                ${plan.price.monthly * 12 - plan.price.annually}{" "}
                                annual savings
                              </Typography>

                              <Typography
                                variant="caption"
                                color="textSecondary"
                                display="block"
                              >
                                Billed as ${plan.price.annually}/year
                              </Typography>
                            </Box>
                          )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ flex: 1 }}>
                          {plan.features.map((feature, i) => (
                            <FeatureRow
                              key={i}
                              feature={feature.text}
                              included={feature.included}
                            />
                          ))}
                        </Box>

                        <Box sx={{ mt: 4 }}>
                          <Button
                            fullWidth
                            variant={plan.buttonVariant}
                            color={isPopular ? "primary" : "primary"}
                            size="large"
                            sx={{
                              py: 1.5,
                              fontWeight: 600,
                              borderRadius: 2,
                              ...(isPopular && {
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              }),
                            }}
                          >
                            {plan.buttonText}
                          </Button>
                        </Box>
                      </Box>
                    </StyledPricingCard>
                  </AnimatedBox>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          position: "relative",
          padding: theme.spacing(12, 0),
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.15
                )} 50%, ${alpha("#000", 0)} 100%)`
              : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                  theme.palette.primary.light,
                  0.12
                )} 50%, ${alpha("#fff", 0)} 100%)`,
          overflow: "hidden",
          color: theme.palette.common.white,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
                    theme.palette.primary.dark,
                    0.15
                  )} 50%, ${alpha("#000", 0)} 100%)`
                : `linear-gradient(180deg, ${alpha("#fff", 0)} 0%, ${alpha(
                    theme.palette.primary.light,
                    0.12
                  )} 50%, ${alpha("#fff", 0)} 100%)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <AnimatedBox animation="fadeInUp">
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 6 }}
            >
              All Plans Include
            </Typography>
          </AnimatedBox>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: <SpeedIcon sx={{ fontSize: 40 }} />,
                title: "AI-Powered Email Responses",
                description:
                  "Smart email assistant that understands context and responds appropriately",
              },
              {
                icon: <AutoGraphIcon sx={{ fontSize: 40 }} />,
                title: "Email Analytics",
                description: "Track your email performance and response rates",
              },
              {
                icon: <SwitchAccessShortcutIcon sx={{ fontSize: 40 }} />,
                title: "Multiple Account Support",
                description:
                  "Connect and manage all your email accounts in one place",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  {feature.icon}
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* FAQ Section */}
      <FAQ />
      {/* Footer */}
      <Footer />
    </AppTheme>
  );
}
