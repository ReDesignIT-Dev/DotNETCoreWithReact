import { Box, Stack, Button, TextField } from "@mui/material";
import CategoryAssociatedTree from "components/CategoryAssociatedTree";
import { getAllSearchProducts } from "services/shopServices/apiRequestsShop";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductList from "components/ProductList";
import NotFoundProducts from "./NotFoundProducts";
import Loading from "components/Loading";

export default function SearchPage() {
  const { slug } = useParams() as { slug: string };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryString = searchParams.get("string") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageInput, setPageInput] = useState<number>(pageParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getAllSearchProducts(queryString, pageParam);
        if (response?.data?.products) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages || 1);
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
    fetchProducts();
  }, [slug, queryString, pageParam]);

  useEffect(() => {
    setPageInput(pageParam);
  }, [pageParam]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }

    navigate(`?${params.toString()}`);
  };

  const renderPagination = () => (
    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} my={2}>
      <Button variant="outlined" onClick={() => handlePageChange(pageParam - 1)} disabled={pageParam <= 1}>
        ←
      </Button>

      <TextField
        type="number"
        size="small"
        value={pageInput}
        onChange={(e) => setPageInput(Number(e.target.value))}
        onBlur={() => {
          if (pageInput >= 1 && pageInput <= totalPages && pageInput !== pageParam) {
            handlePageChange(pageInput);
          } else {
            setPageInput(pageParam); // Reset if invalid
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        sx={{
          width: 80,
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
          '& input[type=number]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
        }}
        slotProps={{
          htmlInput: {
            min: 1,
            max: totalPages,
            style: { textAlign: 'center' },
          },
        }}
      
      />

      <Box component="span">of {totalPages}</Box>

      <Button variant="outlined" onClick={() => handlePageChange(pageParam + 1)} disabled={pageParam >= totalPages}>
        →
      </Button>
    </Box>
  );

  if (notFound) return <NotFoundProducts />;
  if (isLoading) return <Loading />;

  return (
    <Box maxWidth={1264} mx="auto">
      <Stack direction="row" spacing={3} mt={3} alignItems="flex-start">
        <Box flex={1} maxWidth="25%">
          <CategoryAssociatedTree />
        </Box>
        <Box flex={3} maxWidth="75%">
          {renderPagination()}
          <ProductList products={products} />
          {renderPagination()}
        </Box>
      </Stack>
    </Box>
  );
}
