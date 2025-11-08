import { Box, Typography } from "@mui/material";
import CategoryBreadcrumb from "./CategoryBreadcrumb";

interface CategoryTopBarProps {
    category: CategoryTree | null;
}

export default function CategoryTopBar({ category }: CategoryTopBarProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            gap={1}
            sx={{
                mb: 2, // margin bottom
                pb: 2, // padding bottom
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary'
                }}
            >
                {category ? category.name : "Missing Category info :("}
            </Typography>

            {category ? (
                <CategoryBreadcrumb categoryId={category.id} includeSelf={true} />
            ) : (
                <Typography
                    variant="body2"
                    color="error.main"
                    sx={{ fontStyle: 'italic' }}
                >
                    Category missing
                </Typography>
            )}
        </Box>
    );
}