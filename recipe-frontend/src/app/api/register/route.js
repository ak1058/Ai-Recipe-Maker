import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, name, gender } = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, gender }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      name: data.name,
      gender: data.gender
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}