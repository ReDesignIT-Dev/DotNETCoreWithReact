import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CategoryUpdate } from './CategoryUpdate';
import { Container, Typography, Button, Box } from '@mui/material';

export const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categoryId = id ? parseInt(id, 10) : null;

  if (!categoryId || isNaN(categoryId)) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Invalid category ID
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/categories')}
          sx={{ mt: 2 }}
        >
          Back to Categories
        </Button>
      </Container>
    );
  }

  const handleSuccess = () => {
    navigate('/admin/categories');
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  return (
    <Box>
      <CategoryUpdate 
        categoryId={categoryId} 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Box>
  );
};