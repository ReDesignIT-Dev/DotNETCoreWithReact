import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { 
  MAIN_ADMIN_PANEL_URL,
  FRONTEND_MAIN_ADMIN_PANEL_URL, 
  FRONTEND_MAIN_ADMIN_PROJECTS_URL,
  FRONTEND_MAIN_ADMIN_SETTINGS_URL,
  FRONTEND_MAIN_ADMIN_ANALYTICS_URL
} from 'config';

export const MainAdminNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '') {
      return location.pathname === MAIN_ADMIN_PANEL_URL;
    }
    return location.pathname.includes(path);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          to={FRONTEND_MAIN_ADMIN_PANEL_URL}
          variant={isActive('') ? 'contained' : 'outlined'}
          color="primary"
        >
          Dashboard
        </Button>
        <Button
          component={Link}
          to={FRONTEND_MAIN_ADMIN_PROJECTS_URL}
          variant={isActive('projects') ? 'contained' : 'outlined'}
          color="primary"
        >
          Projects
        </Button>
        <Button
          component={Link}
          to={FRONTEND_MAIN_ADMIN_SETTINGS_URL}
          variant={isActive('settings') ? 'contained' : 'outlined'}
          color="primary"
        >
          Settings
        </Button>
        <Button
          component={Link}
          to={FRONTEND_MAIN_ADMIN_ANALYTICS_URL}
          variant={isActive('analytics') ? 'contained' : 'outlined'}
          color="primary"
        >
          Analytics
        </Button>
      </Box>
    </Paper>
  );
};