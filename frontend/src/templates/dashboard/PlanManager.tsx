import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
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
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  Avatar,
  Badge,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useMediaQuery,
} from "@mui/material";
import Footer from "./components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useState } from "react";

// Icons
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import HistoryIcon from "@mui/icons-material/History";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import BallotIcon from '@mui/icons-material/Ballot';

import PaymentNotification from "./components/PaymentNotifications";

// payment data
import usePayments, {
  PaymentHistoryItem,
  SubscriptionDetails,
} from "./hooks/usePayments";
import useUsageStats from "./hooks/useUsageStats";
import Pricing from "./components/Pricing";
import { useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Price IDs from Stripe
const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: "price_1R7exXFQrwy1FRGCuHlPz15w",
  PRO_YEARLY: "price_1R8cAXFQrwy1FRGCZVC85y4P",
};

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// // Sample data for payment history
// const paymentHistory = [
//   { id: '923456', date: '2025-03-15', amount: '€19.99', status: 'Paid', method: 'Visa ****2345' },
//   { id: '856234', date: '2025-02-15', amount: '€19.99', status: 'Paid', method: 'Visa ****2345' },
//   { id: '723954', date: '2025-01-15', amount: '€19.99', status: 'Paid', method: 'Visa ****2345' },
//   { id: '612487', date: '2024-12-15', amount: '€19.99', status: 'Paid', method: 'Visa ****2345' },
// ];

// Pricing tiers
const tiers = [
  // {
  //   title: "Free",
  //   icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />,
  //   price: "0",
  //   priceDetails: {
  //     monthly: "0",
  //     yearly: "0",
  //   },
  //   buttonText: "Get Started",
  //   buttonVariant: "outlined",
  //   buttonColor: "primary",
  //   highlighted: false,
  //   features: [
  //     { title: "1 email account", included: true },
  //     { title: "10 emails per month", included: true },
  //     { title: "Basic AI responses", included: true },
  //     { title: "Help center access", included: true },
  //     { title: "Email support", included: true },
  //     { title: "Advanced analytics", included: false },
  //     { title: "Customizable templates", included: false },
  //     { title: "Priority support", included: false },
  //   ],
  // },
  {
    title: "Pro",
    icon: <DiamondOutlinedIcon sx={{ fontSize: 28 }} />,
    subheader: "Most Popular",
    price: "5",
    priceDetails: {
      monthly: "12",
      yearly: "100",
    },
    savings: "€20",
    buttonText: "Start Pro Plan",
    buttonVariant: "contained",
    buttonColor: "primary",
    highlighted: true,
    features: [
      { title: "2 email accounts", included: true },
      { title: "1000 AI email replies", included: true },
      { title: "Advanced AI responses", included: true },
      { title: "Custom email signatures", included: true },
      { title: "Priority email support", included: true },
      { title: "Advanced analytics", included: true },
    ],
  },
  {
    title: "Business",
    icon: <BusinessCenterOutlinedIcon sx={{ fontSize: 28 }} />,
    price: "Custom",
    priceDetails: {
      monthly: "Custom",
      yearly: "Custom",
    },
    buttonText: "Contact Sales",
    buttonVariant: "outlined",
    buttonColor: "primary",
    highlighted: false,
    features: [
      { title: "Unlimited email accounts", included: true },
      { title: "Unlimited emails", included: true },
      { title: "Enterprise AI responses", included: true },
      { title: "Custom integrations", included: true },
      { title: "Dedicated account manager", included: true },
      { title: "Advanced analytics & reporting", included: true },
      { title: "White-labeling options", included: true },
      { title: "Priority 24/7 support", included: true },
    ],
  },
];

export default function PlanBillingManagement(props: {
  disableCustomTheme?: boolean;
}) {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">(
    "monthly"
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { search } = window.location;
  const queryParams = new URLSearchParams(search);

  // States for subscription and payment data
  const [subscription, setSubscription] =
    React.useState<SubscriptionDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = React.useState<
    PaymentHistoryItem[]
  >([]);
  const [currentPlan, setCurrentPlan] = React.useState(tiers[0]); // Default to Free plan

  // Get the payment hooks
  const {
    loading,
    error,
    createCheckoutSession,
    getSubscription,
    cancelSubscription,
    updateSubscription,
    getPaymentHistory,
  } = usePayments();

  // Get usage statistics
  const {
    usageData,
    loading: usageLoading,
    error: usageError,
    fetchUsageStats,
  } = useUsageStats();

  // Show success/error messages from URL params
  React.useEffect(() => {
    const success = queryParams.get("success");
    const canceled = queryParams.get("canceled");

    if (success === "true") {
      // Show success message using your preferred notification system
      console.log("Payment successful!");
      // After successful payment, fetch the updated subscription
      fetchSubscriptionData();
    }

    if (canceled === "true") {
      // Show canceled message
      console.log("Payment was canceled.");
    }
  }, [queryParams]);

  // Function to fetch payment history
  const fetchPaymentHistory = async () => {
    const history = await getPaymentHistory();

    if (history.length > 0) {
      setPaymentHistory(history);
    }
  };

  interface UserData {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    connectedEmailsCount?: number;
    subscriptionPlan?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);

      const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('Fetching user data...');
        
        interface UserApiResponse {
          user: UserData;
        }

        const response = await axios.get<UserApiResponse>(`${apiBaseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        
        if (response.data) {
          setUserData(response.data as any);
        } else {
          console.error('Invalid user data format:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

  // Fetch subscription data  and usage stats on component mount
  React.useEffect(() => {
    fetchUserData();
    fetchSubscriptionData();
    fetchPaymentHistory();
    fetchUsageStats();
  }, []);

  // Additional effect to refresh usage stats when subscription changes
  React.useEffect(() => {
    if (subscription) {
      fetchUsageStats();
    }
  }, [subscription]);

  // Function to fetch subscription data
  const fetchSubscriptionData = async () => {
    const subscriptionData = await getSubscription();

    if (subscriptionData) {
      setSubscription(subscriptionData);

      // Add an additional check for plan property
      if (
        subscriptionData.plan &&
        (subscriptionData.plan.id === STRIPE_PRICE_IDS.PRO_MONTHLY ||
          subscriptionData.plan.id === STRIPE_PRICE_IDS.PRO_YEARLY)
      ) {
        setCurrentPlan(tiers[1]); // Pro plan

        // Set billing cycle based on subscription interval
        if (subscriptionData.plan.interval === "year") {
          setBillingCycle("yearly");
        } else {
          setBillingCycle("monthly");
        }
      } else {
        setCurrentPlan(tiers[0]); // Free plan
      }
    }
  };

  // Handle subscription purchase/update
  const handleSubscriptionPurchase = async () => {
    // Select price ID based on current billing cycle preference
    const priceId =
      billingCycle === "monthly"
        ? STRIPE_PRICE_IDS.PRO_MONTHLY
        : STRIPE_PRICE_IDS.PRO_YEARLY;

    await createCheckoutSession(priceId);
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      const success = await cancelSubscription();

      if (success) {
        // Show success message
        console.log("Subscription successfully canceled");
        // Refresh subscription data
        fetchSubscriptionData();
      }
    }
  };

  // Handle billing cycle change
  const handleBillingCycleChange = async (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle);

    // If user already has an active subscription, update it
    if (subscription && subscription.status === "active") {
      const newPriceId =
        cycle === "monthly"
          ? STRIPE_PRICE_IDS.PRO_MONTHLY
          : STRIPE_PRICE_IDS.PRO_YEARLY;

      const success = await updateSubscription(newPriceId);

      if (success) {
        // Show success message
        console.log("Subscription successfully updated");
        // Refresh subscription data
        fetchSubscriptionData();
      }
    }
  };

  // Calculate next billing date from subscription
    const getNextBillingDate = () => {
    
    // First check if we have a direct end date from the user model
    if (userData?.subscriptionEndDate) {
      try {
        return new Date(userData.subscriptionEndDate);
      } catch (e) {
        console.error("Failed to parse subscription end date:", e);
      }
    }
    
    // Fall back to Stripe data if available
    if (subscription && subscription.current_period_end) {
      try {
        return new Date(subscription.current_period_end * 1000);
      } catch (e) {
        console.error("Failed to parse Stripe period end:", e);
      }
    }
    
    // Default to current date if no subscription data found
    return new Date();
  };

  // Format date
  const formatDate = (dateString: string | number) => {
    const date =
      typeof dateString === "string"
        ? new Date(dateString)
        : new Date(dateString * 1000);

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Current subscription data (later, this would come from an API)
  // const usageData = {
  //   emails: {
  //     used: 746,
  //     total: 1000,
  //     percentage: 74.6
  //   },
  //   accounts: {
  //     used: 2,
  //     total: 2,
  //     percentage: 100
  //   }
  // };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
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
              pb: 3,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>

          <Box sx={{ mx: 3, mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Plan & Billing
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Manage your subscription and billing details
                </Typography>
              </Box>

              <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  sx={{ mr: 2 }}
                  onClick={() =>
                    window.open(subscription?.invoice_pdf, "_blank")
                  }
                  disabled={!subscription?.invoice_pdf}
                >
                  View Invoices
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  href="https://buy.stripe.com/5kA6qP9YoaN5g92aEE"
                  target="_blank"
                >
                  Update Payment
                </Button>
              </Box>
            </Box>

            {/* Tabs for different sections */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                mb: 4,
                "& .MuiTab-root": {
                  minHeight: "64px",
                  fontSize: "0.95rem",
                },
              }}
            >
              <Tab
                icon={<CreditScoreIcon />}
                iconPosition="start"
                label="Subscription"
              />
              <Tab
                icon={<HistoryIcon />}
                iconPosition="start"
                label="Payment History"
              />
              <Tab
                icon={<BallotIcon />}
                iconPosition="start"
                label="View All Plans"
              />
            </Tabs>

            <AnimatePresence mode="wait">
              {tabValue === 0 && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%" }}
                >
                  <Grid container spacing={4}>
                    {/* Current Plan Details */}
                    <Grid item xs={12} md={8}>
                      <Card
                        elevation={0}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          height: "100%",
                          position: "relative",
                          overflow: "visible",
                          bgColor: "background.default",
                        }}
                      >
                        {/* Plan Badge */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -16,
                            left: 24,
                            backgroundColor: "primary.main",
                            color: "common.white",
                            py: 0.75,
                            px: 3,
                            borderRadius: 1,
                            boxShadow: `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.4
                            )}`,
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            Available Plan
                          </Typography>
                        </Box>

                        <CardContent sx={{ pt: 4, pb: 3, px: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              mb: 2,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                  color: "primary.main",
                                  width: 56,
                                  height: 56,
                                  mr: 2,
                                }}
                              >
                                {currentPlan.icon}
                              </Avatar>
                              <Box>
                                <Typography variant="h5" fontWeight="bold">
                                  {currentPlan.title} Plan
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                >
                                  Billed{" "}
                                  {billingCycle === "monthly"
                                    ? "monthly"
                                    : "annually"}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                textAlign: { xs: "left", sm: "right" },
                                mt: { xs: 2, sm: 0 },
                                ml: { xs: 0, sm: 2 },
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "baseline" }}
                              >
                                <Typography
                                  variant="h4"
                                  component="span"
                                  fontWeight="bold"
                                  color="primary.main"
                                >
                                  €
                                  {billingCycle === "monthly"
                                    ? currentPlan.priceDetails.monthly
                                    : currentPlan.priceDetails.yearly}
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  component="span"
                                  color="text.secondary"
                                  ml={1}
                                >
                                  {billingCycle === "monthly"
                                    ? "/month"
                                    : "/year"}
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {userData?.subscriptionEndDate ? (
                                    <>Next billing: {getNextBillingDate().toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}</>
                                  ) : (
                                    <>No active subscription</>
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 3 }} />

                          {/* Usage Stats */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Usage Statistics
                          </Typography>

                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 3 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Email usage
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {usageData?.emails?.used || 0} /{" "}
                                    {usageData?.emails?.total || 0}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={usageData?.emails?.percentage || 0}
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.1
                                    ),
                                  }}
                                />
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Box sx={{ mb: 3 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Email accounts
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {usageData?.accounts?.used || 0} /{" "}
                                    {usageData?.accounts?.total || 0}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={usageData?.accounts?.percentage || 0}
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.1
                                    ),
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor:
                                        (usageData?.accounts?.percentage ||
                                          0) === 100
                                          ? "warning.main"
                                          : "primary.main",
                                    },
                                  }}
                                />
                                {(usageData?.accounts?.percentage || 0) ===
                                  100 && (
                                  <Typography
                                    variant="caption"
                                    color="warning.main"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <WarningIcon
                                      fontSize="small"
                                      sx={{ mr: 0.5 }}
                                    />
                                    You've reached your account limit
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>

                          {usageLoading && (
                              <Box sx={{ width: '100%', mt: 2 }}>
                                <LinearProgress />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                  Loading usage statistics...
                                </Typography>
                              </Box>
                            )}

                            {usageError && (
                              <Box sx={{ width: '100%', mt: 2 }}>
                                <Typography color="error" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <WarningIcon sx={{ mr: 1 }} />
                                  {usageError}
                                </Typography>
                              </Box>
                            )}

                          <Divider sx={{ my: 3 }} />

                          {/* Plan Features */}
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Plan Features
                          </Typography>

                          <Grid container spacing={2}>
                            {currentPlan.features.map((feature, index) => (
                              <Grid item xs={12} sm={6} key={index}>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <CheckCircleRoundedIcon
                                    sx={{
                                      color: "success.main",
                                      mr: 1.5,
                                      fontSize: 20,
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {feature.title}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>

                          <Box
                            sx={{
                              mt: 4,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            }}
                          >
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={handleSubscriptionPurchase}
                              disabled={loading}
                            >
                              {loading ? "Processing..." : "Change Plan"}
                            </Button>

                            <Button
                              variant="text"
                              color="error"
                              onClick={handleCancelSubscription}
                              disabled={
                                loading ||
                                !subscription ||
                                subscription.status !== "active"
                              }
                            >
                              {loading
                                ? "Processing..."
                                : "Cancel Subscription"}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Billing Cycle & Upcoming Events */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={3} sx={{ height: "100%" }}>
                        {/* Billing Cycle Card */}
                        <Card
                          elevation={0}
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Billing Cycle
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                              }}
                            >
                              <Button
                                variant={
                                  billingCycle === "monthly"
                                    ? "contained"
                                    : "outlined"
                                }
                                color="primary"
                                fullWidth
                                onClick={() =>
                                  handleBillingCycleChange("monthly")
                                }
                                sx={{ justifyContent: "space-between", px: 2 }}
                                disabled={loading}
                              >
                                Monthly
                                <Typography variant="body2" component="span">
                                  €{currentPlan.priceDetails.monthly}/mo
                                </Typography>
                              </Button>

                              <Button
                                variant={
                                  billingCycle === "yearly"
                                    ? "contained"
                                    : "outlined"
                                }
                                color="primary"
                                fullWidth
                                onClick={() =>
                                  handleBillingCycleChange("yearly")
                                }
                                sx={{
                                  justifyContent: "space-between",
                                  px: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  flexDirection: "row",
                                }}
                                disabled={loading}
                              >
                                Yearly
                                {currentPlan.savings && (
                                  <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{
                                      color: "success.main",
                                      bgcolor: alpha(
                                        theme.palette.success.main,
                                        0.1
                                      ),
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                    }}
                                  >
                                    Save {currentPlan.savings}
                                  </Typography>
                                )}
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography variant="body2" component="span">
                                    €{currentPlan.priceDetails.yearly}/yr
                                  </Typography>
                                </Box>
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>

                        {/* Upcoming Events */}
                        <Card
                          elevation={0}
                          variant="outlined"
                          sx={{ borderRadius: 2, flexGrow: 1 }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <EventIcon sx={{ mr: 1 }} />
                              Recent Events
                            </Typography>

                            <Stack spacing={2}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  backgroundColor: alpha(
                                    theme.palette.info.main,
                                    0.08
                                  ),
                                  border: `1px solid ${alpha(
                                    theme.palette.info.main,
                                    0.2
                                  )}`,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <NotificationsIcon color="info" />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    New feature release
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate("2025-03-01")}
                                  </Typography>
                                </Box>
                              </Paper>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  backgroundColor: alpha(
                                    theme.palette.warning.main,
                                    0.08
                                  ),
                                  border: `1px solid ${alpha(
                                    theme.palette.warning.main,
                                    0.2
                                  )}`,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <EventIcon color="warning" />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    Scheduled maintenance
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate("2025-03-10")}
                                  </Typography>
                                </Box>
                              </Paper>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  backgroundColor: alpha(
                                    theme.palette.success.main,
                                    0.08
                                  ),
                                  border: `1px solid ${alpha(
                                    theme.palette.success.main,
                                    0.2
                                  )}`,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CheckCircleRoundedIcon color="success" />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    New payment method added
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate("2025-02-15")}
                                  </Typography>
                                </Box>
                              </Paper>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Stack>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
              {tabValue === 1 && (
                <motion.div
                  key="payment-history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%" }}
                >
                  <Card
                    elevation={0}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <CardContent
                      sx={{
                        p: 2.5,
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Payment History
                      </Typography>
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{ borderRadius: 1, bgcolor: "background.default" }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Transaction ID</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Payment Method</TableCell>
                            </TableRow>
                          </TableHead>
                          {/* Use the fetched payment history data */}
                          <TableBody>
                            {Array.isArray(paymentHistory) &&
                              paymentHistory.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell>{row.id}</TableCell>
                                  <TableCell>{formatDate(row.date)}</TableCell>
                                  <TableCell>{row.amount}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={row.status}
                                      color={
                                        row.status === "Paid"
                                          ? "success"
                                          : "error"
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{row.method}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>

                          {/* Show loading or error states */}
                          {loading && <LinearProgress />}
                          {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                              {error}
                            </Typography>
                          )}
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {tabValue === 2 && (
                <motion.div
                  key="view-all-plans"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%" }}
                >
                  <Pricing/>
                </motion.div>
              )}

            </AnimatePresence>
          </Box>
          {/* Notifications for payment success, cancellation, or errors */}
          <PaymentNotification />
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
