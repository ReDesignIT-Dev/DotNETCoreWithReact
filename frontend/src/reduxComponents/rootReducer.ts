import { combineReducers } from '@reduxjs/toolkit';

import authReducer from "./reduxUser/Auth/authReducer";
import { categoryFlatReducer, categoryTreeReducer } from 'reduxComponents/reduxShop/Categories/reducers';

const rootReducer = combineReducers({
  categoriesTree: categoryTreeReducer,
  categoriesFlat: categoryFlatReducer,
  auth: authReducer,
});

export default rootReducer;