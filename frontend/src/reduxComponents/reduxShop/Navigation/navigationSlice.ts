import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NavigationState {
  activePath: string;
  menuOpen: boolean;
  breadcrumbs: string[];
  history: string[];
  previousLocation: string | null;
  currentLocation: string | null;
}

const initialState: NavigationState = {
  activePath: '/',
  menuOpen: false,
  breadcrumbs: ['/'],
  history: ['/'],
  previousLocation: null,
  currentLocation: null, 
};

const slice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActivePath(state, action: PayloadAction<string>) {
      const newPath = action.payload;
      if (state.activePath !== newPath) {
        state.previousLocation = state.activePath;
        state.activePath = newPath;
        const last = state.history[state.history.length - 1];
        if (last !== newPath) {
          state.history.push(newPath);
        }
        const segments = newPath.split('/').filter(Boolean);
        state.breadcrumbs = segments.length ? segments.map((s, i) => `/${segments.slice(0, i + 1).join('/')}`) : ['/'];
      }
    },

    navigateTo(state, action: PayloadAction<string>) {
      slice.caseReducers.setActivePath(state, action);
    },

    goBack(state) {
      if (state.history.length > 1) {
        state.history.pop();
        const prev = state.history[state.history.length - 1] || '/';
        state.activePath = prev;
        const segments = prev.split('/').filter(Boolean);
        state.breadcrumbs = segments.length ? segments.map((s, i) => `/${segments.slice(0, i + 1).join('/')}`) : ['/'];
      } else {
        state.activePath = '/';
        state.history = ['/'];
        state.breadcrumbs = ['/'];
      }
    },

    openMenu(state) {
      state.menuOpen = true;
    },

    closeMenu(state) {
      state.menuOpen = false;
    },

    toggleMenu(state) {
      state.menuOpen = !state.menuOpen;
    },

    setBreadcrumbs(state, action: PayloadAction<string[]>) {
      state.breadcrumbs = action.payload.length ? action.payload : ['/'];
    },

    clearHistory(state) {
      state.history = [state.activePath || '/'];
    },
  },
});

export const {
  setActivePath,
  navigateTo,
  goBack,
  openMenu,
  closeMenu,
  toggleMenu,
  setBreadcrumbs,
  clearHistory,
} = slice.actions;

export default slice.reducer;

export const selectActivePath = (state: { navigation: NavigationState }) => state.navigation.activePath;
export const selectMenuOpen = (state: { navigation: NavigationState }) => state.navigation.menuOpen;
export const selectBreadcrumbs = (state: { navigation: NavigationState }) => state.navigation.breadcrumbs;
export const selectHistory = (state: { navigation: NavigationState }) => state.navigation.history;
export const selectPreviousLocation = (state: { navigation: NavigationState }) => 
  state.navigation.previousLocation;