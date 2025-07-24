import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories } from "services/shopServices/apiRequestsShop";



export const fetchCategoryFlat = createAsyncThunk(
  "categories/fetchCategoryFlat",
  async () => {
    const response = await getAllCategories();
    if (response && response.data) {
      console.log("Fetched categories:", response.data);
      return response.data;
    } else {
      throw new Error("Failed to fetch categories");
    }
  },
  {
condition: (_, { getState }) => {
  const state = getState() as { categories: CategoryState };
  return !state.categories.isLoading;
},
  }
);
