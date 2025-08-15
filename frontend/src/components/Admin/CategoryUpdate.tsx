import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Card, CardMedia, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getCategory, updateCategory } from 'services/shopServices/apiRequestsShop';
import { useSelector } from 'react-redux';
import { selectTreeCategories } from 'reduxComponents/reduxShop/Categories/selectors';

interface CategoryUpdateProps {
  categoryId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CategoryUpdate: React.FC<CategoryUpdateProps> = ({ categoryId, onSuccess, onCancel }) => {
  const categories = useSelector(selectTreeCategories);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; shortName?: string }>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    parentId: null as number | null,
    newImage: null as File | null,
    removeCurrentImage: false
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    shortName: '',
    parentId: null as number | null,
    newImage: null as File | null,
    removeCurrentImage: false
  });

  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCategory(categoryId);
        
        if (response?.data) {
          const categoryData = response.data;
          setCategory(categoryData);
          const initialData = {
            name: categoryData.name || '',
            shortName: categoryData.shortName || '',
            parentId: categoryData.parentId || null,
            newImage: null,
            removeCurrentImage: false
          };
          setFormData(initialData);
          setOriginalData(initialData);
          setModifiedFields(new Set());
        } else {
          setError('Failed to load category');
        }
      } catch (err) {
        setError('Error loading category');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleChange = (field: string, value: string | number | null | File | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Track if this field has been modified from original
    const isModified = value !== originalData[field as keyof typeof originalData];
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleChange('newImage', file);
    // If adding new image, don't remove current
    if (file) {
      handleChange('removeCurrentImage', false);
    }
  };

  const handleRemoveCurrentImage = () => {
    handleChange('removeCurrentImage', true);
    handleChange('newImage', null);
  };

  const validate = () => {
    const errors: { name?: string; shortName?: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.shortName.trim()) {
      errors.shortName = 'Short name is required';
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
      
      // Check if we need to send FormData (for image operations) or JSON
      const hasImageChanges = modifiedFields.has('newImage') || modifiedFields.has('removeCurrentImage');
      
      if (hasImageChanges) {
        // Use FormData for image operations
        const updateData = new FormData();
        
        // Always include required fields when using FormData
        updateData.append('name', formData.name.trim());
        updateData.append('shortName', formData.shortName.trim());
        
        if (formData.parentId !== null) {
          updateData.append('parentId', formData.parentId.toString());
        }
        
        if (formData.newImage) {
          updateData.append('image', formData.newImage);
        }
        
        if (formData.removeCurrentImage) {
          updateData.append('removeImage', 'true');
        }
        
        const response = await updateCategory(categoryId, updateData);
        
        if (response?.status === 204) {
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError('Failed to update category');
        }
      } else {
        // Use JSON for text-only updates
        const updateData: any = {};
        
        if (modifiedFields.has('name')) {
          updateData.name = formData.name.trim();
        }
        if (modifiedFields.has('shortName')) {
          updateData.shortName = formData.shortName.trim();
        }
        if (modifiedFields.has('parentId')) {
          updateData.parentId = formData.parentId;
        }
        
        // You'll need to create a JSON version of updateCategory
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (response.status === 204) {
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError('Failed to update category');
        }
      }
    } catch (err) {
      setError('Error updating category');
      console.error('Error updating category:', err);
    } finally {
      setSaving(false);
    }
  };

  // Flatten categories for parent selection (exclude self and children)
  const flattenCategories = (cats: any[], level = 0, excludeId?: number): any[] => {
    const result: any[] = [];
    cats.forEach(cat => {
      if (cat.id !== excludeId) {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          result.push(...flattenCategories(cat.children, level + 1, excludeId));
        }
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories, 0, categoryId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography ml={2}>Loading category...</Typography>
      </Box>
    );
  }

  if (error && !category) {
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

  if (!category) {
    return (
      <Box>
        <Typography>Category not found.</Typography>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ mt: 2 }}>
            Back
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Typography variant="h5" mb={3}>
        Update Category
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Category Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        margin="normal"
        required
        disabled={saving}
        error={!!formErrors.name}
        helperText={formErrors.name || "Letters, digits, spaces, and hyphens only"}
      />

      <TextField
        fullWidth
        label="Short Name"
        value={formData.shortName}
        onChange={(e) => handleChange('shortName', e.target.value)}
        margin="normal"
        required
        disabled={saving}
        error={!!formErrors.shortName}
        helperText={formErrors.shortName || "Brief identifier for the category"}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Parent Category (Optional)</InputLabel>
        <Select
          value={formData.parentId || ""}
          onChange={(e) => handleChange('parentId', e.target.value || null)}
          disabled={saving}
        >
          <MenuItem value="">
            <em>None (Top Level Category)</em>
          </MenuItem>
          {flatCategories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {"—".repeat(cat.level)} {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Current Image Section */}
      {category.image && !formData.removeCurrentImage && (
        <Box mt={2} mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Current Image
          </Typography>
          <Card sx={{ maxWidth: 200, position: 'relative' }}>
            <CardMedia
              component="img"
              height="120"
              image={category.image.url}
              alt={category.name}
            />
            <IconButton
              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
              onClick={handleRemoveCurrentImage}
              disabled={saving}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Card>
        </Box>
      )}

      {/* New Image Upload */}
      <Box mt={2} mb={2}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {category.image && !formData.removeCurrentImage ? 'Replace Image (Optional)' : 'Category Image (Optional)'}
        </Typography>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={saving}
          style={{ width: '100%' }}
        />
        {formData.newImage && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            New image selected: {formData.newImage.name}
          </Typography>
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
          {saving ? "Updating..." : "Update Category"}
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