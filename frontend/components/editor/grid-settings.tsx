'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GridSettingsProps {
	dimX: number;
	dimY: number;
	resolution: number;
	gridWidth: number;
	gridHeight: number;
	onDimensionsChange: (dimX: number, dimY: number) => void;
	onResolutionChange: (resolution: number) => void;
}

export function GridSettings({ dimX, dimY, resolution, gridWidth, gridHeight, onDimensionsChange, onResolutionChange }: GridSettingsProps) {
	const scaleX = (dimX / gridWidth).toFixed(4);
	const scaleY = (dimY / gridHeight).toFixed(4);

	return (
		<Card className='border-border bg-card'>
			<CardHeader className='pb-3'>
				<CardTitle className='text-sm font-medium text-foreground'>Dimensions & Resolution</CardTitle>
			</CardHeader>
			<CardContent className='flex flex-col gap-4'>
				<div className='flex gap-2'>
					<div className='flex-1'>
						<Label htmlFor='dim-x-input' className='text-xs text-muted-foreground'>
							dimX (m)
						</Label>
						<Input id='dim-x-input' type='number' min={0.1} step={0.1} value={dimX} onChange={(e) => onDimensionsChange(Number(e.target.value), dimY)} className='h-8 bg-input text-sm' placeholder='Width in meters' />
					</div>
					<div className='flex-1'>
						<Label htmlFor='dim-y-input' className='text-xs text-muted-foreground'>
							dimY (m)
						</Label>
						<Input id='dim-y-input' type='number' min={0.1} step={0.1} value={dimY} onChange={(e) => onDimensionsChange(dimX, Number(e.target.value))} className='h-8 bg-input text-sm' placeholder='Height in meters' />
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label htmlFor='resolution' className='text-xs text-muted-foreground'>
						Resolution: {resolution}
					</Label>
					<Slider id='resolution' min={10} max={100} step={1} value={[resolution]} onValueChange={([value]) => onResolutionChange(value)} className='w-full' />
					<p className='text-xs text-muted-foreground'>The longer side uses this many dots. The shorter side scales automatically.</p>
				</div>

				<div className='rounded-md border border-border/70 bg-secondary/30 p-3 text-sm'>
					<div className='flex justify-between gap-3'>
						<span className='text-muted-foreground'>Canvas dots</span>
						<span className='font-medium text-foreground'>
							{gridWidth} x {gridHeight}
						</span>
					</div>
					<div className='mt-2 flex justify-between gap-3'>
						<span className='text-muted-foreground'>Scale (m/dot)</span>
						<span className='font-medium text-foreground'>
							{scaleX} x {scaleY}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
