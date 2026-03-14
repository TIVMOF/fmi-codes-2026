import { NextRequest, NextResponse } from 'next/server';
import { setAuthToken } from '@/lib/auth';
import { djangoFetch } from '@/lib/api';

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
		}

		const response = await djangoFetch('/users/login/', {
			method: 'POST',
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return NextResponse.json({ error: errorData.detail || errorData.error || 'Invalid credentials' }, { status: response.status });
		}

		const data = await response.json();

		if (!data.token) {
			return NextResponse.json({ error: 'Missing token in login response' }, { status: 502 });
		}

		await setAuthToken(data.token);

		return NextResponse.json({
			user: {
				id: data.user?.id,
				username: data.user?.username ?? username,
				email: data.user?.email ?? '',
			},
		});
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
