import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "../apiErrorHandler";
import {
    API_PRODUCT_URL,
    API_SEARCH_ASSOCIATED_CATEGORIES_URL,
    API_SEARCH_URL,
    API_CATEGORY_URL,
    API_ALL_CATEGORIES_TREE,
    API_PRODUCTS_QUERY_URL,
    API_CATEGORY_PATH_URL
} from "config";
import { AxiosResponse } from "axios";
import { getValidatedToken } from "utils/cookies";

// No local interfaces - all are in shopTypes.d.ts

export async function addProduct(productData: CreateProductRequest): Promise<AxiosResponse | undefined> {
    try {
        const token = getValidatedToken();
        
        // Create FormData from the typed object
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('categoryId', String(productData.categoryId));
        formData.append('description', productData.description || '');
        formData.append('price', String(productData.price));
        
        // Append images
        productData.images.forEach((image) => {
            formData.append('images', image);
        });
        
        const response = await apiClient.post(`${API_PRODUCT_URL}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function addCategory(data: CreateCategoryRequest): Promise<AxiosResponse | undefined> {
    try {
        const token = getValidatedToken();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('shortName', data.shortName);

        if (data.parentId !== null && data.parentId !== undefined) {
            formData.append('parentId', data.parentId.toString());
        }

        if (data.image) {
            formData.append('image', data.image);
        }
        
        const response = await apiClient.post(`${API_CATEGORY_URL}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export const updateProduct = async (productId: number, productData: UpdateProductRequest): Promise<AxiosResponse | undefined> => {
    try {
        const token = getValidatedToken();
        
        const formData = new FormData();
        
        // Only append fields that are being updated
        if (productData.name !== undefined) {
            formData.append('name', productData.name);
        }
        if (productData.categoryId !== undefined) {
            formData.append('categoryId', String(productData.categoryId));
        }
        if (productData.description !== undefined) {
            formData.append('description', productData.description);
        }
        if (productData.price !== undefined) {
            formData.append('price', String(productData.price));
        }
        
        // NEW APPROACH: send current images with positions
        if (productData.currentImages) {
            Object.entries(productData.currentImages).forEach(([imageId, position]) => {
                formData.append(`currentImages[${imageId}]`, String(position));
            });
        }
        
        if (productData.newImages && productData.newImages.length > 0) {
            productData.newImages.forEach(image => {
                formData.append('newImages', image);
            });
        }
        
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

export async function getProductsCount(categoryId?: number, search?: string): Promise<AxiosResponse<number> | undefined> {
    try {
        let url = `${API_PRODUCT_URL}count`;
        
        const params = new URLSearchParams();
        if (categoryId !== undefined) {
            params.append('categoryId', categoryId.toString());
        }
        if (search !== undefined && search.trim() !== '') {
            params.append('search', search);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await apiClient.get(url);
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function getCategoriesCount(): Promise<AxiosResponse<number> | undefined> {
    try {
        const response = await apiClient.get(`${API_CATEGORY_URL}count`);
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function getAllProducts(): Promise<AxiosResponse | undefined> {
    try {
        const url = `${API_PRODUCTS_QUERY_URL}`;
        const response = await apiClient.get(url);
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function getAllProductsInCategory(
  categoryId: number, 
  page = 1, 
  searchString?: string
): Promise<AxiosResponse | undefined> {
  try {
    const params = new URLSearchParams({
      category: categoryId.toString(),
      page: page.toString()
    });
    
    // Add search parameter if provided
    if (searchString && searchString.trim()) {
      params.append('search', searchString.trim());
    }
    
    const url = `${API_PRODUCTS_QUERY_URL}?${params.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}

export async function getAllSearchProducts(searchString: string, page = 1): Promise<AxiosResponse | undefined> {
    try {
        // Build proper URL instead of string concatenation
        const params = new URLSearchParams();
        if (searchString && searchString.trim()) {
            params.append('search', searchString.trim());
        }
        params.append('page', page.toString());
        
        const url = `${API_PRODUCTS_QUERY_URL}?${params.toString()}`;
        const response = await apiClient.get(url);
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}

export async function getAllCategoriesTree(): Promise<AxiosResponse | undefined> {
    try {
        const response = await apiClient.get(API_ALL_CATEGORIES_TREE);
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
        const response = await apiClient.get(`${API_CATEGORY_URL}${categoryId}`);
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
        // Build URL with proper query parameters
        const params = new URLSearchParams();
        if (searchString && searchString.trim()) {
            params.append('search', searchString.trim()); // Use 'search' not 'string'
        }
        
        const url = `${API_SEARCH_ASSOCIATED_CATEGORIES_URL}?${params.toString()}`;
        console.log('Calling API:', url); // Add logging to debug
        
        const response = await apiClient.get(url);
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}


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

export const deleteCategory = async (categoryId: number): Promise<AxiosResponse | undefined> => {
    try {
        const token = getValidatedToken();
        const response = await apiClient.delete(`${API_CATEGORY_URL}${categoryId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}
export const updateCategory = async (categoryId: number, formData: FormData): Promise<AxiosResponse | undefined> => {
    try {
        const token = getValidatedToken();
        const response = await apiClient.put(`${API_CATEGORY_URL}${categoryId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        apiErrorHandler(error);
    }
}