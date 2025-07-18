import { isEmailValid } from "utils/validation";
import { useState, useEffect, ChangeEvent } from "react";
import "./CommonStyles.css";

interface EmailFieldProps {
  value: string;
  disabled: boolean;
  customClasses: string;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({ value, disabled, customClasses, onChange, onValidate }) => {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    setEmail(value);
    validate(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validate(value);
    onChange(value);
  };

  const validate = (value: string) => {
    const isValid = isEmailValid(value);
    onValidate(isValid);
  };

  return (
    <div className={`${customClasses}`}>
      <label className='input-label' htmlFor='emailField'>Email</label>
      <input
        value={email}
        className='text-center w-100'
        type='email'
        id='emailField'
        placeholder='email'
        autoComplete='email'
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

export default EmailField;