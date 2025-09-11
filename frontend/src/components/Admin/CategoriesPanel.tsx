// filepath: d:\Backupowane\Programowanie\DotNETCoreWithReact\frontend\src\components\Admin\CategoriesPanel.tsx
import React, { useState } from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectFlatCategories, selectCategoriesIsLoading, selectCategoriesError } from "reduxComponents/reduxShop/Categories/selectors";
import { deleteCategoryThunk, fetchCategoryTree } from "reduxComponents/reduxShop/Categories/thunks";
import { ConfirmDialog } from "components/common/ConfirmDialog";
import { navigateToCategory } from "utils/navigation"; // You'll need to create this

type CategoriesPanelProps = {
  onAdd: () => void;
  onEdit: (categoryId: number) => void;
};

export const CategoriesPanel: React.FC<CategoriesPanelProps> = ({ onAdd, onEdit }) => {
  const dispatch = useDispatch<any>();
  const categories = useSelector(selectFlatCategories);
  const loading = useSelector(selectCategoriesIsLoading);
  const error = useSelector(selectCategoriesError);
  
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<Category | null>(null);

  const openDelete = (category: Category) => {
    setTarget(category);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    try {
      await dispatch(deleteCategoryThunk(target.id)).unwrap();
      await dispatch(fetchCategoryTree());
    } catch (e) {
      console.error(`Error removing category: ${target.name}`, e);
    } finally {
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" color="primary" onClick={onAdd}>Add Category</Button>
      </Box>

      {loading ? (
        <Typography>Loading categories...</Typography>
      ) : error ? (
        <Typography color="error">Error loading categories</Typography>
      ) : categories.length > 0 ? (
        <Box>
          {categories.map((c) => (
            <Tooltip 
              key={c.id}
              title={`Click to view ${c.name} category`}
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
                onClick={(event) => navigateToCategory(c.slug, event, navigate)}
              >
                <Typography flex={1}>{c.name}</Typography>
                <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outlined" color="primary" size="small" onClick={() => onEdit(c.id)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => openDelete(c)}>
                    Remove
                  </Button>
                </Box>
              </Box>
            </Tooltip>
          ))}
        </Box>
      ) : (
        <Typography>No categories available.</Typography>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Category Deletion"
        message={`Are you sure you want to delete the category "${target?.name}"? This action cannot be undone and may affect products.`}
        loading={loading}
        onCancel={() => { setConfirmOpen(false); setTarget(null); }}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};