import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProductsCount, getCategoriesCount } from "services/shopServices/apiRequestsShop";

export const fetchAdminStats = createAsyncThunk(
  "admin/fetchAdminStats",
  async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProductsCount(),
        getCategoriesCount()
      ]);

      const productsCount = productsResponse?.data || 0;
      const categoriesCount = categoriesResponse?.data || 0;

      return {
        productsCount,
        categoriesCount,
        usersCount: 0 // Placeholder until you implement users endpoint
      };
    } catch (error) {
      throw new Error("Failed to fetch admin statistics");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { admin: { isLoading: boolean } };
      return !state.admin.isLoading;
    },
  }
);

export const fetchProductsCount = createAsyncThunk(
  "admin/fetchProductsCount",
  async (params?: { categoryId?: number; search?: string }) => {
    const response = await getProductsCount(params?.categoryId, params?.search);
    if (response && response.data !== undefined) {
      return response.data;
    } else {
      throw new Error("Failed to fetch products count");
    }
  }
);