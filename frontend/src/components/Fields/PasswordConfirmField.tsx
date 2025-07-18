import React, { useState, useEffect, ChangeEvent } from "react";
import "./CommonStyles.css";

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
    <div className={`${customClasses}`}>
      <label className='input-label' htmlFor='passwordConfirmField'>Confirm Password</label>
      <input
        type='password'
        id='passwordConfirmField'
        placeholder='repeat password'
        value={repeatPassword}
        onChange={handleChange}
        className='text-center w-100'
      />
    </div>
  );
};

export default PasswordRepeatField;