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
import { AxiosResponse } from "axios";

export function useCart() {
  const isLoggedIn = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = async (product: Product, quantity: number): Promise<AxiosResponse | undefined> => {
    if (isLoggedIn) {
      try {
        const response = await apiAddToCart(product.id, quantity);
        return response;
      } catch (error) {
        console.error("Error adding to cart:", error);
        throw error; // Re-throw to allow the component to handle the error
      }
    } else {
      localAddToCart(product, quantity);
      // For local storage, simulate a successful response
      return {
        status: 200,
        statusText: 'OK',
        data: { success: true },
        headers: {},
        config: {} as any
      } as AxiosResponse;
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

  const deleteFromCart = async (productId: number): Promise<AxiosResponse | undefined> => {
    if (isLoggedIn) {
      try {
        const response = await apiDeleteCartItem(productId);
        return response;
      } catch (error) {
        console.error("Error deleting from cart:", error);
        throw error;
      }
    } else {
      localRemoveItemFromCart(productId);
      // For local storage, simulate a successful response
      return {
        status: 204,
        statusText: 'No Content',
        data: null,
        headers: {},
        config: {} as any
      } as AxiosResponse;
    }
  };

  const updateCart = async (productId: number, quantity: number): Promise<AxiosResponse | undefined> => {
    if (isLoggedIn) {
      try {
        const response = await apiUpdateCartItemQuantity(productId, quantity);
        return response;
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
        throw error;
      }
    } else {
      localUpdateItemQuantity(productId, quantity);
      // For local storage, simulate a successful response
      return {
        status: 200,
        statusText: 'OK',
        data: { success: true },
        headers: {},
        config: {} as any
      } as AxiosResponse;
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
