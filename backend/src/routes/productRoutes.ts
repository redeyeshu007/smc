import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProductSchema,
  queryProductSchema,
} from '../validators/productValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router
  .route('/')
  .get(validateRequest(queryProductSchema), getProducts)
  .post(
    authenticate,
    authorize('admin', 'staff'),
    validateRequest(createProductSchema),
    createProduct
  );

router.get('/slug/:slug', getProductBySlug);

router
  .route('/:id')
  .get(getProductById)
  .put(authenticate, authorize('admin', 'staff'), updateProduct)
  .delete(authenticate, authorize('admin'), deleteProduct);

export default router;
