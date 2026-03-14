'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { SimulationCard } from '@/components/dashboard/simulation-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ArrowRight, LayoutGrid } from 'lucide-react'
import type { Simulation } from '@/types/simulation'

export default function DashboardPage() {
  const { user } = useAuth()
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSimulations() {
      try {
        const response = await fetch('/api/simulations')
        if (response.ok) {
          const data = await response.json()
          setSimulations(data.simulations || [])
        }
      } catch (error) {
        console.error('Failed to fetch simulations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSimulations()
  }, [])

  const recentSimulations = simulations.slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your emergency evacuation simulations
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <StatsOverview simulations={simulations} />

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Simulations</h2>
              {simulations.length > 4 && (
                <Button asChild variant="ghost" className="text-primary">
                  <Link href="/simulations">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {simulations.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No simulations yet</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Create your first emergency evacuation simulation to get started
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/simulations/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Simulation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentSimulations.map((simulation) => (
                  <SimulationCard key={simulation.id} simulation={simulation} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
