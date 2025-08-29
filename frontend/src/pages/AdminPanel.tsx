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

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate('/add');
  };

  const handleEditProduct = (id: number) => {
    navigate(`${id}/edit`);
  };

  const handleAddCategory = () => {
    navigate('/add');
  };

  const handleEditCategory = (id: number) => {
    navigate(`${id}/edit`);
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
            {/* Admin Home - shows when at /admin-panel */}
            <Route path="" element={<AdminHome />} />
            
            {/* Products routes */}
            <Route path="products" element={<ProductsPanel onAdd={handleAddProduct} onEdit={handleEditProduct} />} />
            <Route path="products/add" element={<ProductAdd />} />
            <Route path="products/:id/edit" element={<ProductEdit />} />
            
            {/* Categories routes */}
            <Route path="categories" element={<CategoriesPanel onAdd={handleAddCategory} onEdit={handleEditCategory} />} />
            <Route path="categories/add" element={<CategoryAdd />} />
            <Route path="categories/:id/edit" element={<CategoryEdit />} />
            
            {/* Future routes */}
            <Route path="users" element={<div>Users management coming soon...</div>} />
            <Route path="reports" element={<div>Reports coming soon...</div>} />
            
            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </Box>
      </Box>
    </Container>
  );
};