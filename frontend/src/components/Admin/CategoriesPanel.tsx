// filepath: d:\Backupowane\Programowanie\DotNETCoreWithReact\frontend\src\components\Admin\CategoriesPanel.tsx
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectFlatCategories, selectCategoriesIsLoading, selectCategoriesError } from "reduxComponents/reduxShop/Categories/selectors";
import { deleteCategoryThunk, fetchCategoryTree } from "reduxComponents/reduxShop/Categories/thunks";
import { ConfirmDialog } from "components/common/ConfirmDialog";

type CategoriesPanelProps = {
  onAdd: () => void;
  onEdit: (categoryId: number) => void; // Add this
};

export const CategoriesPanel: React.FC<CategoriesPanelProps> = ({ onAdd, onEdit }) => {
  const dispatch = useDispatch<any>();
  const categories = useSelector(selectFlatCategories);
  const loading = useSelector(selectCategoriesIsLoading);
  const error = useSelector(selectCategoriesError);

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
            <Box
              key={c.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
              p={1}
              border="1px solid #ccc"
              borderRadius="4px"
            >
              <Typography>{c.name}</Typography>
              <Box display="flex" gap={1}>
                <Button variant="outlined" color="primary" size="small" onClick={() => onEdit(c.id)}>
                  Edit
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => openDelete(c)}>
                  Remove
                </Button>
              </Box>
            </Box>
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