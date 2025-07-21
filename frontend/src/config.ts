// config.ts
export const FRONTEND_SHOP_URL: string = "/shop";

export const BACKEND_BASE_URL: string = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8000";
export const FRONTEND_BASE_URL: string = process.env.REACT_APP_FRONTEND_BASE_URL || "http://localhost:3000";
export const BACKEND_SHOP_URL: string =  "api/shop";
export const BACKEND_USER_URL: string = "api/auth";
export const BACKEND_HOME_URL: string = "api/myprojects";
export const RECAPTCHA_SITEKEY: string = process.env.REACT_APP_RECAPTCHA_SITEKEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"

// main page
export const FRONTEND_ABOUT_URL: string = "/about";
export const FRONTEND_CONTACT_URL: string = "/contact";

// user login/register - SHOP BASED
export const ROUTE_PATH_LOGIN: string = "/login";
export const FRONTEND_LOGIN_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_LOGIN}`;
export const ROUTE_PATH_REGISTER: string = "/register";
export const FRONTEND_REGISTER_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_REGISTER}`;
export const ROUTE_PATH_ACTIVATE_USER: string = "/activate/:token";
export const FRONTEND_ACTIVATE_USER_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_ACTIVATE_USER}`;
export const ROUTE_PATH_PASSWORD_RECOVERY: string = "/password-recovery";
export const FRONTEND_PASSWORD_RECOVERY_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PASSWORD_RECOVERY}`;
export const ROUTE_PATH_PASSWORD_RESET: string = "/passwrod-reset/:token";
export const FRONTEND_PASSWORD_RESET_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PASSWORD_RESET}`;

// shop based
export const PRODUCT_PATH: string = "/product";
export const FRONTEND_PRODUCT_PATH: string = `${FRONTEND_SHOP_URL}${PRODUCT_PATH}`;
export const ROUTE_PATH_PRODUCT: string = `${PRODUCT_PATH}/:slug`;
export const PRODUCT_ADD_PATH: string = "/add";
export const FRONTEND_PRODUCT_ADD_PATH: string = `${FRONTEND_SHOP_URL}${PRODUCT_PATH}${PRODUCT_ADD_PATH}`;
export const ROUTE_PATH_PRODUCT_ADD: string = `${PRODUCT_PATH}${PRODUCT_ADD_PATH}`;
export const FRONTEND_PRODUCT_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_PRODUCT}`;
export const CATEGORY_PATH: string = "/category";
export const FRONTEND_CATEGORY_PATH: string = `${FRONTEND_SHOP_URL}${CATEGORY_PATH}`;
export const ROUTE_PATH_CATEGORY: string = `${CATEGORY_PATH}/:slug`;
export const FRONTEND_CATEGORY_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_CATEGORY}`;
export const ROUTE_PATH_SEARCH: string = "/search";
export const FRONTEND_SEARCH_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_SEARCH}`;
export const ROUTE_PATH_CART: string = "/cart";
export const FRONTEND_CART_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_CART}`;
export const ROUTE_PATH_ADMIN_PANEL: string = "/admin-panel";
export const FRONTEND_ADMIN_PANEL_URL: string = `${FRONTEND_SHOP_URL}${ROUTE_PATH_ADMIN_PANEL}`;

// API urls should match the django urls
export const API_LOGOUT_USER_URL: string = `${BACKEND_USER_URL}/logout`;
export const API_LOGIN_USER_URL: string = `${BACKEND_USER_URL}/login`;
export const API_ACTIVATE_USER_URL: string = `${BACKEND_USER_URL}/activate`;
export const API_REGISTER_USER_URL: string = `${BACKEND_USER_URL}/register`;
export const API_PASSWORD_RESET_URL: string = `${BACKEND_USER_URL}/password-reset`;

// API shop based
export const API_PRODUCTS_QUERY_URL: string = `${BACKEND_SHOP_URL}/products`;
export const API_PRODUCT_URL: string = `${BACKEND_SHOP_URL}/products/`;
export const API_PRODUCT_ADD_URL: string = `${API_PRODUCT_URL}/create`;
export const API_CATEGORY_URL: string = `${BACKEND_SHOP_URL}/category`;
export const API_ALL_CATEGORIES_FLAT: string = `${API_CATEGORY_URL}/flat`;
export const API_SEARCH_URL: string = `${BACKEND_SHOP_URL}/search?string=`;
export const API_SEARCH_ASSOCIATED_CATEGORIES_URL: string = `${BACKEND_SHOP_URL}/search-associated-categories?string=`;
export const API_CART_URL: string = `${BACKEND_SHOP_URL}/cart`;
export const API_ADD_TO_CART_URL: string = `${API_CART_URL}/add`
export const API_UPDATE_CART_URL: string = `${API_CART_URL}/update`
export const API_DELETE_FROM_CART_URL: string = `${API_CART_URL}/delete`

// API home based
export const API_PROJECTS_ALL_URL: string = `${BACKEND_HOME_URL}`;
