import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCategoryTree } from "./thunks";

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
  },
});

export const { clearCategories } = categoryTreeSlice.actions;
export const categoryReducer = categoryTreeSlice.reducer;
