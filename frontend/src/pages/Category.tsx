import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductList from "components/ProductList";
import CategoryTree from "components/CategoryTree";
import CategoryTopBar from "components/CategoryTopBar";
import NotFound from "./NotFound";
import { Box, Grid2 } from "@mui/material";
import { getIdFromSlug } from "utils/utils";
import { useSelector } from "react-redux";
import { RootState } from "reduxComponents/store";
import { selectCategoryTreeById } from "reduxComponents/reduxShop/Categories/selectors";
import { getAllProductsInCategory } from "services/shopServices/apiRequestsShop";
import Loading from "components/Loading";
import PaginationComponent from "components/PaginationComponent";

export default function Category() {
  const [searchParams] = useSearchParams();
  const { slug } = useParams() as { slug: string };
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const categoryId = getIdFromSlug(slug);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (categoryId === null) return;
        const response = await getAllProductsInCategory(categoryId, pageParam);
        if (response?.data) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [categoryId, pageParam]);

  if (category === undefined) {
    return <Loading />;
  }

  if (category === null) {
    return <NotFound />;
  }

  return (
    <Box display="flex" flexDirection="column" mx="auto" gap={3} sx={{ maxWidth: 1264 }}>
      <CategoryTopBar category={category} />

      <Grid2 container spacing={3} sx={{ flexDirection: { xs: "column", md: "row" } }}>
        {/* CategoryTree */}
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
          <CategoryTree categoryTree={categoryTree} parentCategory={parentCategory} highlightedCategoryId={categoryId}/>
        </Grid2>

        {/* ProductList and Pagination */}
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
