import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DashboardItem {
  id: string;
  type: string;
  colSpan: number;
  rowSpan: number;
  hideInLarge?: boolean;
  hideInMedium?: boolean;
  hideInSmall?: boolean;
}

export interface DashboardPreset {
  id: string;
  name: string;
  items: DashboardItem[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardState {
  items: DashboardItem[];
  presets: DashboardPreset[];
  activePresetId: string | null;
  setItems: (items: DashboardItem[]) => void;
  savePreset: (name: string, items: DashboardItem[], presetId?: string) => void;
  removePreset: (id: string) => void;
  applyPreset: (id: string) => void;
}

const defaultItems: DashboardItem[] = [
  { id: "1", type: "chart", colSpan: 2, rowSpan: 1 },
  { id: "2", type: "chart", colSpan: 4, rowSpan: 1 },
  { id: "3", type: "calendar", colSpan: 3, rowSpan: 2 },
  { id: "4", type: "empty", colSpan: 3, rowSpan: 1 },
];

// Helper function to deep clone objects
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      items: deepClone(defaultItems),
      presets: [],
      activePresetId: null,

      setItems: (items) => {
        set({ items: deepClone(items) });
      },

      savePreset: (name, items, presetId) => {
        const timestamp = new Date().toISOString();

        if (presetId) {
          // Update existing preset
          set((state) => ({
            presets: state.presets.map((preset) =>
              preset.id === presetId
                ? {
                    ...preset,
                    items: deepClone(items),
                    updatedAt: timestamp,
                  }
                : preset,
            ),
            activePresetId: presetId,
          }));
        } else {
          // Create new preset
          const newPreset: DashboardPreset = {
            id: crypto.randomUUID(),
            name,
            items: deepClone(items),
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          set((state) => ({
            presets: [...state.presets, newPreset],
            activePresetId: newPreset.id,
          }));
        }
      },

      removePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id),
          activePresetId:
            state.activePresetId === id ? null : state.activePresetId,
          items:
            state.activePresetId === id ? deepClone(defaultItems) : state.items,
        }));
      },

      applyPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id);
        if (preset) {
          set({
            items: deepClone(preset.items),
            activePresetId: id,
          });
        }
      },
    }),
    {
      name: "dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        presets: deepClone(state.presets),
        items: deepClone(state.items),
        activePresetId: state.activePresetId,
      }),
    },
  ),
);
