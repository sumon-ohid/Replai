import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    verifyAuth();
  }, [checkAuthStatus]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
