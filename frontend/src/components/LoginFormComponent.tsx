import EmailField from "components/Fields/EmailField";
import PasswordField from "components/Fields/PasswordField";
import RecaptchaField from "components/Fields/RecaptchaField";
import React, { useEffect, useState, FormEvent } from "react";
import Loading from "components/Loading";
import "./LoginFormComponent.css"; 
import { loginUser } from "reduxComponents/reduxUser/Auth/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "reduxComponents/store"; // Adjust the import according to your store setup

const LoginFormComponent: React.FC = () => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
  const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

  const { isLoggedIn, isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const valid = isEmailValid && isValidReCaptchaToken && isPasswordValid;
    setIsValid(valid);
  }, [isEmailValid, isValidReCaptchaToken, isPasswordValid]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isValid) {
      dispatch(loginUser({ username: email, password, recaptchaToken: reCaptchaToken }));
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : isLoggedIn ? (
        <label className="alert alert-success">{"You are logged in"}</label>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="login-form-custom d-flex flex-column justify-content-center align-items-center mx-auto"
        >
          <div className="input-group-login">
            <EmailField
              value={email}
              onChange={setEmail}
              onValidate={setIsEmailValid}
              disabled={false}
            />
          </div>
          <div className="input-group-login">
            <PasswordField
              customClasses="w-100"
              value={password}
              onChange={setPassword}
              onValidate={setIsPasswordValid}
            />
          </div>
          <RecaptchaField
            onValidate={setIsValidRecaptchaToken}
            setReturnToken={setReCaptchaToken}
            customClasses="w-100" 
          />
          <button type="submit" className="btn btn-primary mt-3" disabled={!isValid}>
            Submit
          </button>
          {error && <label className="alert alert-warning">{error}</label>}
        </form>
      )}
    </div>
  );
};

export default LoginFormComponent;