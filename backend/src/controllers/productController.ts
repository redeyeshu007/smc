import { Request, Response } from 'express';
import { productService } from '../services/productService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  return ApiResponse.created(res, 'Product created successfully', product);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.queryProducts(req.query as any);
  return ApiResponse.success(res, {
    message: 'Products retrieved successfully',
    data: result.products,
    meta: {
      total: result.total,
      pages: result.pages,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    },
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  return ApiResponse.success(res, {
    message: 'Product retrieved successfully',
    data: product,
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug);
  return ApiResponse.success(res, {
    message: 'Product retrieved successfully',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return ApiResponse.success(res, {
    message: 'Product updated successfully',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  return ApiResponse.success(res, {
    message: 'Product deleted successfully',
  });
});
