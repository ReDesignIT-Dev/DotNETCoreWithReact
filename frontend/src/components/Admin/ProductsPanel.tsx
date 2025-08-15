// filepath: d:\Backupowane\Programowanie\DotNETCoreWithReact\frontend\src\components\Admin\ProductsPanel.tsx
import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { deleteProduct, getAllProducts } from "services/shopServices/apiRequestsShop";
import { ConfirmDialog } from "components/common/ConfirmDialog";

type ProductsPanelProps = {
  onAdd: () => void;
  onEdit: (productId: number) => void;
};

export const ProductsPanel: React.FC<ProductsPanelProps> = ({ onAdd, onEdit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<Product | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts();
      if (response?.data) {
        setProducts(response.data.products);
      } else {
        setError("Failed to load products");
      }
    } catch (e) {
      setError("Error loading products");
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDelete = (product: Product) => {
    setTarget(product);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    try {
      setLoading(true);
      await deleteProduct(target.id);
      await load();
    } catch (e) {
      console.error(`Error removing product: ${target.name}`, e);
      setError("Error removing product");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  const openEdit = (product: Product) => {
    onEdit(product.id); // Use the callback instead of local state
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Products</Typography>
        <Button variant="contained" color="primary" onClick={onAdd}>Add Product</Button>
      </Box>

      {loading ? (
        <Typography>Loading products...</Typography>
      ) : error ? (
        <Box>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={load} sx={{ mt: 1 }}>Retry</Button>
        </Box>
      ) : products.length > 0 ? (
        <Box>
          {products.map((p) => (
            <Box
              key={p.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
              p={1}
              border="1px solid #ccc"
              borderRadius="4px"
            >
              <Box>
                <Typography variant="h6">{p.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${p.price}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button variant="outlined" color="primary" size="small" onClick={() => openEdit(p)}>
                  Edit
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => openDelete(p)}>
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography>No products available.</Typography>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Product Deletion"
        message={`Are you sure you want to delete the product "${target?.name}"? This action cannot be undone.`}
        loading={loading}
        onCancel={() => { setConfirmOpen(false); setTarget(null); }}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};