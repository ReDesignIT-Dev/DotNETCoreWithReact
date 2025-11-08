import { generatePath, useNavigate, useSearchParams } from "react-router-dom";
import { MouseEvent } from "react";
import { FRONTEND_CATEGORY_URL } from "config";
import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

export interface CategoryTreeProps {
  // Data props
  categories: CategoryTree[];
  title?: string;
  
  // Navigation behavior props
  preserveSearchParams?: boolean;
  highlightedCategoryId?: number | null;
  parentCategory?: CategoryTree | null;
  
  // Display options
  showProductCount?: boolean;
}

export default function CategoryTree({ 
  categories,
  title = "Subcategories:",
  preserveSearchParams = false,
  highlightedCategoryId = null,
  parentCategory = null,
  showProductCount = true // Default to true since you want it in both cases
}: CategoryTreeProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleNavigationClick = (slug: string, event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    
    if (preserveSearchParams) {
      // Preserve existing search parameters
      const params = new URLSearchParams(searchParams);
      const queryString = params.toString();
      const fullPath = queryString ? `${categoryPath}?${queryString}` : categoryPath;
      navigate(fullPath);
    } else {
      // Navigate without preserving params
      navigate(categoryPath);
    }
  };

  const renderCategoryItem = (category: CategoryTree, depth = 0) => {
    const isHighlighted = highlightedCategoryId === category.id;
    
    return (
      <Box key={category.slug}>
        <ListItem 
          component="div" 
          sx={{ pl: depth * 2 }} // Indentation based on depth
          disablePadding
        >
          <ListItemButton 
            selected={isHighlighted} 
            onClick={(event) => handleNavigationClick(category.slug, event)}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'rgba(0, 255, 34, 0.1)', // Light green hover
                '& .MuiTypography-root': {
                  color: '#00ff22'
                }
              },
              cursor: "pointer"
            }}
          >
            <ListItemText 
              primary={
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontWeight: isHighlighted ? "bold" : "normal",
                    transition: 'color 0.2s ease'
                  }}
                >
                  {category.name}
                  {showProductCount && ` (${category.productCount})`}
                </Typography>
              } 
            />
          </ListItemButton>
        </ListItem>
        
        {/* Render children recursively with increased depth */}
        {category.children && category.children.length > 0 && (
          <>
            {category.children.map((childCategory) => 
              renderCategoryItem(childCategory, depth + 1)
            )}
          </>
        )}
      </Box>
    );
  };

  const renderCategoryList = () => {
    if (!categories || categories.length === 0) return null;
    
    return (
      <List component="div" disablePadding>
        {categories.map((category) => renderCategoryItem(category, 0))}
      </List>
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">{title}</Typography>
      
      {/* Parent category back button */}
      {parentCategory && (
        <Button 
          variant="outlined" 
          onClick={(event) => handleNavigationClick(parentCategory.slug, event)} 
          sx={{ alignSelf: "flex-start" }}
        >
          Go back to {parentCategory.name}
        </Button>
      )}
      
      {renderCategoryList()}
    </Box>
  );
}
