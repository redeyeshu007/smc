import { Asset3D } from './asset3d';

export type ProductType = 'door' | 'window';
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface MaterialOption {
  name: string;
  code: string;
  hexColor: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
  priceModifier: number;
}

export interface HardwareOption {
  name: string;
  code: string;
  finish: string;
  price: number;
}

export interface ProductDimensions {
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  unit: 'mm' | 'inches';
}

export interface ProductCustomizable {
  widthRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  materials: MaterialOption[];
  hardware: HardwareOption[];
}

export interface ProductAssets {
  primaryGlb?: Asset3D | string;
  iosUsdz?: Asset3D | string;
  thumbnailUrl: string;
  galleryImages: string[];
}

export interface ProductARConfig {
  enabled: boolean;
  placement: 'floor' | 'wall' | 'window';
  scale: number;
  autoRotate: boolean;
}

export interface ProductVRShowroom {
  enabled: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  featured: boolean;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  productType: ProductType;
  subType: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    type: string;
  };
  basePrice: number;
  currency: string;
  dimensions: ProductDimensions;
  customizable: ProductCustomizable;
  assets: ProductAssets;
  arConfig: ProductARConfig;
  vrShowroom: ProductVRShowroom;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
