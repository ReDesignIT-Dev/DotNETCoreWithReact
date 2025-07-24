import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCategoryFlat } from "./thunks";

const initialState: CategoryState = { 
  flat: [],                   
  tree: [],                
  isLoading: false, 
  error: false,
  lastUpdated: null    
};

const categorySlice = createSlice({
  name: "categories",
  initialState: initialState,
  reducers: {
    clearCategories: (state) => {
      state.flat = [];
      state.tree = [];
      state.error = false;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryFlat.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(fetchCategoryFlat.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.isLoading = false;
      state.flat = action.payload;           // Store flat categories
      state.tree = buildTree(action.payload); // Build and store tree
      state.lastUpdated = Date.now();        // Track when data was updated
      state.error = false;
    });
    builder.addCase(fetchCategoryFlat.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

// Helper function to build tree from flat array
const buildTree = (categories: Category[]): CategoryWithChildren[] => {
  const categoryMap = new Map<number, CategoryWithChildren>();
  
  // Create enhanced categories with children array
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  const rootCategories: CategoryWithChildren[] = [];

  // Build tree structure
  categories.forEach(category => {
    const enhancedCategory = categoryMap.get(category.id);
    if (!enhancedCategory) return;

    if (category.parentId === null) {
      rootCategories.push(enhancedCategory);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(enhancedCategory);
      }
    }
  });

  return rootCategories;
};

export const { clearCategories } = categorySlice.actions;
export const categoryReducer = categorySlice.reducer;
