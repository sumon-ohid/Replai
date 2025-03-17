import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LiveHelpOutlinedIcon from '@mui/icons-material/LiveHelpOutlined';

export default function FAQ() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [activeMobileTab, setActiveMobileTab] = React.useState(0);

  const handleChange = (panel: string) => {
    setExpanded(
      expanded.includes(panel)
        ? expanded.filter((item) => item !== panel)
        : [...expanded, panel]
    );
  };

  const faqItems = [
    {
      id: 'panel1',
      question: 'How do I contact customer support if I have a question or issue?',
      answer: (
        <>
          You can reach our customer support team by emailing&nbsp;
          <Link 
            href="mailto:support@replai.tech"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 500,
              position: 'relative',
              '&:hover': {
                textDecoration: 'none',
                '&:after': {
                  width: '100%',
                }
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -1,
                left: 0,
                width: 0,
                height: 1.5,
                bgcolor: 'primary.main',
                transition: 'width 0.3s ease',
              }
            }}
          >
            support@replai.tech
          </Link>
          &nbsp;. We're here to assist you promptly.
        </>
      )
    },
    {
      id: 'panel3',
      question: 'What makes your service stand out from others in the market?',
      answer: 'Our AI email auto-replier stands out with its intelligent adaptability, seamless automation, and user-centric design. It ensures timely and context-aware responses, enhancing efficiency while maintaining a personal touch. We prioritize user satisfaction and continuously refine our technology to exceed expectations.'
    },
    {
      id: 'panel5',
      question: 'How to train the AI to understand my email style?',
      answer: 'You can train the AI by providing it with text, file or website link. The AI will learn from these examples and generate responses that match your style. You can also provide feedback to the AI to help it improve its responses.'
    },
    {
      id: 'panel6',
      question: 'Is my email data secure with Replai?',
      answer: 'Absolutely. Security is our top priority. All your data is encrypted end-to-end, and we follow industry-best practices for data protection. Our systems comply with major privacy regulations, and we never share your information with third parties.'
    },
    {
      id: 'panel7',
      question: 'Can I customize the AI responses?',
      answer: 'Yes! Replai offers extensive customization options. You can set specific tones, styles, and response preferences. Additionally, you can create templates for common scenarios and train the AI to understand context-specific responses based on your communication patterns.'
    }
  ];

  // Mobile slider navigation
  const handleNext = () => {
    setActiveMobileTab((prev) => (prev + 1) % faqItems.length);
  };
  
  const handlePrev = () => {
    setActiveMobileTab((prev) => (prev - 1 + faqItems.length) % faqItems.length);
  };

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha(theme.palette.background.default, 0)} 100%)`
          : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha(theme.palette.background.default, 0)} 100%)`,
      }}
    >
      {/* Background decoration */}
      <Box 
        component={motion.div}
        animate={{
          y: [-20, 20],
          rotate: [0, 10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        sx={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          width: { xs: 150, md: 250 },
          height: { xs: 150, md: 250 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />
      
      <Box 
        component={motion.div}
        animate={{
          y: [20, -20],
          rotate: [0, -8],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: { xs: 120, md: 220 },
          height: { xs: 120, md: 220 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{
            mb: { xs: 6, md: 10 },
            textAlign: 'center',
            maxWidth: 700,
            mx: 'auto'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LiveHelpOutlinedIcon fontSize="medium" />
            </Box>
          </Box>
          
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              letterSpacing: 1.5,
              mb: 1,
              display: 'block'
            }}
          >
            QUESTIONS & ANSWERS
          </Typography>
          
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` 
                : 'inherit',
              WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : 'unset',
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
            }}
          >
            Frequently Asked Questions
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.7
            }}
          >
            Find answers to common questions about Replai. If you can't find what you're 
            looking for, feel free to reach out to our support team.
          </Typography>
        </Box>

        {/* Desktop/Tablet View */}
        {!isMobile && (
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: theme.palette.mode === 'dark' 
                  ? `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}` 
                  : `0 20px 60px ${alpha(theme.palette.common.black, 0.07)}`,
              }}
            >
              {faqItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <Divider sx={{ opacity: 0.3 }} />}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    onClick={() => handleChange(item.id)}
                    sx={{
                      px: { xs: 3, md: 4 },
                      py: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.03)
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          color: expanded.includes(item.id) ? 'primary.main' : 'text.primary',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {item.question}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: expanded.includes(item.id) 
                            ? 'primary.main' 
                            : alpha(theme.palette.text.secondary, 0.08),
                          color: expanded.includes(item.id) ? 'white' : 'text.secondary',
                          width: 32,
                          height: 32,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: expanded.includes(item.id) 
                              ? alpha(theme.palette.primary.main, 0.9)
                              : alpha(theme.palette.text.secondary, 0.12),
                          }
                        }}
                      >
                        {expanded.includes(item.id) ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                    
                    <AnimatePresence initial={false}>
                      {expanded.includes(item.id) && (
                        <Box
                          component={motion.div}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          sx={{ overflow: 'hidden' }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              pt: 2,
                              pb: 1,
                              lineHeight: 1.7,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                              maxWidth: '85%'
                            }}
                          >
                            {item.answer}
                          </Typography>
                        </Box>
                      )}
                    </AnimatePresence>
                  </Box>
                </React.Fragment>
              ))}
            </Paper>
          </Box>
        )}
        
        {/* Mobile Carousel View */}
        {isMobile && (
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                mb: 5,
                position: 'relative',
                height: 320,
                overflow: 'hidden'
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                <Box
                  key={`faq-mobile-${activeMobileTab}`}
                  component={motion.div}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  sx={{ height: '100%', width: '100%', position: 'absolute' }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? `0 15px 40px ${alpha(theme.palette.common.black, 0.25)}` 
                        : `0 15px 40px ${alpha(theme.palette.common.black, 0.07)}`,
                    }}
                  >
                    <Box 
                      sx={{
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.3)
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          color: 'primary.main',
                          mb: 1
                        }}
                      >
                        {faqItems[activeMobileTab].question}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        flex: 1,
                        overflow: 'auto',
                        lineHeight: 1.7,
                        fontSize: '0.95rem'
                      }}
                    >
                      {faqItems[activeMobileTab].answer}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Question {activeMobileTab + 1} of {faqItems.length}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </AnimatePresence>
              
              {/* Mobile Navigation Controls */}
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: -5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.9)
                  }
                }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
              
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: -5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.9)
                  }
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Box>
            
            {/* Mobile Dots Navigation */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 1,
              mb: 4
            }}>
              {faqItems.map((_, i) => (
                <Box
                  key={`dot-${i}`}
                  component={motion.div}
                  initial={false}
                  animate={{
                    width: activeMobileTab === i ? 24 : 8,
                    opacity: activeMobileTab === i ? 1 : 0.5,
                  }}
                  onClick={() => setActiveMobileTab(i)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: activeMobileTab === i ? 'primary.main' : alpha(theme.palette.text.secondary, 0.3),
                    cursor: 'pointer',
                    transition: 'width 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Call To Action */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          sx={{
            mt: { xs: 6, md: 10 },
            textAlign: 'center'
          }}
        >
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Still have questions? We're here to help.
          </Typography>
          
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 3,
              py: 1.2,
              px: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 1.5,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              '&:hover': {
                borderWidth: 1.5,
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
            onClick={() => window.open('mailto:support@replai.tech')}
          >
            Contact Support
          </Button>
        </Box>
      </Container>
    </Box>
  );
}