export interface Point {
	x: number;
	y: number;
}

export interface Wall {
	start: Point;
	end: Point;
}

export interface Table {
	upperLeft: Point;
	upperRight: Point;
	lowerRight: Point;
	lowerLeft: Point;
}

export interface Door {
	start: Point;
	end: Point;
}

export interface Exit {
	position: Point;
}

export interface PanicPin {
	position: Point;
}

export type SerializedPoint3D = [number, number, number];

export interface SerializedWall {
	start: SerializedPoint3D;
	end: SerializedPoint3D;
}

export interface SerializedTable {
	upperLeft: SerializedPoint3D;
	upperRight: SerializedPoint3D;
	lowerRight: SerializedPoint3D;
	lowerLeft: SerializedPoint3D;
}

export interface SerializedDoor {
	start: SerializedPoint3D;
	end: SerializedPoint3D;
}

export interface SerializedExit {
	position: SerializedPoint3D;
}

export interface SerializedPanicPin {
	position: SerializedPoint3D;
}

export interface SimulationScale {
	x: number;
	y: number;
}

export interface SimulationData {
	walls: SerializedWall[];
	tables: SerializedTable[];
	doors: SerializedDoor[];
	exits: SerializedExit[];
	panicPins: SerializedPanicPin[];
	people: number;
	dimX: number;
	dimY: number;
	resolution: number;
	scale: SimulationScale;
}

export interface Simulation {
	id: string;
	name: string;
	description?: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	data: SimulationData;
	schematicUrl?: string;
	videoUrl?: string;
	gridWidth: number;
	gridHeight: number;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: number;
	username: string;
	email: string;
}

export type EditorTool = 'select' | 'wall' | 'table' | 'door' | 'exit' | 'panic' | 'eraser';

export interface EditorState {
	walls: Wall[];
	tables: Table[];
	doors: Door[];
	exits: Exit[];
	panicPins: PanicPin[];
	people: number;
	dimX: number;
	dimY: number;
	resolution: number;
	gridWidth: number;
	gridHeight: number;
	backgroundImage: string | null;
	backgroundOpacity: number;
	selectedTool: EditorTool;
	currentWallStart: Point | null;
	currentDoorStart: Point | null;
	currentTableCorners: Point[];
}
