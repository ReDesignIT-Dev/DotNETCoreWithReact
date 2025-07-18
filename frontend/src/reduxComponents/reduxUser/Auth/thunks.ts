import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";
import { isTokenValid } from "utils/cookies";
import { logout } from "./authReducer";

export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    if (!isTokenValid()) {
      dispatch(logout());
    }
  }
);