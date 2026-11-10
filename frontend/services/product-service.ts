import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';
import { Product } from '@/types/product';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  productType?: 'door' | 'window';
  subType?: string;
  status?: string;
  search?: string;
}

export const productService = {
  getProducts: async (params?: ProductQueryParams): Promise<ApiResponse<Product[]>> => {
    return (await apiClient.get('/products', { params })) as unknown as ApiResponse<Product[]>;
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return (await apiClient.get(`/products/${id}`)) as unknown as ApiResponse<Product>;
  },

  getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    return (await apiClient.get(`/products/slug/${slug}`)) as unknown as ApiResponse<Product>;
  },
};
