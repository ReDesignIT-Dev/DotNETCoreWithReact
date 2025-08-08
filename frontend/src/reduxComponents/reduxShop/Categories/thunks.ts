import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategoriesTree } from "services/shopServices/apiRequestsShop";



export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchCategoryTree",
  async () => {
    const response = await getAllCategoriesTree();
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Failed to fetch categories");
    }
  },
  {
condition: (_, { getState }) => {
      const state = getState() as { categories: { isLoading: boolean } };
      return !state.categories.isLoading; 
},
  }
);
