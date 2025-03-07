import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CircleIcon from '@mui/icons-material/Circle';

const tiers = [
  {
    title: "Free",
    icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />,
    price: "0",
    priceDetails: {
      monthly: "0",
      yearly: "0",
    },
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    highlighted: false,
    features: [
      { title: "1 email account", included: true },
      { title: "10 emails per month", included: true },
      { title: "Basic AI responses", included: true },
      { title: "Help center access", included: true },
      { title: "Email support", included: true },
      { title: "Advanced analytics", included: false },
      { title: "Customizable templates", included: false },
      { title: "Priority support", included: false },
    ],
  },
  {
    title: "Pro",
    icon: <DiamondOutlinedIcon sx={{ fontSize: 28 }} />,
    subheader: "Most Popular",
    price: "5",
    priceDetails: {
      monthly: "15",
      yearly: "120",
    },
    savings: "€30",
    buttonText: "Start Pro Plan",
    buttonVariant: "contained",
    buttonColor: "primary",
    highlighted: true,
    features: [
      { title: "2 email accounts", included: true },
      { title: "Unlimited emails", included: true },
      { title: "Advanced AI responses", included: true },
      { title: "Custom email signatures", included: true },
      { title: "Priority email support", included: true },
      { title: "Advanced analytics", included: true },
      { title: "Customizable templates", included: true },
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

export default function Pricing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [activeIndex, setActiveIndex] = useState(1); // Start with Pro plan

  // Slide effect for mobile
  useEffect(() => {
    if (isMobile && containerRef.current) {
      controls.start({
        x: `-${activeIndex * 100}%`,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  }, [activeIndex, isMobile, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  function handleNext(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setActiveIndex((prevIndex) => (prevIndex + 1) % tiers.length);
  }

  function handlePrev(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setActiveIndex((prevIndex) => (prevIndex - 1 + tiers.length) % tiers.length);
  }
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100vw",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        overflow: "hidden",
      }}
    >
      {/* Full-width background with enhanced visuals */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha("#0a0a0a", 0)} 0%, ${alpha(
                  theme.palette.primary.dark,
                  0.07
                )} 50%, ${alpha("#0a0a0a", 0)} 100%)`
              : `linear-gradient(180deg, ${alpha("#fafafa", 0)} 0%, ${alpha(
                  theme.palette.primary.light,
                  0.06
                )} 50%, ${alpha("#fafafa", 0)} 100%)`,
          zIndex: -2,
        }}
      />

      {/* Enhanced background elements */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {/* Secondary gradient orb */}
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 10,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          sx={{
            position: "absolute",
            bottom: "5%",
            left: "-10%",
            width: { xs: "250px", md: "450px" },
            height: { xs: "250px", md: "450px" },
            backgroundImage:
              theme.palette.mode === "dark"
                ? "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.1) 0%, rgba(0, 0, 0, 0) 60%)"
                : "radial-gradient(circle at 20% 20%, rgba(41, 98, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
        {/* Accent gradient orb */}
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 12,
            delay: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          sx={{
            position: "absolute",
            top: "60%",
            right: "20%",
            width: { xs: "200px", md: "350px" },
            height: { xs: "200px", md: "350px" },
            background:
              theme.palette.mode === "dark"
                ? `radial-gradient(circle, ${alpha(
                    theme.palette.info.dark,
                    0.3
                  )} 0%, transparent 70%)`
                : `radial-gradient(circle, ${alpha(
                    theme.palette.info.light,
                    0.2
                  )} 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        {/* Light grid pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(${alpha(
              theme.palette.divider,
              0.1
            )} 1px, transparent 1px), 
                         linear-gradient(90deg, ${alpha(
                           theme.palette.divider,
                           0.1
                         )} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            opacity: theme.palette.mode === "dark" ? 0.1 : 0.07,
            zIndex: -1,
          }}
        />
      </Box>
      <Container
        id="pricing"
        sx={{
          pt: { xs: 8, sm: 12, md: 16 },
          pb: { xs: 8, sm: 12, md: 16 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "5%",
              right: "-10%",
              width: { xs: "250px", md: "400px" },
              height: { xs: "250px", md: "400px" },
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "10%",
              left: "-5%",
              width: { xs: "200px", md: "350px" },
              height: { xs: "200px", md: "350px" },
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
        </Box>

        {/* Header Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            mb: { xs: 6, md: 8 },
            maxWidth: "1800px",
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            component="span"
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              letterSpacing: 1.2,
              mb: 2,
              display: "block",
            }}
          >
            PRICING PLANS
          </Typography>

          <Typography
            component="h2"
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              fontWeight: 800,
              mb: 2,
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Simple, Transparent Pricing
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              fontWeight: 400,
              maxWidth: "650px",
              mx: "auto",
            }}
          >
            Choose the plan that works best for you. All plans include a 14-day
            free trial.
          </Typography>

          {/* Billing Toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: billingCycle === "monthly" ? 600 : 400,
                color:
                  billingCycle === "monthly"
                    ? "text.primary"
                    : "text.secondary",
              }}
            >
              Monthly
            </Typography>

            <Switch
              checked={billingCycle === "yearly"}
              onChange={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              color="primary"
              sx={{ mx: 1.5 }}
            />

            <Box sx={{ position: "relative" }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: billingCycle === "yearly" ? 600 : 400,
                  color:
                    billingCycle === "yearly"
                      ? "text.primary"
                      : "text.secondary",
                }}
              >
                Yearly
              </Typography>

              {/* Save label */}
              {billingCycle === "yearly" && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: -80,
                    background: theme.palette.success.main,
                    color: "#fff",
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  Save 20%
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Mobile Carousel View */}
        {isMobile && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              overflow: "visible",
              mb: 6,
            }}
          >
            <Box
              ref={containerRef}
              component={motion.div}
              animate={controls}
              sx={{
                display: "flex",
                width: "100%",
              }}
            >
              {tiers.map((tier, index) => (
                <Box
                  key={tier.title}
                  sx={{
                    minWidth: "100%",
                    px: 2,
                  }}
                >
                  <Card
                elevation={tier.highlighted ? 6 : 0}
                sx={[
                  {
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    transition: "all 0.3s ease-in-out",
                    border: "1px solid",
                    borderColor: "divider",
                    ...(tier.highlighted
                      ? {
                          transform: "scale(1.05)",
                          zIndex: 1,
                          mt: { xs: -1, md: -2 },
                          mb: { xs: 4, md: 2 },
                        }
                      : {}),
                  },
                  tier.highlighted && {
                    background:
                      theme.palette.mode === "dark"
                        ? `linear-gradient(145deg, ${alpha(
                            theme.palette.background.paper,
                            0.9
                          )}, ${alpha(theme.palette.primary.dark, 0.2)})`
                        : `linear-gradient(145deg, ${alpha(
                            theme.palette.background.paper,
                            0.9
                          )}, ${alpha(theme.palette.primary.light, 0.1)})`,
                    backdropFilter: "blur(10px)",
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2),
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? `0 12px 30px ${alpha(
                            theme.palette.common.black,
                            0.5
                          )}`
                        : `0 12px 24px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                  },
                ]}
                  >
                    {/* Ribbon for highlighted plan */}
                    {index === 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -12,
                          right: 24,
                          backgroundColor: "primary.main",
                          color: "common.white",
                          py: 0.5,
                          px: 2,
                          borderRadius: 1,
                          boxShadow: `0 2px 12px ${alpha(
                            theme.palette.primary.main,
                            0.4
                          )}`,
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold">
                          {tier.subheader}
                        </Typography>
                      </Box>
                    )}

                    {/* Card Content */}
                    <CardContent sx={{ p: 0, flexGrow: 1 }}>
                      {/* Same card content as desktop view */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            backgroundColor:
                              index === 1
                                ? alpha(
                                    theme.palette.primary.main,
                                    theme.palette.mode === "dark" ? 0.3 : 0.15
                                  )
                                : alpha(theme.palette.action.hover, 0.12),
                            color:
                              index === 1 ? "primary.main" : "text.secondary",
                          }}
                        >
                          {tier.icon}
                        </Box>

                        <Typography
                          variant="h5"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            color:
                              index === 1 ? "primary.main" : "text.primary",
                          }}
                        >
                          {tier.title}
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "baseline",
                          }}
                        >
                          {/* Show different styles based on whether it's a fixed or custom price */}
                          {tier.price === "Custom" ? (
                            <Typography
                              component="h3"
                              variant="h3"
                              sx={{
                                fontWeight: 700,
                                color:
                                  index === 1 ? "primary.main" : "text.primary",
                              }}
                            >
                              {tier.price}
                            </Typography>
                          ) : (
                            <>
                              <Typography
                                component="span"
                                variant="h6"
                                sx={{ fontWeight: 600, mr: 0.5 }}
                              >
                                €
                              </Typography>
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={billingCycle}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Typography
                                    component="h3"
                                    variant="h3"
                                    sx={{
                                      fontWeight: 700,
                                      color:
                                        index === 1
                                          ? "primary.main"
                                          : "text.primary",
                                    }}
                                  >
                                    {billingCycle === "monthly"
                                      ? tier.priceDetails.monthly
                                      : tier.priceDetails.yearly
                                          .toString()
                                          .split(".")[0]}
                                  </Typography>
                                </motion.div>
                              </AnimatePresence>
                            </>
                          )}

                          {tier.price !== "Custom" && (
                            <Typography
                              component="span"
                              variant="subtitle1"
                              sx={{ ml: 1 }}
                            >
                              per month
                            </Typography>
                          )}
                        </Box>

                        {/* Billing details */}
                        {tier.price !== "Custom" &&
                          billingCycle === "yearly" &&
                          tier.savings && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "success.main",
                                fontWeight: 500,
                                mt: 0.5,
                                display: "block",
                              }}
                            >
                              Save {tier.savings} a year
                            </Typography>
                          )}

                        {/* Description text */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, minHeight: 40 }}
                        >
                          {tier.title === "Free" &&
                            "Get started with the basics for personal use"}
                          {tier.title === "Pro" &&
                            "Everything you need for professional email automation"}
                          {tier.title === "Business" &&
                            "Enterprise-grade features with dedicated support"}
                        </Typography>
                      </Box>

                      {/* Feature list */}
                      <Divider sx={{ my: 3, opacity: 0.6 }} />
                      <Stack spacing={2}>
                        {tier.features.map((feature) => (
                          <Box
                            key={feature.title}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            {feature.included ? (
                              <CheckCircleRoundedIcon
                                sx={{
                                  width: 20,
                                  height: 20,
                                  color:
                                    index === 1
                                      ? "primary.main"
                                      : "success.main",
                                }}
                              />
                            ) : (
                              <RemoveCircleOutlineIcon
                                sx={{
                                  width: 20,
                                  height: 20,
                                  color: "text.disabled",
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: feature.included
                                  ? "text.primary"
                                  : "text.disabled",
                                fontWeight: feature.included ? 500 : 400,
                              }}
                            >
                              {feature.title}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>

                    {/* Button */}
                    <CardActions sx={{ p: 0, mt: 4 }}>
                      <Button
                        fullWidth
                        size="large"
                        variant={tier.buttonVariant as "outlined" | "contained"}
                        color={tier.buttonColor as "primary" | "secondary"}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "1rem",
                          boxShadow: index === 1 ? 4 : 0,
                          "&:hover": {
                            boxShadow: index === 1 ? 8 : 1,
                          },
                        }}
                      >
                        {tier.buttonText}
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Slider Navigation Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 4,
                gap: 2,
              }}
            >
              <IconButton
                onClick={handlePrev}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>

              <Box sx={{ display: "flex", gap: 1 }}>
                {tiers.map((_, idx) => (
                  <Box
                    key={idx}
                    component={motion.div}
                    initial={false}
                    animate={
                      activeIndex === idx ? { scale: 1.2 } : { scale: 1 }
                    }
                    onClick={() => setActiveIndex(idx)}
                    sx={{
                      width: activeIndex === idx ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor:
                        activeIndex === idx
                          ? "primary.main"
                          : alpha(theme.palette.text.disabled, 0.3),
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>

              <IconButton
                onClick={handleNext}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Desktop View */}

        {/* Pricing Cards */}
        {!isMobile && (
        <Grid
          container
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          spacing={3}
          sx={{
            alignItems: "stretch",
            justifyContent: "center",
            px: { xs: 0, md: 4 },
          }}
        >
          {tiers.map((tier, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={4}
              key={tier.title}
              component={motion.div}
              variants={cardVariants}
              custom={index}
              whileHover={tier.highlighted ? {} : "hover"}
            >
              <Card
                elevation={tier.highlighted ? 6 : 0}
                sx={[
                  {
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "visible",
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    transition: "all 0.3s ease-in-out",
                    border: "1px solid",
                    borderColor: "divider",
                    ...(tier.highlighted
                      ? {
                          transform: "scale(1.05)",
                          zIndex: 1,
                          mt: { xs: -1, md: -2 },
                          mb: { xs: 4, md: 2 },
                        }
                      : {}),
                  },
                  tier.highlighted && {
                    background:
                      theme.palette.mode === "dark"
                        ? `linear-gradient(145deg, ${alpha(
                            theme.palette.background.paper,
                            0.9
                          )}, ${alpha(theme.palette.primary.dark, 0.2)})`
                        : `linear-gradient(145deg, ${alpha(
                            theme.palette.background.paper,
                            0.9
                          )}, ${alpha(theme.palette.primary.light, 0.1)})`,
                    backdropFilter: "blur(10px)",
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2),
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? `0 12px 30px ${alpha(
                            theme.palette.common.black,
                            0.5
                          )}`
                        : `0 12px 24px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                  },
                ]}
              >
                {/* Ribbon for highlighted plan */}
                {tier.highlighted && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 24,
                      backgroundColor: "primary.main",
                      color: "common.white",
                      py: 0.5,
                      px: 2,
                      borderRadius: 1,
                      boxShadow: `0 2px 12px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {tier.subheader}
                    </Typography>
                  </Box>
                )}

                {/* Card Content */}
                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        backgroundColor: tier.highlighted
                          ? alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.3 : 0.15
                            )
                          : alpha(theme.palette.action.hover, 0.12),
                        color: tier.highlighted
                          ? "primary.main"
                          : "text.secondary",
                      }}
                    >
                      {tier.icon}
                    </Box>

                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: tier.highlighted
                          ? "primary.main"
                          : "text.primary",
                      }}
                    >
                      {tier.title}
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                      }}
                    >
                      {/* Show different styles based on whether it's a fixed or custom price */}
                      {tier.price === "Custom" ? (
                        <Typography
                          component="h3"
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            color: tier.highlighted
                              ? "primary.main"
                              : "text.primary",
                          }}
                        >
                          {tier.price}
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            component="span"
                            variant="h6"
                            sx={{ fontWeight: 600, mr: 0.5 }}
                          >
                            €
                          </Typography>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={billingCycle}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Typography
                                component="h3"
                                variant="h3"
                                sx={{
                                  fontWeight: 700,
                                  color: tier.highlighted
                                    ? "primary.main"
                                    : "text.primary",
                                }}
                              >
                                {billingCycle === "monthly"
                                  ? tier.priceDetails.monthly
                                  : tier.priceDetails.yearly
                                      .toString()
                                      .split(".")[0]}
                              </Typography>
                            </motion.div>
                          </AnimatePresence>
                        </>
                      )}

                      {tier.price !== "Custom" && (
                        <Typography
                          component="span"
                          variant="subtitle1"
                          sx={{ ml: 1 }}
                        >
                          {/* per month or per year */}
                          {billingCycle === "monthly"
                            ? "per month"
                            : "per year"}
                        </Typography>
                      )}
                    </Box>

                    {/* Billing details */}
                    {tier.price !== "Custom" &&
                      billingCycle === "yearly" &&
                      tier.savings && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "success.main",
                            fontWeight: 500,
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          Save {tier.savings} a year
                        </Typography>
                      )}

                    {/* Description text */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, minHeight: 40 }}
                    >
                      {tier.title === "Free" &&
                        "Get started with the basics for personal use"}
                      {tier.title === "Pro" &&
                        "Everything you need for professional email automation"}
                      {tier.title === "Business" &&
                        "Enterprise-grade features with dedicated support"}
                    </Typography>
                  </Box>

                  {/* Feature list */}
                  <Divider sx={{ my: 3, opacity: 0.6 }} />
                  <Stack spacing={2}>
                    {tier.features.map((feature) => (
                      <Box
                        key={feature.title}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        {feature.included ? (
                          <CheckCircleRoundedIcon
                            sx={{
                              width: 20,
                              height: 20,
                              color: tier.highlighted
                                ? "primary.main"
                                : "success.main",
                            }}
                          />
                        ) : (
                          <RemoveCircleOutlineIcon
                            sx={{
                              width: 20,
                              height: 20,
                              color: "text.disabled",
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: feature.included
                              ? "text.primary"
                              : "text.disabled",
                            fontWeight: feature.included ? 500 : 400,
                          }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>

                {/* Button */}
                <CardActions sx={{ p: 0, mt: 4 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant={tier.buttonVariant as "outlined" | "contained"}
                    color={tier.buttonColor as "primary" | "secondary"}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: tier.highlighted ? 4 : 0,
                      "&:hover": {
                        boxShadow: tier.highlighted ? 8 : 1,
                      },
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        )}

        {/* Additional information */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          sx={{
            mt: { xs: 6, md: 10 },
            maxWidth: "700px",
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            All plans include a 14-day free trial. No credit card required.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Need something specific?{" "}
            <Link
              href="#contact"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 500 }}
            >
              Contact us
            </Link>{" "}
            for a custom quote.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
