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
        <Route path="/data" element={<Dashboard />} />
        <Route path="/blocklist" element={<Dashboard />} />
        <Route path="/billing" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
        <Route path="/about" element={<Dashboard />} />
        <Route path="/feedback" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
