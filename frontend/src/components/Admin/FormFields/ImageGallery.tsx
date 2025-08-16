import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton, 
  Typography, 
  Chip 
} from '@mui/material';
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface ImageItem {
  id: string | number;
  url?: string;
  preview?: string;
  name?: string;
  size?: number;
  position?: number;
  altText?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onReorder?: (result: DropResult) => void;
  onRemove: (id: string | number) => void;
  title?: string;
  showDragHandle?: boolean;
  showPosition?: boolean;
  showFileInfo?: boolean;
  disabled?: boolean;
  markedForDeletion?: (string | number)[];
  onRestore?: (id: string | number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onReorder,
  onRemove,
  title,
  showDragHandle = true,
  showPosition = true,
  showFileInfo = true,
  disabled = false,
  markedForDeletion = [],
  onRestore
}) => {
  if (images.length === 0) return null;

  const content = (
    <>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title} ({images.length})
          {showDragHandle && onReorder && " - Drag to reorder:"}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {images.map((image, index) => {
          const isMarkedForDeletion = markedForDeletion.includes(image.id);
          const imageUrl = image.url || image.preview;
          
          const cardContent = (
            <Card 
              sx={{ 
                position: 'relative',
                opacity: isMarkedForDeletion ? 0.5 : 1,
                filter: isMarkedForDeletion ? 'grayscale(100%)' : 'none',
                transform: 'none',
                boxShadow: 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%', // 1:1 aspect ratio
                  overflow: 'hidden',
                }}
              >
                {imageUrl && (
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={image.altText || `Image ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}

                {/* Position indicator */}
                {showPosition && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {image.position || index + 1}
                  </Box>
                )}

                {/* Drag handle */}
                {showDragHandle && onReorder && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      borderRadius: 1,
                      p: 0.5,
                      cursor: 'grab',
                      '&:active': {
                        cursor: 'grabbing'
                      }
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16 }} />
                  </Box>
                )}

                {/* Remove/Restore button */}
                {isMarkedForDeletion && onRestore ? (
                  <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                    <Chip
                      label="Restore"
                      size="small"
                      color="success"
                      onClick={() => onRestore(image.id)}
                      disabled={disabled}
                    />
                  </Box>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(image.id)}
                    disabled={disabled}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark',
                      },
                      width: 24,
                      height: 24,
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
              
              {showFileInfo && (image.name || image.size) && (
                <CardContent sx={{ py: 1 }}>
                  {image.name && (
                    <Typography variant="caption" noWrap>
                      {image.name}
                    </Typography>
                  )}
                  {image.size && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                </CardContent>
              )}
            </Card>
          );

          return (
            <Grid item xs={6} sm={4} md={3} key={image.id}>
              {cardContent}
            </Grid>
          );
        })}
      </Grid>
    </>
  );

  // If drag and drop is enabled, wrap with DragDropContext
  if (onReorder && showDragHandle) {
    return (
      <DragDropContext onDragEnd={onReorder}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <Box 
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={String(image.id)} index={index}>
                    {(provided, snapshot) => (
                      <Grid 
                        item 
                        xs={6} 
                        sm={4} 
                        md={3}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card 
                          sx={{ 
                            position: 'relative',
                            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                            boxShadow: snapshot.isDragging ? 4 : 1,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                        >
                          {/* Same card content as above, but with drag handle props */}
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Card content here - similar to above but with drag handle props */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                borderRadius: 1,
                                p: 0.5,
                                cursor: 'grab',
                                '&:active': {
                                  cursor: 'grabbing'
                                }
                              }}
                            >
                              <DragIndicatorIcon sx={{ fontSize: 16 }} />
                            </Box>
                            {/* Rest of the card content */}
                          </Box>
                        </Card>
                      </Grid>
                    )}
                  </Draggable>
                ))}
              </Grid>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  return <Box>{content}</Box>;
};