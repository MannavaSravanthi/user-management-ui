// hooks/use-login.ts
import { useState } from 'react';
import Cookies from 'js-cookie';

interface LoginResponse {
  token: string;
  name: string;
  id: number;
  role: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`http://localhost:5230/api/User/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data: LoginResponse = await response.json();
      Cookies.set('authToken', data.token, { expires: 1 });
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
