import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";

export const selectTreeCategories = (state: RootState) => state.categories.categoryTreeStructure;
export const selectCategoriesIsLoading = (state: RootState) => state.categories.isLoading;
export const selectCategoriesError = (state: RootState) => state.categories.error;

export const selectCategoryById = createSelector(
  [selectTreeCategories, (_: RootState, categoryId: number) => categoryId],
  (treeCategories, categoryId): Category | null => {
    const findInTree = (categories: CategoryTree[]): Category | null => {
      for (const category of categories) {
        if (category.id === categoryId) {
          // Return without children
          const { children, ...categoryBasic } = category;
          return categoryBasic;
        }
        
        if (category.children && category.children.length > 0) {
          const found = findInTree(category.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(treeCategories);
  }
);

export const selectCategoryTreeById = createSelector(
  [selectTreeCategories, (_: RootState, categoryId: number) => categoryId],
  (treeCategories, categoryId) => {
    const findInTree = (categories: CategoryTree[]): CategoryTree | null => {
      for (const category of categories) {
        if (category.id === categoryId) {
          return category;
        }
        
        // Fixed: check category.children, not category.childrenIds
        if (category.children && category.children.length > 0) {
          const found = findInTree(category.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(treeCategories);
  }
);

