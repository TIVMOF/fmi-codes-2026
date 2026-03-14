import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import type { SimulationData, Simulation } from '@/types/simulation';

// Mock mode - set to true when Django backend is not available
const USE_MOCK_BACKEND = true;

// In-memory mock storage (would be replaced by Django backend)
const mockSimulations: Map<string, Simulation> = new Map();

export async function GET() {
	try {
		if (USE_MOCK_BACKEND) {
			// Return mock simulations
			const simulations = Array.from(mockSimulations.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			return NextResponse.json({ simulations });
		}

		// Real backend call
		const djangoUrl = process.env.DJANGO_API_URL;
		if (!djangoUrl) {
			return NextResponse.json({ simulations: [] });
		}

		const response = await fetch(`${djangoUrl}/api/simulations/`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			return NextResponse.json({ simulations: [] });
		}

		const data = await response.json();
		return NextResponse.json({ simulations: data });
	} catch (error) {
		console.error('Error fetching simulations:', error);
		return NextResponse.json({ simulations: [] });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, data, gridWidth, gridHeight, schematicUrl } = body as {
			name: string;
			data: SimulationData;
			gridWidth: number;
			gridHeight: number;
			schematicUrl?: string;
		};

		// Validate input
		if (!name || !data) {
			return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
		}

		if (!data.walls || data.walls.length === 0) {
			return NextResponse.json({ error: 'At least one wall is required' }, { status: 400 });
		}

		if (!data.people || data.people <= 0) {
			return NextResponse.json({ error: 'People count must be greater than 0' }, { status: 400 });
		}

		if (USE_MOCK_BACKEND) {
			// Create mock simulation
			const simulationId = `sim_${Date.now()}`;
			const now = new Date().toISOString();

			const simulation: Simulation = {
				id: simulationId,
				name,
				status: 'processing',
				data,
				schematicUrl,
				gridWidth,
				gridHeight,
				createdAt: now,
				updatedAt: now,
			};

			mockSimulations.set(simulationId, simulation);

			// Log the JSON that would be sent to Django
			const simulationPayload = {
				walls: data.walls,
				tables: data.tables,
				doors: data.doors,
				exits: data.exits,
				panicPins: data.panicPins,
				people: data.people,
				dimX: data.dimX,
				dimY: data.dimY,
				resolution: data.resolution,
				scale: data.scale,
			};

			console.log('Simulation payload that would be sent to Django:');
			console.log(JSON.stringify(simulationPayload, null, 2));

			// Simulate processing delay
			setTimeout(() => {
				const sim = mockSimulations.get(simulationId);
				if (sim) {
					sim.status = 'completed';
					sim.updatedAt = new Date().toISOString();
					// In real implementation, this would be the video URL from Django
					sim.videoUrl = '/placeholder-video.mp4';
					mockSimulations.set(simulationId, sim);
				}
			}, 3000);

			return NextResponse.json({
				simulation,
				message: 'Simulation created (mock mode). Check console for JSON payload.',
			});
		}

		// Real backend call
		const djangoUrl = process.env.DJANGO_API_URL;
		if (!djangoUrl) {
			return NextResponse.json({ error: 'Django backend URL not configured' }, { status: 500 });
		}

		// Create simulation record
		const createResponse = await fetch(`${djangoUrl}/api/simulations/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				data,
				gridWidth,
				gridHeight,
				schematicUrl,
				status: 'pending',
			}),
		});

		if (!createResponse.ok) {
			const errorData = await createResponse.json().catch(() => ({}));
			return NextResponse.json({ error: errorData.detail || 'Failed to create simulation' }, { status: createResponse.status });
		}

		const simulation = await createResponse.json();

		// Send simulation data to Django for processing
		const simulateResponse = await fetch(`${djangoUrl}/api/simulate/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				simulation_id: simulation.id,
				walls: data.walls,
				tables: data.tables,
				doors: data.doors,
				exits: data.exits,
				panicPins: data.panicPins,
				people: data.people,
				dimX: data.dimX,
				dimY: data.dimY,
				resolution: data.resolution,
				scale: data.scale,
			}),
		});

		if (simulateResponse.ok) {
			// Get the video blob from the response
			const videoBlob = await simulateResponse.blob();

			// Upload video to Vercel Blob
			const timestamp = Date.now();
			const videoFilename = `simulations/${simulation.id}/${timestamp}.mp4`;

			const blob = await put(videoFilename, videoBlob, {
				access: 'public',
				contentType: 'video/mp4',
			});

			// Update simulation with video URL
			await fetch(`${djangoUrl}/api/simulations/${simulation.id}/`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'completed',
					videoUrl: blob.url,
				}),
			});

			return NextResponse.json({
				simulation: {
					...simulation,
					status: 'completed',
					videoUrl: blob.url,
				},
			});
		} else {
			// Mark simulation as processing (async handling)
			await fetch(`${djangoUrl}/api/simulations/${simulation.id}/`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'processing',
				}),
			});

			return NextResponse.json({
				simulation: {
					...simulation,
					status: 'processing',
				},
			});
		}
	} catch (error) {
		console.error('Error creating simulation:', error);
		return NextResponse.json({ error: 'Failed to create simulation' }, { status: 500 });
	}
}

// Export mock storage for other routes
export { mockSimulations };
