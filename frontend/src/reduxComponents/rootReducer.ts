import { combineReducers } from '@reduxjs/toolkit';

import authReducer from "./reduxUser/Auth/authReducer";
import { categoryReducer } from 'reduxComponents/reduxShop/Categories/reducers';

const rootReducer = combineReducers({
  categories: categoryReducer,
  auth: authReducer,
});

export default rootReducer;