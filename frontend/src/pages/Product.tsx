import { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "services/shopServices/apiRequestsShop";
import { useCart } from "services/shopServices/cartLogic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Box, Grid2, Typography, Button, TextField, Card, CardMedia } from "@mui/material";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import "yet-another-react-lightbox/styles.css";
import shopDefaultImage from "assets/images/shop_default_image.jpg";
import { getIdFromSlug } from "utils/utils";
import NotFound from "./NotFound";
import CategoryBreadcrumb from "components/CategoryBreadcrumb";
import { useMemo } from "react";
import Loading from "components/Loading";

export default function Product() {
  const { slug } = useParams() as { slug: string };
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>({
    id: 1,
    name: "",
    categoryId: 0,
    description: "",
    price: 0,
    images: [{ id: 0, url: shopDefaultImage, thumbnailUrl: shopDefaultImage, altText: "", position: 0 }],
    slug: "",
  });

  const [notFound, setNotFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true); // Start loading immediately
      setNotFound(false); // Reset notFound state
      
      try {
          if (!slug) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        const productId = getIdFromSlug(slug);
          if (productId == null) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        // Only set notFound after the API call completes
        const response = await getProduct(productId);
        const productData = response?.data;
        
        if (productData) {
          const images = productData.images;
          const selectedImage = images?.[0]?.url || shopDefaultImage;

          setSelectedImage(selectedImage);
          setProduct({
            ...productData,
            images: images.length > 0 ? images : [{ url: shopDefaultImage }],
          });
          setNotFound(false); 
        } else {
          setNotFound(true);
        }
      } catch (error) {
          console.error("Error fetching product data:", error);
        setNotFound(true); 
      } finally {
        setIsLoading(false); 
      }
    };

    fetchProduct();
  }, [slug]);

  const swiperSlides = useMemo(
    () =>
      product.images.map((img, index) => (
        <SwiperSlide key={index} style={{ backgroundColor: "transparent" }}>
          <Card
            onClick={() => {
              setSelectedImage(img.url);
              setCurrentImageIndex(index);
            }}
            sx={{
              cursor: "pointer",
              width: "160px",
              height: "90px",
              marginTop: "10px",
              marginBottom: "35px",
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
          >
            <CardMedia
              component="img"
              image={img.url}
              alt={`Product image ${index + 1}`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                backgroundColor: "transparent",
              }}
            />
          </Card>
        </SwiperSlide>
      )),
    [product.images]
  );

  const handleQuantityChange = (quantity: number) => {
    if (isNaN(quantity) || quantity < 1) {
      setError("Quantity must be a number greater than 0.");
      return;
    }
    setQuantity(quantity);
    setError(null);
  };

  const handleAddToCartClick = async (product: Product, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await addToCart(product, quantity);
      setConfirmationMessage(`Product added to the cart!`);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  if (isLoading) {
    return (
     <Loading />
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      {showConfirmation && (
        <Box mb={2} p={2} bgcolor="success.main" color="white" borderRadius={1}>
          {confirmationMessage}
        </Box>
      )}
      {product.categoryId ? <CategoryBreadcrumb categoryId={product.categoryId} includeSelf={true} /> : "Category missing"}

      {/* Main product info */}
      <Grid2 container direction="column" sx={{ width: "100%" }}>
        {/* Images on left with title and price on right*/}
        <Grid2 container direction="row" sx={{ width: "100%", height: "500px" }} spacing={2}>
          {/* Left: Product images */}
          <Grid2 container direction="column" size={{ xs: 12, md: 6 }} sx={{ marginX: "auto" }}>
            <Box>
              <Card
                onClick={() => openLightbox(currentImageIndex)}
                sx={{
                  width: "100%",
                  aspectRatio: "16/9",
                  display: "flex", // makes CardMedia respect parent's size
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CardMedia
                  component="img"
                  image={selectedImage}
                  alt={product.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                    cursor: "pointer",
                  }}
                />
              </Card>
            </Box>

            {/* Thumbnails using Swiper */}
            <Box sx={{ width: "100%" }}>
              <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={10}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                scrollbar={{ draggable: true }}
                style={{ width: "100%" }}
              >
                {swiperSlides}
              </Swiper>
            </Box>
          </Grid2>
          {/* Right: Product details and cart actions */}
          <Grid2
            size={{ xs: 12, md: 6 }}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {product.price} PLN
            </Typography>

            <Box
              mt={3}
              display="flex"
              sx={{
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="body1" sx={{ mr: 2 }}>
                Quantity:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuantityChange(Math.max(1, parseInt(e.target.value, 10)))}
                
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ width: 80 }}
              />
            </Box>

            <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={(event) => handleAddToCartClick(product, event)}>
              Add to Cart
            </Button>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Grid2>
        </Grid2>
      </Grid2>

      <Box mt={4}>
        <Typography variant="body1">{product.description}</Typography>
      </Box>

      {/* Lightbox for fullscreen images */}
      {isLightboxOpen && (
        <Lightbox open={isLightboxOpen} close={() => setIsLightboxOpen(false)} slides={product.images.map((img) => ({ src: img.url }))} />
      )}
      {isLightboxOpen && (
        <Lightbox
          plugins={[Inline]}
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={product.images.map((img) => ({ src: img.url }))}
          inline={{
            style: {
              width: "80%", // Set desired width
              maxWidth: "900px", // Set maximum width
              height: "auto", // Maintain aspect ratio
              maxHeight: "80vh", // Set maximum height relative to viewport height
              margin: "0 auto", // Center the lightbox
            },
          }}
        />
      )}
    </Box>
  );
}
