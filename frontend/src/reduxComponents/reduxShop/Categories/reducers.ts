import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCategoryFlat, fetchCategoryTree } from "./thunks";

// Initial State for Tree Categories
const initialStateTree: CategoryTreeStore = { 
  categories: [], 
  isLoading: false, 
  error: false 
};

// Slice for categoryTree
const categoryTreeSlice = createSlice({
  name: "categoriesTree",
  initialState: initialStateTree,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryTree.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCategoryTree.fulfilled, (state, action: PayloadAction<CategoryNode[]>) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategoryTree.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

// Initial State for Flat Categories
const initialStateFlat: CategoryStore = { 
  categories: [], 
  isLoading: false, 
  error: false 
};

// Slice for categoryFlat
const categoryFlatSlice = createSlice({
  name: "categoriesFlat",
  initialState: initialStateFlat,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryFlat.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCategoryFlat.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategoryFlat.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

export const categoryTreeReducer = categoryTreeSlice.reducer;
export const categoryFlatReducer = categoryFlatSlice.reducer;
