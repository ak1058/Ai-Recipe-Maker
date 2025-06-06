import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to set token' },
      { status: 400 }
    );
  }
}