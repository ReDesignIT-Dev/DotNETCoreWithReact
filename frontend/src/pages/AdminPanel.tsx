import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { ProductsPanel } from 'components/Admin/ProductsPanel';
import { ProductAdd } from 'components/Admin/ProductAdd';
import { ProductEdit } from 'components/Admin/ProductEdit';
import { CategoriesPanel } from 'components/Admin/CategoriesPanel';
import { CategoryAdd } from 'components/Admin/CategoryAdd';
import { CategoryEdit } from 'components/Admin/CategoryEdit';
import { AdminNavigation } from 'components/Admin/AdminNavigation';
import { AdminHome } from 'components/Admin/AdminHome';
import { 
  ADMIN_PRODUCTS_PATH,
  ADMIN_PRODUCTS_ADD_PATH,
  ADMIN_PRODUCTS_EDIT_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_CATEGORIES_ADD_PATH,
  ADMIN_CATEGORIES_EDIT_PATH,
  ADMIN_USERS_PATH,
  ADMIN_REPORTS_PATH,
  getProductEditPath,
  getCategoryEditPath,
  getProductAddPath,
  getCategoryAddPath
} from '../config';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate(getProductAddPath()); 
  };

  const handleEditProduct = (id: number) => {
    navigate(getProductEditPath(id)); 
  };

  const handleAddCategory = () => {
    navigate(getCategoryAddPath()); 
  };

  const handleEditCategory = (id: number) => {
    navigate(getCategoryEditPath(id)); 
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        
        <AdminNavigation />

        <Box sx={{ mt: 3 }}>
          <Routes>
            <Route path="" element={<AdminHome />} />
            <Route path={ADMIN_PRODUCTS_PATH} element={<ProductsPanel onAdd={handleAddProduct} onEdit={handleEditProduct} />} />
            <Route path={ADMIN_PRODUCTS_ADD_PATH} element={<ProductAdd />} />
            <Route path={ADMIN_PRODUCTS_EDIT_PATH} element={<ProductEdit />} />
            <Route path={ADMIN_CATEGORIES_PATH} element={<CategoriesPanel onAdd={handleAddCategory} onEdit={handleEditCategory} />} />
            <Route path={ADMIN_CATEGORIES_ADD_PATH} element={<CategoryAdd />} />
            <Route path={ADMIN_CATEGORIES_EDIT_PATH} element={<CategoryEdit />} />
            <Route path={ADMIN_USERS_PATH} element={<div>Users management coming soon...</div>} />
            <Route path={ADMIN_REPORTS_PATH} element={<div>Reports coming soon...</div>} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </Box>
      </Box>
    </Container>
  );
};