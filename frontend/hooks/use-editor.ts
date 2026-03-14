'use client';

import { useState, useCallback } from 'react';
import type { Wall, Table, Door, Exit, PanicPin, Point, EditorTool, EditorState } from '@/types/simulation';

const DEFAULT_DIM_X = 10;
const DEFAULT_DIM_Y = 10;
const DEFAULT_RESOLUTION = 50;

function clampDimension(value: number) {
	if (!Number.isFinite(value)) {
		return 0.1;
	}

	return Math.max(0.1, Number(value));
}

function clampResolution(value: number) {
	if (!Number.isFinite(value)) {
		return DEFAULT_RESOLUTION;
	}

	return Math.max(10, Math.min(100, Math.round(value)));
}

function calculateGridSize(dimX: number, dimY: number, resolution: number) {
	const safeDimX = clampDimension(dimX);
	const safeDimY = clampDimension(dimY);
	const safeResolution = clampResolution(resolution);
	const longestSide = Math.max(safeDimX, safeDimY);
	const metersPerDot = longestSide / safeResolution;

	return {
		gridWidth: Math.max(10, Math.min(100, Math.round(safeDimX / metersPerDot))),
		gridHeight: Math.max(10, Math.min(100, Math.round(safeDimY / metersPerDot))),
		dimX: safeDimX,
		dimY: safeDimY,
		resolution: safeResolution,
	};
}

const initialGrid = calculateGridSize(DEFAULT_DIM_X, DEFAULT_DIM_Y, DEFAULT_RESOLUTION);

const initialState: EditorState = {
	walls: [],
	tables: [],
	doors: [],
	exits: [],
	panicPins: [],
	people: 10,
	dimX: initialGrid.dimX,
	dimY: initialGrid.dimY,
	resolution: initialGrid.resolution,
	gridWidth: initialGrid.gridWidth,
	gridHeight: initialGrid.gridHeight,
	backgroundImage: null,
	backgroundOpacity: 0.3,
	selectedTool: 'wall',
	currentWallStart: null,
	currentDoorStart: null,
	currentTableCorners: [],
};

export function useEditor() {
	const [state, setState] = useState<EditorState>(initialState);

	const setTool = useCallback((tool: EditorTool) => {
		setState((prev) => ({
			...prev,
			selectedTool: tool,
			currentWallStart: null,
			currentDoorStart: null,
			currentTableCorners: [],
		}));
	}, []);

	const setDimensions = useCallback((dimX: number, dimY: number) => {
		setState((prev) => {
			const nextGrid = calculateGridSize(dimX, dimY, prev.resolution);
			return {
				...prev,
				dimX: nextGrid.dimX,
				dimY: nextGrid.dimY,
				gridWidth: nextGrid.gridWidth,
				gridHeight: nextGrid.gridHeight,
			};
		});
	}, []);

	const setResolution = useCallback((resolution: number) => {
		setState((prev) => ({
			...prev,
			...calculateGridSize(prev.dimX, prev.dimY, resolution),
		}));
	}, []);

	const setBackgroundImage = useCallback((url: string | null) => {
		setState((prev) => ({ ...prev, backgroundImage: url }));
	}, []);

	const setBackgroundOpacity = useCallback((opacity: number) => {
		setState((prev) => ({ ...prev, backgroundOpacity: opacity }));
	}, []);

	const setPeople = useCallback((count: number) => {
		setState((prev) => ({ ...prev, people: Math.max(0, count) }));
	}, []);

	const handleCanvasClick = useCallback((point: Point) => {
		setState((prev) => {
			const { selectedTool, currentWallStart, currentDoorStart, currentTableCorners, walls, tables, doors, exits, panicPins } = prev;

			if (selectedTool === 'eraser') {
				// Find and remove element that contains this point
				const wallIndex = walls.findIndex((wall) => isPointOnLine(point, wall.start, wall.end));
				if (wallIndex !== -1) {
					return { ...prev, walls: walls.filter((_, i) => i !== wallIndex) };
				}

				const doorIndex = doors.findIndex((door) => isPointOnLine(point, door.start, door.end));
				if (doorIndex !== -1) {
					return { ...prev, doors: doors.filter((_, i) => i !== doorIndex) };
				}

				const tableIndex = tables.findIndex((table) => isPointInTable(point, table));
				if (tableIndex !== -1) {
					return { ...prev, tables: tables.filter((_, i) => i !== tableIndex) };
				}

				const exitIndex = exits.findIndex((exit) => isPointNear(point, exit.position));
				if (exitIndex !== -1) {
					return { ...prev, exits: exits.filter((_, i) => i !== exitIndex) };
				}

				const panicIndex = panicPins.findIndex((pin) => isPointNear(point, pin.position));
				if (panicIndex !== -1) {
					return { ...prev, panicPins: panicPins.filter((_, i) => i !== panicIndex) };
				}

				return prev;
			}

			if (selectedTool === 'wall') {
				if (!currentWallStart) {
					return { ...prev, currentWallStart: point };
				} else {
					const newWall: Wall = { start: currentWallStart, end: point };
					return { ...prev, walls: [...walls, newWall], currentWallStart: null };
				}
			}

			if (selectedTool === 'door') {
				if (!currentDoorStart) {
					return { ...prev, currentDoorStart: point };
				} else {
					const newDoor: Door = { start: currentDoorStart, end: point };
					return { ...prev, doors: [...doors, newDoor], currentDoorStart: null };
				}
			}

			if (selectedTool === 'exit') {
				const newExit: Exit = { position: point };
				return { ...prev, exits: [...exits, newExit] };
			}

			if (selectedTool === 'panic') {
				const newPanic: PanicPin = { position: point };
				return { ...prev, panicPins: [...panicPins, newPanic] };
			}

			if (selectedTool === 'table') {
				const newCorners = [...currentTableCorners, point];

				if (newCorners.length < 4) {
					return { ...prev, currentTableCorners: newCorners };
				} else {
					const newTable: Table = {
						upperLeft: newCorners[0],
						upperRight: newCorners[1],
						lowerRight: newCorners[2],
						lowerLeft: newCorners[3],
					};
					return { ...prev, tables: [...tables, newTable], currentTableCorners: [] };
				}
			}

			return prev;
		});
	}, []);

	const clearAll = useCallback(() => {
		setState((prev) => ({
			...prev,
			walls: [],
			tables: [],
			doors: [],
			exits: [],
			panicPins: [],
			currentWallStart: null,
			currentDoorStart: null,
			currentTableCorners: [],
		}));
	}, []);

	const reset = useCallback(() => {
		setState(initialState);
	}, []);

	const getSimulationData = useCallback(() => {
		const pt = (p: Point): [number, number, number] => [p.x, p.y, 0];
		const scale = {
			x: Number((state.dimX / state.gridWidth).toFixed(4)),
			y: Number((state.dimY / state.gridHeight).toFixed(4)),
		};
		return {
			walls: state.walls.map((w) => ({ start: pt(w.start), end: pt(w.end) })),
			tables: state.tables.map((t) => ({
				upperLeft: pt(t.upperLeft),
				upperRight: pt(t.upperRight),
				lowerRight: pt(t.lowerRight),
				lowerLeft: pt(t.lowerLeft),
			})),
			doors: state.doors.map((d) => ({ start: pt(d.start), end: pt(d.end) })),
			exits: state.exits.map((e) => ({ position: pt(e.position) })),
			panicPins: state.panicPins.map((p) => ({ position: pt(p.position) })),
			people: state.people,
			dimX: state.dimX,
			dimY: state.dimY,
			resolution: state.resolution,
			scale,
		};
	}, [state.walls, state.tables, state.doors, state.exits, state.panicPins, state.people, state.dimX, state.dimY, state.resolution, state.gridWidth, state.gridHeight]);

	return {
		state,
		setTool,
		setDimensions,
		setResolution,
		setBackgroundImage,
		setBackgroundOpacity,
		setPeople,
		handleCanvasClick,
		clearAll,
		reset,
		getSimulationData,
	};
}

// Helper functions
function isPointOnLine(point: Point, start: Point, end: Point, tolerance: number = 2): boolean {
	const minX = Math.min(start.x, end.x) - tolerance;
	const maxX = Math.max(start.x, end.x) + tolerance;
	const minY = Math.min(start.y, end.y) - tolerance;
	const maxY = Math.max(start.y, end.y) + tolerance;

	if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
		return false;
	}

	const A = point.x - start.x;
	const B = point.y - start.y;
	const C = end.x - start.x;
	const D = end.y - start.y;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;
	const param = lenSq !== 0 ? dot / lenSq : -1;

	let xx, yy;
	if (param < 0) {
		xx = start.x;
		yy = start.y;
	} else if (param > 1) {
		xx = end.x;
		yy = end.y;
	} else {
		xx = start.x + param * C;
		yy = start.y + param * D;
	}

	const dx = point.x - xx;
	const dy = point.y - yy;
	const distance = Math.sqrt(dx * dx + dy * dy);

	return distance <= tolerance;
}

function isPointInTable(point: Point, table: Table): boolean {
	const minX = Math.min(table.upperLeft.x, table.upperRight.x, table.lowerLeft.x, table.lowerRight.x);
	const maxX = Math.max(table.upperLeft.x, table.upperRight.x, table.lowerLeft.x, table.lowerRight.x);
	const minY = Math.min(table.upperLeft.y, table.upperRight.y, table.lowerLeft.y, table.lowerRight.y);
	const maxY = Math.max(table.upperLeft.y, table.upperRight.y, table.lowerLeft.y, table.lowerRight.y);

	return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

function isPointNear(point: Point, target: Point, tolerance: number = 3): boolean {
	const dx = point.x - target.x;
	const dy = point.y - target.y;
	return Math.sqrt(dx * dx + dy * dy) <= tolerance;
}
