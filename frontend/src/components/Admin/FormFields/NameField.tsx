import React from 'react';
import { TextField } from '@mui/material';

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const NameField: React.FC<NameFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Name",
  helperText = "Required field",
  required = true
}) => {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error || helperText}
    />
  );
};