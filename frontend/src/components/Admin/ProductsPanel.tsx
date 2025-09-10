// filepath: d:\Backupowane\Programowanie\DotNETCoreWithReact\frontend\src\components\Admin\ProductsPanel.tsx
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Avatar, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteProduct, getAllProducts } from "services/shopServices/apiRequestsShop";
import { ConfirmDialog } from "components/common/ConfirmDialog";
import { navigateToProduct } from "utils/navigation";

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
  
  const navigate = useNavigate();

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
            <Tooltip 
              key={p.id}
              title={`Click to view ${p.name} details`}
              arrow
              placement="top"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
                p={1}
                border="1px solid #ccc"
                borderRadius="4px"
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                    borderColor: '#007bff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.15)'
                  }
                }}
                onClick={(event) => navigateToProduct(p.slug, event, navigate)}
              >
                <Box display="flex" alignItems="center" gap={2} flex={1}>
                  <Avatar
                    src={p.images && p.images.length > 0 ? p.images[0].url : '/placeholder-image.png'}
                    alt={p.name}
                    variant="rounded"
                    sx={{
                      width: 60,
                      height: 60,
                      border: '1px solid #ddd'
                    }}
                  />
                  <Box>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${p.price}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outlined" color="primary" size="small" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => openDelete(p)}>
                    Remove
                  </Button>
                </Box>
              </Box>
            </Tooltip>
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