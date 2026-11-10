export type ARPlacementMode = 'floor' | 'wall' | 'window';
export type ARSessionStatus = 'idle' | 'initializing' | 'active' | 'unsupported' | 'failed';

export interface ARSessionConfig {
  modelUrl: string;
  usdzUrl?: string;
  title: string;
  placement: ARPlacementMode;
  scale?: number;
}

