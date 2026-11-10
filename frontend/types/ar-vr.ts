export type ARPlacementMode = 'floor' | 'wall' | 'window';
export type ARSessionStatus = 'idle' | 'initializing' | 'active' | 'unsupported' | 'failed';

export interface ARSessionConfig {
  modelUrl: string;
  usdzUrl?: string;
  title: string;
  placement: ARPlacementMode;
  scale?: number;
}

export interface ShowroomCameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ShowroomHotspot {
  id: string;
  productId: string;
  title: string;
  position: [number, number, number];
  normal: [number, number, number];
}
