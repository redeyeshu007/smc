import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProductType = 'door' | 'window';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type DoorSubType = 'sliding' | 'casement' | 'french' | 'folding' | 'pivot' | 'bifold';
export type WindowSubType = 'casement' | 'sliding' | 'fixed' | 'tilt_turn' | 'awning';

export interface IMaterialOption {
  name: string;
  code: string;
  hexColor: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
  priceModifier: number;
}

export interface IHardwareOption {
  name: string;
  code: string;
  finish: string;
  price: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  sku: string;
  description: string;
  productType: ProductType;
  subType: string;
  category: Types.ObjectId;
  basePrice: number;
  currency: string;
  dimensions: {
    defaultWidth: number;
    defaultHeight: number;
    defaultDepth: number;
    unit: 'mm' | 'inches';
  };
  customizable: {
    widthRange: { min: number; max: number };
    heightRange: { min: number; max: number };
    materials: IMaterialOption[];
    hardware: IHardwareOption[];
  };
  assets: {
    primaryGlb?: Types.ObjectId;
    iosUsdz?: Types.ObjectId;
    thumbnailUrl: string;
    galleryImages: string[];
  };
  arConfig: {
    enabled: boolean;
    placement: 'floor' | 'wall' | 'window';
    scale: number;
    autoRotate: boolean;
  };
  vrShowroom: {
    enabled: boolean;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    featured: boolean;
  };
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialOptionSchema = new Schema<IMaterialOption>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  hexColor: { type: String, required: true },
  roughness: { type: Number, default: 0.5 },
  metalness: { type: Number, default: 0.0 },
  textureUrl: { type: String },
  priceModifier: { type: Number, default: 0 },
});

const HardwareOptionSchema = new Schema<IHardwareOption>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  finish: { type: String, required: true },
  price: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true },
    productType: {
      type: String,
      enum: ['door', 'window'],
      required: true,
      index: true,
    },
    subType: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    dimensions: {
      defaultWidth: { type: Number, required: true },
      defaultHeight: { type: Number, required: true },
      defaultDepth: { type: Number, required: true },
      unit: { type: String, enum: ['mm', 'inches'], default: 'mm' },
    },
    customizable: {
      widthRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
      },
      heightRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
      },
      materials: [MaterialOptionSchema],
      hardware: [HardwareOptionSchema],
    },
    assets: {
      primaryGlb: { type: Schema.Types.ObjectId, ref: 'Asset3D' },
      iosUsdz: { type: Schema.Types.ObjectId, ref: 'Asset3D' },
      thumbnailUrl: { type: String, default: '' },
      galleryImages: [{ type: String }],
    },
    arConfig: {
      enabled: { type: Boolean, default: true },
      placement: {
        type: String,
        enum: ['floor', 'wall', 'window'],
        default: 'wall',
      },
      scale: { type: Number, default: 1.0 },
      autoRotate: { type: Boolean, default: false },
    },
    vrShowroom: {
      enabled: { type: Boolean, default: true },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
      },
      rotation: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
      },
      featured: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
