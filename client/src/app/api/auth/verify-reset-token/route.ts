import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    console.log('🔍 Verifying reset token with backend:', token);

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Forward to backend for verification
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/auth/verify-reset-token`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend verification failed:', backendData);
      throw new Error(backendData.message || backendData.error || 'Token verification failed');
    }

    console.log('✅ Token verified by backend:', backendData);
    
    return NextResponse.json({
      success: true,
      valid: true,
      email: backendData.email,
      backendResponse: backendData
    });

  } catch (error: any) {
    console.error('❌ Token verification error:', error);
    
    return NextResponse.json({
      success: false,
      valid: false,
      error: error.message || 'Invalid or expired reset token'
    }, { status: 400 });
  }
}