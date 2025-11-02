import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "../apiErrorHandler";
import { AxiosResponse } from "axios";
import { getValidatedToken, isTokenValid } from "utils/cookies";

const API_CART_URL = "/api/shop/cart";

export async function getCart(): Promise<AxiosResponse<Cart> | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.get(API_CART_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function addToCart(productId: number, quantity = 1): Promise<AxiosResponse<Cart> | undefined> {
    try {
        const token = getValidatedToken();
        
        // ✅ Add debugging
        console.log("=== Frontend Cart Add Debug ===");
        console.log("Token exists:", !!token);
        console.log("Token length:", token?.length || 0);
        console.log("Token preview:", token?.substring(0, 20) + "...");
        console.log("Is token valid:", isTokenValid());
        
        const response = await apiClient.post(`${API_CART_URL}/add`, {
            productId,
            quantity
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        console.error("Cart add error:", error);
        apiErrorHandler(error);
    }
}

export async function updateCartItem(productId: number, quantity: number): Promise<AxiosResponse<Cart> | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.put(`${API_CART_URL}/items/${productId}`, {
            quantity
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function removeFromCart(productId: number): Promise<AxiosResponse | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.delete(`${API_CART_URL}/items/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function clearCart(): Promise<AxiosResponse | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.delete(`${API_CART_URL}/clear`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function getCartItemCount(): Promise<AxiosResponse<number> | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.get(`${API_CART_URL}/count`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function testWebSocket(): Promise<AxiosResponse<{ requestId: string; message: string }> | undefined> {
    try {
        const token = getValidatedToken();
        const response = await apiClient.post(`${API_CART_URL}/test-websocket`, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}