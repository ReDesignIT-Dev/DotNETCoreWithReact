import React, { useState, useEffect, ChangeEvent } from "react";
import {
  isPasswordValid,
  isLengthValid,
  isDigitValid,
  isLowercaseValid,
  isSpecialCharValid,
  isUppercaseValid,
} from "utils/validation";
import {
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Box,
  Stack
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface NewPasswordFieldProps {
  value: string;
  customClasses: string;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const NewPasswordField: React.FC<NewPasswordFieldProps> = ({ value, customClasses, onChange, onValidate }) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    const isValid = isPasswordValid(newPassword);
    onValidate(isValid);
  }, [newPassword, onValidate]);

  useEffect(() => {
    setNewPassword(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    onChange(value);
  };

  return (
    <Box className={`d-flex flex-column ${customClasses}`}>
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        id="newPasswordField"
        value={newPassword}
        onChange={handleChange}
        placeholder="password"
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-input': {
            textAlign: 'center'
          }
        }}
      />
      
      <Stack spacing={0.5} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
          Password Requirements:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem',
            color: isLengthValid(newPassword) ? 'success.main' : 'error.main'
          }}
        >
          Minimum length - 8 characters
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem',
            color: isUppercaseValid(newPassword) ? 'success.main' : 'error.main'
          }}
        >
          At least one uppercase letter
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem',
            color: isLowercaseValid(newPassword) ? 'success.main' : 'error.main'
          }}
        >
          At least one lowercase letter
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem',
            color: isDigitValid(newPassword) ? 'success.main' : 'error.main'
          }}
        >
          At least one numeric digit
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem',
            color: isSpecialCharValid(newPassword) ? 'success.main' : 'error.main'
          }}
        >
          At least one special character
        </Typography>
      </Stack>
    </Box>
  );
};

export default NewPasswordField;