'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, AlertTriangle, Loader2, Minus, Square, Users, Grid3X3, DoorOpen, LogOut } from 'lucide-react';
import type { Simulation } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface SimulationDetailsProps {
	simulation: Simulation;
}

export function SimulationDetails({ simulation }: SimulationDetailsProps) {
	const statusConfig = {
		pending: {
			label: 'Pending',
			icon: Clock,
			className: 'bg-muted text-muted-foreground',
		},
		processing: {
			label: 'Processing',
			icon: Loader2,
			className: 'bg-warning/10 text-warning',
		},
		completed: {
			label: 'Completed',
			icon: CheckCircle,
			className: 'bg-success/10 text-success',
		},
		failed: {
			label: 'Failed',
			icon: AlertTriangle,
			className: 'bg-destructive/10 text-destructive',
		},
	};

	const status = statusConfig[simulation.status];
	const StatusIcon = status.icon;

	const formattedDate = new Date(simulation.createdAt).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

	return (
		<Card className='border-border bg-card'>
			<CardHeader>
				<div className='flex items-start justify-between'>
					<CardTitle className='text-xl font-bold text-foreground'>{simulation.name}</CardTitle>
					<Badge className={cn('shrink-0', status.className)}>
						<StatusIcon className={cn('mr-1 h-3 w-3', simulation.status === 'processing' && 'animate-spin')} />
						{status.label}
					</Badge>
				</div>
				{simulation.description && <p className='mt-2 text-muted-foreground'>{simulation.description}</p>}
				<p className='text-sm text-muted-foreground'>{formattedDate}</p>
			</CardHeader>
			<CardContent className='flex flex-col gap-6'>
				<Separator />

				<div>
					<h3 className='mb-4 font-semibold text-foreground'>Simulation Parameters</h3>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						<StatCard icon={<Minus className='h-5 w-5' />} label='Walls' value={simulation.data.walls.length} color='text-red-500' />
						<StatCard icon={<DoorOpen className='h-5 w-5' />} label='Doors' value={simulation.data.doors?.length ?? 0} color='text-amber-500' />
						<StatCard icon={<Square className='h-5 w-5' />} label='Tables' value={simulation.data.tables.length} color='text-blue-500' />
						<StatCard icon={<LogOut className='h-5 w-5' />} label='Exits' value={simulation.data.exits?.length ?? 0} color='text-emerald-500' />
						<StatCard icon={<AlertTriangle className='h-5 w-5' />} label='Panic Pins' value={simulation.data.panicPins?.length ?? 0} color='text-orange-500' />
						<StatCard icon={<Users className='h-5 w-5' />} label='People' value={simulation.data.people} color='text-primary' />
						<StatCard icon={<Grid3X3 className='h-5 w-5' />} label='Grid Size' value={`${simulation.gridWidth}x${simulation.gridHeight}`} color='text-muted-foreground' />
						<StatCard icon={<Grid3X3 className='h-5 w-5' />} label='Dimensions' value={`${simulation.data.dimX}m x ${simulation.data.dimY}m`} color='text-muted-foreground' />
						<StatCard icon={<Grid3X3 className='h-5 w-5' />} label='Scale' value={`${simulation.data.scale.x} x ${simulation.data.scale.y}`} color='text-muted-foreground' />
					</div>
				</div>

				<Separator />

				<div>
					<h3 className='mb-3 font-semibold text-foreground'>Simulation Data (JSON)</h3>
					<div className='max-h-60 overflow-y-auto rounded-md bg-secondary/30 p-3'>
						<pre className='text-xs text-muted-foreground font-mono'>
							{JSON.stringify(
								{
									walls: simulation.data.walls,
									tables: simulation.data.tables,
									doors: simulation.data.doors ?? [],
									exits: simulation.data.exits ?? [],
									panicPins: simulation.data.panicPins ?? [],
									people: simulation.data.people,
									dimX: simulation.data.dimX,
									dimY: simulation.data.dimY,
									resolution: simulation.data.resolution,
									scale: simulation.data.scale,
								},
								null,
								2,
							)}
						</pre>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
	return (
		<div className='flex items-center gap-3 rounded-lg bg-secondary/30 p-4'>
			<div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-background', color)}>{icon}</div>
			<div>
				<p className='text-2xl font-bold text-foreground'>{value}</p>
				<p className='text-sm text-muted-foreground'>{label}</p>
			</div>
		</div>
	);
}
