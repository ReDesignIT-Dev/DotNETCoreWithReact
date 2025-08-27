import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getProduct, updateProduct } from 'services/shopServices/apiRequestsShop';
import { selectFlatCategories } from 'reduxComponents/reduxShop/Categories/selectors';
import { 
  NameField, 
  PriceField, 
  DescriptionField, 
  CategorySelector, 
  ImageUploadDropzone,
  ImageGallery 
} from 'components/Admin/FormFields';

interface ProductUpdateProps {
  productId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ImageFile extends File {
  preview: string;
  id: string;
  position: number;
}

export const ProductUpdate: React.FC<ProductUpdateProps> = ({ productId, onSuccess, onCancel }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string; description?: string }>({});
  
  const categories = useSelector(selectFlatCategories);

  // Form state
  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    imagesToDelete: [],
    newImages: []
  });

  const [originalData, setOriginalData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    imagesToDelete: [],
    newImages: []
  });

  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [newImageFiles, setNewImageFiles] = useState<ImageFile[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProduct(productId);
        
        if (response?.data) {
          const productData: Product = response.data;
          setProduct(productData);
          const initialData: UpdateProductRequest = {
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

  const handleFieldChange = (field: keyof UpdateProductRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Track if this field has been modified from original
    const isModified = JSON.stringify(value) !== JSON.stringify(originalData[field]);
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

  const handleImageDelete = (imageId: string | number) => {
    const numericId = typeof imageId === 'string' ? parseInt(imageId, 10) : imageId;
    const newImagesToDelete = [...(formData.imagesToDelete || []), numericId];
    handleFieldChange('imagesToDelete', newImagesToDelete);
  };

  const handleImageRestore = (imageId: string | number) => {
    const newImagesToDelete = (formData.imagesToDelete || []).filter(id => id !== Number(imageId));
    handleFieldChange('imagesToDelete', newImagesToDelete);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newImageFiles = acceptedFiles.map((file, index) => {
      const imageFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: `new-${Date.now()}-${index}`,
        position: newImageFiles.length + index + 1,
      }) as ImageFile;
      return imageFile;
    });

    setNewImageFiles(prev => {
      const updated = [...prev, ...newImageFiles];
      handleFieldChange('newImages', updated.map(img => img as File));
      return updated;
    });
  };

  const removeNewImage = (imageId: string | number) => {
    setNewImageFiles(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      const updated = filtered.map((img, index) => ({
        ...img,
        position: index + 1
      }));
      
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      handleFieldChange('newImages', updated.map(img => img as File));
      return updated;
    });
  };

  const validate = () => {
    const errors: { name?: string; price?: string; description?: string } = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
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
      
      // Build the update request with only modified fields
      const updateData: UpdateProductRequest = {};
      
      if (modifiedFields.has('name')) {
        updateData.name = formData.name?.trim();
      }
      if (modifiedFields.has('description')) {
        updateData.description = formData.description?.trim();
      }
      if (modifiedFields.has('price')) {
        updateData.price = formData.price;
      }
      if (modifiedFields.has('categoryId')) {
        updateData.categoryId = formData.categoryId;
      }
      if (modifiedFields.has('imagesToDelete') && formData.imagesToDelete && formData.imagesToDelete.length > 0) {
        updateData.imagesToDelete = formData.imagesToDelete;
      }
      if (modifiedFields.has('newImages') && formData.newImages && formData.newImages.length > 0) {
        updateData.newImages = formData.newImages;
      }
      
      const response = await updateProduct(productId, updateData);
      
      if (response?.status === 204) {
        // Clean up new image previews
        newImageFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setNewImageFiles([]);
        
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      newImageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

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

  // Convert existing product images to gallery format
  const existingImages = product.images?.map(image => ({
    id: image.id,
    url: image.url,
    preview: image.url, // Add this line - use url as preview for existing images
    altText: image.altText || undefined,
    position: image.position || undefined,
    name: `Image ${image.id}`,
    size: undefined
  })) || [];

  // Convert new images to gallery format
  const newGalleryImages = newImageFiles.map(file => ({
    id: file.id,
    preview: file.preview,
    name: file.name,
    size: file.size,
    position: file.position
  }));

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

      <NameField
        value={formData.name || ''}
        onChange={(value) => handleFieldChange('name', value)}
        error={formErrors.name}
        disabled={saving}
      />

      <CategorySelector
        value={formData.categoryId || null}
        onChange={(value) => handleFieldChange('categoryId', value)}
        categories={categories}
        disabled={saving}
        allowEmpty={false}
      />

      <PriceField
        value={formData.price || 0}
        onChange={(value) => handleFieldChange('price', value)}
        error={formErrors.price}
        disabled={saving}
      />

      <DescriptionField
        value={formData.description || ''}
        onChange={(value) => handleFieldChange('description', value)}
        error={formErrors.description}
        disabled={saving}
      />

      {/* Current Images Section */}
      {existingImages.length > 0 && (
        <Box mt={3} mb={2}>
          <ImageGallery
            images={existingImages}
            onRemove={handleImageDelete}
            onRestore={handleImageRestore}
            markedForDeletion={formData.imagesToDelete || []}
            title="Current Images"
            showDragHandle={false}
            showPosition={true}
            showFileInfo={false}
            disabled={saving}
          />
        </Box>
      )}

      {/* New Images Section */}
      <Box mt={3} mb={2}>
        <Typography variant="h6" mb={2}>Add New Images</Typography>
        
        <ImageUploadDropzone
          onDrop={onDrop}
          disabled={saving}
          multiple={true}
        />

        {newGalleryImages.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <ImageGallery
              images={newGalleryImages}
              onRemove={removeNewImage}
              title="New Images to be Added"
              showDragHandle={false}
              showPosition={true}
              showFileInfo={true}
              disabled={saving}
            />
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