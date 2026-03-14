'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { Simulation } from '@/types/simulation'

interface StatsOverviewProps {
  simulations: Simulation[]
}

export function StatsOverview({ simulations }: StatsOverviewProps) {
  const stats = {
    total: simulations.length,
    completed: simulations.filter((s) => s.status === 'completed').length,
    processing: simulations.filter((s) => s.status === 'processing' || s.status === 'pending').length,
    failed: simulations.filter((s) => s.status === 'failed').length,
  }

  const items = [
    {
      label: 'Total Simulations',
      value: stats.total,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'In Progress',
      value: stats.processing,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.bgColor}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
