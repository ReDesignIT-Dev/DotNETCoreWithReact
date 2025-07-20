import React, { useState, useEffect } from "react";
import NewPasswordField from "./NewPasswordField";
import PasswordRepeatField from "./PasswordConfirmField";

interface NewPasswordWithPasswordRepeatFieldProps {
  customClassesForNewPassword: string;
  customClassesForPasswordRepeat: string;
  passwordValue: string;
  passwordRepeatValue: string;
  onChangePassword: (value: string) => void;
  onChangePasswordConfirm: (value: string) => void;
  onValidate: (isValid: boolean) => void;
}

const NewPasswordWithPasswordRepeatField: React.FC<NewPasswordWithPasswordRepeatFieldProps> = ({
  customClassesForNewPassword,
  customClassesForPasswordRepeat,
  passwordValue,
  passwordRepeatValue,
  onChangePassword,
  onChangePasswordConfirm,
  onValidate,
}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>("");
  const [newPasswordIsValid, setNewPasswordIsValid] = useState<boolean>(false);
  const [passwordRepeatIsValid, setPasswordRepeatIsValid] = useState<boolean>(false);
  const [passwordRepeatError, setPasswordRepeatError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    setNewPassword(passwordValue);
  }, [passwordValue]);

  useEffect(() => {
    setNewPasswordRepeat(passwordRepeatValue);
  }, [passwordRepeatValue]);

useEffect(() => {
  const valid = newPasswordIsValid && passwordRepeatIsValid;
  setIsValid(valid);
  setPasswordRepeatError(passwordRepeatIsValid ? "" : "Passwords do not match");
}, [newPasswordIsValid, passwordRepeatIsValid]);

  useEffect(() => {
    onValidate(isValid);
  }, [isValid, onValidate]);

  const handlePasswordChange = (value: string) => {
    onChangePassword(value);
  };

  const handlePasswordConfirmChange = (value: string) => {
    onChangePasswordConfirm(value);
  };

  return (
    <div className="d-flex flex-column w-100 gap-2">
      <NewPasswordField
        value={newPassword}
        customClasses={customClassesForNewPassword}
        onChange={handlePasswordChange}
        onValidate={setNewPasswordIsValid}
      />
      <PasswordRepeatField
        value={newPasswordRepeat}
        customClasses={customClassesForPasswordRepeat}
        onChange={handlePasswordConfirmChange}
        newPassword={newPassword}
        onValidate={setPasswordRepeatIsValid}
      />
      <label className="text-danger">{passwordRepeatError}</label>
    </div>
  );
};

export default NewPasswordWithPasswordRepeatField;
