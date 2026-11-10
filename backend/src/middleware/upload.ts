import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

const ALLOWED_EXTENSIONS = new Set([
  '.glb',
  '.gltf',
  '.usdz',
  '.bin',
  '.hdr',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Unsupported file type '${ext}'. Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`
      )
    );
  }
};

// Use memory storage so files can be directly streamed to S3/R2 or optimized via Sharp
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});
