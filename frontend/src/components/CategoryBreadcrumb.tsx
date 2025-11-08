import React, { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FRONTEND_CATEGORY_URL } from "config";
import { getCategoryPath } from "services/shopServices/apiRequestsShop";
import {
    Breadcrumbs,
    Link,
    Typography,
    CircularProgress,
    Box
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

interface CategoryBreadcrumbProps {
    categoryId: number;
    includeSelf?: boolean;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
    categoryId,
    includeSelf = false
}) => {
    const navigate = useNavigate();

    const handleNavigationClick = (slug: string) => {
        const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
        navigate(categoryPath);
    };

    const [breadcrumb, setBreadcrumb] = useState<CategoryPath[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryPath = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getCategoryPath(categoryId, includeSelf);

                if (response?.data) {
                    setBreadcrumb(response.data);
                } else {
                    setError("Failed to load category path");
                }
            } catch (err) {
                setError("Error loading breadcrumb");
                console.error("Error fetching category path:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryPath();
        }
    }, [categoryId, includeSelf]);

    if (isLoading) {
        return (
            <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="body2" color="error.main">
                {error}
            </Typography>
        );
    }

    return (
        <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="category breadcrumb"
            sx={{
                '& .MuiBreadcrumbs-separator': {
                    color: 'text.secondary'
                }
            }}
        >
            {breadcrumb.map((pathItem, index) => {
                const isLast = index === breadcrumb.length - 1;

                if (isLast) {
                    return (
                        <Typography
                            key={pathItem.id}
                            variant="body2"
                            color="text.primary"
                            sx={{ fontWeight: 500 }}
                        >
                            {pathItem.shortName}
                        </Typography>
                    );
                }

                return (
                    <Link
                        key={pathItem.id}
                        component="button"
                        variant="body2"
                        onClick={() => handleNavigationClick(pathItem.slug)}
                        sx={{
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.dark'
                            }
                        }}
                    >
                        {pathItem.shortName}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
};

export default CategoryBreadcrumb;
