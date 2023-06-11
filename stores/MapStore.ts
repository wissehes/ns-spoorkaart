import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface MapState {
  shouldRotate: boolean;
  showTrack: boolean;
  autoRefresh: boolean;

  setRotate: (to: boolean) => void;
  setShowTrack: (to: boolean) => void;
  setAutoRefresh: (to: boolean) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      shouldRotate: true,
      showTrack: true,
      autoRefresh: true,

      setRotate: (v) => set({ shouldRotate: v }),
      setShowTrack: (v) => set({ showTrack: v }),
      setAutoRefresh: (v) => set({ autoRefresh: v }),
    }),
    { name: "map-store", storage: createJSONStorage(() => localStorage) }
  )
);
