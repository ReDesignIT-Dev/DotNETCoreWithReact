import { AxiosResponse, AxiosRequestConfig } from "axios";
import { getToken, getValidatedToken } from "utils/cookies";
import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "services/apiErrorHandler";
import { API_CART_URL, API_ADD_TO_CART_URL, API_UPDATE_CART_URL, API_DELETE_FROM_CART_URL} from "config";

type Headers = Record<string, string | undefined>;

const getAuthHeaders = (): Headers => {
  const token = getValidatedToken();
  const headers: Headers = {
    Authorization: token ? `Token ${token}` : undefined,
    'Content-Type': apiClient.defaults.headers['Content-Type'] as string | undefined,
    Accept: apiClient.defaults.headers['Accept'] as string | undefined,
  };

  return headers;
};

interface ApiRequestConfig extends AxiosRequestConfig {
  data?: Record<string, unknown>; 
}

interface CartItem {
  product: Product;
  quantity: number;
}

const apiRequest = async (
  method: string,
  url: string,
  data?: Record<string, unknown>
): Promise<AxiosResponse | undefined> => {
  try {
    const config: ApiRequestConfig = {
      method,
      url,
      headers: getAuthHeaders(), 
      ...(data ? { data } : {}) 
    };

    const response = await apiClient(config);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
};

export const getCart = async (): Promise<CartItem[]> => {
  const response = await apiRequest('get', API_CART_URL);
  if (response && response.data) {
    return response.data.map((item: any) => ({
      product: {
        slug: item.product.slug,
        name: item.product.name,
        image: item.product.image,
        price: parseFloat(item.product.price),
      },
      quantity: item.quantity,
    }));
  }
  return [];
};

export const addToCart = (product: Product, quantity: number): Promise<AxiosResponse | undefined> => 
  apiRequest('post', API_ADD_TO_CART_URL, { product_slug: product.slug, quantity });

export const updateCartItemQuantity = (product: Product, quantity: number): Promise<AxiosResponse | undefined> => 
  apiRequest('put', API_UPDATE_CART_URL, { product_slug: product.slug, quantity });

export const deleteCartItem = (product: Product): Promise<AxiosResponse | undefined> => 
  apiRequest('delete', API_DELETE_FROM_CART_URL, { product_slug: product.slug });