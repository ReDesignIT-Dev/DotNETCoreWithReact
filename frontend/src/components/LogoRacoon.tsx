import React from "react";
import racoonLogo from "assets/images/racoon-logo.png";
import { Box } from "@mui/material";

const LogoRacoon: React.FC = () => {
  return (
    <Box
      sx={{
        width: 60,
        height: 60,
        minWidth: 60,
        minHeight: 60,
        marginRight: "auto",
        borderRadius: "5px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={racoonLogo}
        alt="Logo"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </Box>
  );
};

export default LogoRacoon;
