import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon, DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { addProduct } from "services/shopServices/apiRequestsShop";
import { selectTreeCategories } from "reduxComponents/reduxShop/Categories/selectors";

interface ImageFile extends File {
  preview: string;
  id: string;
  position: number;
}

interface CreateProductRequest {
  name: string;
  categoryId: number;
  description: string;
  price: number;
  images: File[];
}

export const ProductAdd = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [productSummary, setProductSummary] = useState<CreateProductRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  // Use the selector to get flat categories from the Redux store
  const categories = useSelector(selectTreeCategories);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProductRequest>({
    defaultValues: {
      categoryId: 1,
      price: 1,
      name: "",
      description: "",
      images: [],
    },
  });

  // Dropzone configuration
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
      // Update form value
      setValue("images", updated.map(img => img as File));
      return updated;
    });
  }, [imageFiles.length, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB max file size
  });

  // Handle drag-and-drop reordering
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(imageFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));

    setImageFiles(updatedItems);
    setValue("images", updatedItems.map(img => img as File));
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setImageFiles(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      // Recalculate positions
      const updated = filtered.map((img, index) => ({
        ...img,
        position: index + 1
      }));
      
      // Clean up URL to prevent memory leaks
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      // Update form value
      setValue("images", updated.map(img => img as File));
      return updated;
    });
  };

  // Clean up URLs on component unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  const onSubmit = async (data: CreateProductRequest) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category", String(data.categoryId));
    formData.append("description", data.description || "");
    formData.append("price", String(data.price));

    // Add images in order
    const sortedImages = imageFiles.sort((a, b) => a.position - b.position);
    sortedImages.forEach((file) => {
      formData.append("uploaded_images", file as File);
    });

    try {
      const response = await addProduct(formData);  
      if (response && response.status === 201) {
        setSubmitted(true);
        setSnackbarOpen(true);
        setProductSummary(data);
        
        // Clean up image previews
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
    // Clean up existing previews
    imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setImageFiles([]);
    
    reset({
      name: "",
      categoryId: 1,
      description: "",
      price: 1,
      images: [],
    });
    setSubmitted(false);
    setProductSummary(null);
  };

  const handleGoHome = () => {
    // Clean up previews before navigating
    imageFiles.forEach(file => URL.revokeObjectURL(file.preview));
    navigate("/");
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
          <Button variant="outlined" onClick={handleGoHome} fullWidth sx={{ mt: 2 }}>
            Go Back Home
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            defaultValue={1}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  {...field}
                  labelId="category-select-label"
                  label="Category"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            defaultValue={1}
            rules={{ required: "Price is required", min: { value: 0.01, message: "Price must be greater than 0" } }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Price"
                fullWidth
                margin="normal"
                error={!!errors.price}
                helperText={errors.price?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
                inputProps={{ step: "0.01", min: "0.01" }}
              />
            )}
          />

          {/* Image Upload Section */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            
            {/* Dropzone */}
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              {isDragActive ? (
                <Typography>Drop images here...</Typography>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Drag & drop images here, or click to select
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Accepted formats: JPEG, PNG, GIF, WebP (Max 5MB each)
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Always render DragDropContext - Move it outside the conditional */}
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Box sx={{ mt: 2 }}>
                {imageFiles.length > 0 ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Images ({imageFiles.length}) - Drag to reorder:
                    </Typography>
                    
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <Grid 
                          container 
                          spacing={2}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {imageFiles.map((file, index) => (
                            <Draggable key={file.id} draggableId={file.id} index={index}>
                              {(provided, snapshot) => (
                                <Grid 
                                  item 
                                  xs={6} 
                                  sm={4} 
                                  md={3}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <Card 
                                    sx={{ 
                                      position: 'relative',
                                      transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                      boxShadow: snapshot.isDragging ? 4 : 1,
                                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: 'relative',
                                        paddingTop: '100%', // 1:1 aspect ratio
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <Box
                                        component="img"
                                        src={file.preview}
                                        alt={`Preview ${index + 1}`}
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                      />
                                    
                                      {/* Position indicator */}
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 4,
                                          left: 4,
                                          bgcolor: 'primary.main',
                                          color: 'white',
                                          borderRadius: '50%',
                                          width: 24,
                                          height: 24,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        {index + 1}
                                      </Box>

                                      {/* Drag handle */}
                                      <Box
                                        {...provided.dragHandleProps}
                                        sx={{
                                          position: 'absolute',
                                          top: 4,
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          bgcolor: 'rgba(0,0,0,0.7)',
                                          color: 'white',
                                          borderRadius: 1,
                                          p: 0.5,
                                          cursor: 'grab',
                                          '&:active': {
                                            cursor: 'grabbing'
                                          }
                                        }}
                                      >
                                        <DragIndicatorIcon sx={{ fontSize: 16 }} />
                                      </Box>

                                      {/* Remove button */}
                                      <IconButton
                                        size="small"
                                        onClick={() => removeImage(file.id)}
                                        sx={{
                                          position: 'absolute',
                                          top: 4,
                                          right: 4,
                                          bgcolor: 'error.main',
                                          color: 'white',
                                          '&:hover': {
                                            bgcolor: 'error.dark',
                                          },
                                          width: 24,
                                          height: 24,
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Box>
                                    
                                    <CardContent sx={{ py: 1 }}>
                                      <Typography variant="caption" noWrap>
                                        {file.name}
                                      </Typography>
                                      <Typography variant="caption" display="block" color="textSecondary">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Grid>
                      )}
                    </Droppable>
                  </>
                ) : (
                  // Always render a droppable, even when empty
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <Box 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ display: 'none' }} // Hide when no images
                      >
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                )}
              </Box>
            </DragDropContext>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
          </Button>
        </form>
      )}
    </Container>
  );
};