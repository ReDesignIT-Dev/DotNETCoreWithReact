import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { addProduct } from "services/shopServices/apiRequestsShop";
import { selectFlatCategories } from "reduxComponents/reduxShop/Categories/selectors";
import { 
  NameField, 
  PriceField, 
  DescriptionField, 
  CategorySelector, 
  ImageUploadDropzone,
  ImageGallery 
} from "components/Admin/FormFields";
import { FRONTEND_ADMIN_PRODUCTS_URL } from "config";

interface ImageFile extends File {
  preview: string;
  id: string;
  position: number;
}

export const ProductAdd = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [productSummary, setProductSummary] = useState<CreateProductRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const categories = useSelector(selectFlatCategories);

  // Get the first available category ID, or null if none available
  const defaultCategoryId = categories.length > 0 ? categories[0].id : null;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    defaultValues: {
      categoryId: defaultCategoryId || 0, // Use 0 as fallback if no categories
      price: 1,
      name: "",
      description: "",
      images: [],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImageFiles = acceptedFiles.map((file, index) => {
      const imageFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${index}`,
        position: imageFiles.length + index + 1,
      }) as ImageFile;
      return imageFile;
    });

    setImageFiles(prev => {
      const updated = [...prev, ...newImageFiles];
      setValue("images", updated.map(img => img as File));
      return updated;
    });
  }, [imageFiles.length, setValue]);

  const removeImage = (imageId: string | number) => {
    setImageFiles(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      const updated = filtered.map((img, index) => ({
        ...img,
        position: index + 1
      }));
      
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      setValue("images", updated.map(img => img as File));
      return updated;
    });
  };

  // Convert imageFiles to format expected by ImageGallery
  const galleryImages = imageFiles.map(file => ({
    id: file.id,
    preview: file.preview,
    name: file.name,
    size: file.size,
    position: file.position
  }));

  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  const onSubmit = async (data: CreateProductRequest) => {
    setLoading(true);

    const sortedImages = imageFiles.sort((a, b) => a.position - b.position);
    
    const productData: CreateProductRequest = {
      name: data.name,
      categoryId: data.categoryId,
      description: data.description || "",
      price: data.price,
      images: sortedImages.map(file => file as File)
    };

    try {
      const response = await addProduct(productData);  
      if (response && response.status === 201) {
        setSubmitted(true);
        setSnackbarOpen(true);
        setProductSummary(data);
        
        imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setImageFiles([]);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setImageFiles([]);
    
    reset({
      name: "",
      categoryId: defaultCategoryId || 0,
      description: "",
      price: 1,
      images: [],
    });
    setSubmitted(false);
    setProductSummary(null);
  };

  const handleGoToProducts = () => {
    imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    navigate(FRONTEND_ADMIN_PRODUCTS_URL);
  };

  const handleCancel = () => {
    imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    navigate(FRONTEND_ADMIN_PRODUCTS_URL);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add Product
      </Typography>

      {submitted ? (
        <>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
              Product added successfully!
            </Alert>
          </Snackbar>

          {/* Summary Display */}
          {productSummary && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6">Summary</Typography>
                <Typography>
                  <strong>Name:</strong> {productSummary.name}
                </Typography>
                <Typography>
                  <strong>Category:</strong> {productSummary.categoryId}
                </Typography>
                <Typography>
                  <strong>Description:</strong> {productSummary.description}
                </Typography>
                <Typography>
                  <strong>Price:</strong> ${productSummary.price}
                </Typography>
                <Typography>
                  <strong>Images:</strong> {productSummary.images?.length ?? 0} file(s)
                </Typography>
              </CardContent>
            </Card>
          )}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddAnother}
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Another Product
          </Button>
          <Button variant="outlined" onClick={handleGoToProducts} fullWidth sx={{ mt: 2 }}>
            Back to Products
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <NameField
                value={field.value}
                onChange={field.onChange}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <CategorySelector
                value={field.value}
                onChange={(value) => field.onChange(value || 1)}
                categories={categories}
                allowEmpty={false}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <DescriptionField
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            rules={{ required: "Price is required", min: { value: 0.01, message: "Price must be greater than 0" } }}
            render={({ field }) => (
              <PriceField
                value={field.value}
                onChange={field.onChange}
                error={errors.price?.message}
              />
            )}
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            
            <ImageUploadDropzone onDrop={onDrop} />

            <Box sx={{ mt: 2 }}>
              <ImageGallery
                images={galleryImages}
                onReorder={(result) => {
                  // Handle the reorder using the result format from ImageGallery
                  const sourceIndex = result.source.index;
                  const destinationIndex = result.destination.index;
                  
                  const newOrder = [...imageFiles];
                  const [reorderedItem] = newOrder.splice(sourceIndex, 1);
                  newOrder.splice(destinationIndex, 0, reorderedItem);
                  
                  const updated = newOrder.map((item, index) => ({
                    ...item,
                    position: index + 1
                  }));
                  
                  setImageFiles(updated);
                  setValue("images", updated.map(img => img as File));
                }}
                onRemove={removeImage}
                title="Selected Images"
                showDragHandle={true}
                showPosition={true}
                showFileInfo={true}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </form>
      )}
    </Container>
  );
};