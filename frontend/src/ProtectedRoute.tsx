import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      setLoading(false);
    };
    verifyAuth();
  }, [checkAuthStatus]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;