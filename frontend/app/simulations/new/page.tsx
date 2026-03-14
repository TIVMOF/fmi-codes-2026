'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useEditor } from '@/hooks/use-editor';
import { FloorPlanEditor } from '@/components/editor/floor-plan-editor';
import { Toolbar } from '@/components/editor/toolbar';
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';

export default function NewSimulationPage() {
	const router = useRouter();
	const editor = useEditor();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showNameDialog, setShowNameDialog] = useState(false);
	const [simulationName, setSimulationName] = useState('');
	const [error, setError] = useState('');
	const overlayObjectUrlRef = useRef<string | null>(null);
	const overCapacityRef = useRef(false);

	useEffect(() => {
		const sqm = editor.state.dimX * editor.state.dimY;
		const isOver = editor.state.people > 4 * sqm;
		if (isOver && !overCapacityRef.current) {
			toast.warning('High occupancy density', {
				description: `${editor.state.people} people exceeds 4× the floor area (${sqm.toFixed(1)} m²). Consider reducing the headcount.`,
				duration: 6000,
			});
		}
		overCapacityRef.current = isOver;
	}, [editor.state.people, editor.state.dimX, editor.state.dimY]);

	const handleImageUpload = (file: File) => {
		if (!file.type.startsWith('image/')) {
			setError('Please select an image file');
			return;
		}

		if (overlayObjectUrlRef.current) {
			URL.revokeObjectURL(overlayObjectUrlRef.current);
		}

		const objectUrl = URL.createObjectURL(file);
		overlayObjectUrlRef.current = objectUrl;
		editor.setBackgroundImage(objectUrl);
		setError('');
		toast.success('Floor plan image loaded');
	};

	const handleBackgroundImageChange = (url: string | null) => {
		if (!url && overlayObjectUrlRef.current) {
			URL.revokeObjectURL(overlayObjectUrlRef.current);
			overlayObjectUrlRef.current = null;
		}

		editor.setBackgroundImage(url);
	};

	useEffect(() => {
		return () => {
			if (overlayObjectUrlRef.current) {
				URL.revokeObjectURL(overlayObjectUrlRef.current);
			}
		};
	}, []);

	const handleSimulate = () => {
		const { walls, people, dimX, dimY } = editor.state;

		if (walls.length === 0) {
			const msg = 'Please add at least one wall to the layout';
			setError(msg);
			toast.error(msg);
			return;
		}

		if (people <= 0) {
			const msg = 'Please set the number of people (must be greater than 0)';
			setError(msg);
			toast.error(msg);
			return;
		}

		if (dimX <= 0 || dimY <= 0) {
			const msg = 'Please enter valid dimensions in meters';
			setError(msg);
			toast.error(msg);
			return;
		}

		setError('');
		setShowNameDialog(true);
	};

	const handleSubmitSimulation = async () => {
		if (!simulationName.trim()) {
			return;
		}

		setIsSubmitting(true);
		setError('');

		try {
			const simulationData = editor.getSimulationData();

			const response = await fetch('/api/simulations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: simulationName.trim(),
					data: simulationData,
					gridWidth: editor.state.gridWidth,
					gridHeight: editor.state.gridHeight,
					schematicUrl: null,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to create simulation');
			}

			const data = await response.json();
			toast.success('Simulation created!', { description: `"${simulationName.trim()}" is being processed.` });
			router.push(`/simulations/${data.simulation.id}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to create simulation';
			setError(msg);
			toast.error('Failed to create simulation', { description: msg });
			setShowNameDialog(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex h-full min-h-0 flex-col overflow-hidden'>
			{/* Header */}
			<div className='flex items-center justify-between border-b border-border bg-card px-4 py-3'>
				<div className='flex items-center gap-4'>
					<Button asChild variant='ghost' size='sm'>
						<Link href='/simulations'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back
						</Link>
					</Button>
					<div>
						<h1 className='text-lg font-semibold text-foreground'>New Simulation</h1>
						<p className='text-sm text-muted-foreground'>Design your floor plan layout</p>
					</div>
				</div>
				<div className='flex items-center gap-3'>
					{error && <p className='text-sm text-destructive'>{error}</p>}
					<Button onClick={handleSimulate} disabled={isSubmitting}>
						<Play className='mr-2 h-4 w-4' />
						Run Simulation
					</Button>
				</div>
			</div>

			{/* Editor Area */}
			<div className='flex flex-1 overflow-hidden'>
				{/* Left Toolbar */}
				<div className='flex items-start border-r border-border bg-card p-2'>
					<Toolbar selectedTool={editor.state.selectedTool} onToolChange={editor.setTool} onClearAll={editor.clearAll} />
				</div>

				{/* Canvas Area */}
				<div className='flex-1 p-4'>
					<FloorPlanEditor state={editor.state} onCanvasClick={editor.handleCanvasClick} />
				</div>

				{/* Right Sidebar */}
				<EditorSidebar
					state={editor.state}
					onGridSizeChange={editor.setDimensions}
					onResolutionChange={editor.setResolution}
					onBackgroundImageChange={handleBackgroundImageChange}
					onBackgroundOpacityChange={editor.setBackgroundOpacity}
					onPeopleChange={editor.setPeople}
					onImageUpload={handleImageUpload}
				/>
			</div>

			{/* Name Dialog */}
			<Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Name Your Simulation</DialogTitle>
						<DialogDescription>Give your simulation a descriptive name to help identify it later.</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<Label htmlFor='simulation-name' className='text-foreground'>
							Simulation Name
						</Label>
						<Input id='simulation-name' value={simulationName} onChange={(e) => setSimulationName(e.target.value)} placeholder='e.g., Office Building Floor 1' className='mt-2 bg-input' autoFocus />
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setShowNameDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmitSimulation} disabled={!simulationName.trim() || isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Creating...
								</>
							) : (
								'Start Simulation'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
