import { useState, useCallback } from "react";
import {
  addToCart as apiAddToCart,
  deleteCartItem as apiDeleteCartItem,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  getCart as apiGetCart,
} from "./cartRequests";
import {
  addItemToCart as localAddToCart,
  removeItemFromCart as localRemoveItemFromCart,
  updateItemQuantity as localUpdateItemQuantity,
  getCart as localGetCart,
  clearCart as localClearCart,
} from "./localStorageRequestsShop";
import { useAuth } from "hooks/useAuth";

export function useCart() {
  const isLoggedIn = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = async (product: Product, quantity: number) => {
    if (isLoggedIn) {
      try {
        await apiAddToCart(product.id, quantity);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    } else {
      localAddToCart(product, quantity);
    }
  };

  const addCartItemToCart = async (cartItem: CartItem) => {
    if (isLoggedIn) {
        try {
        await apiAddToCart(cartItem.product.id, cartItem.quantity);
      } catch (error) {
        console.error("Error adding cart item to cart:", error);
      }
    }
  };

  const deleteFromCart = async (productId: number) => {
    if (isLoggedIn) {
      try {
        await apiDeleteCartItem(productId);
      } catch (error) {
        console.error("Error deleting from cart:", error);
      }
    } else {
      localRemoveItemFromCart(productId);
    }
  };

  const updateCart = async (productId: number, quantity: number) => {
    if (isLoggedIn) {
      try {
        await apiUpdateCartItemQuantity(productId, quantity);
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
      }
    } else {
      localUpdateItemQuantity(productId, quantity);
    }
  };

  const getCart = useCallback(async () => {
    try {
      let cartItems = [];
      if (isLoggedIn) {
          const backendCart = await apiGetCart();
          const localCart = localGetCart();
          cartItems = mergeCarts(backendCart, localCart);
          setItems(cartItems);
          localClearCart();
      } else {
        cartItems = localGetCart();
        setItems(cartItems);
      }
      return cartItems;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  }, [isLoggedIn]);

  const calculateTotal = useCallback((cartItems: CartItem[]) => {
    return cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
  }, []);

  const mergeCarts = (
    backendCart: CartItem[],
    localCart: CartItem[]
  ): CartItem[] => {
    const mergedCart = [...backendCart];

    localCart.forEach((localItem) => {
      const backendItem = mergedCart.find(
        (item) => item.product.id === localItem.product.id
      );
      if (backendItem) {
        backendItem.quantity += localItem.quantity;
      } else {
        // Use the internal method for CartItem
        addCartItemToCart(localItem);
        mergedCart.push(localItem);
      }
    });

    return mergedCart;
  };

  return {
    items,
    addToCart,
    deleteFromCart,
    updateCart,
    getCart,
    calculateTotal,
  };
}
