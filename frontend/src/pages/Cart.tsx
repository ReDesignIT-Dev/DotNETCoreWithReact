import React, { useEffect, useState, MouseEvent } from "react";
import Loading from "components/Loading";
import { FaRegTrashAlt } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { generatePath, useNavigate } from "react-router-dom";
import { FRONTEND_PRODUCT_URL } from "config";
import { Typography } from "@mui/material";
import { useCart } from "services/shopServices/cartLogic";
import "./Cart.css";
import shopDefaultImage from "assets/images/shop_default_image.jpg";

export default function Cart() {
  const FaRegTrashAltIcon = FaRegTrashAlt as React.ComponentType<any>;
  const { getCart, updateCart, deleteFromCart, calculateTotal } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<string>("0");
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const [debounceTimeouts, setDebounceTimeouts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const responseItems = await getCart();
        const validatedItems = responseItems.map((item) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || [], // Default to an empty array if undefined
          },
        }));

        setItems(validatedItems);
        const totalAmount = calculateTotal(responseItems);
        setTotal(totalAmount.toFixed(2));
      } catch (error) {
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [getCart, calculateTotal]);

  const handleQuantityChange = (product: Product, quantity: number) => {
    // Update the quantity immediately in the local state (UI)
    const updatedItems = items.map((item) =>
      item.product && item.product.slug === product.slug
        ? { ...item, quantity }
        : item
    );
    setItems(updatedItems);

    // Cancel any existing timeout for the current product
    if (debounceTimeouts[product.slug]) {
      clearTimeout(debounceTimeouts[product.slug]);
    }

    // Set a new timeout to update the quantity after a delay (debounce logic)
    const timeout = window.setTimeout(async () => {
      try {
        await updateCart(product, quantity); // Backend update
        const totalAmount = calculateTotal(updatedItems);
        setTotal(totalAmount.toFixed(2));
      } catch (error: any) {
        setError(error.message);
      }
    }, 500); // 500ms debounce delay

    // Update the timeout reference
    setDebounceTimeouts((prev) => ({
      ...prev,
      [product.slug]: timeout,
    }));
  };

  const handleRemoveItem = async (product: Product) => {
    try {
      await deleteFromCart(product);
      const updatedItems = items.filter(
        (item) => item.product && item.product.slug !== product.slug
      );
      setItems(updatedItems);
      const totalAmount = calculateTotal(updatedItems);
      setTotal(totalAmount.toFixed(2));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleNavigationClick = (slug: string, event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const productPath = generatePath(FRONTEND_PRODUCT_URL, { slug });
    navigate(productPath);
  };

  const handleCheckout = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cartItemList = () => (
    <>
      {items.map((item, index) =>
        item.product ? (
          <div
            key={item.product.slug}
            className={`basket-item d-flex align-items-center pb-3 mb-3 ${
              index !== items.length - 1 ? "border-bottom" : ""
            }`}
          >
            <img
              src={
                item.product.images.length > 0 && item.product.images[0].src
                  ? item.product.images[0].src
                  : shopDefaultImage
              }
              alt={
                item.product.images.length > 0 && item.product.images[0].altText
                  ? item.product.images[0].altText
                  : "Default Image"
              }
              className="cart-item-image me-3"
            />
            <div className="flex-grow-1">
              <Typography
                key={item.product.slug}
                variant="h6"
                component="h4"
                onClick={(event) => handleNavigationClick(item.product.slug, event)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    color: "blue",
                  },
                }}
              >
                {item.product.name}
              </Typography>
              <p>Price: {item.product.price} PLN</p>
              <div className="d-flex align-items-center">
                <div className="me-2">
                  Quantity:
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.product,
                        Math.max(1, parseInt(e.target.value, 10))
                      )
                    }
                    min="1"
                    className="quantity-input form-control d-inline-block w-auto ms-2"
                  />
                </div>
                <button
                  onClick={() => handleRemoveItem(item.product)}
                  className="btn btn-danger d-flex align-items-center"
                >
                  <FaRegTrashAltIcon />
                </button>
              </div>
            </div>
          </div>
        ) : null
      )}
    </>
  );

  return (
    <div className="cart-container d-flex justify-content-center flex-column gap-2 text-center mx-auto">
      <div className="mb-5 mt-2">
        <h2>Your Basket</h2>
      </div>
      {items.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <>
          {error && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: "10px" }}
            >
              {error}
            </div>
          )}
          <div className="d-flex flex-row justify-content-between">
            <div className="cart-item-list">{cartItemList()}</div>
            <div className="cart-summary d-flex flex-column">
              <div className="cart-payment">
                <h3>Total: {total} PLN</h3>
              </div>
              <div>
                <button className="checkout-button" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Checkout Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>You bought items for {total} PLN.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
