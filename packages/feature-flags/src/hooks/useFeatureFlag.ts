import { useQuery } from "@tanstack/react-query"
import { useAccessControl } from "../../roles-permissions/useAccessControl"
import { FeatureFlag, UseFeatureFlag } from "../types"
import { FEATURE_STATE_CONFIG, isFeatureNew } from "../lib/featureFlags"
import { MOCK_FEATURES } from "../lib/mockFeatures"
import { Role } from "../../roles-permissions/types"

async function getFeatureFlag(id: string): Promise<FeatureFlag> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 100))

  const feature = MOCK_FEATURES[id]
  if (!feature) {
    throw new Error(`Feature ${id} not found`)
  }

  return feature
}

export function useFeatureFlag(featureId: string): UseFeatureFlag {
  const { user, roles } = useAccessControl()
  const userId = user.data?.id ?? "guest"

  // Convert roles to array format for feature flag checks
  const mainRole = roles.get() as Role
  const userRoles: Role[] = roles.isTester ? [mainRole, "TESTER"] : [mainRole]

  const { data: feature } = useQuery({
    queryKey: ["feature-flag", featureId],
    queryFn: () => getFeatureFlag(featureId),
  })

  if (!feature) {
    return {
      isVisible: false,
      isEnabled: false,
      state: "disabled",
    }
  }

  const config = FEATURE_STATE_CONFIG[feature.state]
  const isNew = feature.state === "new" && isFeatureNew(feature.createdAt)

  return {
    isVisible: config.isVisible(userRoles, userId),
    isEnabled: config.isEnabled(userRoles, userId),
    state: feature.state,
    badge:
      isNew || config.badge
        ? {
            text: isNew ? "New" : config.badge?.text ?? "",
            className: isNew
              ? "bg-green-100 text-green-800"
              : config.badge?.className ?? "",
          }
        : undefined,
  }
}
