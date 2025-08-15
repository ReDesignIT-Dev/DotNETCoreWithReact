import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCategory, getAllCategoriesTree } from "services/shopServices/apiRequestsShop";



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

export const deleteCategoryThunk = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: number) => {
    const response = await deleteCategory(categoryId);
    if (response && response.status === 204) {
      return categoryId; // Return the deleted category ID
    } else {
      throw new Error("Failed to delete category");
    }
  }
);