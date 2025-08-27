import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAdminStats, fetchProductsCount } from "./adminThunks";

interface AdminStatsData {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
}

interface AdminState {
  stats: AdminStatsData;
  isLoading: boolean;
  error: boolean;
  lastUpdated: number | null;
}

const initialState: AdminState = {
  stats: {
    productsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
  },
  isLoading: false,
  error: false,
  lastUpdated: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {
    clearAdminStats: (state) => {
      state.stats = {
        productsCount: 0,
        categoriesCount: 0,
        usersCount: 0,
      };
      state.error = false;
      state.lastUpdated = null;
    },
    updateProductsCount: (state, action: PayloadAction<number>) => {
      state.stats.productsCount = action.payload;
      state.lastUpdated = Date.now();
    },
    updateCategoriesCount: (state, action: PayloadAction<number>) => {
      state.stats.categoriesCount = action.payload;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminStats.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(fetchAdminStats.fulfilled, (state, action: PayloadAction<AdminStatsData>) => {
      state.isLoading = false;
      state.stats = action.payload;
      state.lastUpdated = Date.now();
      state.error = false;
    });
    builder.addCase(fetchAdminStats.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });

    builder.addCase(fetchProductsCount.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(fetchProductsCount.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.stats.productsCount = action.payload;
      state.lastUpdated = Date.now();
      state.error = false;
    });
    builder.addCase(fetchProductsCount.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

export const { clearAdminStats, updateProductsCount, updateCategoriesCount } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;