'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  initializeActiveIds: (panels: { id: string; position: PanelPosition }[]) => void
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

type PanelStore = ReturnType<typeof create<PanelState>> extends (config: any) => infer R ? R : never

const stores = new Map<string, PanelStore>()

const createPanelStore = (storeId: string): PanelStore => {
  const existingStore = stores.get(storeId)
  if (existingStore) {
    console.log(`[${storeId}] Using existing store:`, {
      activeIds: existingStore.getState().activeIds,
      isHydrated: existingStore.getState().isHydrated
    })
    return existingStore
  }

  const store = create<PanelState>()(
    persist(
      (set, get) => ({
        ...defaultState,

        // Actions
        setLeftVisible: (visible) => {
          if (!get().isHydrated) return
          console.log(`[${storeId}] Setting left visible:`, {
            visible,
            activeIds: get().activeIds
          })
          set({ leftVisible: visible })
        },
        setRightVisible: (visible) => {
          if (!get().isHydrated) return
          console.log(`[${storeId}] Setting right visible:`, {
            visible,
            activeIds: get().activeIds
          })
          set({ rightVisible: visible })
        },
        setPanelSizes: (left, middle, right) => {
          if (!get().isHydrated) return
          set({ leftSize: left, middleSize: middle, rightSize: right })
        },
        setActiveId: (position, id) => {
          if (!get().isHydrated) return
          const state = get()
          console.log(`[${storeId}] Setting active ID:`, {
            position,
            id,
            currentActiveIds: state.activeIds
          })
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
          console.log(`[${storeId}] Setting hydrated:`, {
            hydrated,
            activeIds: get().activeIds
          })
          set({ isHydrated: hydrated })
        },
        initializeActiveIds: (panels) => {
          const state = get()
          console.log(`[${storeId}] Initializing active IDs:`, {
            isHydrated: state.isHydrated,
            currentActiveIds: state.activeIds,
            incomingPanels: panels
          })
          
          // Initialize only if not hydrated or no active IDs are set
          if (state.isHydrated && Object.values(state.activeIds).some(id => id !== '')) {
            console.log(`[${storeId}] Skipping initialization - already has active IDs`)
            return
          }
          
          const activeIds = panels.reduce((acc, panel) => ({
            ...acc,
            [panel.position]: panel.id
          }), {} as Record<PanelPosition, PanelId>)
          
          console.log(`[${storeId}] Setting new active IDs:`, activeIds)
          set({ activeIds, isHydrated: true })
        }
      }),
      {
        name: `panel-storage-${storeId}`,
        skipHydration: true,
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log(`[${storeId}] Rehydrating store:`, {
              activeIds: state.activeIds,
              isHydrated: state.isHydrated
            })
            state.setHydrated(true)
          }
        }
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