import { Asset3D, IAsset3D, AssetFormat } from '../models/Asset3D.js';
import { storageService } from './storageService.js';
import { ApiError } from '../utils/apiError.js';
import path from 'path';

export class AssetService {
  /**
   * Detect format from extension
   */
  detectFormat(fileName: string): AssetFormat {
    const ext = path.extname(fileName).toLowerCase().replace('.', '');
    if (['glb', 'gltf', 'usdz', 'hdr'].includes(ext)) {
      return ext as AssetFormat;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return 'texture';
    }
    return 'glb';
  }

  /**
   * Upload and register a 3D asset
   */
  async uploadAndRegisterAsset(
    file: Express.Multer.File,
    metadata: {
      name?: string;
      lodLevel?: 'lod0' | 'lod1' | 'lod2';
      polycount?: number;
      isArReady?: boolean;
      isVrReady?: boolean;
      dimensions?: { width: number; height: number; depth: number };
    }
  ): Promise<IAsset3D> {
    const format = this.detectFormat(file.originalname);
    const folder = ['glb', 'gltf', 'usdz'].includes(format) ? 'models' : 'textures';

    const upload = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    const asset = await Asset3D.create({
      name: metadata.name || file.originalname,
      originalFileName: file.originalname,
      format,
      url: upload.url,
      s3Key: upload.key,
      bucket: upload.bucket,
      fileSize: upload.size,
      mimeType: upload.mimeType,
      lodLevel: metadata.lodLevel || 'lod0',
      polycount: metadata.polycount,
      isArReady: metadata.isArReady ?? (format === 'glb' || format === 'usdz'),
      isVrReady: metadata.isVrReady ?? (format === 'glb'),
      dimensions: metadata.dimensions,
    });

    return asset;
  }

  /**
   * Find asset by ID
   */
  async getAssetById(id: string): Promise<IAsset3D> {
    const asset = await Asset3D.findById(id);
    if (!asset) {
      throw ApiError.notFound(`3D Asset with ID '${id}' not found`);
    }
    return asset;
  }

  /**
   * List assets with filtering
   */
  async listAssets(filter: {
    format?: AssetFormat;
    isArReady?: boolean;
    isVrReady?: boolean;
    lodLevel?: string;
  }): Promise<IAsset3D[]> {
    return Asset3D.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Delete asset and remote storage file
   */
  async deleteAsset(id: string): Promise<void> {
    const asset = await this.getAssetById(id);
    await storageService.deleteFile(asset.s3Key);
    await Asset3D.findByIdAndDelete(id);
  }
}

export const assetService = new AssetService();

