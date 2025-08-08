import { useNavigate, generatePath } from "react-router-dom";
import { FRONTEND_CATEGORY_URL } from "config";
import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

interface CategoryTreeProps {
  categoryTree: CategoryTree | null;
  parentCategory?: CategoryTree | null;
  highlightedCategoryId?: number | null;
}
export default function CategoryTree({ categoryTree, parentCategory, highlightedCategoryId }: CategoryTreeProps) {
  const navigate = useNavigate();
  const highlightedId = highlightedCategoryId ?? null;

  const handleNavigationClick = (slug: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    navigate(categoryPath);
  };

  const listCategoryChildren = () => {
    if (!categoryTree?.children) return null;
    return (
      <List>
        {categoryTree.children.map((child: CategoryTree) => (
          <ListItem key={child.id} disablePadding>
            <ListItemButton selected={highlightedId === child.id} onClick={(event) => handleNavigationClick(child.slug, event)}>
              <ListItemText primary={<span style={{ fontWeight: highlightedId === child.id ? "bold" : "normal" }}>{child.name}</span>} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6">Subcategories:</Typography>
      {parentCategory && (
        <Button variant="outlined" onClick={(event) => handleNavigationClick(parentCategory.slug, event)} sx={{ alignSelf: "flex-start" }}>
          Go back to {parentCategory.name}
        </Button>
      )}
      {listCategoryChildren()}
    </Box>
  );
}
