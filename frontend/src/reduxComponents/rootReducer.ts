import { combineReducers } from '@reduxjs/toolkit';

import authReducer from "./reduxUser/Auth/authReducer";
import { categoryReducer as categoryTreeReducer } from 'reduxComponents/reduxShop/Categories/reducers';

const rootReducer = combineReducers({
  categories: categoryTreeReducer,
  auth: authReducer,
});

export default rootReducer;