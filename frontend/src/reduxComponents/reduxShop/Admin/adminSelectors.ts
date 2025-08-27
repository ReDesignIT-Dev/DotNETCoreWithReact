import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "reduxComponents/store";

export const selectAdminStats = (state: RootState) => state.admin.stats;
export const selectAdminIsLoading = (state: RootState) => state.admin.isLoading;
export const selectAdminError = (state: RootState) => state.admin.error;
export const selectAdminLastUpdated = (state: RootState) => state.admin.lastUpdated;

export const selectProductsCount = createSelector(
  [selectAdminStats],
  (stats) => stats.productsCount
);

export const selectCategoriesCount = createSelector(
  [selectAdminStats],
  (stats) => stats.categoriesCount
);

export const selectUsersCount = createSelector(
  [selectAdminStats],
  (stats) => stats.usersCount
);

export const selectAdminStatsWithLoading = createSelector(
  [selectAdminStats, selectAdminIsLoading, selectAdminError],
  (stats, isLoading, error) => ({
    ...stats,
    isLoading,
    error,
  })
);

// Selector to check if stats need refresh (older than 5 minutes)
export const selectAdminStatsNeedRefresh = createSelector(
  [selectAdminLastUpdated],
  (lastUpdated) => {
    if (!lastUpdated) return true;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastUpdated < fiveMinutesAgo;
  }
);