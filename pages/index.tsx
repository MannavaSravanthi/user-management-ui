// src/Pages/HomePage.tsx

import React from 'react';
import Cookies from 'js-cookie';
import { Button, Typography, Container, Box, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  const handleLogout = () => {
    Cookies.remove('authToken');
    window.location.href = '/login';
  };

  return (
    <Container component="main" sx={{
      height: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper elevation={6} sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        padding: 4,
        textAlign: 'center'
      }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Home Page
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to the home page! You are logged in.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogout} sx={{ mt: 3 }}>
          Log Out
        </Button>
      </Paper>
    </Container>
  );
};

export default HomePage;
