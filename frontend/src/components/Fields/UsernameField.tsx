import React, { useState, useEffect, ChangeEvent } from "react";
import { TextField, Box } from "@mui/material";
import { FIELD_LIMITS } from "constants/validation";

interface UsernameFieldProps {
  value: string;
  disabled: boolean;
  customClasses: string;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const UsernameField: React.FC<UsernameFieldProps> = ({ 
  value, 
  disabled, 
  customClasses, 
  onChange, 
  onValidate 
}) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    setUsername(value);
    validate(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validate(value);
    setUsername(value);
    onChange(value);
  };

  const validate = (value: string): boolean => {
    // Use constants instead of hardcoded values
    const isValid = value.length >= FIELD_LIMITS.USERNAME_MIN && value.length <= FIELD_LIMITS.USERNAME_MAX;
    onValidate(isValid);
    return isValid;
  };

  return (
    <Box className={`${customClasses}`}>
      <TextField
        label="Username"
        type="text"
        id="usernameField"
        value={username}
        onChange={handleChange}
        placeholder="username"
        disabled={disabled}
        fullWidth
        variant="outlined"
        size="small"
        error={username !== "" && !validate(username)}
        helperText={
          username !== "" && !validate(username)
            ? `Username must be between ${FIELD_LIMITS.USERNAME_MIN} and ${FIELD_LIMITS.USERNAME_MAX} characters`
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

export default UsernameField;
