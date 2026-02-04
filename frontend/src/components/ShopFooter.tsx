import "./Footer.css";
import { Box, Typography, Link } from "@mui/material";
import { LinkedIn, GitHub, YouTube } from "@mui/icons-material";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: "#333",
        color: "#fff",
        py: 2,
        px: 6,
        display: "flex",
        alignItems: "center",
        mt: 2,
      }}
    >
      <Typography variant="body2" sx={{ textAlign: "center", flex: 1 }}>
        © {currentYear} ReDesignIT. All rights reserved.
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Link
          href="https://www.linkedin.com/in/arkadiusz-budkowski/"
          color="inherit"
          underline="none"
        >
          <LinkedIn fontSize="large" />
        </Link>
        <Link
          href="https://github.com/ReDesignIT-Dev"
          color="inherit"
          underline="none"
        >
          <GitHub fontSize="large" />
        </Link>
        <Link
          href="https://www.youtube.com/@ReDesignIT"
          color="inherit"
          underline="none"
        >
          <YouTube fontSize="large" />
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
