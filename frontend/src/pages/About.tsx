import React from "react";
import { Box, Typography, Container, Divider } from "@mui/material";

const About: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: 4,
        marginY: "auto"
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: 5,
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            About Me
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              fontStyle: "italic",
              marginBottom: 2,
            }}
          >
            {`Hi, I'm Arkadiusz`}
          </Typography>

          <Divider
            sx={{ marginY: 3, borderColor: "rgba(255, 255, 255, 0.3)" }}
          />

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: 3,
            }}
          >
            {`I was a mechanical engineer (3D Designer) for 10 years. Since 2010, when I first encountered programming during my studies, I became fascinated with it and aspired to incorporate it into my future career.`}{" "}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {`Over the years, I had the opportunity to use programming skills, particularly in Visual Basic and Python, to automate repetitive tasks at work. However, I felt that wasn’t enough to fulfill my potential.`}
          </Typography>

          <Divider
            sx={{ marginY: 3, borderColor: "rgba(255, 255, 255, 0.3)" }}
          />

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {`Now, I combine both 3D design and programming skills in my projects to create innovative solutions that bridge both worlds.`}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
