import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "../apiErrorHandler";
import {
  API_PRODUCT_URL,
  API_SEARCH_ASSOCIATED_CATEGORIES_URL,
  API_SEARCH_URL,
  API_CATEGORY_URL,
  API_ALL_CATEGORIES_TREE,
  API_ALL_CATEGORIES_FLAT,
  API_PRODUCT_ADD_URL,
  API_PRODUCTS_QUERY_URL,
} from "config";
import { AxiosResponse } from "axios";
import { getToken, getValidatedToken } from "utils/cookies";


export async function getAllProductsInCategory(categoryId: number, page: number = 1): Promise<AxiosResponse | undefined> {
  try {
    const url = `${API_PRODUCTS_QUERY_URL}?category=${categoryId}&page=${page}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllSearchProducts(searchString: string, page: number = 1): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_SEARCH_URL}${searchString}&page=${page}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}
export async function getCategoriesTree(): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(API_ALL_CATEGORIES_TREE);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllCategories(): Promise<AxiosResponse | undefined> {
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
    const response = await apiClient.get(`${API_PRODUCT_URL}/${productId}`);
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

export async function getProductParentCategory(productId: number): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_PRODUCT_URL}/${productId}/parent-category`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllSearchAssociatedCategories(
  searchString: string
): Promise<AxiosResponse<CategoryNode[]> | undefined> {
  try {
    const response = await apiClient.get(`${API_SEARCH_ASSOCIATED_CATEGORIES_URL}${searchString}`);

    if (response.data) {
      const remapCategoryNode = (category: any): CategoryNode => ({
        id: category.id,
        shortName: category.shortName,
        slug: category.slug,
        name: category.name,
        productCount: category.product_count,
        children: category.children ? category.children.map(remapCategoryNode) : [], // Recursively remap children
      });

      // Transform data and return the modified response
      const transformedData = response.data.map(remapCategoryNode);
      return { ...response, data: transformedData };
    }

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
        Authorization: `Token ${token}`
      }});
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}