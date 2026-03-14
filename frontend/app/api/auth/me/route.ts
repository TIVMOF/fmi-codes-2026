import { NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/auth'
import { djangoFetch } from '@/lib/api'

export async function GET() {
  try {
    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const response = await djangoFetch('/auth/user/', {
      method: 'GET',
    }, token)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const user = await response.json()
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
