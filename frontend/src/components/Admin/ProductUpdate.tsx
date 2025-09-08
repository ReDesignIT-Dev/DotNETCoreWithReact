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

export const ProductUpdate: React.FC<ProductUpdateProps> = ({ productId, onSuccess, onCancel }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string; description?: string }>({});
  
  const categories = useSelector(selectFlatCategories);

  // Form state - using the new simplified approach
  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    currentImages: {}, // NEW: Track existing images and their positions
    newImages: []
  });

  const [originalData, setOriginalData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    currentImages: {},
    newImages: []
  });

  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [newImageFiles, setNewImageFiles] = useState<ImageFile[]>([]);

  // Convert existing product images to gallery format
  const existingImages: ImageItem[] = React.useMemo(() => {
    return product?.images?.map(image => ({
      id: image.id,
      url: image.url,
      preview: image.thumbnailUrl,
      altText: undefined,
      position: image.position ?? undefined,
      name: `Image ${image.id}`,
      size: undefined
    })) || [];
  }, [product?.images]);

  // Convert new images to gallery format  
  const newGalleryImages: ImageItem[] = React.useMemo(() => {
    return newImageFiles.map(file => ({
      id: file.id,
      url: undefined,
      preview: file.preview,
      altText: undefined,
      position: file.position,
      name: file.name,
      size: file.size
    }));
  }, [newImageFiles]);

  // Combine existing and new images with current positions
  const allImages: ImageItem[] = React.useMemo(() => {
    // Get existing images that are still current (in currentImages)
    const existing = existingImages
      .filter(img => formData.currentImages && img.id in formData.currentImages)
      .map(img => {
        // Debug: Log what we're getting
        console.log('Image ID:', img.id, 'Current position in formData:', formData.currentImages?.[img.id], 'Original position:', img.position);
        
        return {
          ...img,
          position: formData.currentImages?.[img.id] ?? img.position ?? 1
        };
      });
    
    const newImages = newGalleryImages;
    
    // Combine and sort by position
    const combinedImages = [...existing, ...newImages];
    
    // Debug: Log final combined images
    console.log('Combined images:', combinedImages.map(img => ({ id: img.id, position: img.position })));
    
    return combinedImages.sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [existingImages, newGalleryImages, formData.currentImages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      newImageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [newImageFiles]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProduct(productId);
        
        if (response?.data) {
          const productData: Product = response.data;
          setProduct(productData);
          
          // Initialize currentImages with existing image positions - PRESERVE original positions or assign sequential ones
          const currentImages: Record<number, number> = {};
          productData.images?.forEach((img, index) => {
            // If position is 0 or null/undefined, assign sequential positions starting from 1
            currentImages[img.id] = (img.position !== null && img.position !== undefined && img.position > 0) 
              ? img.position 
              : index + 1;
          });
          
          console.log('Initial currentImages:', currentImages); // Debug log
          
          const initialData: UpdateProductRequest = {
            name: productData.name || '',
            description: productData.description || '',
            price: Number(productData.price) || 0,
            categoryId: productData.categoryId || 1,
            currentImages,
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

  // NEW: Handle image deletion by removing from currentImages
  const handleImageDelete = (imageId: string | number) => {
    const numericId = Number(imageId);
    const updatedCurrentImages = { ...formData.currentImages };
    delete updatedCurrentImages[numericId];
    handleFieldChange('currentImages', updatedCurrentImages);
  };

  // NEW: Handle image restoration by adding back to currentImages
  const handleImageRestore = (imageId: string | number) => {
    const numericId = Number(imageId);
    const originalImage = existingImages.find(img => img.id === numericId);
    if (originalImage) {
      // Find what position this image should have
      const originalProduct = product?.images?.find(img => img.id === numericId);
      const originalIndex = product?.images?.findIndex(img => img.id === numericId) ?? 0;
      
      const restorePosition = (originalProduct?.position !== null && 
                              originalProduct?.position !== undefined && 
                              originalProduct?.position > 0) 
        ? originalProduct.position 
        : originalIndex + 1;
      
      const updatedCurrentImages = {
        ...formData.currentImages,
        [numericId]: restorePosition
      };
      handleFieldChange('currentImages', updatedCurrentImages);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    // Get the highest position from current allImages
    const maxPosition = allImages.length > 0 ? Math.max(...allImages.map(img => img.position || 0)) : 0;

    const newFiles = acceptedFiles.map((file, index) => {
      const imageFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Date.now() * 1000 + index, // Multiply by 1000 to ensure unique IDs
        position: maxPosition + index + 1, // This should give sequential positions
      }) as ImageFile;
      return imageFile;
    });

    setNewImageFiles(prev => {
      const updated = [...prev, ...newFiles];
      handleFieldChange('newImages', updated.map(img => img as File));
      return updated;
    });
  };

  const removeNewImage = (imageId: string | number) => {
    setNewImageFiles(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      handleFieldChange('newImages', filtered.map(img => img as File));
      return filtered;
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
      if (modifiedFields.has('currentImages')) {
        updateData.currentImages = formData.currentImages;
      }
      if (modifiedFields.has('newImages') && formData.newImages && formData.newImages.length > 0) {
        // Sort new images by position before sending
        const sortedNewImages = [...newImageFiles].sort((a, b) => a.position - b.position);
        updateData.newImages = sortedNewImages.map(img => img as File);
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

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Create a working copy of all images
    const workingImages = [...allImages];
    
    // Perform the reorder
    const [reorderedItem] = workingImages.splice(sourceIndex, 1);
    workingImages.splice(destinationIndex, 0, reorderedItem);

    // Update positions for all images (sequential 1, 2, 3...)
    const updatedImages = workingImages.map((img, index) => ({
      ...img,
      position: index + 1
    }));

    // Separate and update both new images and current images
    const updatedNewImages: ImageFile[] = [];
    const updatedCurrentImages: Record<number, number> = {};
    
    updatedImages.forEach((img) => {
      // Check if this is a new image by looking in newImageFiles array
      const isNewImage = newImageFiles.some(f => f.id === img.id);
      
      if (isNewImage) {
        // Update new image position
        const originalFile = newImageFiles.find(f => f.id === img.id);
        if (originalFile) {
          const updatedFile = Object.assign(originalFile, {
            position: img.position
          }) as ImageFile;
          updatedNewImages.push(updatedFile);
        }
      } else {
        // Update existing image position in currentImages
        updatedCurrentImages[Number(img.id)] = img.position || 1;
      }
    });

    // Add any new images that weren't in the visible list
    newImageFiles.forEach(file => {
      if (!updatedNewImages.find(updated => updated.id === file.id)) {
        updatedNewImages.push(file);
      }
    });

    // Update states
    setNewImageFiles(updatedNewImages);
    handleFieldChange('currentImages', updatedCurrentImages);
    handleFieldChange('newImages', updatedNewImages.map(img => img as File));
  };

  // Conditional returns after all hooks
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

  // Check which images are marked for deletion (not in currentImages)
  const markedForDeletion = existingImages
    .filter(img => !formData.currentImages || !(img.id in formData.currentImages))
    .map(img => Number(img.id));

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

      {/* Combined Images Section */}
      <Box mt={3} mb={2}>
        <Typography variant="h6" mb={2}>Product Images</Typography>
        
        <ImageUploadDropzone
          onDrop={onDrop}
          disabled={saving}
          multiple={true}
        />

        {allImages.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <ImageGallery
              images={allImages}
              onReorder={handleOnDragEnd}
              onRemove={(id) => {
                const isNewImage = newGalleryImages.some(img => img.id === id);
                if (isNewImage) {
                  removeNewImage(id);
                } else {
                  handleImageDelete(id);
                }
              }}
              onRestore={handleImageRestore}
              markedForDeletion={markedForDeletion}
              title={`All Images (${Object.keys(formData.currentImages || {}).length} existing, ${newGalleryImages.length} new)`}
              showDragHandle={true}
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