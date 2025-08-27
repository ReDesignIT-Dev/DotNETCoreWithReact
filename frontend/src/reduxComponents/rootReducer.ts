import { combineReducers } from '@reduxjs/toolkit';

import authReducer from "./reduxUser/Auth/authReducer";
import { categoryReducer as categoryTreeReducer } from 'reduxComponents/reduxShop/Categories/reducers';
import { adminReducer } from './reduxShop/Admin/adminReducers';

const rootReducer = combineReducers({
  categories: categoryTreeReducer,
  auth: authReducer,
  admin: adminReducer
});

export default rootReducer;