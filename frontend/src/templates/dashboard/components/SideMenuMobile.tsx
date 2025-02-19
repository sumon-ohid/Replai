import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

interface User {
  name: string;
  email: string;
  profilePicture?: string;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const { logout } = useAuth();
  const [user, setUser] = React.useState<User>({ name: '', email: '', profilePicture: '' });

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const userDetailsResponse = await axios.get(`${apiBaseUrl}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const profilePictureResponse = await axios.get(`${apiBaseUrl}/api/user/me/profile-picture`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser({
          name: (userDetailsResponse.data as { name: string }).name,
          email: (userDetailsResponse.data as { email: string }).email,
          profilePicture: (profilePictureResponse.data as { profilePicture: string }).profilePicture
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.name || 'User'}
              src={user?.profilePicture ? `http://localhost:3000${user.profilePicture}` : ''}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {user?.name || 'User'}
            </Typography>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button variant="outlined" fullWidth startIcon={<LogoutRoundedIcon />} onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}