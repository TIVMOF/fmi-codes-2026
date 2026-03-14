'use client';

import { useRef } from 'react';
import NextImage from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GridSettings } from './grid-settings';
import { Upload, Image as ImageIcon, Users, X, Minus, DoorOpen, Square, LogOut, AlertTriangle } from 'lucide-react';
import type { EditorState } from '@/types/simulation';

interface EditorSidebarProps {
	state: EditorState;
	onGridSizeChange: (dimX: number, dimY: number) => void;
	onResolutionChange: (resolution: number) => void;
	onBackgroundImageChange: (url: string | null) => void;
	onBackgroundOpacityChange: (opacity: number) => void;
	onPeopleChange: (count: number) => void;
	onImageUpload?: (file: File) => void;
}

export function EditorSidebar({ state, onGridSizeChange, onResolutionChange, onBackgroundImageChange, onBackgroundOpacityChange, onPeopleChange, onImageUpload }: EditorSidebarProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onImageUpload) {
			onImageUpload(file);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className='flex h-full w-80 flex-col gap-4 overflow-y-auto border-l border-border bg-card p-4'>
			<h2 className='text-lg font-semibold text-foreground'>Settings</h2>

			{/* Background Image */}
			<Card className='border-border bg-secondary/30'>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-sm font-medium text-foreground'>
						<ImageIcon className='h-4 w-4' />
						Background Schematic
					</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-col gap-3'>
					<input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileChange} className='hidden' />

					{state.backgroundImage ? (
						<div className='relative'>
							<NextImage src={state.backgroundImage} alt='Background schematic' width={512} height={256} unoptimized className='h-32 w-full rounded-md border border-border object-cover' />
							<Button variant='destructive' size='icon' className='absolute right-2 top-2 h-6 w-6' onClick={() => onBackgroundImageChange(null)}>
								<X className='h-3 w-3' />
							</Button>
						</div>
					) : (
						<Button variant='outline' className='h-32 w-full border-dashed' onClick={() => fileInputRef.current?.click()}>
							<div className='flex flex-col items-center gap-2'>
								<Upload className='h-8 w-8 text-muted-foreground' />
								<span className='text-sm text-muted-foreground'>Select floor plan image</span>
							</div>
						</Button>
					)}

					{state.backgroundImage && (
						<div className='flex flex-col gap-2'>
							<Label className='text-xs text-muted-foreground'>Opacity: {Math.round(state.backgroundOpacity * 100)}%</Label>
							<Slider min={0.1} max={1} step={0.05} value={[state.backgroundOpacity]} onValueChange={([value]) => onBackgroundOpacityChange(value)} />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Grid Settings */}
			<GridSettings dimX={state.dimX} dimY={state.dimY} resolution={state.resolution} gridWidth={state.gridWidth} gridHeight={state.gridHeight} onDimensionsChange={onGridSizeChange} onResolutionChange={onResolutionChange} />

			{/* People Count */}
			<Card className='border-border bg-secondary/30'>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-sm font-medium text-foreground'>
						<Users className='h-4 w-4' />
						People in Simulation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-3'>
						<Input type='number' min={1} max={1000} value={state.people} onChange={(e) => onPeopleChange(Number(e.target.value))} className='bg-input' />
						<span className='text-sm text-muted-foreground'>people</span>
					</div>
				</CardContent>
			</Card>

			{/* Statistics */}
			<Card className='border-border bg-secondary/30'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-sm font-medium text-foreground'>Current Layout</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col gap-2 text-sm'>
						<div className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-muted-foreground'>
								<Minus className='h-3 w-3 text-red-500' />
								Walls
							</span>
							<span className='font-medium text-foreground'>{state.walls.length}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-muted-foreground'>
								<DoorOpen className='h-3 w-3 text-amber-500' />
								Doors
							</span>
							<span className='font-medium text-foreground'>{state.doors.length}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-muted-foreground'>
								<Square className='h-3 w-3 text-blue-500' />
								Tables
							</span>
							<span className='font-medium text-foreground'>{state.tables.length}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-muted-foreground'>
								<LogOut className='h-3 w-3 text-emerald-500' />
								Exits
							</span>
							<span className='font-medium text-foreground'>{state.exits.length}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='flex items-center gap-2 text-muted-foreground'>
								<AlertTriangle className='h-3 w-3 text-orange-500' />
								Panic Pins
							</span>
							<span className='font-medium text-foreground'>{state.panicPins.length}</span>
						</div>
						<div className='mt-2 border-t border-border pt-2'>
							<div className='mb-2 flex justify-between'>
								<span className='text-muted-foreground'>Dimensions</span>
								<span className='font-medium text-foreground'>
									{state.dimX}m x {state.dimY}m
								</span>
							</div>
							<div className='mb-2 flex justify-between'>
								<span className='text-muted-foreground'>Resolution</span>
								<span className='font-medium text-foreground'>{state.resolution}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Grid Size</span>
								<span className='font-medium text-foreground'>
									{state.gridWidth}x{state.gridHeight}
								</span>
							</div>
							<div className='mt-2 flex justify-between'>
								<span className='text-muted-foreground'>Scale</span>
								<span className='font-medium text-foreground'>
									{(state.dimX / state.gridWidth).toFixed(4)} x {(state.dimY / state.gridHeight).toFixed(4)} m/dot
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
