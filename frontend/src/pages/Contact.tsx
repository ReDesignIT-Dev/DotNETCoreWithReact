import React from "react";
import { Box, Typography, Container, Link } from "@mui/material";

const Contact: React.FC = () => {
  return (
    <Box
      sx={{
        color: "white", // White text
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingY: 8, // Vertical padding
        marginTop: '10px',
        marginBottom: 'auto'
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Contact Me
      </Typography>

      <Container
        maxWidth="md"
        sx={{
          textAlign: "center",
          marginTop: 6, // Space below the title
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Slightly transparent white box
          borderRadius: 2,
          padding: 4,
        }}
      >
        <Typography variant="body1" color="inherit" paragraph>
          If you have any questions, suggestions, or need support, feel free to contact me
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Email me at:{" "}
          <Link href="mailto:kontakt@redesignit.pl" color="primary" underline="hover">
            kontakt@redesignit.pl
          </Link>
        </Typography>
        <Typography variant="body2" color="inherit">
         I usually respond within 24-48 hours. Thank you for reaching out!
        </Typography>
      </Container>
    </Box>
  );
};

export default Contact;
