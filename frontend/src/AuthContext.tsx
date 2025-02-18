import * as React from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      if (response.status === 200) {
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:3000/api/auth/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuthenticated(false);
    }
  };

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};