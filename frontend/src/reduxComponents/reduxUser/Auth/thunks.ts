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

    // Only logout if both Redux and cookies indicate invalid session
    if (!cookieToken || !isTokenValid()) {
      dispatch(logout());
    }
  }
);