import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FRONTEND_SHOP_URL } from "config";

const NotFoundProducts: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
          {`No Products Found`}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>
          {`We couldn't find any products matching your search.`}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "#777" }}>
          {`Try adjusting your search or browse our categories.`}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(FRONTEND_SHOP_URL)} sx={{ textTransform: "none" }}>
          {`Back to shop`}
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundProducts;
