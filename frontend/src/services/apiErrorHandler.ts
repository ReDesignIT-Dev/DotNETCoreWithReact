import { AxiosError } from "axios";
import { GeneralApiError, MultipleFieldErrors } from "./CustomErrors";

// Define the type for the error response data
interface ErrorResponseData {
  username?: string[];
  email?: string[];
  detail?: string;
}

// Type guard to check if an error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export function apiErrorHandler(error: unknown): void {
  if (isAxiosError(error)) {
    if (error.response) {
      // Type assertion for the response data
      const responseData = error.response.data as ErrorResponseData;

      const errors: { field: string; message: string }[] = [];

      if (responseData.username) {
        errors.push({ field: "username", message: responseData.username.join(", ") });
      }
      if (responseData.email) {
        errors.push({ field: "email", message: responseData.email.join(", ") });
      }
      if (responseData.detail) {
        errors.push({ field: "detail", message: responseData.detail });
      }

      if (errors.length > 0) {
        throw new MultipleFieldErrors(errors);
      }

      throw new GeneralApiError(`API Error: ${error.response.statusText}`);
    } else if (error.request) {
      console.error("My handler Network Error:", error.request);
      throw new GeneralApiError("Network Error: Please check your internet connection.");
    } else {
      console.error("My handler Error:", error.message);
      throw new GeneralApiError(`Error: ${error.message}`);
    }
  } else {
    console.error("Unknown Error:", error);
    throw new GeneralApiError("An unknown error occurred.");
  }
}
