import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../../context/user-context';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Button,
  Box,
} from '@mui/material';
import Cookies from 'js-cookie';

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    Cookies.remove('authToken');
    router.push('/login');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) router.push('/');
    if (newValue === 1) router.push('/user-list');
    if (newValue === 2) router.push('/add-user');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                },
              }}
            >
              <Tab label="Account Home" />
              <Tab label="User List" />
              {user?.role === 'Admin' && <Tab label="Add User" />}
            </Tabs>
          </Box>

          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            {user?.name ? `Welcome ${user.name}!` : 'Welcome!'}
          </Typography>

          <Button color="inherit" onClick={handleLogout} sx={{ ml: 'auto' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>{children}</Box>
    </>
  );
};

export default ProtectedLayout;
