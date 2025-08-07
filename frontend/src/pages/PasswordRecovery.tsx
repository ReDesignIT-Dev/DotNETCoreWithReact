import React, { useState, useEffect, FormEvent } from "react";
import RecaptchaField from "components/Fields/RecaptchaField";
import EmailField from "components/Fields/EmailField";
import { postPasswordRecovery } from "services/apiRequestsUser";
import Loading from "components/Loading";

const PasswordRecovery: React.FC = () => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
  const [isValidReCaptchaToken, setIsValidRecaptchaToken] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const valid = isEmailValid && isValidReCaptchaToken;
    setIsValid(valid);
  }, [isEmailValid, isValidReCaptchaToken]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isValid) {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await postPasswordRecovery({ email, recaptcha: reCaptchaToken });
        if (response && response.data) {
          const returnMessage = response.data.message;
          if (response.status === 200) {
            setPostSuccess(true);
            setSuccessMessage(returnMessage);
            setErrorMessage("");
            console.log(returnMessage);
          } else {
            setErrorMessage(returnMessage);
          }
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } catch (error: any) {
        setErrorMessage(error.message);
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMessage("FORM IS NOT VALID");
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : postSuccess ? (
        <label className="alert alert-success">{successMessage}</label>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='d-flex flex-column justify-content-center align-items-center'
        >
          <label className='text-black'>
            {
              "Enter your user account's verified email address and we will send you a password reset link."
            }
          </label>
          <EmailField
            value={email}
            disabled={false}
            onChange={setEmail}
            onValidate={setIsEmailValid}
          />
          <RecaptchaField
            customClasses=''
            onValidate={setIsValidRecaptchaToken}
            setReturnToken={setReCaptchaToken}
          />
          <button type='submit' className='btn btn-primary mt-3' disabled={!isValid}>
            Submit
          </button>
          {errorMessage && <label className="alert alert-warning">{errorMessage}</label>}
        </form>
      )}
    </div>
  );
};

export default PasswordRecovery;