import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ShopHome from "pages/ShopHome";
import ShopHeader from "components/ShopHeader";
import ShopFooter from "components/ShopFooter";
import Login from "pages/Login";
import Register from "pages/Register";
import PasswordRecovery from "pages/PasswordRecovery";
import PasswordReset from "pages/PasswordReset";
import UserActivation from "pages/UserActivation";
import Category from "pages/Category";
import Product from "pages/Product";
import Cart from "pages/Cart";
import SearchPage from "pages/SearchPage";
import NotFound from "pages/NotFound";
import { Box } from "@mui/material";
import {
  ROUTE_PATH_CART,
  ROUTE_PATH_SEARCH,
  ROUTE_PATH_PRODUCT,
  ROUTE_PATH_CATEGORY,
  ROUTE_PATH_LOGIN,
  ROUTE_PATH_REGISTER,
  ROUTE_PATH_PASSWORD_RECOVERY,
  ROUTE_PATH_PASSWORD_RESET,
  ROUTE_PATH_ACTIVATE_USER,
  ROUTE_PATH_PRODUCT_ADD,
  ROUTE_PATH_ADMIN_PANEL,
} from "config";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCategoryTree } from "reduxComponents/reduxShop/Categories/thunks";
import { AppDispatch } from "reduxComponents/store";
import { ProductAdd } from "../components/Admin/ProductAdd";
import { AdminPanel } from "./AdminPanel";
import WebSocketTest from "components/WebSocketTest";

function Shop() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ShopHeader />
      <Box sx={{ flex: 1 }}>
        <Routes>
          <Route path="" element={<ShopHome />} />
          <Route path={ROUTE_PATH_ADMIN_PANEL} element={<AdminPanel />} />
          <Route path={ROUTE_PATH_LOGIN} element={<Login />} />
          <Route path={ROUTE_PATH_REGISTER} element={<Register />} />
          <Route path={ROUTE_PATH_PASSWORD_RECOVERY} element={<PasswordRecovery />} />
          <Route path={ROUTE_PATH_PASSWORD_RESET} element={<PasswordReset />} />
          <Route path={ROUTE_PATH_ACTIVATE_USER} element={<UserActivation />} />
          <Route path={ROUTE_PATH_CATEGORY} element={<Category />} />
          <Route path={ROUTE_PATH_PRODUCT} element={<Product />} />
          <Route path={ROUTE_PATH_PRODUCT_ADD} element={<ProductAdd />} />
          <Route path={ROUTE_PATH_SEARCH} element={<SearchPage />} />
          <Route path={ROUTE_PATH_CART} element={<Cart />} />
          <Route path={ROUTE_PATH_ADMIN_PANEL} element={<AdminPanel />} />
          <Route path="/test-socket" element={<WebSocketTest />}></Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <ShopFooter />
    </Box>
  );
}

export default Shop;
