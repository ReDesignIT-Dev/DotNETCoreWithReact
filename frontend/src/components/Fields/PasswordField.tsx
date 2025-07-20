import React, { useState, useEffect, ChangeEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./CommonStyles.css";

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
    <div className={`${customClasses}`}>
      <label className='input-label'>Password</label>
      <input
        type={showPassword ? "text" : "password"}
        id='newPasswordField'
        value={password}
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
          <span className='mx-2'>{showPassword ? React.createElement(FaEyeSlash as any) : React.createElement(FaEye as any)}</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordField;