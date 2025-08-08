import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "../apiErrorHandler";
import {
  API_PRODUCT_URL,
  API_SEARCH_ASSOCIATED_CATEGORIES_URL,
  API_SEARCH_URL,
  API_CATEGORY_URL,
  API_ALL_CATEGORIES_FLAT,
  API_PRODUCT_ADD_URL,
  API_PRODUCTS_QUERY_URL,
  API_CATEGORY_PATH_URL
} from "config";
import { AxiosResponse } from "axios";
import { getValidatedToken } from "utils/cookies";

export async function getAllProducts(): Promise<AxiosResponse | undefined> {
  try {
    const url = `${API_PRODUCTS_QUERY_URL}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllProductsInCategory(categoryId: number, page = 1): Promise<AxiosResponse | undefined> {
  try {
    const url = `${API_PRODUCTS_QUERY_URL}?category=${categoryId}&page=${page}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllSearchProducts(searchString: string, page = 1): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_SEARCH_URL}${searchString}&page=${page}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllCategoriesTree(): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(API_ALL_CATEGORIES_FLAT);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllChildrenOfCategory(categoryId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_CATEGORY_URL}/${categoryId}/children`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllParentsOfCategory(categoryId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_CATEGORY_URL}/${categoryId}/parents`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getProduct(productId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_PRODUCT_URL}${productId}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getCategory(categoryId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_CATEGORY_URL}/${categoryId}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getCategoryPath(categoryId: number, includeSelf: boolean): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_CATEGORY_PATH_URL}${categoryId}?include_self=${includeSelf}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getProductParentCategory(productId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_PRODUCT_URL}${productId}/parent-category`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllSearchAssociatedCategories(
  searchString: string
): Promise<AxiosResponse<CategoryTree[]> | undefined> {
  try {
    const response = await apiClient.get(`${API_SEARCH_ASSOCIATED_CATEGORIES_URL}${searchString}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}



export async function addProduct(formData : FormData): Promise<AxiosResponse | undefined> {
  try {
    const token = getValidatedToken();
    const response = await apiClient.post(`${API_PRODUCT_ADD_URL}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }});
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

 export const updateProduct = async (productId: number, formData: FormData): Promise<AxiosResponse | undefined> => {
    try {
      const token = getValidatedToken();
      const response = await apiClient.put(`${API_PRODUCT_URL}${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      apiErrorHandler(error);
    }
  };

  export const deleteProduct = async (productId: number): Promise<AxiosResponse | undefined> => {
    try {
      const token = getValidatedToken();
      const response = await apiClient.delete(`${API_PRODUCT_URL}${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      apiErrorHandler(error);
    }
  }