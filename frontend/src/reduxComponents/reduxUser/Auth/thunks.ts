import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";
import { isTokenValid, getValidatedToken } from "utils/cookies";
import { logout } from "./authReducer";

export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const reduxToken = state.auth.token;
    const cookieToken = getValidatedToken();

    console.log('🔍 validateToken debug:', {
      reduxToken: !!reduxToken,
      cookieToken: !!cookieToken,
      isTokenValid: isTokenValid()
    });

    // Only logout if both Redux and cookies indicate invalid session
    if (!cookieToken || !isTokenValid()) {
      console.log('⚠️ Token invalid, dispatching logout');
      dispatch(logout());
    } else {
      console.log('✅ Token is valid');
    }
  }
);