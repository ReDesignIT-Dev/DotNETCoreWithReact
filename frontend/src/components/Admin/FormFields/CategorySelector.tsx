import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface CategorySelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  categories: Array<{ id: number; name: string; level?: number }>;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  excludeId?: number;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  categories,
  disabled = false,
  label = "Category",
  required = true,
  allowEmpty = true,
  emptyLabel = "None (Top Level Category)",
  excludeId
}) => {
  const filteredCategories = excludeId 
    ? categories.filter(cat => cat.id !== excludeId)
    : categories;

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="category-select-label">{label}</InputLabel>
      <Select
        labelId="category-select-label"
        label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
      >
        {allowEmpty && (
          <MenuItem value="">
            <em>{emptyLabel}</em>
          </MenuItem>
        )}
        {filteredCategories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {"—".repeat(category.level || 0)} {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};