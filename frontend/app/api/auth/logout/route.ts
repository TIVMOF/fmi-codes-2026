import { NextResponse } from 'next/server';
import { clearAuthToken, getAuthToken } from '@/lib/auth';
import { djangoFetch } from '@/lib/api';

export async function POST() {
	try {
		const token = await getAuthToken();
		if (token) {
			await djangoFetch(
				'/users/logout/',
				{
					method: 'POST',
				},
				token,
			);
		}

		await clearAuthToken();
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
