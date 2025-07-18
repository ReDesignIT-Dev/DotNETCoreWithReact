import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";

// Basic selectors
export const selectTreeCategories = (state: RootState) => state.categoriesTree.categories;
export const selectIsTreeLoading = (state: RootState) => state.categoriesTree.isLoading;
export const selectTreeCategoriesError = (state: RootState) => state.categoriesTree.error;

export const selectFlatCategories = (state: RootState) => state.categoriesFlat.categories;
export const selectIsFlatLoading = (state: RootState) => state.categoriesFlat.isLoading;
export const selectFlatCategoriesError = (state: RootState) => state.categoriesFlat.error;

// Select category by ID
export const selectTreeCategoryById = createSelector(
  [selectTreeCategories, (_: RootState, id: number) => id],
  (categories, id) => {
    const findCategoryRecursive = (cats: CategoryNode[], targetId: number): CategoryNode | null => {
      for (const cat of cats) {
        if (cat.id === targetId) return cat;
        if (cat.children) {
          const found = findCategoryRecursive(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategoryRecursive(categories, id);
  }
);


export const selectFlatCategoryById = createSelector(
  [selectFlatCategories, (_: RootState, id: number) => id],
  (categories, id) => categories.find((cat: Category) => cat.id === id) || null
);

// Select parent category by child ID
export const selectParentCategoryById = createSelector(
  [selectTreeCategories, (_: RootState, childId: number) => childId],
  (categories, childId) => {
    const parentCategory = categories.find((category) =>
      category.children?.some((child) => child.id === childId)
    );

    return parentCategory || null;
  }
);

// Select category ancestors by ID
const ancestorsCache = new Map();

export const selectCategoryAncestors = createSelector(
  [selectFlatCategories, (_: RootState, categoryId: number | null) => categoryId],
  (categories, categoryId) => {
    if (!categoryId) return [];

    // Check cache first
    if (ancestorsCache.has(categoryId)) {
      return ancestorsCache.get(categoryId);
    }

    let currentCategory = categories.find((category) => category.id === categoryId);
    if (!currentCategory) return [];

    const ancestors: CategoryAncestor[] = [];

    while (currentCategory.parentId !== null) {
      const parentCategory = categories.find((category) => category.id === currentCategory?.parentId);
      if (!parentCategory) break;

      ancestors.unshift({ name: parentCategory.name, shortName: parentCategory.shortName, slug: parentCategory.slug });
      currentCategory = parentCategory;
    }

    // Cache the ancestors
    ancestorsCache.set(categoryId, ancestors);

    return ancestors;
  }
);
