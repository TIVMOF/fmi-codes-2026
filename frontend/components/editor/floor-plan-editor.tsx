'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { Point, EditorState } from '@/types/simulation';

interface FloorPlanEditorProps {
	state: EditorState;
	onCanvasClick: (point: Point) => void;
}

export function FloorPlanEditor({ state, onCanvasClick }: FloorPlanEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
	const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
	const backgroundImageRef = useRef<HTMLImageElement | null>(null);

	const { gridWidth, gridHeight, backgroundImage, backgroundOpacity, walls, tables, doors, exits, panicPins, selectedTool, currentWallStart, currentDoorStart, currentTableCorners } = state;

	// Calculate dot spacing based on canvas and grid size
	const dotSpacingX = canvasSize.width / (gridWidth + 1);
	const dotSpacingY = canvasSize.height / (gridHeight + 1);

	// Convert grid coordinates to canvas coordinates
	const gridToCanvas = useCallback(
		(point: Point): { x: number; y: number } => {
			return {
				x: (point.x + 1) * dotSpacingX,
				y: (point.y + 1) * dotSpacingY,
			};
		},
		[dotSpacingX, dotSpacingY],
	);

	// Convert canvas coordinates to nearest grid point
	const canvasToGrid = useCallback(
		(canvasX: number, canvasY: number): Point => {
			const gridX = Math.round(canvasX / dotSpacingX) - 1;
			const gridY = Math.round(canvasY / dotSpacingY) - 1;
			return {
				x: Math.max(0, Math.min(gridWidth - 1, gridX)),
				y: Math.max(0, Math.min(gridHeight - 1, gridY)),
			};
		},
		[dotSpacingX, dotSpacingY, gridWidth, gridHeight],
	);

	// Load background image
	useEffect(() => {
		if (backgroundImage) {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = backgroundImage;
			img.onload = () => {
				backgroundImageRef.current = img;
			};
		} else {
			backgroundImageRef.current = null;
		}
	}, [backgroundImage]);

	// Resize canvas to fit container
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			setCanvasSize({ width, height: Math.min(height, width * 0.75) });
		});

		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	}, []);

	// Draw canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Clear canvas
		ctx.fillStyle = '#0f0f1a';
		ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

		// Draw background image if exists
		if (backgroundImageRef.current) {
			ctx.globalAlpha = backgroundOpacity;
			ctx.drawImage(backgroundImageRef.current, 0, 0, canvasSize.width, canvasSize.height);
			ctx.globalAlpha = 1;
		}

		// Draw grid dots with high contrast so they remain visible over schematic images
		for (let x = 0; x < gridWidth; x++) {
			for (let y = 0; y < gridHeight; y++) {
				const canvasPos = gridToCanvas({ x, y });
				// Outer glow ring
				ctx.beginPath();
				ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
				ctx.arc(canvasPos.x, canvasPos.y, 4.5, 0, Math.PI * 2);
				ctx.fill();
				// Core dot
				ctx.beginPath();
				ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
				ctx.arc(canvasPos.x, canvasPos.y, 2.2, 0, Math.PI * 2);
				ctx.fill();
				// Dark outline for readability on light areas
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
				ctx.lineWidth = 1;
				ctx.arc(canvasPos.x, canvasPos.y, 2.2, 0, Math.PI * 2);
				ctx.stroke();
			}
		}

		// Draw walls (red)
		ctx.strokeStyle = '#ef4444';
		ctx.lineWidth = 4;
		ctx.lineCap = 'round';
		walls.forEach((wall) => {
			const start = gridToCanvas(wall.start);
			const end = gridToCanvas(wall.end);
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
		});
		ctx.fillStyle = '#ef4444';
		walls.forEach((wall) => {
			const start = gridToCanvas(wall.start);
			const end = gridToCanvas(wall.end);
			ctx.beginPath();
			ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
			ctx.fill();
		});

		// Draw existing doors (amber)
		ctx.strokeStyle = '#f59e0b';
		ctx.lineWidth = 4;
		ctx.lineCap = 'round';
		ctx.setLineDash([8, 4]);
		doors.forEach((door) => {
			const start = gridToCanvas(door.start);
			const end = gridToCanvas(door.end);
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
		});
		ctx.setLineDash([]);
		ctx.fillStyle = '#f59e0b';
		doors.forEach((door) => {
			const start = gridToCanvas(door.start);
			const end = gridToCanvas(door.end);
			ctx.beginPath();
			ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
			ctx.fill();
		});

		// Draw existing tables (blue)
		ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 2;
		tables.forEach((table) => {
			const ul = gridToCanvas(table.upperLeft);
			const ur = gridToCanvas(table.upperRight);
			const lr = gridToCanvas(table.lowerRight);
			const ll = gridToCanvas(table.lowerLeft);
			ctx.beginPath();
			ctx.moveTo(ul.x, ul.y);
			ctx.lineTo(ur.x, ur.y);
			ctx.lineTo(lr.x, lr.y);
			ctx.lineTo(ll.x, ll.y);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		});
		ctx.fillStyle = '#3b82f6';
		tables.forEach((table) => {
			const corners = [table.upperLeft, table.upperRight, table.lowerRight, table.lowerLeft];
			corners.forEach((corner) => {
				const pos = gridToCanvas(corner);
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
				ctx.fill();
			});
		});

		// Draw exits (emerald/green)
		exits.forEach((exit) => {
			const pos = gridToCanvas(exit.position);
			// Outer glow
			ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
			ctx.fill();
			// Inner circle
			ctx.fillStyle = '#10b981';
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
			ctx.fill();
			// Exit label
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 9px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('EXIT', pos.x, pos.y);
		});

		// Draw panic pins (orange/warning)
		panicPins.forEach((pin) => {
			const pos = gridToCanvas(pin.position);
			// Triangle shape
			ctx.fillStyle = '#f97316';
			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y - 12);
			ctx.lineTo(pos.x - 10, pos.y + 8);
			ctx.lineTo(pos.x + 10, pos.y + 8);
			ctx.closePath();
			ctx.fill();
			// Exclamation mark
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 10px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('!', pos.x, pos.y);
		});

		// Draw current wall start point
		if (currentWallStart && selectedTool === 'wall') {
			const start = gridToCanvas(currentWallStart);
			ctx.fillStyle = '#fbbf24';
			ctx.beginPath();
			ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
			ctx.fill();
			if (hoveredPoint) {
				const hovered = gridToCanvas(hoveredPoint);
				ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
				ctx.lineWidth = 3;
				ctx.setLineDash([5, 5]);
				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(hovered.x, hovered.y);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}

		// Draw current door start point
		if (currentDoorStart && selectedTool === 'door') {
			const start = gridToCanvas(currentDoorStart);
			ctx.fillStyle = '#fbbf24';
			ctx.beginPath();
			ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
			ctx.fill();
			if (hoveredPoint) {
				const hovered = gridToCanvas(hoveredPoint);
				ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
				ctx.lineWidth = 3;
				ctx.setLineDash([5, 5]);
				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(hovered.x, hovered.y);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}

		// Draw current table corners
		if (currentTableCorners.length > 0 && selectedTool === 'table') {
			ctx.fillStyle = '#fbbf24';
			currentTableCorners.forEach((corner, index) => {
				const pos = gridToCanvas(corner);
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = '#0f0f1a';
				ctx.font = 'bold 10px sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(String(index + 1), pos.x, pos.y);
				ctx.fillStyle = '#fbbf24';
			});
			if (currentTableCorners.length > 1) {
				ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
				ctx.lineWidth = 2;
				ctx.setLineDash([5, 5]);
				ctx.beginPath();
				const first = gridToCanvas(currentTableCorners[0]);
				ctx.moveTo(first.x, first.y);
				for (let i = 1; i < currentTableCorners.length; i++) {
					const pos = gridToCanvas(currentTableCorners[i]);
					ctx.lineTo(pos.x, pos.y);
				}
				if (hoveredPoint) {
					const hovered = gridToCanvas(hoveredPoint);
					ctx.lineTo(hovered.x, hovered.y);
				}
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}

		// Draw hovered point
		if (hoveredPoint) {
			const hovered = gridToCanvas(hoveredPoint);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
			ctx.beginPath();
			ctx.arc(hovered.x, hovered.y, 6, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			ctx.font = '12px monospace';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			ctx.fillText(`(${hoveredPoint.x}, ${hoveredPoint.y})`, hovered.x + 10, hovered.y - 5);
		}
	}, [canvasSize, gridWidth, gridHeight, backgroundOpacity, walls, tables, doors, exits, panicPins, selectedTool, currentWallStart, currentDoorStart, currentTableCorners, hoveredPoint, gridToCanvas]);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const point = canvasToGrid(x, y);
			setHoveredPoint(point);
		},
		[canvasToGrid],
	);

	const handleMouseLeave = useCallback(() => {
		setHoveredPoint(null);
	}, []);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const point = canvasToGrid(x, y);
			onCanvasClick(point);
		},
		[canvasToGrid, onCanvasClick],
	);

	const getCursor = () => {
		switch (selectedTool) {
			case 'wall':
			case 'table':
			case 'door':
			case 'exit':
			case 'panic':
				return 'crosshair';
			case 'eraser':
				return 'pointer';
			default:
				return 'default';
		}
	};

	const getToolHint = () => {
		switch (selectedTool) {
			case 'wall':
				return currentWallStart ? 'Click to set wall end point' : 'Click to set wall start point';
			case 'door':
				return currentDoorStart ? 'Click to set door end point' : 'Click to set door start point';
			case 'table':
				return `Click to set corner ${currentTableCorners.length + 1}/4 (${['Upper-Left', 'Upper-Right', 'Lower-Right', 'Lower-Left'][currentTableCorners.length]})`;
			case 'exit':
				return 'Click to place an emergency exit';
			case 'panic':
				return 'Click to place a panic/hazard marker';
			case 'eraser':
				return 'Click on an element to remove it';
			case 'select':
				return 'Select tool active';
			default:
				return '';
		}
	};

	return (
		<div ref={containerRef} className='relative h-full w-full overflow-hidden rounded-lg border border-border bg-card'>
			<canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className='block' style={{ cursor: getCursor() }} onClick={handleClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
			<div className='absolute bottom-4 left-4 rounded-md bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm'>{getToolHint()}</div>
		</div>
	);
}
