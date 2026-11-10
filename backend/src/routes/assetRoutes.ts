import { Router } from 'express';
import {
  uploadAsset,
  getPresignedUrl,
  getAssets,
  getAssetById,
  deleteAsset,
} from '../controllers/assetController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getPresignedUrlSchema,
  uploadAssetMetadataSchema,
} from '../validators/assetValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public: Fetch 3D assets metadata for rendering
router.get('/', getAssets);
router.get('/:id', getAssetById);

// Admin-only: Upload 3D models and delete assets
router.post(
  '/',
  authenticate,
  authorize('admin'),
  uploadMiddleware.single('file'),
  validateRequest(uploadAssetMetadataSchema),
  uploadAsset
);

router.post(
  '/presigned-url',
  authenticate,
  authorize('admin'),
  validateRequest(getPresignedUrlSchema),
  getPresignedUrl
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteAsset
);

export default router;
