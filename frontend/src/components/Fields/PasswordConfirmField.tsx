import React, { useState, useEffect, ChangeEvent } from "react";
import { TextField, Box } from "@mui/material";

interface PasswordRepeatFieldProps {
  value: string;
  customClasses: string;
  onChange: (value: string) => void;
  newPassword: string;
  onValidate: (isValid: boolean) => void;
}

const PasswordRepeatField: React.FC<PasswordRepeatFieldProps> = ({ value, customClasses, onChange, newPassword, onValidate }) => {
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  useEffect(() => {
    const isValid = validateRepeatPassword(repeatPassword);
    onValidate(isValid);
  }, [newPassword, repeatPassword, onValidate]);

  useEffect(() => {
    setRepeatPassword(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepeatPassword(value);
    onChange(value);
  };

  const validateRepeatPassword = (value: string): boolean => {
    return value !== "" && value === newPassword;
  };

  return (
    <Box className={`${customClasses}`}>
      <TextField
        label="Confirm Password"
        type="password"
        id="passwordConfirmField"
        value={repeatPassword}
        onChange={handleChange}
        placeholder="repeat password"
        fullWidth
        variant="outlined"
        size="small"
        error={repeatPassword !== "" && !validateRepeatPassword(repeatPassword)}
        helperText={
          repeatPassword !== "" && !validateRepeatPassword(repeatPassword) 
            ? "Passwords do not match" 
            : ""
        }
        sx={{
          '& .MuiInputBase-input': {
            textAlign: 'center'
          }
        }}
      />
    </Box>
  );
};

export default PasswordRepeatField;