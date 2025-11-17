import React from 'react';
import { TextField } from '@mui/material';
import { FIELD_LIMITS } from 'constants/validation';

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
}

export const NameField: React.FC<NameFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Name",
  helperText = "Required field",
  required = true,
  maxLength = FIELD_LIMITS.PRODUCT_NAME // Use constant instead of hardcoded 255
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
      value={value}
      onChange={handleChange}
      margin="normal"
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error || `${helperText} (max ${maxLength} characters)`}
      inputProps={{ maxLength }}
      FormHelperTextProps={{
        sx: {
          display: 'flex',
          justifyContent: 'space-between',
        }
      }}
      InputProps={{
        endAdornment: (
          <span style={{ 
            fontSize: '0.75rem', 
            color: value.length > maxLength * 0.9 ? '#d32f2f' : '#666',
            marginLeft: '8px'
          }}>
            {value.length}/{maxLength}
          </span>
        )
      }}
    />
  );
};