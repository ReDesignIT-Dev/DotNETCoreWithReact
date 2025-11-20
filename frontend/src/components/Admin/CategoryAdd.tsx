import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectTreeCategories } from "reduxComponents/reduxShop/Categories/selectors";
import { addCategory } from "services/shopServices/apiRequestsShop";
import { fetchCategoryTree } from "reduxComponents/reduxShop/Categories/thunks";
import { AppDispatch } from "reduxComponents/store";

interface CategoryAddProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const CategoryAdd: React.FC<CategoryAddProps> = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector(selectTreeCategories);
    const [formData, setFormData] = useState<CreateCategoryData>({
        name: "DefaultName",
        shortName: "DefaultShortName",
        parentId: null,
        image: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (field: keyof CreateCategoryData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        handleInputChange('image', file);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!formData.name.trim() || !formData.shortName.trim()) {
            setError("Name and Short Name are required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await addCategory(formData);

            if (response?.status === 201) {
                setSuccess(true);

                // Refetch the category tree to update Redux state
                await dispatch(fetchCategoryTree()).unwrap();

                setFormData({
                    name: "DefaultName",
                    shortName: "DefaultShortName",
                    parentId: null,
                    image: null,
                });

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error("Error creating category:", error);

            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.data) {
                setError(typeof error.response.data === 'string' ? error.response.data : 'Failed to create category');
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Flatten categories for parent selection
    const flattenCategories = (cats: any[], level = 0): any[] => {
        const result: any[] = [];
        cats.forEach(cat => {
            result.push({ ...cat, level });
            if (cat.children && cat.children.length > 0) {
                result.push(...flattenCategories(cat.children, level + 1));
            }
        });
        return result;
    };

    const flatCategories = flattenCategories(categories);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
            <Typography variant="h5" mb={3}>
                Add New Category
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Category created successfully!
                </Alert>
            )}

            <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                helperText="Letters, digits, spaces, and hyphens only"
            />

            <TextField
                fullWidth
                label="Short Name"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                helperText="Brief identifier for the category"
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Parent Category (Optional)</InputLabel>
                <Select
                    value={formData.parentId || ""}
                    onChange={(e) => handleInputChange('parentId', e.target.value || null)}
                    disabled={isLoading}
                >
                    <MenuItem value="">
                        <em>None (Top Level Category)</em>
                    </MenuItem>
                    {flatCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {"—".repeat(category.level)} {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box mt={2} mb={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    Category Image (Optional)
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    style={{ width: '100%' }}
                />
                {formData.image && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Selected: {formData.image.name}
                    </Typography>
                )}
            </Box>

            <Box display="flex" gap={2} mt={3}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : null}
                >
                    {isLoading ? "Creating..." : "Create Category"}
                </Button>

                {onCancel && (
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </Box>
        </Box>
    );
};