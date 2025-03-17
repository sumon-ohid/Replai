import * as React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface ConnectEmailDialogProps {
  open: boolean;
  onClose: () => void;
  provider: 'google' | 'microsoft' | 'custom' | null;
}

export default function ConnectEmailDialog({ open, onClose, provider }: ConnectEmailDialogProps) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);
  
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
    server: Yup.string().required('Server URL is required'),
    port: Yup.number().required('Port is required').positive('Port must be positive'),
    protocol: Yup.string().required('Protocol is required')
  });
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      server: '',
      port: 993,
      protocol: 'imap'
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        enqueueSnackbar('Authentication required', { variant: 'error' });
        setLoading(false);
        return;
      }
      
      try {
        await axios.post(`${apiBaseUrl}/api/emails/connect/custom`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        enqueueSnackbar('Email connected successfully', { variant: 'success' });
        onClose();
      } catch (error) {
        console.error('Error connecting custom email:', error);
        enqueueSnackbar('Failed to connect email. Please check your credentials.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  });

  if (provider !== 'custom') return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1, bgcolor: "background.default" }}>
        Connect Custom Email
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 3,  bgcolor: "background.default"  }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your email server details to connect via IMAP/SMTP. This information can 
          typically be found in your email provider's help center.
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              placeholder="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              id="password"
              name="password"
              placeholder="Password or App Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
            
            <FormControl fullWidth>
              <InputLabel id="protocol-label">Protocol</InputLabel>
              <Select
                labelId="protocol-label"
                id="protocol"
                name="protocol"
                value={formik.values.protocol}
                label="Protocol"
                onChange={formik.handleChange}
                disabled={loading}
                error={formik.touched.protocol && Boolean(formik.errors.protocol)}
              >
                <MenuItem value="imap">IMAP</MenuItem>
                <MenuItem value="pop3">POP3</MenuItem>
              </Select>
              {formik.touched.protocol && formik.errors.protocol && (
                <FormHelperText error>{formik.errors.protocol}</FormHelperText>
              )}
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                id="server"
                name="server"
                label="Server URL"
                placeholder="imap.example.com"
                value={formik.values.server}
                onChange={formik.handleChange}
                error={formik.touched.server && Boolean(formik.errors.server)}
                helperText={formik.touched.server && formik.errors.server}
                disabled={loading}
              />
              
              <TextField
                id="port"
                name="port"
                label="Port"
                type="number"
                value={formik.values.port}
                onChange={formik.handleChange}
                error={formik.touched.port && Boolean(formik.errors.port)}
                helperText={formik.touched.port && formik.errors.port}
                disabled={loading}
                sx={{ width: '30%' }}
              />
            </Box>
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3,  bgcolor: "background.default"  }}>
        <Button 
          onClick={onClose} 
          disabled={loading} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Connecting...' : 'Connect Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}