import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useNotification } from 'contexts/NotificationContext';

const NotificationDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleSuccess = () => {
    showSuccess('Product successfully added to cart!');
  };

  const handleError = () => {
    showError('Failed to add product to cart. Please try again.');
  };

  const handleWarning = () => {
    showWarning('Low stock warning: Only 3 items remaining!');
  };

  const handleInfo = () => {
    showInfo('New feature: You can now save items to wishlist!');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Toast Notification Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test the professional toast notification system used throughout the cart functionality.
      </Typography>
      
      <Stack spacing={2}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleSuccess}
          fullWidth
        >
          Show Success Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleError}
          fullWidth
        >
          Show Error Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={handleWarning}
          fullWidth
        >
          Show Warning Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="info" 
          onClick={handleInfo}
          fullWidth
        >
          Show Info Notification
        </Button>
      </Stack>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>Notification Features:</strong>
        </Typography>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Professional Material-UI design</li>
          <li>Appears at top-center of screen with slide-down animation</li>
          <li>Different colors for success (green), error (red), warning (orange), info (blue)</li>
          <li>Auto-dismisses after 4-6 seconds depending on type</li>
          <li>Can be manually closed by clicking the X button</li>
          <li>Only shows success when server responds with status 200/201/204</li>
        </ul>
      </Box>
    </Box>
  );
};

export default NotificationDemo;