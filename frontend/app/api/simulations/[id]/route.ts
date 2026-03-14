import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';
import { djangoFetch } from '@/lib/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const token = await getAuthToken();
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const response = await djangoFetch(
			`/simulations/${id}/`,
			{
				method: 'GET',
			},
			token,
		);

		if (!response.ok) {
			return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
		}

		const data = await response.json();
		const simulation = data.simulation;

		return NextResponse.json({
			simulation: {
				id: String(simulation.id),
				name: simulation.name ?? `Simulation ${simulation.id}`,
				description: simulation.description ?? undefined,
				status: simulation.status,
				data: simulation.data,
				schematicUrl: simulation.schematic_url ?? undefined,
				videoUrl: simulation.video_url ?? simulation.videos?.[0]?.url,
				gridWidth: simulation.grid_width ?? 0,
				gridHeight: simulation.grid_height ?? 0,
				createdAt: simulation.created_at,
				updatedAt: simulation.updated_at ?? simulation.created_at,
			},
		});
	} catch (error) {
		console.error('Error fetching simulation:', error);
		return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const token = await getAuthToken();
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		const response = await djangoFetch(
			`/simulations/${id}/delete/`,
			{
				method: 'DELETE',
			},
			token,
		);

		if (!response.ok) {
			return NextResponse.json({ error: 'Failed to delete simulation' }, { status: response.status });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting simulation:', error);
		return NextResponse.json({ error: 'Failed to delete simulation' }, { status: 500 });
	}
}
