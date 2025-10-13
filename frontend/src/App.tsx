import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Shop from "pages/Shop";
import NotFound from "pages/NotFound";
import { FRONTEND_SHOP_URL } from "config";
import MainPage from "pages/MainPage";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "reduxComponents/store";
import { validateToken } from "reduxComponents/reduxUser/Auth/thunks";
import { useGlobalLogout } from 'hooks/useGlobalLogout';
import { useUser } from 'hooks/useUser';
import { webSocketService } from 'services/webSocketService';
import { getValidatedToken, isTokenValid, isUserAdmin } from "./utils/cookies";

// Create a wrapper component that uses the Router context
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useUser(); // Get the full auth state for debugging
  const { username, isLoggedIn, token, isLoading } = authState;
  
  useGlobalLogout(); // ✅ This handles logout globally

  // Add debugging logs
  useEffect(() => {
    console.log('🔍 Auth state changed:', { 
      isLoggedIn, 
      username, 
      hasToken: !!token, 
      isLoading 
    });
  }, [isLoggedIn, username, token, isLoading]);

  useEffect(() => {
    console.log('🔄 Dispatching validateToken...');
    dispatch(validateToken());
  }, [dispatch]);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    const connectToWebSocket = async () => {
      console.log('🔄 WebSocket connection check - isLoggedIn:', isLoggedIn, 'user:', username);
      
      if (isLoggedIn && username) {
        try {
          console.log('🔌 User is logged in, connecting to WebSocket...');
          console.log('User details:', { username, isLoggedIn });
          await webSocketService.connect();
          console.log('✅ WebSocket connected for authenticated user');
        } catch (error) {
          console.error('❌ Failed to connect to WebSocket:', error);
        }
      } else {
        console.log('🔓 User not logged in, disconnecting WebSocket...');
        console.log('Debug - isLoggedIn:', isLoggedIn, 'user:', username);
        await webSocketService.disconnect();
      }
    };

    connectToWebSocket();
  }, [isLoggedIn, username]); // ✅ Use isLoggedIn consistently

  // Temporarily add this to test token validity
  useEffect(() => {
    console.log('🔍 Token debug info:');
    console.log('Token from cookies:', getValidatedToken());
    console.log('Is token valid:', isTokenValid());
    console.log('Is user admin:', isUserAdmin());
  }, []);

  return (
    <Routes>
      <Route path="/*" element={<MainPage />} />
      <Route path={`${FRONTEND_SHOP_URL}/*`} element={<Shop />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Box>
  );
}

export default App;
