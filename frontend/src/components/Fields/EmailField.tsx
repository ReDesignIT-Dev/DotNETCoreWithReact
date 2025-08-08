import { isEmailValid } from "utils/validation";
import { useEffect, ChangeEvent } from "react";
import { TextField, Box } from "@mui/material";

interface EmailFieldProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({ value, disabled, onChange, onValidate }) => {

  useEffect(() => {
    onValidate(isEmailValid(value));
  }, [value, onValidate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Box>
      <TextField
        label="Email"
        type="email"
        id="emailField"
        value={value}
        onChange={handleChange}
        placeholder="email"
        autoComplete="email"
        disabled={disabled}
        fullWidth
        variant="outlined"
        size="small"
        error={value !== "" && !isEmailValid(value)}
        helperText={value !== "" && !isEmailValid(value) ? "Please enter a valid email address" : ""}
        sx={{
          '& .MuiInputBase-input': {
            textAlign: 'center'
          }
        }}
      />
    </Box>
  );
};

export default EmailField;