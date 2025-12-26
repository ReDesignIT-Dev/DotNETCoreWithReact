import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';

interface SingleImageUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  maxSize?: number;
  accept?: string;
  currentFileName?: string;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  onFileSelect,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/*',
  currentFileName
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file && file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleClick = () => {
    const input = document.getElementById('single-image-upload-input') as HTMLInputElement;
    input?.click();
  };

  return (
    <Paper
      sx={{
        p: 3,
        border: '2px dashed',
        borderColor: 'grey.300',
        borderRadius: 2,
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          borderColor: disabled ? 'grey.300' : 'primary.main',
          bgcolor: disabled ? 'background.paper' : 'action.hover',
        }
      }}
      onClick={disabled ? undefined : handleClick}
    >
      <input
        id="single-image-upload-input"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      
      {currentFileName ? (
        <>
          <ImageIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {currentFileName}
          </Typography>
          <Button
            variant="text"
            size="small"
            sx={{ mt: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Change Image
          </Button>
        </>
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            Click to select an image
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Accepted formats: JPEG, PNG, GIF, WebP (Max {Math.round(maxSize / 1024 / 1024)}MB)
          </Typography>
        </>
      )}
    </Paper>
  );
};