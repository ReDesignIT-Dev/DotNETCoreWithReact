import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { ProductsPanel } from 'components/Admin/ProductsPanel';
import { ProductAdd } from 'components/Admin/ProductAdd';
import { ProductEdit } from 'components/Admin/ProductEdit';
import { CategoriesPanel } from 'components/Admin/CategoriesPanel';
import { CategoryAdd } from 'components/Admin/CategoryAdd';
import { CategoryEdit } from 'components/Admin/CategoryEdit';
import { ShopAdminNavigation } from 'components/Admin/Shop/ShopAdminNavigation';
import { AdminHome } from 'components/Admin/AdminHome';
import { AdminRoute } from 'components/AdminRoute';
import { 
  SHOP_ADMIN_PRODUCTS_PATH,
  SHOP_ADMIN_PRODUCTS_ADD_PATH,
  SHOP_ADMIN_PRODUCTS_EDIT_PATH,
  SHOP_ADMIN_CATEGORIES_PATH,
  SHOP_ADMIN_CATEGORIES_ADD_PATH,
  SHOP_ADMIN_CATEGORIES_EDIT_PATH,
  SHOP_ADMIN_USERS_PATH,
  SHOP_ADMIN_REPORTS_PATH,
  getShopProductEditPath,
  getShopCategoryEditPath,
  getShopProductAddPath,
  getShopCategoryAddPath
} from '../config';

export const ShopAdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate(getShopProductAddPath()); 
  };

  const handleEditProduct = (id: number) => {
    navigate(getShopProductEditPath(id)); 
  };

  const handleAddCategory = () => {
    navigate(getShopCategoryAddPath()); 
  };

  const handleEditCategory = (id: number) => {
    navigate(getShopCategoryEditPath(id)); 
  };

  return (
    <AdminRoute>
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Shop Admin Panel
          </Typography>
          
          <ShopAdminNavigation />

          <Box sx={{ mt: 3 }}>
            <Routes>
              <Route path="" element={<AdminHome />} />
              <Route path={SHOP_ADMIN_PRODUCTS_PATH} element={<ProductsPanel onAdd={handleAddProduct} onEdit={handleEditProduct} />} />
              <Route path={SHOP_ADMIN_PRODUCTS_ADD_PATH} element={<ProductAdd />} />
              <Route path={SHOP_ADMIN_PRODUCTS_EDIT_PATH} element={<ProductEdit />} />
              <Route path={SHOP_ADMIN_CATEGORIES_PATH} element={<CategoriesPanel onAdd={handleAddCategory} onEdit={handleEditCategory} />} />
              <Route path={SHOP_ADMIN_CATEGORIES_ADD_PATH} element={<CategoryAdd />} />
              <Route path={SHOP_ADMIN_CATEGORIES_EDIT_PATH} element={<CategoryEdit />} />
              <Route path={SHOP_ADMIN_USERS_PATH} element={<div>Users management coming soon...</div>} />
              <Route path={SHOP_ADMIN_REPORTS_PATH} element={<div>Reports coming soon...</div>} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </Box>
        </Box>
      </Container>
    </AdminRoute>
  );
};