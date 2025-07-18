import React, { useState, useEffect, ChangeEvent } from "react";
import {
  isPasswordValid,
  isLengthValid,
  isDigitValid,
  isLowercaseValid,
  isSpecialCharValid,
  isUppercaseValid,
} from "utils/validation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./CommonStyles.css";

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
    <div className={`d-flex flex-column ${customClasses}`}>
      <label className='input-label' htmlFor='newPasswordField'>Password</label>
      <input
        type={showPassword ? "text" : "password"}
        id='newPasswordField'
        value={newPassword}
        onChange={handleChange}
        className='text-center w-100'
        placeholder='password'
      />
      <div className='text-center'>
        <div
          className='d-inline-flex justify-content-center align-items-center p-1 mt-1 btn btn-link text-black text-decoration-none'
          onClick={() => setShowPassword(!showPassword)}
        >
          <span>{showPassword ? "Hide password" : "Show password"}</span>
          <span className='mx-2'>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
        </div>
      </div>
      <div className='password-validation d-flex flex-column align-items-center'>
        <div className={isLengthValid(newPassword) ? "valid" : "invalid"}>
          Minimum length - 8 characters
        </div>
        <div className={isUppercaseValid(newPassword) ? "valid" : "invalid"}>
          At least one uppercase letter
        </div>
        <div className={isLowercaseValid(newPassword) ? "valid" : "invalid"}>
          At least one lowercase letter
        </div>
        <div className={isDigitValid(newPassword) ? "valid" : "invalid"}>
          At least one numeric digit
        </div>
        <div className={isSpecialCharValid(newPassword) ? "valid" : "invalid"}>
          At least one special character
        </div>
      </div>
    </div>
  );
};

export default NewPasswordField;