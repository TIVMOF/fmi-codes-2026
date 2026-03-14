'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import type { Simulation } from '@/types/simulation'
import { cn } from '@/lib/utils'

interface SimulationCardProps {
  simulation: Simulation
  onDelete?: (id: string) => void
}

export function SimulationCard({ simulation, onDelete }: SimulationCardProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      variant: 'secondary' as const,
      className: 'bg-muted text-muted-foreground',
    },
    processing: {
      label: 'Processing',
      icon: Loader2,
      variant: 'secondary' as const,
      className: 'bg-warning/10 text-warning',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      variant: 'secondary' as const,
      className: 'bg-success/10 text-success',
    },
    failed: {
      label: 'Failed',
      icon: AlertTriangle,
      variant: 'destructive' as const,
      className: 'bg-destructive/10 text-destructive',
    },
  }

  const status = statusConfig[simulation.status]
  const StatusIcon = status.icon

  const formattedDate = new Date(simulation.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="group border-border bg-card transition-all hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg font-semibold text-foreground">
            {simulation.name}
          </CardTitle>
          <Badge className={cn('shrink-0', status.className)}>
            <StatusIcon className={cn('mr-1 h-3 w-3', simulation.status === 'processing' && 'animate-spin')} />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {simulation.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {simulation.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">{simulation.data.walls.length}</span> walls
          </div>
          <div>
            <span className="font-medium text-foreground">{simulation.data.doors?.length ?? 0}</span> doors
          </div>
          <div>
            <span className="font-medium text-foreground">{simulation.data.tables.length}</span> tables
          </div>
          <div>
            <span className="font-medium text-foreground">{simulation.data.exits?.length ?? 0}</span> exits
          </div>
          <div>
            <span className="font-medium text-foreground">{simulation.data.people}</span> people
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Created {formattedDate}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-border pt-4">
        <Button asChild variant="secondary" className="flex-1">
          <Link href={`/simulations/${simulation.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(simulation.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
