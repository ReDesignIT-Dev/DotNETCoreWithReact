import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  SHOP_ADMIN_PANEL_URL,
  FRONTEND_SHOP_ADMIN_CATEGORIES_URL, 
  FRONTEND_SHOP_ADMIN_PANEL_URL, 
  FRONTEND_SHOP_ADMIN_PRODUCTS_URL,
  FRONTEND_SHOP_ADMIN_USERS_URL,
  FRONTEND_SHOP_ADMIN_REPORTS_URL
} from 'config';

export const ShopAdminNavigation: React.FC = () => {
  
  const isActive = (path: string) => {
    if (path === '') {
      return location.pathname.endsWith(SHOP_ADMIN_PANEL_URL);
    }
    return location.pathname.includes(path);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          to={FRONTEND_SHOP_ADMIN_PANEL_URL}
          variant={isActive('') ? 'contained' : 'outlined'}
          color="primary"
        >
          Dashboard
        </Button>
        <Button
          component={Link}
          to={FRONTEND_SHOP_ADMIN_PRODUCTS_URL}
          variant={isActive('products') ? 'contained' : 'outlined'}
          color="primary"
        >
          Products
        </Button>
        <Button
          component={Link}
          to={FRONTEND_SHOP_ADMIN_CATEGORIES_URL}
          variant={isActive('categories') ? 'contained' : 'outlined'}
          color="primary"
        >
          Categories
        </Button>
        <Button
          component={Link}
          to={FRONTEND_SHOP_ADMIN_USERS_URL}
          variant={isActive('users') ? 'contained' : 'outlined'}
          color="primary"
        >
          Users
        </Button>
        <Button
          component={Link}
          to={FRONTEND_SHOP_ADMIN_REPORTS_URL}
          variant={isActive('reports') ? 'contained' : 'outlined'}
          color="primary"
        >
          Reports
        </Button>
      </Box>
    </Paper>
  );
};