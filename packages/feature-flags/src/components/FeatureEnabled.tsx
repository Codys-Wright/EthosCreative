"use client"

import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { FeatureState } from "../types"

interface FeatureEnabledProps {
  featureId: string
  children: (props: {
    isEnabled: boolean
    isVisible: boolean
    badge?: { text: string; className: string }
    state: FeatureState
  }) => React.ReactNode
}

export function FeatureEnabled({ featureId, children }: FeatureEnabledProps) {
  const { isEnabled, isVisible, badge, state } = useFeatureFlag(featureId)

  const content = children({ isEnabled, isVisible, badge, state })
  if (!content) return null

  return <>{content}</>
}
