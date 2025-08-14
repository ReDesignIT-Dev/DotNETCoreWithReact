import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchCategoryTree } from "reduxComponents/reduxShop/Categories/thunks";
import { ProductAdd } from "components/Admin/ProductAdd";
import { ProductUpdate } from "components/Admin/ProductUpdate";
import { CategoryAdd } from "components/Admin/CategoryAdd";
import { CategoryUpdate } from "components/Admin/CategoryUpdate";
import { ProductsPanel } from "components/Admin/ProductsPanel";
import { CategoriesPanel } from "components/Admin/CategoriesPanel";

const AdminPanel: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [activeView, setActiveView] = useState<"products" | "categories" | "addProduct" | "addCategory" | "editProduct" | "editCategory" | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const handleCategoryAddSuccess = async () => {
    await dispatch(fetchCategoryTree());
    setActiveView("categories");
  };

  const handleEditProduct = (productId: number) => {
    setEditingProductId(productId);
    setActiveView("editProduct");
  };

  const handleEditCategory = (categoryId: number) => {
    setEditingCategoryId(categoryId);
    setActiveView("editCategory");
  };

  const handleProductUpdateSuccess = () => {
    setEditingProductId(null);
    setActiveView("products");
  };

  const handleCategoryUpdateSuccess = async () => {
    await dispatch(fetchCategoryTree());
    setEditingCategoryId(null);
    setActiveView("categories");
  };

  return (
    <Box maxWidth={1264} mx="auto" mt={3}>
      <Typography variant="h4" mb={3}>Admin Panel</Typography>

      <Box display="flex" gap={2} mb={3}>
        <Button variant="contained" color="primary" onClick={() => setActiveView("products")}>Products</Button>
        <Button variant="contained" color="primary" onClick={() => setActiveView("categories")}>Categories</Button>
      </Box>

      <Box>
        {activeView === "products" && (
          <ProductsPanel 
            onAdd={() => setActiveView("addProduct")}
            onEdit={handleEditProduct}
          />
        )}

        {activeView === "categories" && (
          <CategoriesPanel 
            onAdd={() => setActiveView("addCategory")}
            onEdit={handleEditCategory}
          />
        )}

        {activeView === "addProduct" && (
          <Box>
            <ProductAdd />
            <Button variant="outlined" color="primary" onClick={() => setActiveView("products")} sx={{ mt: 2 }}>
              Back to Products
            </Button>
          </Box>
        )}

        {activeView === "addCategory" && (
          <Box>
            <CategoryAdd
              onSuccess={handleCategoryAddSuccess}
              onCancel={() => setActiveView("categories")}
            />
          </Box>
        )}

        {activeView === "editProduct" && editingProductId && (
          <Box>
            <ProductUpdate
              productId={editingProductId}
              onSuccess={handleProductUpdateSuccess}
              onCancel={() => {
                setEditingProductId(null);
                setActiveView("products");
              }}
            />
          </Box>
        )}

        {activeView === "editCategory" && editingCategoryId && (
          <Box>
            <CategoryUpdate
              categoryId={editingCategoryId}
              onSuccess={handleCategoryUpdateSuccess}
              onCancel={() => {
                setEditingCategoryId(null);
                setActiveView("categories");
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminPanel;
