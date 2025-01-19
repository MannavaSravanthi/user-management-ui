import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  username: string;
  role: string;
}

interface PaginatedResponse {
  data: User[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export const useUserTable = (page: number, rowsPerPage: number) => {
    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
  
      const authToken = Cookies.get('authToken');
      if (!authToken) {
        setError('Unauthorized: No auth token found');
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(
          `http://localhost:5230/api/User?pageNumber=${page + 1}&pageSize=${rowsPerPage}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
  
        const data: PaginatedResponse = await response.json();
        setUsers(data.data);
        setTotalCount(data.totalCount);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchUsers();
    }, [page, rowsPerPage]);
  
    return { users, totalCount, loading, error, refetch: fetchUsers };
  };
  
export const useDeleteUser = () => {
    const deleteUser = async (userId: number) => {
      const authToken = Cookies.get('authToken');
      if (!authToken) {
        alert('Unauthorized: No auth token found'); // Remove this alert
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5230/api/User/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error deleting user: ${response.statusText}`);
        }
  
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete user');
      }
    };
  
    return { deleteUser };
  };
  
