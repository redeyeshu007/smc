import { Router } from 'express';
import {
  createProduct,
  getAdminProducts,
  getProducts,
  getProductById,
  updateProduct,
  publishProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { uploadProductModelsMiddleware } from '../middleware/upload.js';

const router = Router();

// ==========================================
// PUBLIC / USER ROUTES
// ==========================================

// GET /api/products - View published products only
router.get('/', getProducts);

// GET /api/products/admin - Admin view of all products (drafts + published)
// Note: Placed before /:id so 'admin' is not parsed as a MongoDB ObjectId
router.get(
  '/admin',
  authenticate,
  authorize('admin'),
  getAdminProducts
);

// GET /api/products/:id - View single product (published for users, or drafts for admin)
router.get('/:id', optionalAuthenticate, getProductById);

// ==========================================
// ADMIN-ONLY CRUD & PUBLICATION ROUTES
// ==========================================

// POST /api/products - Create a product (upload GLB and optional USDZ, save as draft or published)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  uploadProductModelsMiddleware,
  createProduct
);

// PUT /api/products/:id - Edit an existing product
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  uploadProductModelsMiddleware,
  updateProduct
);

// PATCH /api/products/:id/publish - Explicitly publish a product to make it visible to users
router.patch(
  '/:id/publish',
  authenticate,
  authorize('admin'),
  publishProduct
);

// DELETE /api/products/:id - Delete a product and its 3D assets
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProduct
);

export default router;
