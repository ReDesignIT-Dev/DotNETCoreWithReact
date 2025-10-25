import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import { isUserAdmin, isTokenValid } from 'utils/cookies';
import { Box, Alert, Typography } from '@mui/material';
import { FRONTEND_LOGIN_URL } from 'config'

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const isLoggedIn = useAuth();
  const location = useLocation();

  // Check if user is logged in
  if (!isLoggedIn || !isTokenValid()) {
      return <Navigate to={FRONTEND_LOGIN_URL} state={{ from: location }} replace />;
  }

  // Check if user has admin privileges
  if (!isUserAdmin()) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          px: 2
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            {'You don\'t have administrator privileges to access this page. Please contact your system administrator if you believe this is an error.'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};