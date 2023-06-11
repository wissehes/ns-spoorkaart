import { create } from "zustand";

export interface MapState {
  shouldRotate: boolean;
  showTrack: boolean;

  setRotate: (to: boolean) => void;
  setShowTrack: (to: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  shouldRotate: true,
  showTrack: true,

  setRotate: (v) => set({ shouldRotate: v }),
  setShowTrack: (v) => set({ showTrack: v }),
}));
