import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('🔄 Forwarding password reset to backend...');
    console.log(`🔐 Token: ${token.substring(0, 10)}...`);
    console.log(`🔐 Password length: ${password.length}`);

    // Forward to backend for actual password update
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/auth/reset-password`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend reset failed:', backendData);
      throw new Error(backendData.message || backendData.error || 'Password reset failed');
    }

    console.log('✅ Password reset successful via backend:', backendData);
    
    return NextResponse.json({
      success: true,
      email: backendData.email,
      message: 'Password has been reset successfully! You can now login with your new password.',
      backendResponse: backendData
    });

  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}