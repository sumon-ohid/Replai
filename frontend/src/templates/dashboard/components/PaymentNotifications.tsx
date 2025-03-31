import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function PaymentNotification() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<'success' | 'error' | 'info'>('info');
  
  const location = useLocation();
  
  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const error = queryParams.get('error');
    
    if (success === 'true') {
      setMessage('Payment successful! Your subscription is now active.');
      setSeverity('success');
      setOpen(true);
    } else if (canceled === 'true') {
      setMessage('Payment was canceled. No charges were made.');
      setSeverity('info');
      setOpen(true);
    } else if (error) {
      setMessage(`Payment error: ${error}`);
      setSeverity('error');
      setOpen(true);
    }
  }, [location.search]);
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setOpen(false)} 
        severity={severity}
        variant="filled"
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
