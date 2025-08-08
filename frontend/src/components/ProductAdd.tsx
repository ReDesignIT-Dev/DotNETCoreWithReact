import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { addProduct } from "services/shopServices/apiRequestsShop";
import { selectTreeCategories } from "reduxComponents/reduxShop/Categories/selectors";

export const ProductAdd = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [productSummary, setProductSummary] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Use the selector to get flat categories from the Redux store
  const categories = useSelector(selectTreeCategories);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      categoryId: 1,
      price: 1,
      name: "",
      description: "",
      isOnSale: false,
      images: [],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category", String(data.categoryId));
    formData.append("description", data.description || "");
    formData.append("price", String(data.price));
    formData.append("isOnSale", String(data.isOnSale ?? false));

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("uploaded_images", file);
      });
    }

    try {
      const response = await addProduct(formData);  
      if (response && response.status === 201) {
        setSubmitted(true);
        setSnackbarOpen(true);
        setProductSummary(data); // Save for summary display
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    reset({
      name: "",
      categoryId: 1,
      description: "",
      price: 1,
      isOnSale: false,
      images: [],
    });
    setSubmitted(false);
    setProductSummary(null);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm">
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
                  <strong>On Sale:</strong> {productSummary.isOnSale ? "Yes" : "No"}
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
            rules={{ required: "Price is required" }}
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
              />
            )}
          />
          <Controller
            name="images"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    field.onChange(Array.from(files));
                  }
                }}
              />
            )}
          />

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