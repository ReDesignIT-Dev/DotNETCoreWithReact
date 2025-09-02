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

// Add this interface or update your existing one
interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  imagesToDelete?: number[];
  newImages?: File[];
  imagePositions?: { id: number; position: number }[]; // Add this for existing image position updates
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

  // Convert existing product images to gallery format matching ImageItem interface
  const existingImages: ImageItem[] = React.useMemo(() => {
    return product?.images?.map(image => ({
      id: image.id,
      url: image.url,
      preview: image.thumbnailUrl, // Use thumbnail for preview
      altText: undefined,
      position: image.position ?? undefined,
      name: `Image ${image.id}`,
      size: undefined
    })) || [];
  }, [product?.images]);

  // Convert new images to gallery format matching ImageItem interface  
  const newGalleryImages: ImageItem[] = React.useMemo(() => {
    return newImageFiles.map(file => ({
      id: file.id,
      url: undefined, // New files don't have URLs yet
      preview: file.preview,
      altText: undefined,
      position: file.position,
      name: file.name,
      size: file.size
    }));
  }, [newImageFiles]);

  // Combine existing and new images into one array for display
  const allImages: ImageItem[] = React.useMemo(() => {
    const existing = existingImages
      .filter(img => !formData.imagesToDelete?.includes(Number(img.id)))
      .sort((a, b) => (a.position || 0) - (b.position || 0));
      
    const newImages = newGalleryImages
      .sort((a, b) => (a.position || 0) - (b.position || 0));
      
    return [...existing, ...newImages].map((img, index) => ({
      ...img,
      position: index + 1 // Ensure sequential positions
    }));
  }, [existingImages, newGalleryImages, formData.imagesToDelete]);

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
    // Calculate current total images count (existing + new, excluding deleted)
    const currentExistingCount = product?.images?.filter(img => 
      !formData.imagesToDelete?.includes(img.id)
    ).length || 0;
    const currentNewCount = newImageFiles.length;
    const totalCurrentImages = currentExistingCount + currentNewCount;

    const newFiles = acceptedFiles.map((file, index) => {
      const imageFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: `new-${Date.now()}-${index}`,
        position: totalCurrentImages + index + 1,
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
        // Sort new images by position before sending
        const sortedNewImages = [...newImageFiles].sort((a, b) => a.position - b.position);
        updateData.newImages = sortedNewImages.map(img => img as File);
      }
      if (modifiedFields.has('imagePositions')) {
        // Get the current positions of existing images from the allImages array
        const existingImagePositions = allImages
          .filter(img => !img.id.toString().startsWith('new-') && !formData.imagesToDelete?.includes(Number(img.id)))
          .map(img => ({
            id: Number(img.id),
            position: img.position || 1
          }));
        
        if (existingImagePositions.length > 0) {
          updateData.imagePositions = existingImagePositions;
        }
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

    // Create a working copy of all images with their current state
    const workingImages = [...allImages];
    
    // Perform the reorder
    const [reorderedItem] = workingImages.splice(sourceIndex, 1);
    workingImages.splice(destinationIndex, 0, reorderedItem);

    // Update positions for all images in the reordered array
    const updatedImages = workingImages.map((img, index) => ({
      ...img,
      position: index + 1
    }));

    // Separate new images and existing images after reorder
    const updatedNewImages: ImageFile[] = [];
    const updatedExistingImages: ImageItem[] = [];
    
    updatedImages.forEach((img, index) => {
      if (img.id.toString().startsWith('new-')) {
        // Find the original file object and update it
        const originalFile = newImageFiles.find(f => f.id === img.id);
        if (originalFile) {
          const updatedFile = Object.assign(originalFile, {
            position: index + 1
          }) as ImageFile;
          updatedNewImages.push(updatedFile);
        }
      } else {
        // This is an existing image
        updatedExistingImages.push({
          ...img,
          position: index + 1
        });
      }
    });

    // Update new image files state
    setNewImageFiles(updatedNewImages);
    handleFieldChange('newImages', updatedNewImages.map(img => img as File));
    
    // Check if any existing images have changed positions
    const hasExistingImagePositionChanges = updatedExistingImages.some(updatedImg => {
      const originalImg = existingImages.find(orig => orig.id === updatedImg.id);
      return originalImg && originalImg.position !== updatedImg.position;
    });

    // Only mark imagePositions as modified if existing images actually moved
    if (hasExistingImagePositionChanges) {
      setModifiedFields(prev => new Set(prev).add('imagePositions'));
    }

    // Also mark newImages as modified since we're changing their positions
    if (updatedNewImages.length > 0) {
      setModifiedFields(prev => new Set(prev).add('newImages'));
    }
  };

  // NOW the conditional returns can happen after all hooks are called
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
                // Check if it's a new image or existing image
                const isNewImage = newGalleryImages.some(img => img.id === id);
                if (isNewImage) {
                  removeNewImage(id);
                } else {
                  handleImageDelete(id);
                }
              }}
              onRestore={handleImageRestore}
              markedForDeletion={formData.imagesToDelete || []}
              title={`All Images (${existingImages.length} existing, ${newGalleryImages.length} new)`}
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