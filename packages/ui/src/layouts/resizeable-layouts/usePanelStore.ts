'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type PanelPosition = 'left' | 'middle' | 'right'
type PanelId = string

interface PanelState {
  // Panel visibility and sizes
  leftVisible: boolean
  rightVisible: boolean
  leftSize: number
  middleSize: number
  rightSize: number
  activeIds: Record<PanelPosition, PanelId>
  isMobileLayout: boolean
  activeMobilePanel: PanelPosition
  isHydrated: boolean

  // Panel actions
  setLeftVisible: (visible: boolean) => void
  setRightVisible: (visible: boolean) => void
  setPanelSizes: (left: number, middle: number, right: number) => void
  setActiveId: (position: PanelPosition, id: PanelId) => void
  setIsMobileLayout: (isMobile: boolean) => void
  setActiveMobilePanel: (panel: PanelPosition) => void
  setHydrated: (hydrated: boolean) => void
}

const defaultState = {
  leftVisible: true,
  rightVisible: true,
  leftSize: 20,
  middleSize: 60,
  rightSize: 20,
  activeIds: {
    left: '',
    middle: '',
    right: ''
  },
  isMobileLayout: false,
  activeMobilePanel: 'middle' as PanelPosition,
  isHydrated: false,
}

// Create store instances lazily and memoize them
const stores = new Map<string, ReturnType<typeof createPanelStore>>()

const createPanelStore = (storeId: string) => {
  const existingStore = stores.get(storeId)
  if (existingStore) {
    return existingStore
  }

  const store = create<PanelState>()(
    persist(
      (set, get) => ({
        ...defaultState,

        // Actions
        setLeftVisible: (visible) => {
          if (!get().isHydrated) return
          set({ leftVisible: visible })
        },
        setRightVisible: (visible) => {
          if (!get().isHydrated) return
          set({ rightVisible: visible })
        },
        setPanelSizes: (left, middle, right) => {
          const state = get()
          if (!state.isHydrated) return
          set({ leftSize: left, middleSize: middle, rightSize: right })
        },
        setActiveId: (position, id) => {
          if (!get().isHydrated) return
          const state = get()
          set({
            activeIds: {
              ...state.activeIds,
              [position]: id
            }
          })
        },
        setIsMobileLayout: (isMobile) => {
          if (!get().isHydrated) return
          set({ isMobileLayout: isMobile })
        },
        setActiveMobilePanel: (panel) => {
          if (!get().isHydrated) return
          set({ activeMobilePanel: panel })
        },
        setHydrated: (hydrated) => {
          set({ isHydrated: hydrated })
        },
      }),
      {
        name: `panel-storage-${storeId}`,
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        onRehydrateStorage: () => {
          return (state) => {
            if (!state) return
            // Set hydrated state in the next tick to avoid React state updates during render
            queueMicrotask(() => {
              state.setHydrated(true)
            })
          }
        },
      }
    )
  )

  stores.set(storeId, store)
  return store
}

export const usePanelStore = (storeId: string) => {
  return createPanelStore(storeId)
}

export type { PanelPosition, PanelId }

