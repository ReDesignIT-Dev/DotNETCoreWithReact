import React, { useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface ImageUploadDropzoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  onDrop,
  disabled = false,
  multiple = true,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  }
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
    disabled
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          borderColor: disabled ? 'grey.300' : 'primary.main',
          bgcolor: disabled ? 'background.paper' : 'action.hover',
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
      {isDragActive ? (
        <Typography>Drop images here...</Typography>
      ) : (
        <Box>
          <Typography variant="body1" gutterBottom>
            Drag & drop images here, or click to select
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Accepted formats: JPEG, PNG, GIF, WebP (Max {Math.round(maxSize / 1024 / 1024)}MB each)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};