import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Highlights from './components/Highlights';
import Pricing from './components/Pricing';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import './style.css';
import CardAlert from '../dashboard/components/CardAlert';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import AiCard from './components/AiCard';
import { Policy } from '@mui/icons-material';
import { Box, fontStyle } from '@mui/system';

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        {/* <LogoCollection /> */}
        {/* <Divider /> */}
        {/* <Divider />
        <Highlights /> */}
        <AiCard />
        <Typography variant="h6" align="center" gutterBottom sx={{ mt: -6, mb: 3, fontWeight: 'normal', fontSize: '.8rem' }}>
          Powered by powerful AI
        </Typography>
        <Features />
        {/* <Pricing /> */}
        {/* <Testimonials /> */}
        <FAQ />
        {/* <Divider /> */}
        <Box sx={{ pt: 6, pb: 6, m: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="h4" align="center" gutterBottom>
            <Policy sx={{ fontSize: 40 }} />
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            We take your privacy seriously. We do not share your data with third parties.
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Check our <a href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy </a>
            for more information.
          </Typography>
        </Box>
        <Footer />
      </div>
    </AppTheme>
  );
}
