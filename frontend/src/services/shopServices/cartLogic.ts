import { useState, useCallback, useEffect } from "react";
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
        await apiAddToCart(product, quantity);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    } else {
      localAddToCart(product, quantity);
    }
  };

  const deleteFromCart = async (product: Product) => {
    if (isLoggedIn) {
      try {
        await apiDeleteCartItem(product);
      } catch (error) {
        console.error("Error deleting from cart:", error);
      }
    } else {
      localRemoveItemFromCart(product);
    }
  };

  const updateCart = async (product: Product, quantity: number) => {
    if (isLoggedIn) {
      try {
        await apiUpdateCartItemQuantity(product, quantity);
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
      }
    } else {
      localUpdateItemQuantity(product, quantity);
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
    const backendSlugs = new Set(backendCart.map((item) => item.product.slug));

    localCart.forEach((localItem) => {
      const backendItem = mergedCart.find(
        (item) => item.product.slug === localItem.product.slug
      );
      if (backendItem) {
        backendItem.quantity += localItem.quantity;
      } else {
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
