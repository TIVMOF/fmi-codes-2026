import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/auth'
import { djangoFetch } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const response = await djangoFetch(`/api/simulations/${id}/`, {
      method: 'GET',
    }, token)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      )
    }

    const simulation = await response.json()
    return NextResponse.json({ simulation })
  } catch (error) {
    console.error('Error fetching simulation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const response = await djangoFetch(`/api/simulations/${id}/`, {
      method: 'DELETE',
    }, token)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete simulation' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting simulation:', error)
    return NextResponse.json(
      { error: 'Failed to delete simulation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const response = await djangoFetch(`/api/simulations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, token)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update simulation' },
        { status: response.status }
      )
    }

    const simulation = await response.json()
    return NextResponse.json({ simulation })
  } catch (error) {
    console.error('Error updating simulation:', error)
    return NextResponse.json(
      { error: 'Failed to update simulation' },
      { status: 500 }
    )
  }
}
