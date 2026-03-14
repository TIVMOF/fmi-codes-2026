import { NextRequest, NextResponse } from 'next/server';
import { setAuthToken } from '@/lib/auth';
import { djangoFetch } from '@/lib/api';

export async function POST(request: NextRequest) {
	try {
		const { username, email, password } = await request.json();

		if (!username || !email || !password) {
			return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
		}

		const response = await djangoFetch('/users/register/', {
			method: 'POST',
			body: JSON.stringify({ username, password, email }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return NextResponse.json({ error: errorData.detail || errorData.error || 'Registration failed' }, { status: response.status });
		}

		const data = await response.json();

		if (!data.token) {
			return NextResponse.json({ error: 'Missing token in registration response' }, { status: 502 });
		}

		await setAuthToken(data.token);

		return NextResponse.json({
			user: {
				id: data.user?.id || 0,
				username: data.user?.username || username,
				email,
			},
		});
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
