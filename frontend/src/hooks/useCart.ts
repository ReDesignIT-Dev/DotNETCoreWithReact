import { useState, useCallback, useEffect } from 'react';
import { useAuth } from 'hooks/useAuth';
import * as cartApi from 'services/shopServices/cartApiRequests';
import * as localCartService from 'services/shopServices/localStorageRequestsShop';

export function useCart() {
    const isLoggedIn = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn) {
            // For non-logged users, get from localStorage
            const localCart = localCartService.getCart();
            const mockCart: Cart = {
                id: 0,
                items: localCart.map((item, index) => ({
                    id: index,
                    productId: item.product.id,
                    product: item.product,
                    quantity: item.quantity,
                    totalAmount: item.product.price * item.quantity,
                    addedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })),
                totalAmount: localCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            };
            setCart(mockCart);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.getCart();
            if (response?.data) {
                setCart(response.data);
            }
        } catch (err) {
            setError('Failed to fetch cart');
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const addToCart = useCallback(async (productId: number, quantity: number = 1) => {
        if (!isLoggedIn) {
            // Handle local storage for non-logged users
            // You'll need to implement this based on your Product interface
            console.log('Adding to local storage - implement based on your needs');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.addToCart(productId, quantity);
            if (response?.data) {
                setCart(response.data);
            }
        } catch (err) {
            setError('Failed to add item to cart');
            console.error('Error adding to cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const updateCartItem = useCallback(async (productId: number, quantity: number) => {
        if (!isLoggedIn) {
            // Handle local storage for non-logged users
            console.log('Updating local storage - implement based on your needs');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await cartApi.updateCartItem(productId, quantity);
            if (response?.data) {
                setCart(response.data);
            }
        } catch (err) {
            setError('Failed to update cart item');
            console.error('Error updating cart item:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const removeFromCart = useCallback(async (productId: number) => {
        if (!isLoggedIn) {
            // Handle local storage for non-logged users
            console.log('Removing from local storage - implement based on your needs');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await cartApi.removeFromCart(productId);
            // Refresh cart after removal
            await fetchCart();
        } catch (err) {
            setError('Failed to remove item from cart');
            console.error('Error removing from cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, fetchCart]);

    const clearCart = useCallback(async () => {
        if (!isLoggedIn) {
            localCartService.clearCart();
            await fetchCart();
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await cartApi.clearCart();
            setCart({
                id: 0,
                items: [],
                totalAmount: 0

            });
        } catch (err) {
            setError('Failed to clear cart');
            console.error('Error clearing cart:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const getCartItemCount = useCallback(async (): Promise<number> => {
        if (!isLoggedIn) {
            const localCart = localCartService.getCart();
            return localCart.reduce((sum, item) => sum + item.quantity, 0);
        }

        try {
            const response = await cartApi.getCartItemCount();
            return response?.data || 0;
        } catch (err) {
            console.error('Error getting cart count:', err);
            return 0;
        }
    }, [isLoggedIn]);

    // Load cart on mount and when login status changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartItemCount,
        refreshCart: fetchCart
    };
}