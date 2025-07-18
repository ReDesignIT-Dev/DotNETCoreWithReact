import { RECAPTCHA_SITEKEY } from "config";
import React, { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaFieldProps {
  customClasses: string;
  setReturnToken: (token: string | null) => void;
  onValidate: (isValid: boolean) => void;
}

const RecaptchaField: React.FC<RecaptchaFieldProps> = ({ customClasses, setReturnToken, onValidate }) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const isValid = isReCAPTCHAValid();
    onValidate(isValid);
    setReturnToken(recaptchaToken);
  }, [recaptchaToken, onValidate, setReturnToken]);

  const isReCAPTCHAValid = (): boolean => {
    return recaptchaToken !== null;
  };

  return (
    <ReCAPTCHA
      className={`my-1 ${customClasses}`}
      sitekey={RECAPTCHA_SITEKEY}
      onChange={(token) => setRecaptchaToken(token)}
    />
  );
};

export default RecaptchaField;