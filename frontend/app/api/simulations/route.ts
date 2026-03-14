import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';
import { djangoFetch } from '@/lib/api';
import type { Simulation, SimulationData } from '@/types/simulation';

function toFrontendSimulation(raw: any): Simulation {
	const createdAt = raw.created_at ?? raw.createdAt ?? new Date().toISOString();
	const updatedAt = raw.updated_at ?? raw.updatedAt ?? createdAt;

	return {
		id: String(raw.id),
		name: raw.name ?? `Simulation ${raw.id}`,
		description: raw.description ?? undefined,
		status: raw.status ?? 'processing',
		data: (raw.data ?? {
			walls: [],
			tables: [],
			doors: [],
			exits: [],
			panicPins: [],
			people: 0,
			dimX: 10,
			dimY: 10,
			resolution: 50,
			scale: { x: 0.2, y: 0.2 },
		}) as SimulationData,
		schematicUrl: raw.schematic_url ?? raw.schematicUrl ?? undefined,
		videoUrl: raw.video_url ?? raw.videoUrl ?? raw.videos?.[0]?.url ?? undefined,
		gridWidth: raw.grid_width ?? raw.gridWidth ?? 0,
		gridHeight: raw.grid_height ?? raw.gridHeight ?? 0,
		createdAt,
		updatedAt,
	};
}

export async function GET() {
	try {
		const token = await getAuthToken();
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const response = await djangoFetch('/simulations/', { method: 'GET' }, token);

		if (!response.ok) {
			return NextResponse.json({ simulations: [] });
		}

		const data = await response.json();
		const simulations = (data.simulations ?? []).map(toFrontendSimulation);

		return NextResponse.json({ simulations });
	} catch (error) {
		console.error('Error fetching simulations:', error);
		return NextResponse.json({ simulations: [] });
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = await getAuthToken();
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, data, gridWidth, gridHeight, schematicUrl } = body as {
			name: string;
			data: SimulationData;
			gridWidth: number;
			gridHeight: number;
			schematicUrl?: string | null;
		};

		if (!name || !data) {
			return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
		}

		if (!data.walls || data.walls.length === 0) {
			return NextResponse.json({ error: 'At least one wall is required' }, { status: 400 });
		}

		if (!data.people || data.people <= 0) {
			return NextResponse.json({ error: 'People count must be greater than 0' }, { status: 400 });
		}

		const createResponse = await djangoFetch(
			'/simulations/create/',
			{
				method: 'POST',
				body: JSON.stringify({
					name,
					data,
					gridWidth,
					gridHeight,
					schematicUrl,
				}),
			},
			token,
		);

		const createData = await createResponse.json().catch(() => ({}));

		if (!createResponse.ok || !createData.success) {
			return NextResponse.json({ error: createData.error || 'Failed to create simulation' }, { status: createResponse.status || 500 });
		}

		const detailResponse = await djangoFetch(
			`/simulations/${createData.simulation_id}/`,
			{
				method: 'GET',
			},
			token,
		);

		if (!detailResponse.ok) {
			return NextResponse.json({
				simulation: {
					id: String(createData.simulation_id),
					name,
					status: 'processing',
					data,
					schematicUrl: schematicUrl ?? undefined,
					gridWidth,
					gridHeight,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			});
		}

		const detailData = await detailResponse.json();
		return NextResponse.json({ simulation: toFrontendSimulation(detailData.simulation) });
	} catch (error) {
		console.error('Error creating simulation:', error);
		return NextResponse.json({ error: 'Failed to create simulation' }, { status: 500 });
	}
}
