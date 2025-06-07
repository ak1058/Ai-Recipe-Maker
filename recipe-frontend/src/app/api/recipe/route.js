import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const token = request.cookies.get('access_token')?.value;
    const { ingredients } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const response = await fetch('http://127.0.0.1:8000/recipes/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate recipes');
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate recipes' },
      { status: 400 }
    );
  }
}