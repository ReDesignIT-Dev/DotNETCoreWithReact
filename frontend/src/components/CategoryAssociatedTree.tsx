import { generatePath, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, MouseEvent } from "react";
import { FRONTEND_CATEGORY_URL } from "config";
import useQueryParams from "hooks/useQueryParams";
import { getAllSearchAssociatedCategories } from "services/shopServices/apiRequestsShop";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const CategoryAssociatedTree: React.FC = () => {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParams = useQueryParams();

  useEffect(() => {
    const fetchAssociatedCategoriesTree = async () => {
      if (!queryParams.string?.trim()) {
        setCategories([]);
        return;
      }

      try {
        const response = await getAllSearchAssociatedCategories(queryParams.string);
        if (response?.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching associated categories:", error);
        setCategories([]);
      }
    };

    fetchAssociatedCategoriesTree();
  }, [queryParams.string]); // Only depend on search string, not entire queryParams

  const handleNavigationClick = (slug: string, event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    // Preserve existing search parameters
    const params = new URLSearchParams(searchParams);

    // Navigate to category with preserved search string
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    const queryString = params.toString();
    const fullPath = queryString ? `${categoryPath}?${queryString}` : categoryPath;

    navigate(fullPath);
  };

  const CategoryTree: React.FC<{ category: CategoryTree }> = ({ category }) => {
    return (
      <Box ml={2}>
        <ListItem component="div" onClick={(event) => handleNavigationClick(category.slug, event)}>
          <ListItemText
            primary={
              <Typography variant="body1" sx={{ '&:hover': { color: "#00ff22" }, cursor: "pointer" }}>
                {category.name} ({category.productCount})
              </Typography>
            }
          />
        </ListItem>
        {category.children && category.children.length > 0 && (
          <List component="div" disablePadding>
            {category.children.map((childCategory: CategoryTree) => (
              <CategoryTree key={childCategory.slug} category={childCategory} />
            ))}
          </List>
        )}
      </Box>
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">Subcategories:</Typography>
      <List>
        {categories.map((category) => (
          <CategoryTree key={category.slug} category={category} />
        ))}
      </List>
    </Box>
  );
};

export default CategoryAssociatedTree;
