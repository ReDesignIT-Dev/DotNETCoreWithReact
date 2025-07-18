import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Full height to center the box
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white background
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: "4rem", fontWeight: "bold", color: "#333" }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, color: "#555" }}>
          Page Not Found
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "#777" }}>
          Sorry, the page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")} // Navigate to home page
          sx={{ textTransform: "none" }}
        >
          Go Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
