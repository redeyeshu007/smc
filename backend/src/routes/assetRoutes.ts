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

router
  .route('/')
  .get(getAssets)
  .post(
    authenticate,
    authorize('admin', 'staff'),
    uploadMiddleware.single('file'),
    validateRequest(uploadAssetMetadataSchema),
    uploadAsset
  );

router.post(
  '/presigned-url',
  authenticate,
  authorize('admin', 'staff'),
  validateRequest(getPresignedUrlSchema),
  getPresignedUrl
);

router
  .route('/:id')
  .get(getAssetById)
  .delete(authenticate, authorize('admin'), deleteAsset);

export default router;

