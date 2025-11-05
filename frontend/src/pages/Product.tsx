import { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "services/shopServices/apiRequestsShop";
import { useCart } from "services/shopServices/cartLogic";
import { useNotification } from "contexts/NotificationContext";
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
import { createSafeImage, getImageSrc } from "utils/imageUtils";
import { SHOP_DEFAULT_IMAGE } from "config";
import { getIdFromSlug } from "utils/utils";
import NotFound from "./NotFound";
import CategoryBreadcrumb from "components/CategoryBreadcrumb";
import { useMemo } from "react";
import Loading from "components/Loading";

export default function Product() {
  const { slug } = useParams() as { slug: string };
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const [product, setProduct] = useState<Product>({
    id: 1,
    name: "",
    categoryId: 0,
    description: "",
    price: 0,
    images: [{ 
      id: 0, 
      url: SHOP_DEFAULT_IMAGE, 
      thumbnailUrl: SHOP_DEFAULT_IMAGE, 
      altText: "Default product image", 
      position: 0 
    }],
    slug: "",
  });

  const [notFound, setNotFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setNotFound(false);
      
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
        
        const response = await getProduct(productId);
        const productData = response?.data;
        
        if (productData) {
          const images = productData.images;
          
          // Use imageUtils for safe image handling
          const safeMainImage = createSafeImage(
            images?.[0] ? {
              url: images[0].url,
              thumbnailUrl: images[0].thumbnailUrl,
              altText: images[0].altText
            } : null,
            productData.name
          );
          
          setSelectedImage(getImageSrc(safeMainImage, false)); // Use full image for main display

          setProduct({
            ...productData,
            images: images.length > 0 ? images : [{
              id: 0,
              url: safeMainImage.url,
              thumbnailUrl: safeMainImage.thumbnailUrl,
              altText: safeMainImage.altText,
              position: 0
            }],
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
      product.images.map((img, index) => {
        const safeImage = createSafeImage(
          {
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            altText: img.altText
          },
          `${product.name} - Image ${index + 1}`
        );

        return (
          <SwiperSlide key={index} style={{ backgroundColor: "transparent" }}>
            <Card
              onClick={() => {
                setSelectedImage(getImageSrc(safeImage, false)); // Use full image when selected
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
                image={getImageSrc(safeImage, true)} // Use thumbnail for swiper
                alt={safeImage.altText}
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
        );
      }),
    [product.images, product.name]
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
      const response = await addToCart(product, quantity);
      
      if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
        showSuccess(`${quantity} x ${product.name} added to cart!`);
      } else {
        showError("Failed to add product to cart. Please try again.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      showError("Failed to add product to cart. Please check your connection and try again.");
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (notFound) {
    return <NotFound />;
  }

  // Create safe image for main display
  const mainDisplayImage = createSafeImage(
    selectedImage ? { url: selectedImage } : null,
    product.name
  );

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
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
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CardMedia
                  component="img"
                  image={getImageSrc(mainDisplayImage, false)}
                  alt={mainDisplayImage.altText}
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
        <Lightbox 
          open={isLightboxOpen} 
          close={() => setIsLightboxOpen(false)}
          index={currentImageIndex}
          slides={product.images.map((img) => {
            const safeImage = createSafeImage(
              { url: img.url, altText: img.altText },
              `${product.name} - Image`
            );
            return { src: getImageSrc(safeImage, false) };
          })}
        />
      )}
    </Box>
  );
}
