import * as React from 'react';
import { useState, useEffect } from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha, useTheme } from '@mui/material/styles';
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
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  IconButton,
  Grid,
  InputAdornment,
  LinearProgress,
  Tooltip,
  Snackbar,
  Badge,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './components/Footer';

// Icons
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PaymentIcon from '@mui/icons-material/Payment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import LanguageIcon from '@mui/icons-material/LanguageOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import DataUsageIcon from '@mui/icons-material/DataUsageOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import { useAuth } from '../../AuthContext';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

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
      {value === index && (
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ pt: 3 }}>{children}</Box>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

export default function SettingsPage(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { user, updateProfilePicture, updateUserName, updatePassword } = useAuth();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPicture, setIsChangingPicture] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfilePictureClick = () => {
    setIsChangingPicture(true);
  };

  const handleCancelPictureChange = () => {
    setIsChangingPicture(false);
    setProfilePicture(user?.profilePicture || '');
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setProfilePicture(URL.createObjectURL(file));
      try {
        await updateProfilePicture(file);
        showSnackbar('Profile picture updated successfully', 'success');
        setIsChangingPicture(false);
      } catch (error) {
        showSnackbar('Error updating profile picture', 'error');
      }
    }
  };

  const handleProfileChange = async () => {
    setIsSaving(true);
    try {
      await updateUserName(fullName);
      showSnackbar('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showSnackbar('Error updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }
    
    if (passwordStrength < 3) {
      showSnackbar('Password is not strong enough', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      showSnackbar('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordStrength(0);
    } catch (error) {
      showSnackbar('Error updating password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteAccount = async () => {
    setDeletionStatus('deleting');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await fetch(`${apiBaseUrl}/api/user/account/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete account');

      setDeletionStatus('success');
      setTimeout(() => (window.location.href = '/'), 2000);
    } catch (error) {
      setDeletionStatus('error');
      setTimeout(() => setDeletionStatus('idle'), 2000);
    }
  };

  useEffect(() => {
    const calculatePasswordStrength = (password: string): number => {
      if (!password) return 0;
      let strength = 0;
      
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      return strength;
    };
    
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return theme.palette.error.main;
      case 1: return theme.palette.error.main;
      case 2: return theme.palette.warning.main;
      case 3: return theme.palette.success.light;
      case 4: return theme.palette.success.main;
      default: return theme.palette.error.main;
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "Very Weak";
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
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
              mx: { xs: 2, sm: 3 },
              pb: 2,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
          </Stack>
          
          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              maxWidth: 1200, 
              mx: 'auto', 
              px: { xs: 2, sm: 3, md: 4 }, 
              pb: 5 
            }}
          >
            {/* Header */}
            <Box 
              component={motion.div}
              variants={itemVariants}
              sx={{ mb: 3 }}
            >
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  background: 'linear-gradient(90deg,rgb(0, 98, 255),rgb(43, 156, 255))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Account Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your personal information, security preferences and billing details
              </Typography>
            </Box>
            
            {/* Main Content Wrapper */}
            <Box 
              component={motion.div}
              variants={itemVariants}
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
              }}
            >
              {/* Left Side - Tabs Navigation */}
              <Box
                sx={{
                  minWidth: { xs: '100%', md: 260 },
                  maxWidth: { md: 260 }
                }}
              >
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      orientation="vertical"
                      sx={{
                        '& .MuiTab-root': {
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          minHeight: 60,
                          px: 2.5,
                          textAlign: 'left',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          borderLeft: '3px solid transparent',
                          '&.Mui-selected': {
                            borderLeftColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          }
                        },
                        '& .MuiTabs-indicator': {
                          display: 'none'
                        }
                      }}
                    >
                      <Tab 
                        icon={<PersonIcon />} 
                        iconPosition="start"
                        label="Profile" 
                        id="settings-tab-0" 
                        aria-controls="settings-tabpanel-0" 
                      />
                      <Tab 
                        icon={<SecurityIcon />} 
                        iconPosition="start"
                        label="Security" 
                        id="settings-tab-1" 
                        aria-controls="settings-tabpanel-1" 
                      />
                      <Tab 
                        icon={<NotificationsIcon />} 
                        iconPosition="start"
                        label="Notifications" 
                        id="settings-tab-3" 
                        aria-controls="settings-tabpanel-3" 
                      />
                      <Tab 
                        icon={<PaymentIcon />} 
                        iconPosition="start"
                        label="Billing" 
                        id="settings-tab-2" 
                        aria-controls="settings-tabpanel-2" 
                      />
                      <Tab 
                        icon={<PaletteIcon />} 
                        iconPosition="start"
                        label="Appearance" 
                        id="settings-tab-4" 
                        aria-controls="settings-tabpanel-4" 
                      />
                      <Tab 
                        icon={<DataUsageIcon />} 
                        iconPosition="start"
                        label="Data & Privacy" 
                        id="settings-tab-5" 
                        aria-controls="settings-tabpanel-5" 
                      />
                    </Tabs>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Right Side - Tab Content */}
              <Box sx={{ flexGrow: 1 }}>
                {/* Profile Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Profile Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          mb: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Personal Information
                        </Typography>
                        <Button 
                          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                          variant={isEditing ? "contained" : "outlined"}
                          size="small"
                          onClick={() => {
                            if (isEditing) {
                              handleProfileChange();
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          disabled={isSaving}
                          sx={{ borderRadius: 2 }}
                        >
                          {isEditing ? "Save" : "Edit Profile"}
                        </Button>
                      </Box>

                      <Box sx={{ px: 3, pb: 3 }}>
                        {/* Profile Picture Section */}
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'flex-start' },
                            gap: 3,
                            mb: 4
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box
                                  onClick={handleProfilePictureClick}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: `2px solid ${theme.palette.background.paper}`,
                                    boxShadow: theme.shadows[2],
                                    '&:hover': {
                                      backgroundColor: theme.palette.primary.dark,
                                    }
                                  }}
                                >
                                  <PhotoCameraIcon sx={{ color: '#fff', fontSize: 18 }} />
                                </Box>
                              }
                            >
                              <Avatar 
                                src={profilePicture}
                                alt={fullName}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  border: `3px solid ${theme.palette.background.paper}`,
                                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                                }}
                              />
                            </Badge>

                            <Collapse in={isChangingPicture} sx={{ mt: 2, textAlign: 'center' }}>
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => fileInputRef.current?.click()}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Choose File
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={handleCancelPictureChange}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                              <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                              />
                            </Collapse>
                          </Box>

                          <Box sx={{ flex: 1, mt: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Profile Photo
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Upload a clear photo to help others recognize you. JPG or PNG format recommended.
                            </Typography>
                          </Box>
                        </Box>

                        {/* Profile Information Form */}
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 100, mb: 0.5, ml: 2, fontSize: '0.6rem' }}>
                              Full Name
                            </Typography>
                            <TextField
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              variant="outlined"
                              fullWidth
                              disabled={!isEditing}
                              InputProps={{
                                sx: { borderRadius: 2 }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 100, mb: 0.5, ml: 2, fontSize: '0.6rem' }}>
                              Email Address
                            </Typography>
                            <TextField
                              value={email}
                              variant="outlined"
                              fullWidth
                              disabled
                              InputProps={{
                                sx: { borderRadius: 2 },
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Chip 
                                      label="Verified" 
                                      size="small" 
                                      color="success" 
                                      variant="outlined" 
                                      sx={{ borderRadius: 1 }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                            <Typography variant="subtitle1" sx={{ fontWeight: 100, mb: 0.5, ml: 2, fontSize: '0.6rem' }}>
                              Language
                            </Typography>
                              <Select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as string)}
                                label="Language"
                                disabled={!isEditing}
                                sx={{ borderRadius: 2 }}
                              >
                                <MenuItem value="en">English</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 100, mb: 0.5, ml: 2, fontSize: '0.6rem' }}>
                              Timezone
                            </Typography>
                            <TextField
                              value="(UTC-auto) Coordinated Universal Time"
                              variant="outlined"
                              fullWidth
                              disabled
                              InputProps={{ sx: { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>

                        {/* Divider with danger zone */}
                        <Box sx={{ mt: 5, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.error.main, 0.08),
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            }}
                          >
                            <Typography variant="subtitle1" color="error" sx={{ fontWeight: 600, mb: 1 }}>
                              Danger Zone
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Once you delete your account, there is no going back. Please be certain.
                            </Typography>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => setOpenDeleteDialog(true)}
                              startIcon={<DeleteIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              Delete My Account
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Security Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Security Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Password & Security
                        </Typography>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                          Change Password
                        </Typography>

                        <Stack spacing={3}>
                          <TextField
                            placeholder="Current Password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    edge="end"
                                    sx={{ borderRadius: 10 }}
                                  >
                                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2 }
                            }}
                          />
                          
                          <TextField
                            placeholder="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                    sx={{ borderRadius: 10 }}
                                  >
                                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2 }
                            }}
                          />
                          
                          {newPassword && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Password Strength
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: getPasswordStrengthColor() }}>
                                  {getPasswordStrengthText()}
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={(passwordStrength / 4) * 100} 
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
                                  backgroundColor: alpha(theme.palette.divider, 0.3),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getPasswordStrengthColor()
                                  }
                                }}
                              />
                              
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Use 8+ characters with a mix of uppercase, lowercase, numbers and symbols for best security
                              </Typography>
                            </Box>
                          )}
                          
                          <TextField
                            placeholder="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            error={newPassword !== confirmNewPassword && confirmNewPassword !== ''}
                            helperText={
                              newPassword !== confirmNewPassword && confirmNewPassword !== '' 
                                ? "Passwords don't match" 
                                : ''
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    sx={{ borderRadius: 10 }}
                                  >
                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2 }
                            }}
                          />
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handlePasswordChange}
                            disabled={!currentPassword || !newPassword || !confirmNewPassword || isSaving}
                            sx={{ 
                              borderRadius: 2, 
                              alignSelf: 'flex-start', 
                              px: 4,
                              position: 'relative'
                            }}
                          >
                            {isSaving && (
                              <CircularProgress
                                size={24}
                                sx={{
                                  position: 'absolute',
                                  left: '50%',
                                  top: '50%',
                                  marginTop: '-12px',
                                  marginLeft: '-12px',
                                }}
                              />
                            )}
                            <span style={{ visibility: isSaving ? 'hidden' : 'visible', color: 'rgb(115, 115, 115)' }}>
                              Update Password
                            </span>
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Notifications Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Notifications
                        </Typography>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={notificationsEnabled}
                                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Enable Notifications"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Email Notifications"
                          />
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Billing Tab */}
                <TabPanel value={tabValue} index={3}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Billing Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Billing Information
                        </Typography>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          You are currently on the Free plan. Upgrade to a paid plan to unlock more features.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Appearance Tab */}
                <TabPanel value={tabValue} index={4}> 
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Appearance Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Appearance
                        </Typography>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Change the look and feel of the app.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Data & Privacy Tab */}
                <TabPanel value={tabValue} index={5}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: '16px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Data & Privacy Tab Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Data & Privacy
                        </Typography>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Manage your data, privacy and consent settings.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>
              </Box>
            </Box>
          </Box>
          <Footer />
        </Box>
      </Box>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbarSeverity} 
          onClose={() => setSnackbarOpen(false)}
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Are you sure you want to delete your account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. Your data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            disabled={deletionStatus === 'deleting'}
          >
            {deletionStatus === 'deleting' ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}