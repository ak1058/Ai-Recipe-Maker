import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes/saved`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch saved recipes');
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved recipes' },
      { status: 400 }
    );
  }
}