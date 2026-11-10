import { create } from 'zustand';
import { ARPlacementMode, ARSessionStatus } from '@/types/ar-vr';

interface ARStoreState {
  status: ARSessionStatus;
  activeModelUrl: string | null;
  activeUsdzUrl: string | null;
  productTitle: string;
  placement: ARPlacementMode;
  scale: number;

  // Actions
  startARSession: (params: {
    modelUrl: string;
    usdzUrl?: string;
    title: string;
    placement?: ARPlacementMode;
  }) => void;
  setStatus: (status: ARSessionStatus) => void;
  setScale: (scale: number) => void;
  endARSession: () => void;
}

export const useARStore = create<ARStoreState>((set) => ({
  status: 'idle',
  activeModelUrl: null,
  activeUsdzUrl: null,
  productTitle: '',
  placement: 'wall',
  scale: 1.0,

  startARSession: ({ modelUrl, usdzUrl, title, placement = 'wall' }) =>
    set({
      status: 'active',
      activeModelUrl: modelUrl,
      activeUsdzUrl: usdzUrl || null,
      productTitle: title,
      placement,
      scale: 1.0,
    }),

  setStatus: (status) => set({ status }),
  setScale: (scale) => set({ scale }),
  endARSession: () =>
    set({
      status: 'idle',
      activeModelUrl: null,
      activeUsdzUrl: null,
      productTitle: '',
    }),
}));
