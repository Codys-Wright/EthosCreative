import { create, type StoreApi } from "zustand"
import { persist } from "zustand/middleware"

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetStore {
  widgetSizes: Record<string, WidgetSize>
  setWidgetSize: (id: string, size: WidgetSize) => void
  getWidgetSize: (id: string) => WidgetSize | undefined
}

export function createWidgetStore(storeId: string) {
  return create<WidgetStore>()(
    persist(
      (set, get) => ({
        widgetSizes: {},
        setWidgetSize: (id, size) => {
          set((state) => {
            const widgetSizes = { ...state.widgetSizes }
            widgetSizes[id] = size
            return { widgetSizes }
          })
        },
        getWidgetSize: (id) => {
          const size = get().widgetSizes[id]
          return size || { width: 1, height: 1 }
        },
      }),
      {
        name: `widget-store-${storeId}`,
      }
    )
  )
}
