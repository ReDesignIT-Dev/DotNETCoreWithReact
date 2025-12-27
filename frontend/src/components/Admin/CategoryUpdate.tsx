import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { getCategory, updateCategory } from 'services/shopServices/apiRequestsShop';
import { useSelector } from 'react-redux';
import { selectTreeCategories } from 'reduxComponents/reduxShop/Categories/selectors';
import { SingleImageUpload, SingleImagePreview } from './FormFields';

interface CategoryUpdateProps {
    categoryId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const CategoryUpdate: React.FC<CategoryUpdateProps> = ({ categoryId, onSuccess, onCancel }) => {
    const categories = useSelector(selectTreeCategories);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{ name?: string; shortName?: string }>({});

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        parentId: null as number | null,
        newImage: null as File | null,
        removeCurrentImage: false,
        showOnHomePage: false
    });

    const [originalData, setOriginalData] = useState({
        name: '',
        shortName: '',
        parentId: null as number | null,
        newImage: null as File | null,
        removeCurrentImage: false,
        showOnHomePage: false
    });

    const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCategory(categoryId);

                if (response?.data) {
                    const categoryData = response.data;
                    setCategory(categoryData);
                    const initialData = {
                        name: categoryData.name || '',
                        shortName: categoryData.shortName || '',
                        parentId: categoryData.parentId || null,
                        newImage: null,
                        removeCurrentImage: false,
                        showOnHomePage: categoryData.showOnHomePage || false
                    };
                    setFormData(initialData);
                    setOriginalData(initialData);
                    setModifiedFields(new Set());
                } else {
                    setError('Failed to load category');
                }
            } catch (err) {
                setError('Error loading category');
                console.error('Error fetching category:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    const handleChange = (field: string, value: string | number | null | File | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Track if this field has been modified from original
        const isModified = value !== originalData[field as keyof typeof originalData];
        setModifiedFields(prev => {
            const newSet = new Set(prev);
            if (isModified) {
                newSet.add(field);
            } else {
                newSet.delete(field);
            }
            return newSet;
        });

        // Clear error for this field
        if (formErrors[field as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleImageSelect = (file: File | null) => {
        handleChange('newImage', file);
        // If adding new image, don't remove current
        if (file) {
            handleChange('removeCurrentImage', false);
        }
    };

    const handleRemoveCurrentImage = () => {
        handleChange('removeCurrentImage', true);
        handleChange('newImage', null);
    };

    const handleRemoveNewImage = () => {
        handleChange('newImage', null);
    };

    const validate = () => {
        const errors: { name?: string; shortName?: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.shortName.trim()) {
            errors.shortName = 'Short name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        if (modifiedFields.size === 0) {
            setError('No changes detected');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Always use FormData to support image operations
            const updateData = new FormData();

            // Always include required fields when using FormData
            updateData.append('name', formData.name.trim());
            updateData.append('shortName', formData.shortName.trim());
            updateData.append('showOnHomePage', formData.showOnHomePage.toString());

            if (formData.parentId !== null) {
                updateData.append('parentId', formData.parentId.toString());
            }

            if (formData.newImage) {
                updateData.append('image', formData.newImage);
            }

            if (formData.removeCurrentImage) {
                updateData.append('removeImage', 'true');
            }

            const response = await updateCategory(categoryId, updateData);

            if (response?.status === 204) {
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError('Failed to update category');
            }
        } catch (err) {
            setError('Error updating category');
            console.error('Error updating category:', err);
        } finally {
            setSaving(false);
        }
    };

    // Flatten categories for parent selection (exclude self and children)
    const flattenCategories = (cats: any[], level = 0, excludeId?: number): any[] => {
        const result: any[] = [];
        cats.forEach(cat => {
            if (cat.id !== excludeId) {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0) {
                    result.push(...flattenCategories(cat.children, level + 1, excludeId));
                }
            }
        });
        return result;
    };

    const flatCategories = flattenCategories(categories, 0, categoryId);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
                <Typography ml={2}>Loading category...</Typography>
            </Box>
        );
    }

    if (error && !category) {
        return (
            <Box>
                <Alert severity="error">{error}</Alert>
                {onCancel && (
                    <Button variant="outlined" onClick={onCancel} sx={{ mt: 2 }}>
                        Back
                    </Button>
                )}
            </Box>
        );
    }

    if (!category) {
        return (
            <Box>
                <Typography>Category not found.</Typography>
                {onCancel && (
                    <Button variant="outlined" onClick={onCancel} sx={{ mt: 2 }}>
                        Back
                    </Button>
                )}
            </Box>
        );
    }

    const hasCurrentImage = category.image && !formData.removeCurrentImage;
    const hasNewImage = formData.newImage !== null;

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
            <Typography variant="h5" mb={3}>
                Update Category
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                margin="normal"
                required
                disabled={saving}
                error={!!formErrors.name}
                helperText={formErrors.name || "Letters, digits, spaces, and hyphens only"}
            />

            <TextField
                fullWidth
                label="Short Name"
                value={formData.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                margin="normal"
                required
                disabled={saving}
                error={!!formErrors.shortName}
                helperText={formErrors.shortName || "Brief identifier for the category"}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Parent Category (Optional)</InputLabel>
                <Select
                    value={formData.parentId || ""}
                    onChange={(e) => handleChange('parentId', e.target.value || null)}
                    disabled={saving}
                >
                    <MenuItem value="">
                        <em>None (Top Level Category)</em>
                    </MenuItem>
                    {flatCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {"—".repeat(cat.level)} {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.showOnHomePage}
                        onChange={(e) => handleChange('showOnHomePage', e.target.checked)}
                        disabled={saving}
                        color="primary"
                    />
                }
                label="Show on Home Page"
                sx={{ mt: 2, mb: 1 }}
            />

            <Box mt={3} mb={2}>
                <Typography variant="h6" gutterBottom>
                    Category Image (Optional)
                </Typography>

                {/* Show new image if selected */}
                {hasNewImage && (
                    <SingleImagePreview
                        imageFile={formData.newImage!}
                        altText={formData.name || 'Category image'}
                        onRemove={handleRemoveNewImage}
                        disabled={saving}
                        title="New Image"
                    />
                )}

                {/* Show current image if exists and no new image selected */}
                {hasCurrentImage && !hasNewImage && (
                    <SingleImagePreview
                        imageUrl={category.image!.url}
                        altText={category.name}
                        onRemove={handleRemoveCurrentImage}
                        disabled={saving}
                        title="Current Image"
                    />
                )}

                {/* Show upload zone if no image */}
                {!hasCurrentImage && !hasNewImage && (
                    <SingleImageUpload
                        onFileSelect={handleImageSelect}
                        disabled={saving}
                    />
                )}

                {/* Show change image button if there's a current or new image */}
                {(hasCurrentImage || hasNewImage) && (
                    <Box mt={2}>
                        <SingleImageUpload
                            onFileSelect={handleImageSelect}
                            disabled={saving}
                            currentFileName={hasNewImage ? formData.newImage!.name : undefined}
                        />
                    </Box>
                )}
            </Box>

            <Box display="flex" gap={2} mt={3}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving || modifiedFields.size === 0}
                    startIcon={saving ? <CircularProgress size={16} /> : null}
                >
                    {saving ? "Updating..." : "Update Category"}
                </Button>

                {onCancel && (
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                )}
            </Box>
        </Box>
    );
};