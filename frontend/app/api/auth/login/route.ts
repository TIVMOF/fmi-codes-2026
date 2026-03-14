import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken } from '@/lib/auth'
import { djangoFetch } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const response = await djangoFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || errorData.error || 'Invalid credentials' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Store the token in httpOnly cookie
    await setAuthToken(data.token)

    // Fetch user details
    const userResponse = await djangoFetch('/auth/user/', {
      method: 'GET',
    }, data.token)

    if (userResponse.ok) {
      const user = await userResponse.json()
      return NextResponse.json({ user })
    }

    return NextResponse.json({ user: { id: 0, username, email: '' } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
