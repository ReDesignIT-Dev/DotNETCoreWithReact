import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ADMIN_PANEL_URL, FRONTEND_ADMIN_CATEGORIES_URL, FRONTEND_ADMIN_PANEL_URL, FRONTEND_ADMIN_PRODUCTS_URL } from 'config';

export const AdminNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '') {
      return location.pathname.endsWith(ADMIN_PANEL_URL);
    }
    return location.pathname.includes(path);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          to={FRONTEND_ADMIN_PANEL_URL}
          variant={isActive('') ? 'contained' : 'outlined'}
          color="primary"
        >
          Home
        </Button>
        <Button
          component={Link}
          to={FRONTEND_ADMIN_PRODUCTS_URL}
          variant={isActive('products') ? 'contained' : 'outlined'}
          color="primary"
        >
          Products
        </Button>
        <Button
          component={Link}
          to={FRONTEND_ADMIN_CATEGORIES_URL}
          variant={isActive('categories') ? 'contained' : 'outlined'}
          color="primary"
        >
          Categories
        </Button>
      </Box>
    </Paper>
  );
};