import { combineReducers } from '@reduxjs/toolkit';
import navigationReducer from "./reduxShop/Navigation/navigationSlice";
import authReducer from "./reduxUser/Auth/authReducer";
import { categoryReducer as categoryTreeReducer } from 'reduxComponents/reduxShop/Categories/reducers';
import { adminReducer } from './reduxShop/Admin/adminReducers';

const rootReducer = combineReducers({
    categories: categoryTreeReducer,
    auth: authReducer,
    admin: adminReducer,
    navigation: navigationReducer,

});

export default rootReducer;