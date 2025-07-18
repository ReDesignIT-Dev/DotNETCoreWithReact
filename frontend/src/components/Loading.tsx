import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loading: React.FC = () => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 200);
    return () => clearTimeout(timer); // Clear timer if unmounted early
  }, []);

  if (!showSpinner) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="30vh"
      gap={2}
    >
      <CircularProgress color="primary" size={60} />
      <Typography variant="h6" color="textSecondary">
        Please wait
      </Typography>
    </Box>
  );
};

export default Loading;
