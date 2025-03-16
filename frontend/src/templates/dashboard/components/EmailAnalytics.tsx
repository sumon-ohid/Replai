import * as React from 'react';
import { Grid, Paper, Typography, Box, alpha, useTheme, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { BarChart } from '@mui/x-charts/BarChart';
import StatCard from './StatCard';

interface EmailStats {
  totalEmails: number;
  processedEmails: number;
  automatedResponses: number;
}

interface EmailAnalyticsProps {
  stats?: EmailStats;
  refreshTrigger: number;
}

export default function EmailAnalytics({ 
  stats = { totalEmails: 0, processedEmails: 0, automatedResponses: 0 }, 
  refreshTrigger 
}: EmailAnalyticsProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [animateChart, setAnimateChart] = React.useState(false);
  
  // Safe stats to ensure we always have valid numbers
  const safeStats = {
    totalEmails: stats?.totalEmails ?? 0,
    processedEmails: stats?.processedEmails ?? 0,
    automatedResponses: stats?.automatedResponses ?? 0
  };
  
  // Create effect for animation when stats change
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateChart(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [refreshTrigger]);
  
  // Calculate response rate
  const responseRate = safeStats.totalEmails > 0 
    ? Math.round((safeStats.automatedResponses / safeStats.totalEmails) * 100) 
    : 0;
  
  const chartSeries = [
    {
      data: [safeStats.totalEmails, safeStats.processedEmails, safeStats.automatedResponses],
      label: 'Emails',
      color: theme.palette.primary.main,
    }
  ];
  
  const chartXAxis = {
    data: ['Total', 'Processed', 'Automated'],
    scaleType: 'band' as const,
  };

  const chartAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        delay: 0.3,
        duration: 0.8
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { 
                duration: 0.5,
                ease: "easeOut"
              }
            }
          }}
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
            minHeight: 280,
            backgroundImage: theme.palette.mode === 'dark' 
              ? `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.05)}, ${alpha(theme.palette.background.paper, 1)})`
              : `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.paper, 1)})`,
            boxShadow: theme.shadows[1]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Email Activity
            </Typography>
            <Box 
              component={motion.div}
              animate={{ 
                opacity: [0.7, 1, 0.7], 
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                px: 1.5,
                py: 0.5,
                borderRadius: 5,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16 }} />
              {responseRate}% Response Rate
            </Box>
          </Box>
          
          {isLoading ? (
            <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 2 }} />
            </Box>
          ) : (
            <Box 
              sx={{ height: 220 }}
              component={motion.div}
              variants={chartAnimation}
              initial="hidden"
              animate={animateChart ? "visible" : "hidden"}
              key={refreshTrigger}
            >
              <BarChart
                series={chartSeries}
                xAxis={[chartXAxis]}
                height={220}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                colors={[theme.palette.primary.main, theme.palette.secondary.main]}
                sx={{
                  '.MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
                    fontWeight: 500,
                  },
                  '.MuiChartsLegend-root': {
                    display: 'none',
                  }
                }}
              />
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StatCard
              title="Total Emails"
              value={safeStats.totalEmails.toLocaleString()}
              icon={<EmailIcon />}
              color={theme.palette.primary.main}
              isLoading={isLoading}
              delay={0.1}
            />
          </Grid>

          <Grid item xs={12}>
            <StatCard
              title="Processed Emails"
              value={safeStats.processedEmails.toLocaleString()}
              icon={<AutorenewIcon />}
              color={theme.palette.secondary.main}
              isLoading={isLoading}
              delay={0.2}
              percentage={safeStats.totalEmails > 0 ? 
                Math.round((safeStats.processedEmails / safeStats.totalEmails) * 100) : 0}
            />
          </Grid>

          <Grid item xs={12}>
            <StatCard
              title="Automated Responses"
              value={safeStats.automatedResponses.toLocaleString()}
              icon={<DoneAllIcon />}
              color={theme.palette.info.main}
              isLoading={isLoading}
              delay={0.3}
              percentage={safeStats.processedEmails > 0 ? 
                Math.round((safeStats.automatedResponses / safeStats.processedEmails) * 100) : 0}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}