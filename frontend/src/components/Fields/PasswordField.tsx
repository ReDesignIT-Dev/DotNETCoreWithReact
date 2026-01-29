import React, { useState, useEffect, ChangeEvent } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  Box
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  value: string;
  customClasses: string;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ value, customClasses, onChange, onValidate }) => {
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    const isValid = password !== "";
    onValidate(isValid);
  }, [password, onValidate]);

  useEffect(() => {
    setPassword(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    onChange(value);
  };

  return (
    <Box className={customClasses}>
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        id="newPasswordField"
        value={password}
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
    </Box>
  );
};

export default PasswordField;