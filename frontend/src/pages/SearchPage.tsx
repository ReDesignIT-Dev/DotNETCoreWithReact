import { Box, Grid2 } from "@mui/material";
import CategoryTree from "components/CategoryTree";
import SearchTopBar from "components/SearchTopBar";
import { getAllSearchProducts, getAllSearchAssociatedCategories } from "services/shopServices/apiRequestsShop";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductList from "components/ProductList";
import NotFoundProducts from "./NotFoundProducts";
import Loading from "components/Loading";
import PaginationComponent from "components/PaginationComponent";
import useQueryParams from "hooks/useQueryParams";

export default function SearchPage() {
    const { slug } = useParams() as { slug: string };
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryParams = useQueryParams();
    const queryString = searchParams.get("string") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryTree[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
    const [notFound, setNotFound] = useState<boolean>(false);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await getAllSearchProducts(queryString, pageParam);
                if (response?.data?.products) {
                    setProducts(response.data.products);
                    setTotalPages(response.data.totalPages || 1);
                    setTotalResults(response.data.count || 0); // Add total count
                    setNotFound(response.data.products.length === 0);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (queryString.trim()) {
            fetchProducts();
        } else {
            setIsLoading(false);
            setNotFound(true);
        }
    }, [slug, queryString, pageParam]);

    // Fetch associated categories
    useEffect(() => {
        const fetchAssociatedCategories = async () => {
            if (!queryParams.string?.trim()) {
                setCategories([]);
                return;
            }

            setCategoriesLoading(true);
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
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchAssociatedCategories();
    }, [queryParams.string]);

    if (notFound) return <NotFoundProducts />;
    if (isLoading) return <Loading />;

    return (
        <Box display="flex" flexDirection="column" mx="auto" gap={3} sx={{ maxWidth: 1264 }}>
            {/* Search Top Bar - maintains consistent layout with Category page */}
            <SearchTopBar 
                searchQuery={queryString} 
                resultsCount={totalResults}
            />

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
                    {categoriesLoading ? (
                        <Loading />
                    ) : (
                        <CategoryTree
                            categories={categories}
                            title="Related Categories:"
                            preserveSearchParams={true}
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
