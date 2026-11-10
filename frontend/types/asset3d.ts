export type AssetFormat = 'glb' | 'gltf' | 'usdz' | 'texture' | 'hdr';
export type LodLevel = 'lod0' | 'lod1' | 'lod2';

export interface Asset3D {
  _id: string;
  name: string;
  originalFileName: string;
  format: AssetFormat;
  url: string;
  s3Key: string;
  bucket: string;
  fileSize: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'meters' | 'mm';
  };
  lodLevel: LodLevel;
  polycount?: number;
  hasAnimations: boolean;
  isArReady: boolean;
  isVrReady: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

