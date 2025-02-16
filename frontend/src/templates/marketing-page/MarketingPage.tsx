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

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        {/* <LogoCollection /> */}
        {/* <Features /> */}
        {/* <Divider /> */}
        {/* <Testimonials /> */}
        {/* <Divider />
        <Highlights /> */}
        {/* <Divider />
        <Pricing />
        <Divider /> */}
        {/* <FAQ /> */}
        <AiCard />
        <Typography variant="h6" align="center" gutterBottom sx={{ mt: -6, mb: 3, fontWeight: 'normal', fontSize: '.8rem' }}>
          Powered by powerful AI
        </Typography>
        {/* <Divider /> */}
        <Footer />
      </div>
    </AppTheme>
  );
}
