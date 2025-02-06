"use client"

import dynamic from "next/dynamic"

// Only import and render in development
export const RoleSwitcher =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@/features/global/roles-permissions/demo/role-switcher-impl").then(
            (mod) => mod.RoleSwitcherImpl
          ),
        {
          ssr: false,
        },
      )
    : () => null
