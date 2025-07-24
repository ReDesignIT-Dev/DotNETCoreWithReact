import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";

export const selectFlatCategories = (state: RootState) => state.categories.flat;
export const selectTreeCategories = (state: RootState) => state.categories.tree;
export const selectCategoriesIsLoading = (state: RootState) => state.categories.isLoading;
export const selectCategoriesError = (state: RootState) => state.categories.error;

export const selectCategoryById = createSelector(
  [selectFlatCategories, (_: RootState, id: number) => id],
  (categories, id) => categories.find((cat: Category) => cat.id === id) || null
);

// Select parent category by child ID
export const selectParentCategoryById = createSelector(
  [selectFlatCategories, (_: RootState, childId: number) => childId],
  (categories, childId) => {
    const parentCategory = categories.find((category) =>
      category.childrenIds?.some((id) => id === childId)
    );

    return parentCategory || null;
  }
);

export const selectCategoryNodeById = createSelector(
  [selectTreeCategories, (_: RootState, categoryId: number) => categoryId],
  (treeCategories, categoryId) => {
    const findInTree = (categories: CategoryWithChildren[]): CategoryWithChildren | null => {
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

const ancestorsCache = new Map();

// Single selector with includeSelf parameter
export const selectCategoryBreadcrumb = createSelector(
  [
    selectFlatCategories, 
    (_: RootState, categoryId: number | null) => categoryId,
    (_: RootState, categoryId: number | null, includeSelf: boolean = false) => includeSelf
  ],
  (categories, categoryId, includeSelf) => {
    if (!categoryId) return [];

    const findCategory = (id: number) => categories.find((category) => category.id === id);
    const breadcrumb: { shortName: string; slug: string }[] = [];
    
    let currentCategory = findCategory(categoryId);
    if (!currentCategory) return [];

    // Add current category first if includeSelf is true
    if (includeSelf) {
      breadcrumb.push({
        shortName: currentCategory.shortName,
        slug: currentCategory.slug
      });
    }

    // Add ancestors
    while (currentCategory && currentCategory.parentId !== null) {
      const parent = findCategory(currentCategory.parentId);
      if (!parent) break;

      // Add parent to the beginning (so root comes first)
      breadcrumb.unshift({
        shortName: parent.shortName,
        slug: parent.slug
      });
      
      currentCategory = parent;
    }

    return breadcrumb;
  }
);

export const selectCategoryAncestors = createSelector(
  [selectFlatCategories, (_: RootState, categoryId: number | null) => categoryId],
  (categories, categoryId) => {
    if (!categoryId) return [];

    // Check cache first
    if (ancestorsCache.has(categoryId)) {
      return ancestorsCache.get(categoryId);
    }

    const findCategory = (id: number) => categories.find((category) => category.id === id);
    
    let currentCategory = findCategory(categoryId);
    if (!currentCategory) return [];

    const ancestors: CategoryAncestor[] = [];
    let currentId = currentCategory.parentId;

    while (currentId !== null) {
      const parentCategory = findCategory(currentId);
      if (!parentCategory) break;

      ancestors.unshift({ 
        name: parentCategory.name, 
        shortName: parentCategory.shortName, 
        slug: parentCategory.slug 
      });
      
      currentId = parentCategory.parentId;
    }

    // Cache the ancestors
    ancestorsCache.set(categoryId, ancestors);

    return ancestors;
  }
);
