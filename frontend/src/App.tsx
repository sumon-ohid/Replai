import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import ProTip from './ProTip';
import MarketingPage from './templates/marketing-page/MarketingPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './templates/sign-in/SignIn';
import Dashboard from './templates/dashboard/Dashboard';
import EmailManager from './templates/dashboard/EmailManager';
import SignUp from './templates/sign-up/SignUp';
import DataManager from './templates/dashboard/DataManager';
import BlockList from './templates/dashboard/BlockList';
import PlanBillingManagement from './templates/dashboard/PlanManager';
import SettingsPage from './templates/dashboard/SettingsPage';
import AboutPage from './templates/dashboard/AboutPage';
import FeedbackPage from './templates/dashboard/FeedbackPage';

function Copyright() {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: 'text.secondary',
      }}
    >
      {'Copyright © '}
      <Link color="inherit" href="">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connected" element={<EmailManager />} />
        <Route path="/data" element={<DataManager />} />
        <Route path="/blocklist" element={<BlockList />} />
        <Route path="/billing" element={<PlanBillingManagement />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}
