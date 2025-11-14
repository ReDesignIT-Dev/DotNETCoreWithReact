import shopDefaultImageAsset from "assets/images/shop_default_image.jpg";

// config.ts - Now uses environment variables with fallbacks
export const FRONTEND_SHOP_URL = "/shop";

// These will automatically pick the right environment
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "https://localhost:7288";
export const FRONTEND_BASE_URL = process.env.REACT_APP_FRONTEND_BASE_URL || "http://localhost:3000";
export const RECAPTCHA_SITEKEY = process.env.REACT_APP_RECAPTCHA_SITEKEY || "6LeCoQksAAAAAJAdGvP3gr3BfpfiHSQzWV8bBxqK";

// Debug info (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Backend URL:', BACKEND_BASE_URL);
  console.log('Frontend URL:', FRONTEND_BASE_URL);
}

// Rest of your existing configuration...
export const BACKEND_SHOP_URL = "api/shop";
export const BACKEND_USER_URL = "api/shop/auth";
export const BACKEND_HOME_URL = "api/myprojects";

// main page
export const FRONTEND_ABOUT_URL = "/about";
export const FRONTEND_CONTACT_URL = "/contact";

// user login/register - SHOP BASED
export const ROUTE_PATH_LOGIN = "/login";
export const FRONTEND_LOGIN_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_LOGIN}`;
export const ROUTE_PATH_REGISTER = "/register";
export const FRONTEND_REGISTER_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_REGISTER}`;
export const ROUTE_PATH_ACTIVATE_USER = "/activate/:userId/:token";
export const FRONTEND_ACTIVATE_USER_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_ACTIVATE_USER}`;
export const ROUTE_PATH_PASSWORD_RECOVERY = "/password-recovery"
export const FRONTEND_PASSWORD_RECOVERY_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PASSWORD_RECOVERY}`;
export const ROUTE_PATH_PASSWORD_RESET = "/password-reset/:token";
export const FRONTEND_PASSWORD_RESET_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PASSWORD_RESET}`;

// shop based
export const PRODUCT_PATH = "/product";
export const FRONTEND_PRODUCT_PATH = `${FRONTEND_SHOP_URL}${PRODUCT_PATH}`;
export const ROUTE_PATH_PRODUCT = `${PRODUCT_PATH}/:slug`;
export const PRODUCT_ADD_PATH = "/add";
export const FRONTEND_PRODUCT_ADD_PATH = `${FRONTEND_SHOP_URL}${PRODUCT_PATH}${PRODUCT_ADD_PATH}`;
export const ROUTE_PATH_PRODUCT_ADD = `${PRODUCT_PATH}${PRODUCT_ADD_PATH}`;
export const FRONTEND_PRODUCT_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PRODUCT}`;
export const CATEGORY_PATH = "/category";
export const FRONTEND_CATEGORY_PATH = `${FRONTEND_SHOP_URL}${CATEGORY_PATH}`;
export const ROUTE_PATH_CATEGORY = `${CATEGORY_PATH}/:slug`;
export const FRONTEND_CATEGORY_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_CATEGORY}`;
export const ROUTE_PATH_SEARCH = "/search";
export const FRONTEND_SEARCH_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_SEARCH}`;
export const ROUTE_PATH_CART = "/cart";
export const FRONTEND_CART_URL = `${FRONTEND_SHOP_URL}${ROUTE_PATH_CART}`;

// ============= ADMIN PANELS SEPARATION =============

// SHOP ADMIN PANEL (shop/admin-panel)
export const SHOP_ADMIN_PANEL_URL = "/admin-panel";
export const ROUTE_PATH_SHOP_ADMIN_PANEL = `${SHOP_ADMIN_PANEL_URL}/*`;
export const FRONTEND_SHOP_ADMIN_PANEL_URL = `${FRONTEND_SHOP_URL}${SHOP_ADMIN_PANEL_URL}`;

// MAIN SITE ADMIN PANEL (admin-panel)
export const MAIN_ADMIN_PANEL_URL = "/admin-panel";
export const ROUTE_PATH_MAIN_ADMIN_PANEL = `${MAIN_ADMIN_PANEL_URL}/*`;
export const FRONTEND_MAIN_ADMIN_PANEL_URL = MAIN_ADMIN_PANEL_URL;

// API urls should match the django urls
export const API_LOGOUT_USER_URL = `${BACKEND_USER_URL}/logout`;
export const API_LOGIN_USER_URL = `${BACKEND_USER_URL}/login`;
export const API_ACTIVATE_USER_URL = `${BACKEND_USER_URL}/confirm-email`;
export const API_REGISTER_USER_URL = `${BACKEND_USER_URL}/register`;
export const API_PASSWORD_RESET_URL = `${BACKEND_USER_URL}/password-reset`;

// API shop based
export const API_PRODUCTS_QUERY_URL = `${BACKEND_SHOP_URL}/products`;
export const API_PRODUCT_URL = `${BACKEND_SHOP_URL}/products/`;
export const API_CATEGORY_URL = `${BACKEND_SHOP_URL}/categories/`;
export const API_CATEGORY_PATH_URL = `${API_CATEGORY_URL}path/`;
export const API_ALL_CATEGORIES_TREE = `${API_CATEGORY_URL}tree`;
export const API_SEARCH_URL = `${BACKEND_SHOP_URL}/products?search=`;
export const API_SEARCH_ASSOCIATED_CATEGORIES_URL = `${BACKEND_SHOP_URL}/search-associated-categories`;
export const API_CART_URL = `${BACKEND_SHOP_URL}/cart`;
export const API_ADD_TO_CART_URL = `${API_CART_URL}/add`;
export const API_UPDATE_CART_URL = `${API_CART_URL}/items`;
export const API_DELETE_FROM_CART_URL = `${API_CART_URL}/items`;

// API home based
export const API_PROJECTS_ALL_URL = `${BACKEND_HOME_URL}`;
export const API_ADMIN_PROJECTS_URL = `${BACKEND_BASE_URL}/api/myprojects`;

// ============= SHOP ADMIN PANEL NAVIGATION =============
// Shop admin panel navigation - RELATIVE PATHS for internal navigation
export const SHOP_ADMIN_PRODUCTS_PATH = "products";
export const SHOP_ADMIN_PRODUCTS_ADD_PATH = `${SHOP_ADMIN_PRODUCTS_PATH}/add`;
export const SHOP_ADMIN_PRODUCTS_EDIT_PATH = `${SHOP_ADMIN_PRODUCTS_PATH}/:id/edit`;
export const SHOP_ADMIN_CATEGORIES_PATH = "categories";
export const SHOP_ADMIN_CATEGORIES_ADD_PATH = `${SHOP_ADMIN_CATEGORIES_PATH}/add`;
export const SHOP_ADMIN_CATEGORIES_EDIT_PATH = `${SHOP_ADMIN_CATEGORIES_PATH}/:id/edit`;
export const SHOP_ADMIN_USERS_PATH = "users";
export const SHOP_ADMIN_REPORTS_PATH = "reports";

// Shop admin panel navigation - ABSOLUTE PATHS for external navigation
export const FRONTEND_SHOP_ADMIN_PRODUCTS_URL = `${FRONTEND_SHOP_ADMIN_PANEL_URL}/${SHOP_ADMIN_PRODUCTS_PATH}`;
export const FRONTEND_SHOP_ADMIN_CATEGORIES_URL = `${FRONTEND_SHOP_ADMIN_PANEL_URL}/${SHOP_ADMIN_CATEGORIES_PATH}`;
export const FRONTEND_SHOP_ADMIN_USERS_URL = `${FRONTEND_SHOP_ADMIN_PANEL_URL}/${SHOP_ADMIN_USERS_PATH}`;
export const FRONTEND_SHOP_ADMIN_REPORTS_URL = `${FRONTEND_SHOP_ADMIN_PANEL_URL}/${SHOP_ADMIN_REPORTS_PATH}`;

// ============= MAIN SITE ADMIN PANEL NAVIGATION =============
// Main site admin panel navigation - RELATIVE PATHS for internal navigation
export const MAIN_ADMIN_PROJECTS_PATH = "projects";
export const MAIN_ADMIN_PROJECTS_ADD_PATH = `${MAIN_ADMIN_PROJECTS_PATH}/add`;
export const MAIN_ADMIN_PROJECTS_EDIT_PATH = `${MAIN_ADMIN_PROJECTS_PATH}/:id/edit`;
export const MAIN_ADMIN_SETTINGS_PATH = "settings";
export const MAIN_ADMIN_ANALYTICS_PATH = "analytics";

// Main site admin panel navigation - ABSOLUTE PATHS for external navigation
export const FRONTEND_MAIN_ADMIN_PROJECTS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_PROJECTS_PATH}`;
export const FRONTEND_MAIN_ADMIN_SETTINGS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_SETTINGS_PATH}`;
export const FRONTEND_MAIN_ADMIN_ANALYTICS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_ANALYTICS_PATH}`;

// ============= HELPER FUNCTIONS =============
// Shop Admin Helper functions
export const getShopAdminProductEditPath = (id: number) => `${SHOP_ADMIN_PRODUCTS_PATH}/${id}/edit`;
export const getShopAdminCategoryEditPath = (id: number) => `${SHOP_ADMIN_CATEGORIES_PATH}/${id}/edit`;
export const getShopProductEditPath = (id: number) => `${id}/edit`;
export const getShopCategoryEditPath = (id: number) => `${id}/edit`;
export const getShopProductAddPath = () => "add";
export const getShopCategoryAddPath = () => "add";

// Main Site Admin Helper functions
export const getMainAdminProjectEditPath = (id: number) => `${MAIN_ADMIN_PROJECTS_PATH}/${id}/edit`;
export const getMainProjectEditPath = (id: number) => `${id}/edit`;
export const getMainProjectAddPath = () => "add";

// ============= BACKWARD COMPATIBILITY (DEPRECATED - TO BE REMOVED) =============
// Keep these for now to avoid breaking existing code, but mark as deprecated
/** @deprecated Use SHOP_ADMIN_PRODUCTS_PATH instead */
export const ADMIN_PRODUCTS_PATH = SHOP_ADMIN_PRODUCTS_PATH;
/** @deprecated Use SHOP_ADMIN_PRODUCTS_ADD_PATH instead */
export const ADMIN_PRODUCTS_ADD_PATH = SHOP_ADMIN_PRODUCTS_ADD_PATH;
/** @deprecated Use SHOP_ADMIN_PRODUCTS_EDIT_PATH instead */
export const ADMIN_PRODUCTS_EDIT_PATH = SHOP_ADMIN_PRODUCTS_EDIT_PATH;
/** @deprecated Use SHOP_ADMIN_CATEGORIES_PATH instead */
export const ADMIN_CATEGORIES_PATH = SHOP_ADMIN_CATEGORIES_PATH;
/** @deprecated Use SHOP_ADMIN_CATEGORIES_ADD_PATH instead */
export const ADMIN_CATEGORIES_ADD_PATH = SHOP_ADMIN_CATEGORIES_ADD_PATH;
/** @deprecated Use SHOP_ADMIN_CATEGORIES_EDIT_PATH instead */
export const ADMIN_CATEGORIES_EDIT_PATH = SHOP_ADMIN_CATEGORIES_EDIT_PATH;
/** @deprecated Use SHOP_ADMIN_USERS_PATH instead */
export const ADMIN_USERS_PATH = SHOP_ADMIN_USERS_PATH;
/** @deprecated Use SHOP_ADMIN_REPORTS_PATH instead */
export const ADMIN_REPORTS_PATH = SHOP_ADMIN_REPORTS_PATH;
/** @deprecated Use getShopProductEditPath instead */
export const getProductEditPath = getShopProductEditPath;
/** @deprecated Use getShopCategoryEditPath instead */
export const getCategoryEditPath = getShopCategoryEditPath;
/** @deprecated Use getShopProductAddPath instead */
export const getProductAddPath = getShopProductAddPath;
/** @deprecated Use getShopCategoryAddPath instead */
export const getCategoryAddPath = getShopCategoryAddPath;

// ============= ASSET CONFIGURATION =============
export const DEFAULT_IMAGES = {
  SHOP_DEFAULT: shopDefaultImageAsset,
} as const;

export const SHOP_DEFAULT_IMAGE = DEFAULT_IMAGES.SHOP_DEFAULT;