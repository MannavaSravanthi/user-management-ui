import { useState } from 'react';
import Cookies from 'js-cookie';

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  password: string;
  username: string;
  role: string;
}

interface CreateUserResponse {
  success: boolean;
  message: string;
}

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5230/api/User', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('authToken') || ''}`,
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        return { success: true, message: 'User created successfully' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error creating user' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (user: CreateUserRequest): Promise<CreateUserResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5230/api/User/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message || 'Signup successful' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error signing up user' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return { createUser, signup, loading, error };
};
