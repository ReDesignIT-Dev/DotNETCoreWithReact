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

export const setToken = (token: string): void => {
    const expiryDate = getJwtExpiry(token)
    if (!expiryDate) {
    console.error("Failed to get expiry date from token.");
    throw new Error("Invalid token format or missing expiry date");
  }
  if (isNaN(expiryDate.getTime())) {
    console.error("Invalid expiry date:", expiryDate);
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
  const token = getToken();
  if (!token) return false;
  
  return getIsAdminFromJwt(token);
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

export function getJwtExpiry(token: string): Date | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp) {
      // exp is in seconds since epoch
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error("Failed to decode JWT payload:", e);
    return null;
  }
}

export function getIsAdminFromJwt(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    
    // Check if the role array contains "Admin"
    if (Array.isArray(payload.role)) {
      return payload.role.includes("Admin");
    }
    
    // Fallback: check if role is a single string
    if (typeof payload.role === "string") {
      return payload.role === "Admin";
    }
    
    return false;
  } catch (e) {
    console.error("Failed to get admin status from JWT:", e);
    return false;
  }
}
