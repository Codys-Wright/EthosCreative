'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type PanelPosition = 'left' | 'middle' | 'right' | 'top' | 'bottom' | 'bottom-left' | 'bottom-middle' | 'bottom-right'
type PanelId = string

interface PanelState {
  // Panel visibility and sizes
  topVisible: boolean
  leftVisible: boolean
  rightVisible: boolean
  bottomVisible: boolean
  bottomLeftVisible: boolean
  bottomMiddleVisible: boolean
  bottomRightVisible: boolean
  
  topSize: number
  leftSize: number
  middleSize: number
  rightSize: number
  bottomSize: number
  bottomLeftSize: number
  bottomMiddleSize: number
  bottomRightSize: number

  activeIds: Record<PanelPosition, PanelId>
  isMobileLayout: boolean
  activeMobilePanel: PanelPosition
  isHydrated: boolean

  // Panel actions
  setTopVisible: (visible: boolean) => void
  setLeftVisible: (visible: boolean) => void
  setRightVisible: (visible: boolean) => void
  setBottomVisible: (visible: boolean) => void
  setBottomLeftVisible: (visible: boolean) => void
  setBottomMiddleVisible: (visible: boolean) => void
  setBottomRightVisible: (visible: boolean) => void
  
  setPanelSizes: (sizes: Partial<Record<PanelPosition, number>>) => void
  setActiveId: (position: PanelPosition, id: PanelId) => void
  setIsMobileLayout: (isMobile: boolean) => void
  setActiveMobilePanel: (panel: PanelPosition) => void
  setHydrated: (hydrated: boolean) => void
}

const defaultState = {
  topVisible: true,
  leftVisible: true,
  rightVisible: true,
  bottomVisible: true,
  bottomLeftVisible: true,
  bottomMiddleVisible: true,
  bottomRightVisible: true,

  topSize: 10,
  leftSize: 20,
  middleSize: 60,
  rightSize: 20,
  bottomSize: 30,
  bottomLeftSize: 30,
  bottomMiddleSize: 30,
  bottomRightSize: 30,

  activeIds: {
    top: '',
    left: '',
    middle: '',
    right: '',
    bottom: '',
    'bottom-left': '',
    'bottom-middle': '',
    'bottom-right': ''
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

  console.log(`Creating new panel store for ${storeId}`)

  const store = create<PanelState>()(
    persist(
      (set, get) => ({
        ...defaultState,

        // Actions
        setTopVisible: (visible) => {
          if (!get().isHydrated) return
          set({ topVisible: visible })
        },
        setLeftVisible: (visible) => {
          if (!get().isHydrated) return
          set({ leftVisible: visible })
        },
        setRightVisible: (visible) => {
          if (!get().isHydrated) return
          set({ rightVisible: visible })
        },
        setBottomVisible: (visible) => {
          if (!get().isHydrated) return
          set({ bottomVisible: visible })
        },
        setBottomLeftVisible: (visible) => {
          if (!get().isHydrated) return
          set({ bottomLeftVisible: visible })
        },
        setBottomMiddleVisible: (visible) => {
          if (!get().isHydrated) return
          set({ bottomMiddleVisible: visible })
        },
        setBottomRightVisible: (visible) => {
          if (!get().isHydrated) return
          set({ bottomRightVisible: visible })
        },
        setPanelSizes: (sizes) => {
          const state = get()
          if (!state.isHydrated) {
            console.log('Skipping panel size update - store not hydrated')
            return
          }
          console.log('Setting panel sizes in store:', sizes)
          
          // Determine if this is a horizontal or vertical update based on the properties present
          const isHorizontalUpdate = 'left' in sizes || 'middle' in sizes || 'right' in sizes
          const isVerticalUpdate = 'top' in sizes || 'bottom' in sizes || 'bottom-left' in sizes || 'bottom-middle' in sizes || 'bottom-right' in sizes
          
          // Create new state object preserving existing sizes
          const newState = {
            ...state,
            // Only update horizontal sizes if this is a horizontal update
            ...(isHorizontalUpdate ? {
              leftSize: sizes.left ?? state.leftSize,
              middleSize: sizes.middle ?? state.middleSize,
              rightSize: sizes.right ?? state.rightSize,
            } : {}),
            // Only update vertical sizes if this is a vertical update
            ...(isVerticalUpdate ? {
              topSize: sizes.top ?? state.topSize,
              bottomSize: sizes.bottom ?? state.bottomSize,
              bottomLeftSize: sizes['bottom-left'] ?? state.bottomLeftSize,
              bottomMiddleSize: sizes['bottom-middle'] ?? state.bottomMiddleSize,
              bottomRightSize: sizes['bottom-right'] ?? state.bottomRightSize,
            } : {})
          }
          
          set(newState)
        },
        setActiveId: (position, id) => {
          if (!get().isHydrated) return
          console.log(`Setting active ID for ${position} to ${id}`)
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
          console.log(`Setting hydration state to: ${hydrated}`)
          set({ isHydrated: hydrated })
        },
      }),
      {
        name: `panel-storage-${storeId}`,
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
        onRehydrateStorage: () => {
          console.log(`Starting rehydration for store ${storeId}`)
          return (state) => {
            if (!state) return
            console.log(`Rehydrated store ${storeId}:`, state)
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

