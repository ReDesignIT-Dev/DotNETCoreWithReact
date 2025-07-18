import React from "react";
import { Box, Typography } from "@mui/material";
import ProjectsBox from "components/ProjectsBox";

const Home: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          height: "25vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
          paddingX: { xs: 4, md: 8, lg: 16 },
          paddingY: { xs: 4, md: 8 },
          width: "100vw",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to ReDesignIT
        </Typography>
        <Typography variant="h6" sx={{ textAlign: "right" }}>
          A portfolio by Arkadiusz Budkowski – Showcasing innovative web
          solutions
        </Typography>
      </Box>
      <Box sx={{ marginTop: '20px', marginBottom: "auto" }}>
      <ProjectsBox />
      </Box>
    </>
  );
};

export default Home;
