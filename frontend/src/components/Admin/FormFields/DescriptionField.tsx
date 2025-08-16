import React from 'react';
import { TextField } from '@mui/material';

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  rows?: number;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Description",
  required = false,
  rows = 4
}) => {
  return (
    <TextField
      fullWidth
      label={label}
      multiline
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error}
    />
  );
};