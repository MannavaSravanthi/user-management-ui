import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';
import { useLogin } from './hooks/use-login';
import { useUser } from '../context/user-context';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, loading, error } = useLogin();
  const { setUser } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkUserBase = async () => {
      try {
        const API_URL = "http://localhost:5230";
        const response = await fetch(`${API_URL}/api/User/isUserBaseEmpty`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check user base');
        }

        const data = await response.json();
        if (data.isEmpty) {
          router.push('/signup');
        }
      } catch (err) {
        console.error('Error checking user base:', err);
      }
    };

    checkUserBase();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const userData = await login(username, password);

    if (userData) {
      setUser({
        name: userData.name,
        id: userData.id,
        role: userData.role,
      });
      router.push('/');
    }
  };

  return (
    <Container component="main" sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper elevation={6} sx={{
        display: 'flex',
        width: '100%',
        maxWidth: 1200,
        height: '626px',
        flexDirection: 'row',
        overflow: 'hidden',
      }}>
        <Box sx={{
          display: 'flex',
          width: '50%',
          backgroundImage: 'url(images/banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50%',
          p: 3,
        }}>
          <Typography component="h1" variant="h4" sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            mb: 2,
          }}>
            Please login
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
