import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the HTTP-only cookie from the request
    const token = request.cookies.get('access_token')?.value;
    console.log('Token:', token);

    if (!token) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const response = await fetch('http://127.0.0.1:8000/inventory', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch inventory');
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inventory' },
      { status: 400 }
    );
  }
}