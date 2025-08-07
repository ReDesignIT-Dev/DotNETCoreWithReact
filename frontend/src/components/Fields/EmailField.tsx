import { isEmailValid } from "utils/validation";
import { useEffect, ChangeEvent } from "react";
import "./CommonStyles.css";

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
    <div>
      <label className='input-label' htmlFor='emailField'>Email</label>
      <input
        className='text-center w-100'
        value={value}
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