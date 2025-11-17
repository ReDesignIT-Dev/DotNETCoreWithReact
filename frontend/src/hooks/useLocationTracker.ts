import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'reduxComponents/store';
import { setActivePath } from 'reduxComponents/reduxShop/Navigation/navigationSlice';
import { FRONTEND_LOGIN_URL, FRONTEND_PASSWORD_RECOVERY_URL, FRONTEND_REGISTER_URL } from '../config';

export const useLocationTracker = () => {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fullPath = `${location.pathname}${location.search}${location.hash}`;

        const excludedPaths = [FRONTEND_LOGIN_URL, FRONTEND_REGISTER_URL, FRONTEND_PASSWORD_RECOVERY_URL];
        const shouldTrack = !excludedPaths.some(path => location.pathname.startsWith(path));

        if (shouldTrack) {
            dispatch(setActivePath(fullPath));
        }
    }, [location, dispatch]);
};