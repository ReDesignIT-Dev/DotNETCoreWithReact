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
import { NotificationProvider } from 'contexts/NotificationContext';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useUser();
  const { username, isLoggedIn } = authState;
  
  useGlobalLogout();

  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);

  useEffect(() => {
    const connectToWebSocket = async () => {     
      if (isLoggedIn && username) {
        try {
          await webSocketService.connect();
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
        }
      } else {
        await webSocketService.disconnect();
      }
    };

    connectToWebSocket();
  }, [isLoggedIn]);

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
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </BrowserRouter>
    </Box>
  );
}

export default App;
