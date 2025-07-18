import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ProductList from "components/ProductList";
import { useSelector } from "react-redux";
import { selectFlatCategories } from "reduxComponents/reduxShop/Categories/selectors";
import { ProductAdd } from "components/ProductAdd";

const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<"products" | "categories" | "addProduct" | null>(null);
  const categories = useSelector(selectFlatCategories); // Fetch categories using the selector
  const [products, setProducts] = useState<Product[]>([]); // Replace with your product fetching logic

  const handleAddCategory = () => {
    console.log("Add new category");
    // Add your logic for adding a new category here
  };

  const handleEditCategory = (categoryId: number) => {
    console.log(`Edit category with ID: ${categoryId}`);
    // Add your edit logic here
  };

  const handleRemoveCategory = (categoryId: number) => {
    console.log(`Remove category with ID: ${categoryId}`);
    // Add your remove logic here
  };

  const handleAddProduct = () => {
    setActiveView("addProduct"); // Switch to the "Add Product" view
  };

  const handleEditProduct = (productId: number) => {
    console.log(`Edit product with ID: ${productId}`);
    // Add your edit logic here
  };

  const handleRemoveProduct = (productId: number) => {
    console.log(`Remove product with ID: ${productId}`);
    // Add your remove logic here
  };

  const renderProductAdd = () => (
    <Box>
      <ProductAdd />
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setActiveView("products")} 
        sx={{ mt: 2 }}
      >
        Back to Products
      </Button>
    </Box>
  );

  const renderProductsView = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Products</Typography>
        <Button variant="contained" color="primary" onClick={handleAddProduct}>
          Add Product
        </Button>
      </Box>
      {products.length > 0 ? (
        <Box>
          {products.map((product) => (
            <Box
              key={product.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
              p={1}
              border="1px solid #ccc"
              borderRadius="4px"
            >
              <Typography>{product.name}</Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleEditProduct(product.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography>No products available.</Typography>
      )}
    </Box>
  );

  const renderCategoriesView = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" color="primary" onClick={handleAddCategory}>
          Add Category
        </Button>
      </Box>
      {categories.length > 0 ? (
        <Box>
          {categories.map((category) => (
            <Box
              key={category.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
              p={1}
              border="1px solid #ccc"
              borderRadius="4px"
            >
              <Typography>{category.name}</Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleEditCategory(category.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveCategory(category.id)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography>No categories available.</Typography>
      )}
    </Box>
  );

  return (
    <Box maxWidth={1264} mx="auto" mt={3}>
      <Typography variant="h4" mb={3}>
        Admin Panel
      </Typography>
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setActiveView("products")}
        >
          Products
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setActiveView("categories")}
        >
          Categories
        </Button>
      </Box>
      <Box>
        {activeView === "products" && renderProductsView()}
        {activeView === "categories" && renderCategoriesView()}
        {activeView === "addProduct" && renderProductAdd()}
      </Box>
    </Box>
  );
};

export default AdminPanel;