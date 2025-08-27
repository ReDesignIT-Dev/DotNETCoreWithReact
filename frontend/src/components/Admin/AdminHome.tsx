import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Inventory as ProductsIcon, 
  Category as CategoriesIcon,
  People as UsersIcon,
  Assessment as ReportsIcon 
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from 'reduxComponents/reduxShop/Admin/adminThunks';
import { 
  selectProductsCount, 
  selectCategoriesCount, 
  selectUsersCount, 
  selectAdminIsLoading 
} from 'reduxComponents/reduxShop/Admin/adminSelectors';
import { AppDispatch } from 'reduxComponents/store';

export const AdminHome: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const productsCount = useSelector(selectProductsCount);
  const categoriesCount = useSelector(selectCategoriesCount);
  const usersCount = useSelector(selectUsersCount);
  const loading = useSelector(selectAdminIsLoading);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const adminModules = [
    {
      title: 'Products',
      description: 'Manage your product catalog, add new products, update prices and descriptions',
      icon: <ProductsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      path: 'products',
      color: '#1976d2'
    },
    {
      title: 'Categories',
      description: 'Organize your products into categories, create hierarchical structures',
      icon: <CategoriesIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      path: 'categories',
      color: '#dc004e'
    },
    {
      title: 'Users',
      description: 'Manage user accounts, permissions and customer data',
      icon: <UsersIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      path: 'users',
      color: '#2e7d32',
      disabled: true // Future feature
    },
    {
      title: 'Reports',
      description: 'View sales analytics, product performance and business insights',
      icon: <ReportsIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
      path: 'reports',
      color: '#ed6c02',
      disabled: true // Future feature
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Admin Panel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select a module below to manage your e-commerce platform
      </Typography>

      <Grid container spacing={3}>
        {adminModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.title}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: module.disabled ? 'not-allowed' : 'pointer',
                opacity: module.disabled ? 0.6 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': module.disabled ? {} : {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => !module.disabled && navigate(module.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {module.icon}
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {module.title}
                  {module.disabled && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}(Coming Soon)
                    </Typography>
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {module.description}
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  disabled={module.disabled}
                  sx={{ 
                    backgroundColor: module.disabled ? undefined : module.color,
                    '&:hover': {
                      backgroundColor: module.disabled ? undefined : `${module.color}dd`
                    }
                  }}
                >
                  {module.disabled ? 'Coming Soon' : `Manage ${module.title}`}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Quick Overview
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {loading ? '--' : productsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {loading ? '--' : categoriesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {loading ? '--' : usersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};