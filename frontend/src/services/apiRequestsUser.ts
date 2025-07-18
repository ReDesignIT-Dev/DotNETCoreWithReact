import apiClient from "services/axiosConfig";
import {
  API_PASSWORD_RESET_URL,
  API_ACTIVATE_USER_URL,
  API_REGISTER_USER_URL,
  API_LOGIN_USER_URL,
  API_LOGOUT_USER_URL,
} from "config";
import { getToken, getValidatedToken, removeToken, removeUserData, setToken } from "utils/cookies";
import { apiErrorHandler } from "./apiErrorHandler";
import { AxiosResponse, AxiosError } from "axios";
import { getHeaders } from "utils/utils";

interface ReCaptchaData {
  recaptcha: string | null;
}

interface UsernameData {
  username: string;
}

interface PasswordData {
  password: string;
  password_confirm: string;
}

interface EmailData {
  email: string;
}

interface LoginData extends ReCaptchaData, UsernameData {
  password: string;
}

interface RegisterData extends ReCaptchaData, UsernameData, PasswordData, EmailData {}

interface PasswordResetData extends ReCaptchaData, PasswordData {}

interface PasswordRecoveryData extends ReCaptchaData, EmailData {}

interface AuthTokenResponse {
  token: string;
  expiry: string;
}

type ApiResponse<T = any> = AxiosResponse<T>;


function handleApiError(error: unknown): void {
  if (error instanceof AxiosError) {
    apiErrorHandler(error);
  } else {
    console.error("An unexpected error occurred:", error);
    throw new Error("An unexpected error occurred");
  }
}

async function makePostRequest<T>(endpoint: string, data: Record<string, any>, additionalHeaders?: Record<string, string>): Promise<ApiResponse<T> | undefined> {
  try {
    const response = await apiClient.post<T>(endpoint, data, {
      headers: getHeaders(additionalHeaders)
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function postData(endpoint: string, data: Record<string, any>): Promise<ApiResponse | undefined> {
  return makePostRequest(endpoint, data);
}

export async function postLogin({ username, password, recaptcha }: LoginData): Promise<ApiResponse<AuthTokenResponse> | undefined> {
  const authString = `${username}:${password}`;
  const encodedAuthString = btoa(authString);

  const response = await makePostRequest<AuthTokenResponse>(
    API_LOGIN_USER_URL,
    { recaptcha },
    { Authorization: `Basic ${encodedAuthString}` }
  );

  if (response?.status === 200) {
    const { token, expiry } = response.data;
    const expire = new Date(expiry);
    setToken(token, expire);
  }
  return response;
}

export async function registerUser(data: RegisterData): Promise<ApiResponse | undefined> {
  return makePostRequest(API_REGISTER_USER_URL, data);
}

export async function getData(endpoint: string): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(endpoint);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function getDataUsingUserToken(endpoint: string, token: string): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(endpoint, {
      headers: getHeaders({
        Authorization: `Token ${token}`
      })
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function activateUser(token: string): Promise<ApiResponse | undefined> {
  return makePostRequest(`${API_ACTIVATE_USER_URL}/${token}`, {});
}

export async function validatePasswordResetToken(token: string): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_PASSWORD_RESET_URL}/${token}`, {
      headers: getHeaders()
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function postPasswordReset(token: string, data: PasswordResetData): Promise<ApiResponse | undefined> {
  return makePostRequest(`${API_PASSWORD_RESET_URL}/${token}`, data);
}

export async function postPasswordRecovery(data: PasswordRecoveryData): Promise<ApiResponse | undefined> {
  return makePostRequest(API_PASSWORD_RESET_URL, data);
}

export async function logoutUser(): Promise<void> {
  const token = getValidatedToken();
  try {
    if (token) {
      await makePostRequest(API_LOGOUT_USER_URL, {}, { Authorization: `Token ${token}` });
      console.log("Logged out successfully");
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.status === 401) {
      console.log("Unauthorized: Already logged out or token invalid.");
      return;
    }
    handleApiError(error);
  } finally {
    removeToken();
    removeUserData();
  }
}