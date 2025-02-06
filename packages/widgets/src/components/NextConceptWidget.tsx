import React from 'react'
import { Card } from '@repo/ui' 
import { Button } from '@repo/ui'
import { PlayCircle } from 'lucide-react'
import Link from 'next/link'

interface NextConceptWidgetProps {
  nextConcept: {
    title: string
    href: string
  } | null
}

export function NextConceptWidget({ nextConcept }: NextConceptWidgetProps) {
  if (!nextConcept) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Next Up</h3>
          <p className="text-sm text-muted-foreground">{nextConcept.title}</p>
        </div>
        <Link href={nextConcept.href}>
          <Button size="icon" variant="ghost">
            <PlayCircle className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
