// config.ts
export const FRONTEND_SHOP_URL = "/shop";

export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "https://localhost:7288";
export const FRONTEND_BASE_URL = process.env.REACT_APP_FRONTEND_BASE_URL || "http://localhost:3000";
export const BACKEND_SHOP_URL = "api/shop";
export const BACKEND_USER_URL = "api/shop/auth";
export const BACKEND_HOME_URL = "api/myprojects";
export const RECAPTCHA_SITEKEY = process.env.REACT_APP_RECAPTCHA_SITEKEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

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
export const ROUTE_PATH_PASSWORD_RECOVERY = "/password-recovery";
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
export const ADMIN_PANEL_URL = "/admin-panel"
export const ROUTE_PATH_ADMIN_PANEL = `${ADMIN_PANEL_URL}/*`;
export const FRONTEND_ADMIN_PANEL_URL = `${FRONTEND_SHOP_URL}${ADMIN_PANEL_URL}`;

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
export const API_SEARCH_URL = `${BACKEND_SHOP_URL}/products?string=`;
export const API_SEARCH_ASSOCIATED_CATEGORIES_URL = `${BACKEND_SHOP_URL}/search-associated-categories?string=`;
export const API_CART_URL = `${BACKEND_SHOP_URL}/cart`;
export const API_ADD_TO_CART_URL = `${API_CART_URL}/add`;
export const API_UPDATE_CART_URL = `${API_CART_URL}/update`;
export const API_DELETE_FROM_CART_URL = `${API_CART_URL}/delete`;

// API home based
export const API_PROJECTS_ALL_URL = `${BACKEND_HOME_URL}`;

// admin panel navigation - RELATIVE PATHS for internal navigation
export const ADMIN_PRODUCTS_PATH = "products";
export const ADMIN_PRODUCTS_ADD_PATH = `${ADMIN_PRODUCTS_PATH}/add`;
export const ADMIN_PRODUCTS_EDIT_PATH = `${ADMIN_PRODUCTS_PATH}/:id/edit`;
export const ADMIN_CATEGORIES_PATH = "categories";
export const ADMIN_CATEGORIES_ADD_PATH = `${ADMIN_CATEGORIES_PATH}/add`;
export const ADMIN_CATEGORIES_EDIT_PATH = `${ADMIN_CATEGORIES_PATH}/:id/edit`;
export const ADMIN_USERS_PATH = "users";
export const ADMIN_REPORTS_PATH = "reports";

// admin panel navigation - ABSOLUTE PATHS for external navigation
export const FRONTEND_ADMIN_PRODUCTS_URL = `${FRONTEND_ADMIN_PANEL_URL}/${ADMIN_PRODUCTS_PATH}`;
export const FRONTEND_ADMIN_CATEGORIES_URL = `${FRONTEND_ADMIN_PANEL_URL}/${ADMIN_CATEGORIES_PATH}`;
export const FRONTEND_ADMIN_USERS_URL = `${FRONTEND_ADMIN_PANEL_URL}/${ADMIN_USERS_PATH}`;
export const FRONTEND_ADMIN_REPORTS_URL = `${FRONTEND_ADMIN_PANEL_URL}/${ADMIN_REPORTS_PATH}`;

// Helper functions for dynamic paths
// For navigation from admin panel root
export const getAdminProductEditPath = (id: number) => `${ADMIN_PRODUCTS_PATH}/${id}/edit`;
export const getAdminCategoryEditPath = (id: number) => `${ADMIN_CATEGORIES_PATH}/${id}/edit`;

// For navigation from within products/categories pages (relative)
export const getProductEditPath = (id: number) => `${id}/edit`;
export const getCategoryEditPath = (id: number) => `${id}/edit`;
export const getProductAddPath = () => "add";
export const getCategoryAddPath = () => "add";