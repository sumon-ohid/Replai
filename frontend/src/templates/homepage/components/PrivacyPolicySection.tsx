import { motion } from 'framer-motion';
import { alpha, Box, Container, Link, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CheckCircleOutline, SecurityOutlined, SettingsSuggestOutlined } from '@mui/icons-material';
import { Policy } from '@mui/icons-material';

// Privacy Policy section with enhanced UI
const PrivacyPolicySection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${alpha('#0a0a0a', 0)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 50%, ${alpha('#0a0a0a', 0)} 100%)`
          : `linear-gradient(180deg, ${alpha('#fafafa', 0)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 50%, ${alpha('#fafafa', 0)} 100%)`,
      }}
    >
      {/* Background decorative elements */}
      <Box
        component={motion.div}
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      <Box
        component={motion.div}
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: { xs: 100, md: 180 },
          height: { xs: 100, md: 180 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: 3, md: 4 },
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.1 : 0.3),
              background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.7),
              backdropFilter: 'blur(10px)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 20px 80px ${alpha(theme.palette.common.black, 0.2)}`
                : `0 20px 80px ${alpha(theme.palette.common.black, 0.06)}`,
              position: 'relative'
            }}
          >
            {/* Top decorative pattern */}
            <Box
              sx={{
                height: 12,
                width: '100%',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                component={motion.div}
                animate={{ 
                  x: [-100, 800], 
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: 200,
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    ${alpha('#fff', 0.2)} 50%, 
                    transparent 100%)`,
                }}
              />
            </Box>

            <Box sx={{ px: { xs: 3, sm: 5, md: 8 }, py: { xs: 5, sm: 6, md: 8 } }}>
              <Stack 
                direction="column" 
                alignItems="center" 
                spacing={3}
              >
                {/* Animated icon */}
                <Box
                  component={motion.div}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                  }}
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`,
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <Policy sx={{ 
                      fontSize: 34, 
                      color: 'white',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} />
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
                  <Typography
                    variant="h4"
                    component={motion.h4}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      background: theme.palette.mode === 'dark' 
                        ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` 
                        : 'inherit',
                      WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : 'unset',
                      WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
                    }}
                  >
                    Privacy Policy
                  </Typography>

                  <Typography
                    variant="body1"
                    component={motion.p}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    sx={{
                      mb: 3,
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.7,
                    }}
                  >
                    We take your privacy seriously. We do not share your data with third parties.
                  </Typography>

                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Check our{" "}
                      <Link
                        href="/privacy"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 600,
                          textDecoration: 'none',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -2,
                            left: 0,
                            width: '100%',
                            height: 2,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            borderRadius: 1,
                            opacity: 0.8,
                            transition: 'transform 0.3s ease',
                            transform: 'scaleX(0.2)',
                            transformOrigin: 'left'
                          },
                          '&:hover::after': {
                            transform: 'scaleX(1)',
                          }
                        }}
                      >
                        Privacy Policy
                      </Link>{" "}
                      for more information.
                    </Typography>
                  </Box>

                  {/* Security badges */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    sx={{
                      mt: 3,
                      pt: 3,
                      borderTop: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.3)
                    }}
                  >
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 2, sm: 4 }}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {[
                        { icon: <SecurityOutlined />, label: "Data Encrypted" },
                        { icon: <SettingsSuggestOutlined />, label: "GDPR Compliant" },
                        { icon: <CheckCircleOutline />, label: "24/7 Monitoring" }
                      ].map((item, index) => (
                        <Box
                          key={`security-${index}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box
                            sx={{
                              color: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.text.secondary
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicySection;