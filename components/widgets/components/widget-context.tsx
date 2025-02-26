"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  WidgetDefinition,
  WidgetSize,
  WidgetBreakpoint,
} from "./widget-registry";
import { createWidgetStore, type WidgetStore } from "./widget-store";
import type { StoreApi } from "zustand";

interface WidgetContextValue {
  registerWidget: <TProps>(
    type: string,
    definition: WidgetDefinition<TProps>,
  ) => void;
  getWidget: (type: string) => WidgetDefinition | undefined;
  getAvailableWidgetTypes: () => string[];
  useStore: () => StoreApi<WidgetStore>;
}

const WidgetContext = createContext<WidgetContextValue | null>(null);

interface WidgetProviderProps {
  children: ReactNode;
  initialWidgets?: Record<string, WidgetDefinition>;
  storeId?: string;
}

export function WidgetProvider({
  children,
  initialWidgets = {},
  storeId = "default",
}: WidgetProviderProps) {
  // Create a new Map for this instance of the provider
  const registry = useMemo(
    () => new Map(Object.entries(initialWidgets)),
    [initialWidgets],
  );

  // Create a new store instance for this provider
  const store = useMemo(() => createWidgetStore(storeId), [storeId]);

  const registerWidget = useCallback(
    <TProps,>(type: string, definition: WidgetDefinition<TProps>) => {
      registry.set(type, definition as WidgetDefinition);
    },
    [registry],
  );

  const getWidget = useCallback(
    (type: string) => {
      return registry.get(type);
    },
    [registry],
  );

  const getAvailableWidgetTypes = useCallback(() => {
    return Array.from(registry.keys());
  }, [registry]);

  const value = useMemo(
    () => ({
      registerWidget,
      getWidget,
      getAvailableWidgetTypes,
      useStore: () => store,
    }),
    [registerWidget, getWidget, getAvailableWidgetTypes, store],
  );

  return (
    <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgets must be used within a WidgetProvider");
  }
  return context;
}

// Helper hook to register multiple widgets at once
export function useRegisterWidgets(widgets: Record<string, WidgetDefinition>) {
  const { registerWidget } = useWidgets();

  useMemo(() => {
    Object.entries(widgets).forEach(([type, definition]) => {
      registerWidget(type, definition);
    });
  }, [widgets, registerWidget]);
}

// Helper hook to use the widget store
export function useWidgetStore<T>(selector: (state: WidgetStore) => T): T {
  const { useStore } = useWidgets();
  const store = useStore();
  const [state, setState] = useState<T>(selector(store.getState()));

  useEffect(() => {
    return store.subscribe((state) => {
      setState(selector(state));
    });
  }, [store, selector]);

  return state;
}
