import React from "react";
import SignInButton from "./SignInButton";
import SearchBox from "./SearchBox";
import { Link } from "react-router-dom";
import LogoRacoon from "./LogoRacoon";
import CategoryDropdown from "./CategoryDropdown";
import { FaShoppingCart } from "react-icons/fa";
import { ArrowLeft } from "@mui/icons-material";
import { Grid2 } from "@mui/material";
import { Box, Button } from "@mui/material";
import { FRONTEND_BASE_URL, FRONTEND_CART_URL, FRONTEND_SHOP_URL } from "config";

const ShopHeader: React.FC = () => {
  return (
    <Box
      sx={{
        paddingY: "10px",
        paddingX: "10px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "grey",
      }}
    >
      <Grid2 container spacing={2} alignItems="center" flexWrap="nowrap" sx={{width: "100%"}} >
        
        {/* First Row: Logo on Left, Leave Button Center, Sign-in & Cart on Right */}
        <Grid2 sx={{ xs: 12, md: 6 }} display="flex" justifyContent="flex-start" alignItems="center">
          {/* Logo */}
          <Link to={FRONTEND_SHOP_URL}>
            <LogoRacoon />
          </Link>
        </Grid2>

        <Grid2 sx={{ xs: 12, md: 6, width: "100%" }} display="flex" alignItems="center">
          {/* Leave Button */}
          <Link to={FRONTEND_BASE_URL}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowLeft />}
              sx={{ textTransform: "none" }}
            >
              ReDesignIT
            </Button>
          </Link>

          {/* Sign-in and Cart */}
          <Box display="flex" gap={2} alignItems="center" marginLeft={2} justifyContent="flex-end" sx={{width: "100%"}}>
            <Link to={FRONTEND_CART_URL}>
              <FaShoppingCart size={40} />
            </Link>
            <SignInButton />
          </Box>
        </Grid2>

        
        
      </Grid2>
      {/* Second Row: Search Box (Full Width on Small Screens, Moves Below on Large Screens) */}
      <Grid2 sx={{ xs: 12, md: 12, marginTop: "10px" }} display="flex" justifyContent="center">
          <SearchBox />
        </Grid2>
      {/* Always at Bottom: Category Dropdown */}
      <Grid2 sx={{ xs: 12, mt: "auto" }}>
        <CategoryDropdown />
      </Grid2>
    </Box>
  );
};

export default ShopHeader;
