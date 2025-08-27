import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export const AdminNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '') {
      // Home is active only when we're exactly at admin-panel
      return location.pathname.endsWith('/admin-panel');
    }
    return location.pathname.includes(path);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          to="/shop/admin-panel"
          variant={isActive('') ? 'contained' : 'outlined'}
          color="primary"
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/shop/admin-panel/products"
          variant={isActive('products') ? 'contained' : 'outlined'}
          color="primary"
        >
          Products
        </Button>
        <Button
          component={Link}
          to="/shop/admin-panel/categories"
          variant={isActive('categories') ? 'contained' : 'outlined'}
          color="primary"
        >
          Categories
        </Button>
      </Box>
    </Paper>
  );
};