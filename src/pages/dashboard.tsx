import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  AppProvider,
  type Router,
  type Navigation,
} from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

const NAVIGATION: Navigation = [
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: {
    light: true,
    dark: {
      palette: {
        background: {
          default: '#000000',
          paper: '#000000',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function EmailList() {
  const [emails, setEmails] = React.useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState<any | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState<"blur" | "transparent" | "opaque">("blur");

  React.useEffect(() => {
    fetch('http://localhost:3000/api/emails')
      .then((response) => response.json())
      .then((data) => setEmails(data))
      .catch((error) => console.error('Error fetching emails:', error));
  }, []);

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
    onOpen();
  };

  const handleClose = () => {
    setSelectedEmail(null);
    onClose();
  };

  const decodeBase64 = (str: string) => {
    return decodeURIComponent(escape(window.atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Inbox</Typography>
      <List>
        {emails.map((email: any) => (
          <ListItem component="li" key={email.id} onClick={() => handleEmailClick(email)} className="cursor-pointer">
            <ListItemText primary={email.payload.headers.find((header: any) => header.name === 'Subject').value} secondary={email.payload.headers.find((header: any) => header.name === 'From').value} />
          </ListItem>
        ))}
      </List>
      <Modal className='bg-black' backdrop={backdrop} isOpen={isOpen} onClose={handleClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Email Details</ModalHeader>
              <ModalBody>
                {selectedEmail && (
                  <div className="p-4">
                    <Typography variant="h6">From: {selectedEmail.payload.headers.find((header: any) => header.name === 'From').value}</Typography>
                    <Typography variant="h6">Subject: {selectedEmail.payload.headers.find((header: any) => header.name === 'Subject').value}</Typography>
                    <Typography variant="body1">{decodeBase64(selectedEmail.payload.parts[0].body.data)}</Typography>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}

function DemoPageContent({ pathname }: { pathname: string }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
      <EmailList />
    </Box>
  );
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function DashboardLayoutSidebarCollapsed(props: DemoProps) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/dashboard');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}
