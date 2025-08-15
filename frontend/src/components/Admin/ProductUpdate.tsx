import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Card, CardMedia, IconButton, Chip } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getProduct, updateProduct } from 'services/shopServices/apiRequestsShop';

interface ProductUpdateProps {
  productId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductUpdate: React.FC<ProductUpdateProps> = ({ productId, onSuccess, onCancel }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string; description?: string }>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    imagesToDelete: [] as number[],
    newImages: [] as File[]
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    imagesToDelete: [] as number[],
    newImages: [] as File[]
  });

  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProduct(productId);
        
        if (response?.data) {
          const productData = response.data;
          setProduct(productData);
          const initialData = {
            name: productData.name || '',
            description: productData.description || '',
            price: Number(productData.price) || 0,
            categoryId: productData.categoryId || 1,
            imagesToDelete: [],
            newImages: []
          };
          setFormData(initialData);
          setOriginalData(initialData);
          setModifiedFields(new Set());
        } else {
          setError('Failed to load product');
        }
      } catch (err) {
        setError('Error loading product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (field: string, value: string | number | number[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Track if this field has been modified from original
    const isModified = JSON.stringify(value) !== JSON.stringify(originalData[field as keyof typeof originalData]);
    setModifiedFields(prev => {
      const newSet = new Set(prev);
      if (isModified) {
        newSet.add(field);
      } else {
        newSet.delete(field);
      }
      return newSet;
    });

    // Clear error for this field
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageDelete = (imageId: number) => {
    const newImagesToDelete = [...formData.imagesToDelete, imageId];
    handleChange('imagesToDelete', newImagesToDelete);
  };

  const handleImageRestore = (imageId: number) => {
    const newImagesToDelete = formData.imagesToDelete.filter(id => id !== imageId);
    handleChange('imagesToDelete', newImagesToDelete);
  };

  const handleNewImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleChange('newImages', [...formData.newImages, ...files]);
  };

  const handleRemoveNewImage = (index: number) => {
    const newImages = formData.newImages.filter((_, i) => i !== index);
    handleChange('newImages', newImages);
  };

  const validate = () => {
    const errors: { name?: string; price?: string; description?: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Price must be a valid positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (modifiedFields.size === 0) {
      setError('No changes detected');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData = new FormData();
      
      // Only append modified fields
      if (modifiedFields.has('name')) {
        updateData.append('name', formData.name.trim());
      }
      if (modifiedFields.has('description')) {
        updateData.append('description', formData.description.trim());
      }
      if (modifiedFields.has('price')) {
        updateData.append('price', formData.price.toString());
      }
      if (modifiedFields.has('categoryId')) {
        updateData.append('categoryId', formData.categoryId.toString());
      }
      
      // Handle image deletions
      if (modifiedFields.has('imagesToDelete') && formData.imagesToDelete.length > 0) {
        formData.imagesToDelete.forEach(imageId => {
          updateData.append('imagesToDelete', imageId.toString());
        });
      }
      
      // Handle new images
      if (modifiedFields.has('newImages') && formData.newImages.length > 0) {
        formData.newImages.forEach(file => {
          updateData.append('newImages', file);
        });
      }
      
      const response = await updateProduct(productId, updateData);
      
      if (response?.status === 204) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography ml={2}>Loading product...</Typography>
      </Box>
    );
  }

  if (error && !product) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ mt: 2 }}>
            Back
          </Button>
        )}
      </Box>
    );
  }

  if (!product) {
    return (
      <Box>
        <Typography>Product not found.</Typography>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ mt: 2 }}>
            Back
          </Button>
        )}
      </Box>
    );
  }

  // Filter current images to show only non-deleted ones
  const currentImages = product.images?.filter(img => !formData.imagesToDelete.includes(img.id)) || [];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h5" mb={3}>
        Update Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Product Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        margin="normal"
        required
        disabled={saving}
        error={!!formErrors.name}
        helperText={formErrors.name}
      />

      <TextField
        fullWidth
        label="Price"
        type="number"
        inputProps={{ step: "0.01", min: "0" }}
        value={formData.price}
        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
        margin="normal"
        required
        disabled={saving}
        error={!!formErrors.price}
        helperText={formErrors.price}
      />

      <TextField
        fullWidth
        label="Description"
        multiline
        rows={4}
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        margin="normal"
        required
        disabled={saving}
        error={!!formErrors.description}
        helperText={formErrors.description}
      />

      {/* Current Images Section */}
      {product.images && product.images.length > 0 && (
        <Box mt={3} mb={2}>
          <Typography variant="h6" mb={2}>Current Images</Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {product.images.map((image) => (
              <Card key={image.id} sx={{ width: 150, position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={image.url}
                  alt={image.altText || 'Product image'}
                  sx={{ 
                    opacity: formData.imagesToDelete.includes(image.id) ? 0.5 : 1,
                    filter: formData.imagesToDelete.includes(image.id) ? 'grayscale(100%)' : 'none'
                  }}
                />
                {formData.imagesToDelete.includes(image.id) ? (
                  <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleImageRestore(image.id)}
                      disabled={saving}
                    >
                      Restore
                    </Button>
                  </Box>
                ) : (
                  <IconButton
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => handleImageDelete(image.id)}
                    disabled={saving}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                {image.position && (
                  <Chip
                    label={`Pos: ${image.position}`}
                    size="small"
                    sx={{ position: 'absolute', bottom: 4, left: 4 }}
                  />
                )}
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* New Images Section */}
      <Box mt={3} mb={2}>
        <Typography variant="h6" mb={2}>Add New Images</Typography>
        
        <Button
          variant="outlined"
          component="label"
          startIcon={<AddIcon />}
          disabled={saving}
          sx={{ mb: 2 }}
        >
          Select Images
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleNewImagesChange}
          />
        </Button>

        {formData.newImages.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              New images to be added:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.newImages.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => handleRemoveNewImage(index)}
                  disabled={saving}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box display="flex" gap={2} mt={3}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving || modifiedFields.size === 0}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? "Updating..." : `Update Product${modifiedFields.size > 0 ? ` (${modifiedFields.size} changes)` : ''}`}
        </Button>

        {onCancel && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};