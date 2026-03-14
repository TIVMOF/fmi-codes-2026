'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/simulation/video-player';
import { SimulationDetails } from '@/components/simulation/simulation-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Loader2, AlertTriangle, Video } from 'lucide-react';
import type { Simulation } from '@/types/simulation';

export default function SimulationViewPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const [simulation, setSimulation] = useState<Simulation | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchSimulation = async () => {
		try {
			const response = await fetch(`/api/simulations/${id}`);
			if (!response.ok) {
				if (response.status === 404) {
					setError('Simulation not found');
				} else {
					setError('Failed to load simulation');
				}
				return;
			}
			const data = await response.json();
			setSimulation(data.simulation);
		} catch {
			setError('Failed to load simulation');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSimulation();
	}, [id]);

	// Poll for status updates if processing
	useEffect(() => {
		if (simulation?.status === 'processing' || simulation?.status === 'pending') {
			const interval = setInterval(fetchSimulation, 5000);
			return () => clearInterval(interval);
		}
	}, [simulation?.status]);

	if (isLoading) {
		return (
			<div className='mx-auto max-w-7xl'>
				<div className='flex items-center justify-center py-24'>
					<div className='flex flex-col items-center gap-4'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
						<p className='text-muted-foreground'>Loading simulation...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !simulation) {
		return (
			<div className='mx-auto max-w-7xl'>
				<div className='mb-6'>
					<Button asChild variant='ghost'>
						<Link href='/simulations'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Simulations
						</Link>
					</Button>
				</div>
				<Card className='border-border bg-card'>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<AlertTriangle className='h-12 w-12 text-destructive' />
						<h2 className='mt-4 text-xl font-semibold text-foreground'>{error || 'Simulation not found'}</h2>
						<p className='mt-2 text-muted-foreground'>The simulation you're looking for doesn't exist or has been deleted.</p>
						<Button asChild className='mt-6'>
							<Link href='/simulations'>View All Simulations</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-7xl'>
			{/* Header */}
			<div className='mb-t flex items-center justify-between'>
				<Button asChild variant='ghost'>
					<Link href='/simulations'>
						<ArrowLeft className='mr-2 h-4 w-4' />
						Back to Simulations
					</Link>
				</Button>
				{(simulation.status === 'processing' || simulation.status === 'pending') && (
					<Button variant='outline' onClick={fetchSimulation}>
						<RefreshCw className='mr-2 h-4 w-4' />
						Refresh Status
					</Button>
				)}
			</div>

			<div className='grid gap-6 lg:grid-cols-2 p-6'>
				{/* Video Section */}
				<div className='flex flex-col gap-4'>
					<h2 className='text-xl font-semibold text-foreground'>Simulation Video</h2>

					{simulation.status === 'completed' && simulation.videoUrl ? (
						<VideoPlayer src={simulation.videoUrl} title={simulation.name} />
					) : simulation.status === 'processing' || simulation.status === 'pending' ? (
						<Card className='border-border bg-card'>
							<CardContent className='flex aspect-video flex-col items-center justify-center'>
								<Loader2 className='h-12 w-12 animate-spin text-primary' />
								<h3 className='mt-4 text-lg font-semibold text-foreground'>{simulation.status === 'processing' ? 'Processing Simulation...' : 'Waiting to Start...'}</h3>
								<p className='mt-2 text-center text-sm text-muted-foreground'>
									{simulation.status === 'processing' ? 'Your simulation is being processed. This may take a few minutes.' : 'Your simulation is queued and will start shortly.'}
								</p>
							</CardContent>
						</Card>
					) : simulation.status === 'failed' ? (
						<Card className='border-destructive/50 bg-card'>
							<CardContent className='flex aspect-video flex-col items-center justify-center'>
								<AlertTriangle className='h-12 w-12 text-destructive' />
								<h3 className='mt-4 text-lg font-semibold text-foreground'>Simulation Failed</h3>
								<p className='mt-2 text-center text-sm text-muted-foreground'>There was an error processing your simulation. Please try creating a new one.</p>
								<Button asChild className='mt-4'>
									<Link href='/simulations/new'>Create New Simulation</Link>
								</Button>
							</CardContent>
						</Card>
					) : (
						<Card className='border-border bg-card'>
							<CardContent className='flex aspect-video flex-col items-center justify-center'>
								<Video className='h-12 w-12 text-muted-foreground' />
								<h3 className='mt-4 text-lg font-semibold text-foreground'>No Video Available</h3>
								<p className='mt-2 text-center text-sm text-muted-foreground'>The simulation video is not available yet.</p>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Details Section */}
				<div>
					<SimulationDetails simulation={simulation} />
				</div>
			</div>
		</div>
	);
}
