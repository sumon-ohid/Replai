import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useAuth();

  const handleCreateBot = async () => {
    // if (!user) {
    //   console.error('User not authenticated');
    //   return;
    // }
    window.open('http://localhost:3000/api/emails/auth/google', '_blank');
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <InsightsRoundedIcon />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          AI Agent Creation
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          Create an AI agent to automate your email responses.
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
          onClick={handleCreateBot}
        >
          Create Bot
        </Button>
      </CardContent>
    </Card>
  );
}
