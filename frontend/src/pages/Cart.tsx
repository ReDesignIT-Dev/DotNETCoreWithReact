import React, { useEffect, useState, MouseEvent } from "react";
import Loading from "components/Loading";
import { FaRegTrashAlt } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { generatePath, useNavigate } from "react-router-dom";
import { FRONTEND_PRODUCT_URL } from "config";
import { Typography } from "@mui/material";
import { useCart } from "services/shopServices/cartLogic";
import { useNotification } from "contexts/NotificationContext";
import { createSafeImage, getImageSrc } from "utils/imageUtils";
import "./Cart.css";

export default function Cart() {
    const FaRegTrashAltIcon = FaRegTrashAlt as React.ComponentType<any>;
    const { getCart, updateCart, deleteFromCart, calculateTotal } = useCart();
    const { showSuccess, showError, showInfo } = useNotification();
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
                setItems(responseItems);
                const totalAmount = calculateTotal(responseItems);
                setTotal(totalAmount.toFixed(2));
            } catch (error) {
                setError("Error fetching products.");
                showError("Failed to load cart items. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [getCart, showError]);

    const handleQuantityChange = (item: CartItem, quantity: number) => {
        const updatedItems = items.map((i) =>
            i.product && i.product.id === item.product.id
                ? { ...i, quantity }
                : i
        );
        setItems(updatedItems);

        if (debounceTimeouts[item.product.id]) {
            clearTimeout(debounceTimeouts[item.product.id]);
        }
        const timeout = window.setTimeout(async () => {
            try {
                const response = await updateCart(item.product.id, quantity);
                
                if (response && (response.status === 200 || response.status === 204)) {
                    const totalAmount = calculateTotal(updatedItems);
                    setTotal(totalAmount.toFixed(2));
                    showSuccess(`Updated quantity for ${item.product.name}`);
                } else {
                    showError("Failed to update item quantity. Please try again.");
                    // Revert the optimistic update
                    setItems(items);
                    setTotal(calculateTotal(items).toFixed(2));
                }
            } catch (error: any) {
                console.error("Error updating cart:", error);
                showError("Failed to update item quantity. Please check your connection.");
                setError(error.message);
                // Revert the optimistic update
                setItems(items);
                setTotal(calculateTotal(items).toFixed(2));
            }
        }, 500); 

        setDebounceTimeouts((prev) => ({
            ...prev,
            [item.product.id]: timeout,
        }));
    };

    const handleRemoveItem = async (item: CartItem) => {
        try {
            const response = await deleteFromCart(item.product.id);
            
            if (response && (response.status === 200 || response.status === 204)) {
                const updatedItems = items.filter(
                    (i) => i.product && i.product.id !== item.product.id
                );
                setItems(updatedItems);
                const totalAmount = calculateTotal(updatedItems);
                setTotal(totalAmount.toFixed(2));
                showSuccess(`${item.product.name} removed from cart`);
            } else {
                showError("Failed to remove item from cart. Please try again.");
            }
        } catch (error: any) {
            console.error("Error removing item:", error);
            showError("Failed to remove item from cart. Please check your connection.");
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
        showInfo("Thank you for your purchase!");
    };

    if (loading) {
        return <Loading />;
    }

    const cartItemList = () => (
        <>
            {items.map((item, index) =>
                item.product ? (
                    <div
                        key={item.product.id}
                        className={`basket-item d-flex align-items-center pb-3 mb-3 ${
                            index !== items.length - 1 ? "border-bottom" : ""
                        }`}
                    >
                        {(() => {
                            const productImage = createSafeImage(
                                {
                                    url: item.product.mainImageUrl,
                                    thumbnailUrl: item.product.mainImageThumbnailUrl,
                                    altText: item.product.mainImageAltText
                                },
                                item.product.name
                            );
                            
                            return (
                                <img
                                    src={getImageSrc(productImage, true)}
                                    alt={productImage.altText}
                                    className="cart-item-image me-3"
                                />
                            );
                        })()}
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
                                                item,
                                                Math.max(1, parseInt(e.target.value, 10))
                                            )
                                        }
                                        min="1"
                                        className="quantity-input form-control d-inline-block w-auto ms-2"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item)}
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
