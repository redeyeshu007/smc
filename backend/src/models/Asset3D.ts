import mongoose, { Schema, Document } from 'mongoose';

export type AssetFormat = 'glb' | 'gltf' | 'usdz' | 'texture' | 'hdr';
export type LodLevel = 'lod0' | 'lod1' | 'lod2';

export interface IAsset3D extends Document {
  name: string;
  originalFileName: string;
  format: AssetFormat;
  url: string;
  s3Key: string;
  bucket: string;
  fileSize: number; // in bytes
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
  createdAt: Date;
  updatedAt: Date;
}

const Asset3DSchema = new Schema<IAsset3D>(
  {
    name: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true },
    format: {
      type: String,
      enum: ['glb', 'gltf', 'usdz', 'texture', 'hdr'],
      required: true,
      index: true,
    },
    url: { type: String, required: true },
    s3Key: { type: String, required: true, index: true },
    bucket: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      unit: { type: String, enum: ['meters', 'mm'], default: 'meters' },
    },
    lodLevel: {
      type: String,
      enum: ['lod0', 'lod1', 'lod2'],
      default: 'lod0',
    },
    polycount: { type: Number },
    hasAnimations: { type: Boolean, default: false },
    isArReady: { type: Boolean, default: false },
    isVrReady: { type: Boolean, default: false },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const Asset3D = mongoose.model<IAsset3D>('Asset3D', Asset3DSchema);
