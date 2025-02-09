import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import * as React from 'react';
import Box from '@mui/joy/Box';
import Alert from '@mui/joy/Alert';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';

interface AlertVariousStatesProps {
  alertMsg: string;
  alertType: 'success' | 'warning' | 'error' | 'neutral';
  alertTitle: string;
}

const AlertVariousStates: React.FC<AlertVariousStatesProps> = ({ alertMsg, alertType, alertTitle }) => {
  const items = [
    { title: 'Success', color: 'success' as 'success', icon: <CheckCircleIcon /> },
    { title: 'Warning', color: 'warning' as 'warning', icon: <WarningIcon /> },
    { title: 'Error', color: 'danger' as 'danger', icon: <ReportIcon /> },
    { title: 'Neutral', color: 'neutral' as 'neutral', icon: <InfoIcon /> },
  ];

  const currentItem = items.find(item => item.color === alertType);

  if (!currentItem) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: 'column' }}>
      <Alert
        sx={{ alignItems: 'flex-start' }}
        startDecorator={currentItem.icon}
        variant="soft"
        color={currentItem.color}
        endDecorator={
          <IconButton variant="soft" color={currentItem.color}>
            <CloseRoundedIcon />
          </IconButton>
        }
      >
        <div>
          <div>{alertTitle}</div>
          <Typography level="body-sm" color={currentItem.color}>
            {alertMsg}
          </Typography>
        </div>
      </Alert>
    </Box>
  );
};

export default AlertVariousStates;