import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useSelector } from "react-redux";
import { selectTreeCategories } from "reduxComponents/reduxShop/Categories/selectors";
import { ProductAdd } from "components/ProductAdd";
import { deleteProduct, getAllProducts } from "services/shopServices/apiRequestsShop";

const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<"products" | "categories" | "addProduct" | null>(null);
  const categories = useSelector(selectTreeCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null); // Add error state
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      if (activeView === "products") {
        try {
          const response = await getAllProducts();
          if (response?.data) {
                      console.log(response.data)

            setProducts(response.data.products); // Assuming response.data contains Product[]
          } else {
            setProductsError("Failed to load products");
          }
        } catch (error) {
          setProductsError("Error loading products");
          console.error("Error fetching products:", error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchProducts();
  }, [activeView]);

const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      
      const response = await getAllProducts();
      
      if (response?.data) {
        setProducts(response.data.products);
      }
    } catch (error) {
      setProductsError("Error refreshing products");
      console.error("Error refreshing products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleAddCategory = () => {
    console.log("Add new category");
  };

  const handleEditCategory = (categoryId: number) => {
    console.log(`Edit category with ID: ${categoryId}`);
  };

  const handleRemoveCategory = (categoryId: number) => {
    console.log(`Remove category with ID: ${categoryId}`);
  };

  const handleAddProduct = () => {
    setActiveView("addProduct");
  };

  const handleEditProduct = (productId: number) => {
    console.log(`Edit product with ID: ${productId}`);
  };

  const handleRemoveProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      setIsLoadingProducts(true);
      const response = await deleteProduct(productToDelete.id);
      
      if (response) {
        console.log(`Successfully removed product: ${productToDelete.name}`);
        // Refresh the products list after successful deletion
        await refreshProducts();
      }
    } catch (error) {
      console.error(`Error removing product: ${productToDelete.name}`, error);
      setProductsError("Error removing product");
    } finally {
      setIsLoadingProducts(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const renderProductAdd = () => (
    <Box>
      <ProductAdd />
      <Button variant="outlined" color="primary" onClick={() => setActiveView("products")} sx={{ mt: 2 }}>
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
      
      {isLoadingProducts ? (
        <Typography>Loading products...</Typography>
      ) : productsError ? (
        <Box>
          <Typography color="error">{productsError}</Typography>
          <Button variant="outlined" onClick={refreshProducts} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Box>
      ) : products.length > 0 ? (
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
              <Box>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price} {product.isOnSale && "🏷️ On Sale"}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button variant="outlined" color="primary" size="small" onClick={() => handleEditProduct(product.id)}>
                  Edit
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveProduct(product.id)}>
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
                <Button variant="outlined" color="primary" size="small" onClick={() => handleEditCategory(category.id)}>
                  Edit
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveCategory(category.id)}>
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
        <Button variant="contained" color="primary" onClick={() => setActiveView("products")}>
          Products
        </Button>
        <Button variant="contained" color="primary" onClick={() => setActiveView("categories")}>
          Categories
        </Button>
      </Box>
      <Box>
        {activeView === "products" && renderProductsView()}
        {activeView === "categories" && renderCategoriesView()}
        {activeView === "addProduct" && renderProductAdd()}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteProduct}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Product Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {`Are you sure you want to delete the product "${productToDelete?.name}"? 
            This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteProduct} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteProduct} 
            color="error" 
            variant="contained"
            disabled={isLoadingProducts}
          >
            {isLoadingProducts ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
