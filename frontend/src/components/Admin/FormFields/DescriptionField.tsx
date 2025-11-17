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
  maxLength?: number;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Description",
  required = false,
  rows = 4,
  maxLength = 10000
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // Enforce maxLength on input
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <TextField
      fullWidth
      label={label}
      multiline
      rows={rows}
      value={value}
      onChange={handleChange}
      margin="normal"
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={
        error || 
        <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>Optional field</span>
          <span style={{ 
            color: value.length > maxLength * 0.9 ? '#d32f2f' : '#666'
          }}>
            {value.length}/{maxLength}
          </span>
        </span>
      }
      inputProps={{ maxLength }}
    />
  );
};