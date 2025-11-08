import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductList from "components/ProductList";
import CategoryTree from "components/CategoryTree";
import CategoryTopBar from "components/CategoryTopBar";
import NotFound from "./NotFound";
import { Box, Grid2, Typography, Chip } from "@mui/material";
import { getIdFromSlug } from "utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "reduxComponents/store";
import { selectCategoryTreeById, selectCategoriesIsLoading, selectTreeCategories } from "reduxComponents/reduxShop/Categories/selectors";
import { getAllProductsInCategory, getAllSearchAssociatedCategories } from "services/shopServices/apiRequestsShop";
import Loading from "components/Loading";
import PaginationComponent from "components/PaginationComponent";

export default function Category() {
    const [searchParams] = useSearchParams();
    const { slug } = useParams() as { slug: string };
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const searchString = searchParams.get("string") || "";
    const categoryId = getIdFromSlug(slug);

    const categoriesLoading = useSelector(selectCategoriesIsLoading);
    const categoriesInStore = useSelector(selectTreeCategories);

    const category = useSelector((state: RootState) => (categoryId !== null ? selectCategoryTreeById(state, categoryId) : null));

    const categoryTree = useSelector((state: RootState) => {
        if (categoryId === null) return null;
        const currentCategoryTree = selectCategoryTreeById(state, categoryId);
        if (currentCategoryTree?.children?.length) {
            return currentCategoryTree;
        }
        const parentCategoryId = selectCategoryTreeById(state, categoryId)?.parentId;
        if (parentCategoryId) {
            return selectCategoryTreeById(state, parentCategoryId);
        }
        return null;
    });

    const parentCategory = useSelector((state: RootState) => (category?.parentId ? selectCategoryTreeById(state, category.parentId) : null));

    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Add state for search-filtered categories
    const [searchFilteredCategories, setSearchFilteredCategories] = useState<CategoryTree[]>([]);
    const [categoriesForTree, setCategoriesForTree] = useState<CategoryTree[]>([]);
    const [isFetchingCategories, setIsFetchingCategories] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (categoryId === null) return;

                const response = await getAllProductsInCategory(categoryId, pageParam, searchString || undefined);
                if (response?.data) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.totalPages);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, [categoryId, pageParam, searchString]);

    // Fetch search-filtered categories when there's a search string
    useEffect(() => {
        const fetchSearchFilteredCategories = async () => {
            if (!searchString.trim()) {
                setSearchFilteredCategories([]);
                return;
            }

            setIsFetchingCategories(true);
            try {
                const response = await getAllSearchAssociatedCategories(searchString);
                if (response?.data) {
                    setSearchFilteredCategories(response.data);
                } else {
                    setSearchFilteredCategories([]);
                }
            } catch (error) {
                console.error("Error fetching search-filtered categories:", error);
                setSearchFilteredCategories([]);
            } finally {
                setIsFetchingCategories(false);
            }
        };

        fetchSearchFilteredCategories();
    }, [searchString]);

    // Determine which categories to show in the tree
    useEffect(() => {
        if (searchString.trim()) {
            // If there's a search, use search-filtered categories
            // Filter to show only children of current category or related categories
            if (categoryTree && searchFilteredCategories.length > 0) {
                const filterCategoriesToShow = (categories: CategoryTree[]): CategoryTree[] => {
                    const result: CategoryTree[] = [];

                    for (const cat of categories) {
                        // Check if this category is a child of current category or related
                        const isChildOfCurrent = categoryTree.children?.some(child => child.id === cat.id);
                        const isRelatedToSearch = true; // All search results are related

                        if (isChildOfCurrent || isRelatedToSearch) {
                            result.push({
                                ...cat,
                                children: cat.children ? filterCategoriesToShow(cat.children) : []
                            });
                        }
                    }

                    return result;
                };

                setCategoriesForTree(filterCategoriesToShow(searchFilteredCategories));
            } else {
                setCategoriesForTree(searchFilteredCategories);
            }
        } else {
            // No search, use normal category tree
            setCategoriesForTree(categoryTree?.children || []);
        }
    }, [searchString, searchFilteredCategories, categoryTree]);

    if (categoriesLoading || categoriesInStore.length === 0) {
        return <Loading />;
    }

    if (categoryId === null || category === null) {
        return <NotFound />;
    }

    return (
        <Box display="flex" flexDirection="column" mx="auto" gap={3} sx={{ maxWidth: 1264 }}>
            <CategoryTopBar category={category} />

            {/* Show search indicator */}
            {searchString && (
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {` Searching for "${searchString}" in ${category.name}`}
                    </Typography>
                    <Chip
                        label={`"${searchString}" in ${category.name}`}
                        variant="outlined"
                        size="small"
                        color="primary"
                    />
                </Box>
            )}

            <Grid2 container spacing={3} sx={{ flexDirection: { xs: "column", md: "row" } }}>
                <Grid2
                    sx={{
                        display: { xs: "none", md: "block" },
                        backgroundColor: "lightGray",
                        padding: 2,
                        borderRadius: 1,
                        flexBasis: "25%",
                        flexShrink: 0,
                        boxSizing: "border-box",
                    }}
                >
                    {isFetchingCategories ? (
                        <Loading />
                    ) : (
                        <CategoryTree
                            categories={categoriesForTree}
                            title={searchString ? "Related Categories:" : "Subcategories:"}
                            preserveSearchParams={Boolean(searchString)}
                            highlightedCategoryId={categoryId}
                            parentCategory={parentCategory}
                            showProductCount={true}
                        />
                    )}
                </Grid2>

                <Grid2
                    sx={{
                        backgroundColor: "lightGray",
                        padding: 2,
                        borderRadius: 1,
                        flexGrow: 1,
                        flexBasis: { md: "70%" },
                        boxSizing: "border-box",
                    }}
                >
                    <PaginationComponent currentPage={pageParam} totalPages={totalPages} />
                    <ProductList products={products} />
                    <PaginationComponent currentPage={pageParam} totalPages={totalPages} />
                </Grid2>
            </Grid2>
        </Box>
    );
}