import { useEffect } from 'react';
import { webSocketService } from 'services/webSocketService';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'reduxComponents/store';
import { logout as logoutAction } from 'reduxComponents/reduxUser/Auth/authReducer';
import { logoutUser } from 'services/apiRequestsUser';

export function useGlobalLogout() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handleForceLogout = async (data: { reason: string; type: string; timestamp: string }) => {
            alert(`You have been logged out: ${data.reason}`);

            try {
                await logoutUser();
                dispatch(logoutAction());
                await webSocketService.disconnect();
            } catch (error) {
                console.error('Error during forced logout:', error);
            }
            finally {
                navigate('/shop/login', { replace: true });

            }
        };

        const handleGlobalNotification = (data: { message: string; type: string; timestamp: string }) => {
            switch (data.type) {
                case 'error':
                    alert(`Error: ${data.message}`);
                    break;
                case 'warning':
                    alert(`Warning: ${data.message}`);
                    break;
                case 'success':
                    alert(`Success: ${data.message}`);
                    break;
                default:
                    alert(`Info: ${data.message}`);
            }
        };

        webSocketService.on('ForceLogout', handleForceLogout);
        webSocketService.on('GlobalNotification', handleGlobalNotification);

        return () => {
            webSocketService.off('ForceLogout', handleForceLogout);
            webSocketService.off('GlobalNotification', handleGlobalNotification);
        };
    }, [navigate, dispatch]);
}