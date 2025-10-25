import { RootState } from 'reduxComponents/store';
import { FRONTEND_LOGIN_URL, FRONTEND_REGISTER_URL, FRONTEND_PASSWORD_RECOVERY_URL, FRONTEND_SHOP_URL } from '../../../config';

export const selectPreviousLocation = (state: RootState) =>
    state.navigation.previousLocation;

export const selectCurrentLocation = (state: RootState) =>
    state.navigation.currentLocation;

export const selectNavigationHistory = (state: RootState) =>
    state.navigation.history;

export const selectLastShopLocation = (state: RootState) => {
    const history = state.navigation.history;
    const excludedPaths = [FRONTEND_LOGIN_URL, FRONTEND_REGISTER_URL, FRONTEND_PASSWORD_RECOVERY_URL];

    for (let i = history.length - 1; i >= 0; i--) {
        const path = history[i];
        const isExcluded = excludedPaths.some(excluded => path.startsWith(excluded));
        
        if (!isExcluded) {
            return path;
        }
    }

    return FRONTEND_SHOP_URL; // Default fallback
};