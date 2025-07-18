import { useState, useEffect } from "react";
import "./CommonStyles.css";

export default function UsernameField({ value, disabled, customClasses, onChange, onValidate }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(value);
    validate(value);
  }, [value]);

  const handleChange = (e) => {
    const value = e.target.value;
    validate(value);
    setUsername(value);
    onChange(value);
  };

  const validate = (value) => {
    const isValid = value.length >= 3 && value.length <= 30;
    onValidate(isValid);
  };

  return (
    <div className={`${customClasses}`}>
      <label className='input-label'>Username</label>
      <input
        value={username}
        className='text-center w-100'
        type='text'
        id='usernameField'
        placeholder='username'
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
