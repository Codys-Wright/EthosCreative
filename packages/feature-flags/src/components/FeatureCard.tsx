"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import { FeatureEnabled } from "./FeatureEnabled"
import { MOCK_FEATURES } from "../lib/mockFeatures"
import { Button } from "@repo/ui/components/button"

interface FeatureCardProps {
  featureId: string
}

export function FeatureCard({ featureId }: FeatureCardProps) {
  const feature = MOCK_FEATURES[featureId]
  if (!feature) return null

  return (
    <FeatureEnabled featureId={featureId}>
      {({ isEnabled, isVisible }) =>
        isVisible ? (
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-lg">{feature.name}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={isEnabled ? "default" : "secondary"}
                disabled={!isEnabled}
                className="w-full"
              >
                {isEnabled ? "Open Feature" : "Not Available"}
              </Button>
            </CardContent>
          </Card>
        ) : null
      }
    </FeatureEnabled>
  )
}
