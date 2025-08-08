import UsernameField from "./Fields/UsernameField";
import EmailField from "components/Fields/EmailField";
import NewPasswordWithPasswordRepeatField from "./Fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "components/Fields/RecaptchaField";
import { useEffect, useState, FormEvent } from "react";
import Loading from "components/Loading";
import { registerUser } from "services/apiRequestsUser";
import "./RegisterFormComponent.css"; // Import the CSS file
import { GeneralApiError, MultipleFieldErrors } from "services/CustomErrors";
import { useAuth } from "hooks/useAuth";

const RegisterFormComponent: React.FC = () => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(localStorage.getItem("username") || "");
  const [usernameFieldError, setUsernameFieldError] = useState<string>(
    localStorage.getItem("usernameFieldError") || ""
  );
  const [isUsernameValid, setIsUsernameValid] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(localStorage.getItem("email") || "");
  const [emailFieldError, setEmailFieldError] = useState<string>(
    localStorage.getItem("emailFieldError") || ""
  );
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
  const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [isPasswordWithPasswordConfirmValid, setIsPasswordWithPasswordConfirmValid] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(localStorage.getItem("detailError") || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [registrationSuccessful, setRegistrationSuccessful] = useState<boolean>(false);

  const isLoggedIn = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      clearUsedLocalStorage();
      setEmail("");
      setUsername("");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.removeItem("usernameFieldError");
    localStorage.setItem("username", username);
    validateUsername();
  }, [username]);

  useEffect(() => {
    localStorage.removeItem("emailFieldError");
    localStorage.setItem("email", email);
    validateEmail();
  }, [email]);

  const validateEmail = () => {
    const emailFieldErrorFromPost = localStorage.getItem("emailFieldError");
    if (emailFieldErrorFromPost) {
      setEmailFieldError(emailFieldErrorFromPost);
    } else if (!isEmailValid) {
      setEmailFieldError("Invalid email");
    } else {
      setEmailFieldError("");
    }
  };

  const validateUsername = () => {
    const usernameFieldErrorFromPost = localStorage.getItem("usernameFieldError");
    if (usernameFieldErrorFromPost) {
      setUsernameFieldError(usernameFieldErrorFromPost);
    } else if (!isUsernameValid) {
      setUsernameFieldError("Username must be between 3 and 30 chars");
    } else {
      setUsernameFieldError("");
    }
  };

  useEffect(() => {
    const valid =
      isEmailValid &&
      isValidReCaptchaToken &&
      isPasswordWithPasswordConfirmValid &&
      isUsernameValid;
    setIsValid(valid);
    validateUsername();
    validateEmail();
  }, [isEmailValid, isValidReCaptchaToken, isPasswordWithPasswordConfirmValid, isUsernameValid]);

  const clearUsedLocalStorage = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("usernameFieldError");
    localStorage.removeItem("email");
    localStorage.removeItem("emailFieldError");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isValid) {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await registerUser({
          username,
          email,
          password,
          passwordConfirm: passwordConfirm,
          recaptchaToken: reCaptchaToken
        });
        if (response && response.data) {
          const returnMessage = response.data.message;
          if (response.status === 200) {
            clearUsedLocalStorage();
            setErrorMessage("");
            setRegistrationSuccessful(true);
          } else {
            setErrorMessage(returnMessage);
            console.log(returnMessage);
          }
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      } catch (error) {
        if (error instanceof MultipleFieldErrors) {
          error.errors.forEach((err) => {
            if (err.field === "username") {
              setUsernameFieldError(err.message);
              localStorage.setItem("usernameFieldError", err.message);
              console.log(`Username Error: ${err.message}`);
            }
            if (err.field === "email") {
              setEmailFieldError(err.message);
              localStorage.setItem("emailFieldError", err.message);
              console.log(`Email Error: ${err.message}`);
            }
            if (err.field === "detail") {
              setErrorMessage(err.message);
              localStorage.setItem("detailError", err.message);
              console.log(`Detail Error: ${err.message}`);
            }
          });
        } else if (error instanceof GeneralApiError) {
          setErrorMessage(error.message);
          console.log(error.message);
        } else {
          setErrorMessage("An unexpected error occurred.");
          console.log("An unexpected error occurred:", error);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage("FORM IS NOT VALID");
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <label className='alert alert-success'>
          {"You are logged in, you cannot register. Log Out to register"}
        </label>
      ) : registrationSuccessful ? (
        <div className='alert alert-success text-center'>
          <h4>Successful registration, check your email</h4>
          <p>Please check your email inbox for activation instructions.</p>
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <form
          onSubmit={handleSubmit}
          className='register-form-custom d-flex flex-column justify-content-center align-items-center mx-auto'
        >
          <div className='input-group-register'>
            <UsernameField
              value={username}
              customClasses='text-center w-100'
              onChange={setUsername}
              onValidate={setIsUsernameValid}
              disabled={false}
            />
            {usernameFieldError && <label className='text-danger'>{usernameFieldError}</label>}
          </div>
          <div className='input-group-register'>
            <EmailField
              value={email}
              onChange={setEmail}
              onValidate={setIsEmailValid}
              disabled={false}
            />
            {emailFieldError && <label className='text-danger'>{emailFieldError}</label>}
          </div>
          <div className='input-group-register'>
            <NewPasswordWithPasswordRepeatField
              customClassesForNewPassword={"w-100"}
              customClassesForPasswordRepeat={"w-100"}
              passwordValue={password}
              passwordRepeatValue={passwordConfirm}
              onChangePassword={setPassword}
              onChangePasswordConfirm={setPasswordConfirm}
              onValidate={setIsPasswordWithPasswordConfirmValid}
            />
          </div>
          <RecaptchaField
            customClasses=''
            onValidate={setIsValidRecaptchaToken}
            setReturnToken={setReCaptchaToken}
          />
          <button type='submit' className='btn btn-primary mt-3' disabled={!isValid}>
            Submit
          </button>
          {errorMessage && <label className='alert alert-warning'>{errorMessage}</label>}
        </form>
      )}
    </div>
  );
};

export default RegisterFormComponent;