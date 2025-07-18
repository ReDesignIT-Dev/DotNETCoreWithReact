export const SET_CATEGORIES_FLAT = 'SET_CATEGORIES_FLAT';

interface SetFlatCategoriesAction {
  type: typeof SET_CATEGORIES_FLAT;
  payload: Category[];
}

export type CategoryTreeActionTypes = SetFlatCategoriesAction;

export const setFlatCategories = (categories: Category[]): CategoryTreeActionTypes => ({
  type: SET_CATEGORIES_FLAT,
  payload: categories,
});

export const SET_CATEGORIES_TREE = 'SET_CATEGORIES_TREE';

interface SetTreeCategoriesAction {
  type: typeof SET_CATEGORIES_TREE;
  payload: CategoryNode[];
}

export type CategoryFlatActionTypes = SetTreeCategoriesAction;

export const setTreeCategories = (categories: CategoryNode[]): CategoryFlatActionTypes => ({
  type: SET_CATEGORIES_TREE,
  payload: categories,
});