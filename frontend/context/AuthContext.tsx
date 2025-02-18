import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthContextType } from './types';
import { useNavigate } from 'react-router-dom';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user data from your authentication endpoint
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from local storage
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get<User>(`${apiBaseUrl}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
        setUser(response.data as User);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // fetchUser();
  }, []);

  const logout = async () => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    if (!token) {
      console.error('No token found');
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }

    try {
      // await axios.post('${apiBaseUrl}/api/auth/logout', {}, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};