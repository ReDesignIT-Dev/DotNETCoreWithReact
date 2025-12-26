import React from 'react';
import { Box, Card, CardMedia, IconButton, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface SingleImagePreviewProps {
  imageUrl?: string;
  imageFile?: File;
  altText?: string;
  onRemove: () => void;
  disabled?: boolean;
  title?: string;
}

export const SingleImagePreview: React.FC<SingleImagePreviewProps> = ({
  imageUrl,
  imageFile,
  altText = 'Category image',
  onRemove,
  disabled = false,
  title = 'Current Image'
}) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [imageFile]);

  const displayUrl = preview || imageUrl;

  if (!displayUrl) {
    return null;
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {title}
      </Typography>
      <Card sx={{ maxWidth: 300, position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={displayUrl}
          alt={altText}
          sx={{ objectFit: 'cover' }}
        />
        <IconButton
          size="small"
          onClick={onRemove}
          disabled={disabled}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'error.dark',
            },
            width: 32,
            height: 32,
          }}
        >
          <DeleteIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {imageFile && (
          <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.05)' }}>
            <Typography variant="caption" noWrap>
              {imageFile.name}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              {(imageFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};