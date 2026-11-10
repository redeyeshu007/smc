import { create } from 'zustand';

export type LightingMood = 'daylight' | 'sunset' | 'night' | 'studio';

interface ShowroomState {
  activeHotspotId: string | null;
  lightingMood: LightingMood;
  isAudioEnabled: boolean;
  isVrModeActive: boolean;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];

  // Actions
  setActiveHotspot: (id: string | null) => void;
  setLightingMood: (mood: LightingMood) => void;
  toggleAudio: () => void;
  setVrMode: (active: boolean) => void;
  setCameraView: (position: [number, number, number], target: [number, number, number]) => void;
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  activeHotspotId: null,
  lightingMood: 'daylight',
  isAudioEnabled: false,
  isVrModeActive: false,
  cameraPosition: [0, 1.6, 3],
  cameraTarget: [0, 1.2, 0],

  setActiveHotspot: (id) => set({ activeHotspotId: id }),
  setLightingMood: (mood) => set({ lightingMood: mood }),
  toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  setVrMode: (active) => set({ isVrModeActive: active }),
  setCameraView: (position, target) => set({ cameraPosition: position, cameraTarget: target }),
}));
