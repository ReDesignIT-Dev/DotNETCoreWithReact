import React from "react";
import RegisterFormComponent from "components/RegisterFormComponent";
import { FRONTEND_LOGIN_URL } from "config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "hooks/useAuth";
import { Box, Button, Typography } from "@mui/material";

const Register: React.FC = () => {
  const isLoggedIn = useAuth();
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
            navigate(`${FRONTEND_LOGIN_URL}`, { replace: true });
          }}
          sx={{ mt: 2 }}
        >
          {`Already have an account? Click here to Login`}
        </Button>
      
      <Typography variant="h5" sx={{ mt: 2 }}>
        Register
      </Typography>
      </>
      )}
      <RegisterFormComponent />
    </Box>
  );
};

export default Register;