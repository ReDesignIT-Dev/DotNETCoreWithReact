import React, { useEffect, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { validatePasswordResetToken, postPasswordReset } from "services/apiRequestsUser";
import Loading from "components/Loading";
import NewPasswordWithPasswordRepeatField from "components/Fields/NewPasswordWithPasswordRepeatField";
import RecaptchaField from "components/Fields/RecaptchaField";

const PasswordReset: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>("");
  const [reCaptchaToken, setReCaptchaToken] = useState<string | null>("");
  const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
  const { token } = useParams<{ token: string }>();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordChangePostSuccess, setPasswordChangePostSuccess] = useState<boolean>(false);

  useEffect(() => {
    setIsValid(isValidReCaptchaToken && isValidToken === true);
  }, [isValidReCaptchaToken, isValidToken]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!token) {
        setErrorMessage("Invalid token.");
        setIsValidToken(false);
        setLoading(false);    
        return;
      }
      
      try {
        const response = await validatePasswordResetToken(token);
        if (response && response.status === 200) {
          setIsValidToken(true);
        }
      } catch (error: any) {
        if (error.message.includes("Network Error")) {
          setErrorMessage("Network Error: Please check your internet connection.");
        } else if (error.message.includes("API Error")) {
          setErrorMessage("Invalid token.");
        } else {
          setErrorMessage("An unknown error occurred.");
        }
        setIsValidToken(false);
      } finally {
        setLoading(false);
      }
    };
    checkTokenValidity();
  }, [token]);

  if (loading) {
    return <Loading />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage("Invalid token.");
      return;
    }
    
    if (isValid) {
      try {
        const response = await postPasswordReset(
          token,
          { password: newPassword, passwordConfirm: newPasswordRepeat, recaptchaToken: reCaptchaToken }
        );

        if (response && response.status === 200) {
          const returnMessage = response.data.message;
          setSuccessMessage(returnMessage);
          setPasswordChangePostSuccess(true);
          setErrorMessage("");
          console.log(returnMessage);
        } else if (response) {
          const errorData = response.data;
          setErrorMessage(errorData.message || "Failed to reset password.");
          setSuccessMessage("");
        }
      } catch (error: any) {
        setErrorMessage("An error occurred. Please try again.");
        setSuccessMessage("");
      }
    } else {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage("");
    }
  };

  return (
    <div className='container d-flex flex-column align-items-center'>
      {passwordChangePostSuccess ? (
        <div className="alert alert-success mt-3">{successMessage}</div>
      ) : isValidToken ? (
        <form
          onSubmit={handleSubmit}
          className='d-flex flex-column justify-content-center align-items-center'
        >
          <NewPasswordWithPasswordRepeatField
            customClassesForNewPassword="w-100"
            customClassesForPasswordRepeat="w-100"
            passwordValue={newPassword}
            passwordRepeatValue={newPasswordRepeat}
            onChangePassword={setNewPassword}
            onChangePasswordConfirm={setNewPasswordRepeat}
            onValidate={setIsValid}
          />
          <RecaptchaField
            customClasses=""
            onValidate={setIsValidRecaptchaToken}
            setReturnToken={setReCaptchaToken}
          />
          <button type='submit' className='btn btn-primary mt-3' disabled={!isValid}>
            Submit
          </button>
        </form>
      ) : (
        <div className="alert alert-danger mt-3">{errorMessage}</div> // Show an error message if the token is invalid
      )}
    </div>
  );
};

export default PasswordReset;