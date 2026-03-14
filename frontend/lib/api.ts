const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

export async function djangoFetch(endpoint: string, options: RequestInit = {}, token?: string) {
	const url = `${DJANGO_API_URL}${endpoint}`;

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...options,
		headers,
	});

	return response;
}

export async function djangoFetchWithVideo(endpoint: string, body: object, token?: string): Promise<{ video: Blob } | { error: string }> {
	const url = `${DJANGO_API_URL}${endpoint}`;

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return { error: errorText || 'Simulation failed' };
		}

		const video = await response.blob();
		return { video };
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Unknown error' };
	}
}
