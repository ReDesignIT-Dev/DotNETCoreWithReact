import React, { useCallback } from "react";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "reduxComponents/reduxUser/Auth/authReducer";
import { useUser } from "hooks/useUser";
import { AppDispatch } from "reduxComponents/store";
import { useNavigate } from "react-router-dom";
import { FRONTEND_LOGIN_URL, FRONTEND_ADMIN_PANEL_URL } from "config";
import { debounce } from "lodash";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { isTokenValid, isUserAdmin } from "utils/cookies";

const SignInButton: React.FC = () => {
  const FaUserCircleIcon = FaUserCircle as React.ComponentType<any>;
  const FaRegUserCircleIcon = FaRegUserCircle as React.ComponentType<any>;
  const user = useUser();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleClick = useCallback(
    debounce(() => {
      if (user?.isLoggedIn) {
        if (!isTokenValid()) {
          dispatch(logout());
          alert("Your session has expired. Please log in again.");
          return;
        }
        dispatch(logout());
      } else {
        navigate(FRONTEND_LOGIN_URL);
      }
    }, 300),
    [user?.isLoggedIn, user?.token, dispatch, navigate]
  );

  // Check admin status from JWT token directly
  const isAdminUser = user?.isLoggedIn && isTokenValid() && isUserAdmin();

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Admin Profile Icon */}
      {isAdminUser && (
        <Tooltip title="Admin Panel">
          <IconButton size="small" sx={{ color: "#fff" }} onClick={() => navigate(FRONTEND_ADMIN_PANEL_URL)}>
            <FaUserCircleIcon size={28} />
          </IconButton>
        </Tooltip>
      )}
      
      {/* Sign In / Log Out */}
      <Box onClick={handleClick} className="loginicon" sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
        {user?.isLoggedIn ? (
          <Typography className="my-auto px-3" color="white">
            Log Out
          </Typography>
        ) : (
          <FaRegUserCircleIcon size={40} />
        )}
      </Box>
    </Box>
  );
};

export default SignInButton;
