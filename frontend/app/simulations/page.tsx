'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SimulationCard } from '@/components/dashboard/simulation-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import type { Simulation } from '@/types/simulation'

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this simulation?')) return
    
    try {
      const response = await fetch(`/api/simulations/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSimulations(simulations.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete simulation:', error)
    }
  }

  const filteredSimulations = simulations.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Simulations</h1>
          <p className="mt-2 text-muted-foreground">
            All your emergency evacuation simulations
          </p>
        </div>
        <Button asChild>
          <Link href="/simulations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Simulation
          </Link>
        </Button>
      </div>

      {!isLoading && simulations.length > 0 && (
        <div className="mb-6 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input pl-10"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : simulations.length === 0 ? (
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
      ) : filteredSimulations.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No simulations match your search</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSimulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              simulation={simulation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
