import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { verified: false, error: 'No token found' },
        { status: 401 }
      );
    }

    // token checking logic but for now i am returning simply token
    return NextResponse.json(
      { verified: true, user: { /* user data if needed */ } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error.message },
      { status: 400 }
    );
  }
}