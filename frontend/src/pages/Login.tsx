import React from "react";
import LoginFormComponent from "components/LoginFormComponent";
import { useNavigate } from "react-router-dom";
import { FRONTEND_REGISTER_URL } from "config";
import { useAuth } from "hooks/useAuth";
import { Box, Button, Typography } from "@mui/material";

const Login: React.FC = () => {
  const isLoggedIn: boolean = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mt={3}
    >
      {!isLoggedIn && (
        <>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            navigate(`${FRONTEND_REGISTER_URL}`, { replace: true });
          }}
          sx={{ mt: 2 }}
        >
          {`Don't have an account? Click here to register`}
        </Button>
      
        <Typography variant="h5" sx={{ mt: 2 }}>
          {`Login`}
        </Typography>

        </>
      )}
      <LoginFormComponent />
    </Box>
  );
};

export default Login;
