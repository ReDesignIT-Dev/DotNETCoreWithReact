import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "services/shopServices/cartLogic";
import "./ProductList.css";
import { FRONTEND_PRODUCT_URL } from "config";
import { createSafeImage, getImageSrc } from "utils/imageUtils";
import { Box } from "@mui/material";
import { navigateToProduct } from "utils/navigation";

export default function ProductList({ products }: {products: Product[]}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCartClick = async (product: Product, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await addToCart(product, 1);
      alert(`${product.name} was added to the cart!`);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <Box sx={{ opacity: products.length === 0 ? 0.5 : 1, transition: "opacity 0.3s" }}>
      <div className="product-list-container d-flex flex-column gap-3 w-100 p-3">
        {products.map((product) => {
          const safeImage = createSafeImage(
            product.images?.[0] ? {
              url: product.images[0].url,
              thumbnailUrl: product.images[0].thumbnailUrl,
              altText: product.images[0].altText
            } : null,
            product.name
          );

          return (
            <div
              key={product.id}
              className="single-product-on-list d-flex flex-row w-100"
              role="button"
              onClick={(event) => navigateToProduct(product.slug, event, navigate)}
            >
              <img 
                src={getImageSrc(safeImage, true)} 
                alt={safeImage.altText} 
              />
              <div className="product-details d-flex justify-content-between w-100">
                <h2>{product.name}</h2>
                <div className="product-price-and-cart d-flex align-items-center">
                  <p className="product-price">{product.price} PLN</p>
                  <button
                    className="product-add-to-cart-btn"
                    onClick={(event) => handleAddToCartClick(product, event)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}