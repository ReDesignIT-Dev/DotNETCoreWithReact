import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postLogin, logoutUser } from "services/apiRequestsUser";
import { getToken, getValidatedToken, isTokenValid, isUserAdmin, setToken, getIsAdminFromJwt, decodeJwtPayload } from "utils/cookies";

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  expiry: string;
  username: string;
  isAdmin: boolean;
}

// Helper function to extract username from token
function getUsernameFromToken(token: string): string | null {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    
    // The username might be in different claims, try common ones
    return payload.unique_name || payload.username || payload.name || payload.sub || null;
  } catch (e) {
    console.error("Failed to get username from JWT:", e);
    return null;
  }
}

export const loginUser = createAsyncThunk<LoginResponse, { username: string; password: string; recaptchaToken: string | null }>(
  "auth/loginUser",
  async ({ username, password, recaptchaToken }, { rejectWithValue }) => {
    try {
      const response = await postLogin({ username, password, recaptchaToken });
      if (response && response.status === 200) {
        const { token, username } = response.data as LoginResponse;
        console.log("Login response data:", response.data);
        setToken(token);
        const isAdmin = getIsAdminFromJwt(token);
        return { token, username, isAdmin, expiry: "" };
      } else {
        return rejectWithValue("Unexpected response status");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Error Response:", error.response);
        return rejectWithValue(error.response.data || "Server Error");
      } else if (error.request) {
        console.error("No Response Received:", error.request);
        return rejectWithValue("No response from server");
      } else {
        console.error("Error during request setup:", error.message);
        return rejectWithValue("Invalid username or password");
      }
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser(); 
    } catch (error: any) {
      return rejectWithValue(error.response ? error.response.data : "Network Error");
    }
  }
);

// ✅ Fix: Extract username from token on initialization
const initialState: AuthState = {
  isLoggedIn: Boolean(getValidatedToken()) && isTokenValid(),
  username: getValidatedToken() ? getUsernameFromToken(getValidatedToken()!) : null, // ← Extract username from token
  isAdmin: Boolean(getValidatedToken()) && isTokenValid() && isUserAdmin(),
  token: getValidatedToken() || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.username = action.payload.username; 
        state.isAdmin = action.payload.isAdmin;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.isAdmin = false;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.isAdmin = false;
        state.token = null;
        state.username = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;