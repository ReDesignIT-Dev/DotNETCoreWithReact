import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton, 
  Typography, 
  Chip,
  Grid2
} from '@mui/material';
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

// Define the ImageGalleryProps interface
interface ImageGalleryProps {
  images: ImageItem[];
  onReorder?: (result: any) => void;
  onRemove: (id: string | number) => void;
  title?: string;
  showDragHandle?: boolean;
  showPosition?: boolean;
  showFileInfo?: boolean;
  disabled?: boolean;
  markedForDeletion?: (string | number)[];
  onRestore?: (id: string | number) => void;
}

// Add this interface for sortable items
interface SortableImageItemProps {
  image: ImageItem;
  index: number;
  onRemove: (id: string | number) => void;
  showPosition: boolean;
  showFileInfo: boolean;
  disabled: boolean;
  isMarkedForDeletion: boolean;
  onRestore?: (id: string | number) => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  image,
  index,
  onRemove,
  showPosition,
  showFileInfo,
  disabled,
  isMarkedForDeletion,
  onRestore
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const imageUrl = image.url || image.preview;

  return (
    <Grid2 size={{ xs: 6, sm: 4, md: 3 }} ref={setNodeRef} style={style}>
      <Card 
        sx={{ 
          position: 'relative',
          opacity: isMarkedForDeletion ? 0.5 : 1,
          filter: isMarkedForDeletion ? 'grayscale(100%)' : 'none',
          boxShadow: isDragging ? 8 : 1,
          transition: 'box-shadow 0.2s ease',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '100%',
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
          <Box
            {...attributes}
            {...listeners}
            sx={{
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: 1,
              p: 0.5,
              cursor: isDragging ? 'grabbing' : 'grab',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
              }
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 16 }} />
          </Box>

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
    </Grid2>
  );
};

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (images.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((image) => image.id === active.id);
      const newIndex = images.findIndex((image) => image.id === over?.id);
      
      // Convert to the format expected by the parent component
      const result = {
        draggableId: String(active.id),
        type: 'DEFAULT',
        source: {
          droppableId: 'images',
          index: oldIndex,
        },
        destination: {
          droppableId: 'images',
          index: newIndex,
        },
        reason: 'DROP' as const,
        mode: 'FLUID' as const,
        combine: null,
      };

      onReorder?.(result);
    }
  };

  // If drag and drop is enabled
  if (onReorder && showDragHandle) {
    return (
      <Box>
        {title && (
          <Typography variant="subtitle2" gutterBottom>
            {title} ({images.length}) - Drag to reorder:
          </Typography>
        )}
        
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection} // Changed from closestCenter
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={images.map(img => img.id)} 
            strategy={rectSortingStrategy}
          >
            <Grid2 
              container 
              spacing={2}
              sx={{
                '& .MuiGrid2-root': {
                  position: 'relative',
                }
              }}
            >
              {images.map((image, index) => {
                const isMarkedForDeletion = markedForDeletion.includes(image.id);
                
                return (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={onRemove}
                    showPosition={showPosition}
                    showFileInfo={showFileInfo}
                    disabled={disabled}
                    isMarkedForDeletion={isMarkedForDeletion}
                    onRestore={onRestore}
                  />
                );
              })}
            </Grid2>
          </SortableContext>
        </DndContext>
      </Box>
    );
  }

  // Non-draggable version (same as before)
  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title} ({images.length})
        </Typography>
      )}
      
      <Grid2 container spacing={2}>
        {images.map((image, index) => {
          const isMarkedForDeletion = markedForDeletion.includes(image.id);
          const imageUrl = image.url || image.preview;
          
          return (
            <Grid2 size={{ xs: 6, sm: 4, md: 3 }} key={image.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  opacity: isMarkedForDeletion ? 0.5 : 1,
                  filter: isMarkedForDeletion ? 'grayscale(100%)' : 'none',
                  boxShadow: 1,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
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
            </Grid2>
          );
        })}
      </Grid2>
    </Box>
  );
};