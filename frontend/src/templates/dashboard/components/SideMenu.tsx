import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

interface User {
  name: string;
  email: string;
  profilePicture?: string;
}

export default function SideMenu() {
  const [user, setUser] = React.useState<User>({ name: '', email: '' });
  const { logout } = useAuth();

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data as User);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        {/* <SelectContent /> */}
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }}
        >
          <Avatar
            sizes="small"
            alt={user.name}
            src={user.profilePicture || '/static/images/avatar/default.jpg'}
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ mr: 'auto' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {user.name.substring(0, 15)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.email.substring(0, 15)}
            </Typography>
          </Box>
          <OptionsMenu />
          {/* <Tooltip title="logout" placement="top">
            <LogoutIcon
              sx={{ cursor: 'pointer', height: 20, width: 20, border: '1px solid', borderRadius: '20%', padding: .2 }}
              onClick={logout}
            />
          </Tooltip> */}
        </Stack>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
        <CardAlert />
      </Box>
    </Drawer>
  );
}