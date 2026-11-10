import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import productRoutes from './productRoutes.js';
import assetRoutes from './assetRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/products', productRoutes);
router.use('/assets', assetRoutes);
router.use('/auth', authRoutes);

export default router;
