import Cookies from "js-cookie";

export const getToken = (): string | null => {
  const token = Cookies.get("token");
  if (!token) return null;
  return token;
};

// Validate the token and remove it if it is expired
export const getValidatedToken = (): string | null => {
  const token = getToken();
  if (token && !isTokenValid()) {
    console.warn("Token has expired. Removing it from cookies.");
    removeToken();
    return null;
  }
  return token;
};

export const removeToken = (): void => {
  Cookies.remove("token");
  Cookies.remove("tokenExpiry");
};

export const setToken = (token: string, expiry: string | Date): void => {
  const expiryDate = new Date(expiry);
  if (isNaN(expiryDate.getTime())) {
    console.error("Invalid expiry date:", expiry);
    throw new Error("Invalid expiry date format");
  }

  try {
    Cookies.set("token", token, { expires: expiryDate });
    Cookies.set("tokenExpiry", expiryDate.toISOString(), { expires: expiryDate });
  } catch (error) {
    console.error("Failed to set token cookie:", error);
  }
};

export const isUserAdmin = (): boolean => {
  return Cookies.get("isAdmin") === "true";
};

export const setIsUserAdmin = (isUserAdmin: boolean): void => {
  Cookies.set("isAdmin", isUserAdmin.toString());
};

export const removeUserData = (): void => {
  Cookies.remove("isAdmin");
};

export const isTokenValid = (): boolean => {
  const token = Cookies.get("token");
  const tokenExpiry = Cookies.get("tokenExpiry");

  if (!token) {
    console.warn("Token is missing.");
    return false;
  }

  if (!tokenExpiry) {
    console.warn("Token expiration date is missing.");
    return false;
  }

  const expiryDate = new Date(tokenExpiry);
  const currentTime = new Date();

  if (currentTime >= expiryDate) {
    console.warn("Token has expired. Removing it from cookies.");
    removeToken();
    return false;
  }

  return true; // Token is valid
};
