import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategories, getCategoriesTree } from "services/shopServices/apiRequestsShop";

export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchCategoryTree",
  async () => {
    const response = await getCategoriesTree();
    if (response && response.data) {
      return response.data as CategoryNode[];
    } else {
      throw new Error("Failed to fetch categories");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { categoriesTree: CategoryTreeStore };
      return !state.categoriesTree.isLoading;
    },
  }
);

export const fetchCategoryFlat = createAsyncThunk(
  "categories/fetchCategoryFlat",
  async () => {
    const response = await getAllCategories();
    if (response && response.data) {
      const standarizedResponse = response.data.map((category: any) => {
        const { short_name, parent_id, ancestors, ...rest } = category;
        return {
          ...rest,
          shortName: short_name, 
          parentId: parent_id, 
          ancestors: ancestors?.map((ancestor: any) => {
            const { short_name, ...ancestorRest } = ancestor;
            return {
              ...ancestorRest,
              shortName: short_name,
            };
          }) || [],
        };
      }) as Category[];
      return standarizedResponse;
    } else {
      throw new Error("Failed to fetch categories");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { categoriesFlat: CategoryStore };
      return !state.categoriesFlat.isLoading;
    },
  }
);
