import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCategoryTree, deleteCategoryThunk } from "./thunks";

interface CategoryTreeState {
  categoryTreeStructure: CategoryTree[];
  isLoading: boolean;
  error: boolean;
  lastUpdated: number | null;
}

const initialState: CategoryTreeState = { 
  categoryTreeStructure: [],                
  isLoading: false, 
  error: false,
  lastUpdated: null    
};

// Helper function to remove category from tree
const removeCategoryFromTree = (categories: CategoryTree[], categoryId: number): CategoryTree[] => {
  return categories
    .filter(category => category.id !== categoryId)
    .map(category => ({
      ...category,
      children: category.children ? removeCategoryFromTree(category.children, categoryId) : []
    }));
};

const categoryTreeSlice = createSlice({
  name: "categoriesTree",
  initialState: initialState,
  reducers: {
    clearCategories: (state) => {
      state.categoryTreeStructure = [];
      state.error = false;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryTree.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(fetchCategoryTree.fulfilled, (state, action: PayloadAction<CategoryTree[]>) => {
      state.isLoading = false;
      state.categoryTreeStructure = action.payload; 
      state.lastUpdated = Date.now();     
      state.error = false;
    });
    builder.addCase(fetchCategoryTree.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
    
    builder.addCase(deleteCategoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(deleteCategoryThunk.fulfilled, (state, action: PayloadAction<number>) => {
      state.isLoading = false;
      state.categoryTreeStructure = removeCategoryFromTree(state.categoryTreeStructure, action.payload);
      state.lastUpdated = Date.now();
      state.error = false;
    });
    builder.addCase(deleteCategoryThunk.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

export const { clearCategories } = categoryTreeSlice.actions;
export const categoryReducer = categoryTreeSlice.reducer;
