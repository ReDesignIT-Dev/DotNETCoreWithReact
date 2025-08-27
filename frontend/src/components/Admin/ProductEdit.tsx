import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductUpdate } from './ProductUpdate';
import { Container, Typography, Button, Box } from '@mui/material';

export const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;

  if (!productId || isNaN(productId)) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Invalid product ID
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const handleSuccess = () => {
    navigate('/admin/products');
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <Box>
      <ProductUpdate 
        productId={productId} 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Box>
  );
};