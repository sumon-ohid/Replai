import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Only import small, critical components directly
// All page components are lazily loaded for better performance

// Lazy load all page components
const MarketingPage = React.lazy(() => import('./templates/homepage/MarketingPage'));
const SignIn = React.lazy(() => import('./templates/sign-in/SignIn'));
const SignUp = React.lazy(() => import('./templates/sign-up/SignUp'));
const Dashboard = React.lazy(() => import('./templates/dashboard/Dashboard'));
const EmailManager = React.lazy(() => import('./templates/dashboard/EmailManager'));
const InboxEmail = React.lazy(() => import('./templates/dashboard/InboxEmail'));
const DataManager = React.lazy(() => import('./templates/dashboard/DataManager'));
const BlockList = React.lazy(() => import('./templates/dashboard/BlockList'));
const Analytics = React.lazy(() => import('./templates/dashboard/Analytics'));
const PlanBillingManagement = React.lazy(() => import('./templates/dashboard/PlanManager'));
const SettingsPage = React.lazy(() => import('./templates/dashboard/SettingsPage'));
const AboutPage = React.lazy(() => import('./templates/dashboard/AboutPage'));
const FeedbackPage = React.lazy(() => import('./templates/dashboard/FeedbackPage'));
const NotFoundPage = React.lazy(() => import('./templates/not-found/NotFoundPage'));
const PrivacyTermsPage = React.lazy(() => import('./templates/homepage/PrivacyPage'));
const CalendarPage = React.lazy(() => import('./templates/dashboard/CalendarPage'));
const Documentations = React.lazy(() => import('./templates/homepage/Documentations'));
const BlogPage = React.lazy(() => import('./templates/homepage/BlogPage'));
const AboutUsPage = React.lazy(() => import('./templates/homepage/AboutUsPage'));
const ContactUsPage = React.lazy(() => import('./templates/homepage/ContactUsPage'));

// ScrollToTop component that scrolls the window to the top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Loading fallback component
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    sx={{ 
      bgcolor: 'background.default',
      color: 'text.primary'
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MarketingPage />} />
            <Route path="/signin" element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/email-manager" element={
              <ProtectedRoute>
                <EmailManager />
              </ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <InboxEmail />
              </ProtectedRoute>
            } />
            <Route path="/data" element={
              <ProtectedRoute>
                <DataManager />
              </ProtectedRoute>
            } />
            <Route path="/blocklist" element={
              <ProtectedRoute>
                <BlockList />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <PlanBillingManagement />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } />
            
            {/* Additional public pages */}
            <Route path="/privacy" element={<PrivacyTermsPage />} />
            <Route path="/docs" element={<Documentations />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </Router>
  );
}