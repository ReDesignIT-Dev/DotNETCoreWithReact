import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import { selectLastShopLocation } from 'reduxComponents/reduxShop/Navigation/navigationSelectors';

export const useLoginRedirect = (defaultRedirect = '/shop') => {
    const isLoggedIn = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const lastShopLocation = useSelector(selectLastShopLocation);

    const getRedirectDestination = () => {
        if (location.state?.from) {
            return location.state.from;
        }
        if (lastShopLocation && lastShopLocation !== '/' && lastShopLocation.includes('/shop')) {
            return { pathname: lastShopLocation };
        }

        return { pathname: defaultRedirect };
    };

    const redirectTo = getRedirectDestination();

    useEffect(() => {
        if (isLoggedIn) {
            navigate(redirectTo, { replace: true });
        }
    }, [isLoggedIn, navigate, redirectTo]);

    return { from: redirectTo, isLoggedIn };
};