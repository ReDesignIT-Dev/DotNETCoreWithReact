import { useEffect } from 'react';
import { webSocketService } from 'services/webSocketService';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'reduxComponents/store';
import { logout as logoutAction } from 'reduxComponents/reduxUser/Auth/authReducer';
import { logoutUser } from 'services/apiRequestsUser'; // Use your existing function

export function useGlobalLogout() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handleForceLogout = async (data: { reason: string; type: string; timestamp: string }) => {
            console.log('🚪 Force logout received:', data);
            
            // Show notification to user
            alert(`You have been logged out: ${data.reason}`);
            
            try {
                // Use your existing logout function that handles everything properly
                await logoutUser();
                
                // Dispatch Redux logout action to update the store
                dispatch(logoutAction());
                
                // Disconnect WebSocket
                await webSocketService.disconnect();
                
                console.log('✅ Force logout completed successfully');
                
                // Navigate to login page
                navigate('/shop/login', { replace: true });
                
            } catch (error) {
                console.error('❌ Error during force logout:', error);
                
                // Even if logout fails, still navigate to login
                navigate('/shop/login', { replace: true });
            }
        };

        const handleGlobalNotification = (data: { message: string; type: string; timestamp: string }) => {
            console.log('📢 Global notification:', data);
            
            // Show notification based on type
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

        console.log('🔗 Registering global logout handlers');
        webSocketService.on('ForceLogout', handleForceLogout);
        webSocketService.on('GlobalNotification', handleGlobalNotification);

        return () => {
            console.log('🔓 Unregistering global logout handlers');
            webSocketService.off('ForceLogout', handleForceLogout);
            webSocketService.off('GlobalNotification', handleGlobalNotification);
        };
    }, [navigate, dispatch]);
}