import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.scss";

import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { FRONTEND_ABOUT_URL, FRONTEND_CONTACT_URL } from "config";

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, padding: 1 }}>
          <img
            src="logo-redesign.jpg"
            alt="ReDesignIT Logo"
            style={{ height: "60px", marginRight: "10px", borderRadius: 10 }} // Adjust height and spacing as needed
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ReDesignIT
          </Typography>
        </Box>
        <Button color="inherit" onClick={() => navigate("/")}>
          Home
        </Button>
        <Button color="inherit" onClick={() => navigate(FRONTEND_ABOUT_URL)}>
          About Me
        </Button>
        <Button color="inherit" onClick={() => navigate(FRONTEND_CONTACT_URL)}>
          Contact
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
