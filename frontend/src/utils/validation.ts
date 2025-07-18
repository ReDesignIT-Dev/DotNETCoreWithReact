import { getToken, getValidatedToken } from "./cookies";

export function isEmailValid(emailToTest: string): boolean {
  const emailRegex = 
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(emailToTest);
}

export function isLengthValid(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

export function isUppercaseValid(password: string): boolean {
  return /[A-Z]/.test(password);
}

export function isLowercaseValid(password: string): boolean {
  return /[a-z]/.test(password);
}

export function isDigitValid(password: string): boolean {
  return /\d/.test(password);
}

export function isSpecialCharValid(password: string): boolean {
  return /[@$!%*?&#^()]/.test(password);
}

export function isPasswordValid(password: string): boolean {
  const validations = [
    isLengthValid,
    isUppercaseValid,
    isLowercaseValid,
    isDigitValid,
    isSpecialCharValid,
  ];
  if (!password) {
    return false;
  }
  for (const func of validations) {
    const isValid = func(password);
    if (!isValid) {
      return false;
    }
  }
  return true;
}

export function isUserLoggedIn(): boolean {
  const token = getValidatedToken();
  return token ? true : false;
}