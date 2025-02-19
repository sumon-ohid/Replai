import * as React from 'react';
import { useState } from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import {
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Avatar,
  Divider
} from '@mui/material';
import Footer from '../marketing-page/components/Footer';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PaymentIcon from '@mui/icons-material/Payment';
import Info from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import { useAuth } from '../../AuthContext';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// Helper component for Tab Panels
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function SettingsPage(props: { disableCustomTheme?: boolean }) {
  const [tabValue, setTabValue] = useState(0);
  const { user, updateProfilePicture } = useAuth();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePicture(URL.createObjectURL(file));
      await updateProfilePicture(file);
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>
          <Typography variant="h4" gutterBottom ml={3}>
            Settings
          </Typography>
          <Typography variant="body1" color="textSecondary" align="left" ml={3} mb={2}>
            Manage your account settings
          </Typography>
          <Box sx={{ mx: 3, mb: 3}}>
            <Paper square>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Tab
                  icon={<PersonIcon />}
                  label="Profile"
                  {...a11yProps(0)}
                />
                <Tab
                  icon={<LockIcon />}
                  label="Security"
                  {...a11yProps(1)}
                />
                <Tab
                  icon={<PaymentIcon />}
                  label="Billing"
                  {...a11yProps(2)}
                />
              </Tabs>
            </Paper>
            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Details
                  </Typography>
                  <Stack spacing={2}>
                    <TextField placeholder='Full name' variant="outlined" fullWidth />
                    <TextField placeholder='Email address' variant="outlined" fullWidth />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56 }} src={profilePicture} />
                      <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
                        Change Profile Picture
                        <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
                      </Button>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Signature
                        <Tooltip title="Your signature will be used for emails responses. (eg: Best Regards John Doe).
                            If no signature provided your Full Name will be used." placement="right">
                          <Info sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
                        </Tooltip>
                      </Typography>
                      {/* Replace with a signature canvas or upload component as needed */}
                      <TextField
                        placeholder="Type your full name"
                        variant="outlined"
                        fullWidth
                      />
                      <Button variant="contained" sx={{ mt: 1 }}>
                        Update Signature
                      </Button>
                    </Box>
                    <Button variant="contained" color="primary">
                      Save Profile
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      placeholder="Current Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                    />
                    <TextField
                      placeholder="New Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                    />
                    <TextField
                      placeholder="Confirm New Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                    />
                    <Button variant="contained" color="primary">
                      Update Password
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
            {/* Billing Tab */}
            <TabPanel value={tabValue} index={2}>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Card Details
                  </Typography>
                  <Stack spacing={2}>
                    <TextField placeholder="Card Number" variant="outlined" fullWidth />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        placeholder="Expiry Date MM/YY"
                        variant="outlined"
                        fullWidth
                      />
                      <TextField placeholder="CVV" variant="outlined" fullWidth />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Billing Address
                    </Typography>
                    <TextField placeholder="Address" variant="outlined" fullWidth />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField placeholder="City" variant="outlined" fullWidth />
                      <TextField placeholder="Zip Code" variant="outlined" fullWidth />
                    </Box>
                    <TextField placeholder="Country" variant="outlined" fullWidth />
                    <Button variant="contained" color="primary">
                      Update Billing Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
