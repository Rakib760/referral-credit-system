import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('🚀 Get user info API called');
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 401 }
      );
    }

    // Forward to backend
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.message || backendData.error || 'Failed to get user info');
    }

    return NextResponse.json({
      success: true,
      ...backendData
    });

  } catch (error: any) {
    console.error('❌ Get user error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user information'
      },
      { status: 401 }
    );
  }
}