import { MouseEvent } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { useCart } from "services/shopServices/cartLogic";
import "./ProductList.css";
import { FRONTEND_PRODUCT_URL } from "config";
import shopDefaultImage from "assets/images/shop_default_image.jpg";
import { Box } from "@mui/material";

export default function ProductList({ products }: {products: Product[]}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleNavigationClick = (slug: string, event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const productPath = generatePath(FRONTEND_PRODUCT_URL, { slug });
    navigate(productPath);
  };

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
          const imageSrc = product.images?.[0]?.url || shopDefaultImage;
          const imageAlt = product.images?.[0]?.altText || product.name;

          return (
            <div
              key={product.id}
              className="single-product-on-list d-flex flex-row w-100"
              role="button"
              onClick={(event) => handleNavigationClick(product.slug, event)}
            >
              <img src={imageSrc} alt={imageAlt} />
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