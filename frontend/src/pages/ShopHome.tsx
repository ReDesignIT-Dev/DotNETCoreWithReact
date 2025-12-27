import { useSelector } from "react-redux";
import { generatePath, useNavigate } from "react-router-dom";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Grid2,
    Typography,
    Container,
    Box,
} from "@mui/material";
import { FRONTEND_CATEGORY_URL } from "config";
import { selectCategoriesIsLoading, selectCategoriesError, selectFlatCategories } from "reduxComponents/reduxShop/Categories/selectors";

export default function ShopHome() {
    const navigate = useNavigate();
    const categories = useSelector(selectFlatCategories);
    const isLoading = useSelector(selectCategoriesIsLoading);
    const error = useSelector(selectCategoriesError);

    const handleCategoryClick = (slug: string) => {
        const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
        navigate(categoryPath);
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading categories.</p>;

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Welcome to Our Shop
            </Typography>
            <Box mt={4}>
                {categories.length > 0 ? (
                    <Grid2 container spacing={3} justifyContent="center">
                        {categories.map((category) => (
                            category.showOnHomePage && (
                                <Grid2 key={category.slug} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCategoryClick(category.slug)}>
                                            {category.image && (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={category.image.thumbnailUrl}
                                                    alt={category.name}
                                                    sx={{ objectFit: "contain" }}
                                                />
                                            )}
                                            <CardContent sx={{ textAlign: "center" }}>
                                                <Typography variant="h6">{category.name}</Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid2>
                            )
                        ))}
                    </Grid2>
                ) : (
                    <p>No categories available.</p>
                )}
            </Box>
        </Container>
    );
}
