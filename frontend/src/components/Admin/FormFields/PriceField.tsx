import React from 'react';
import { TextField } from '@mui/material';

interface PriceFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

export const PriceField: React.FC<PriceFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Price",
  required = true
}) => {
  return (
    <TextField
      fullWidth
      type="number"
      label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      margin="normal"
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error || "Price must be greater than 0"}
      inputProps={{ step: "0.01", min: "0.01" }}
    />
  );
};