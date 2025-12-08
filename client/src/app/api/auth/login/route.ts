import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🚀 Login API called');
  
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`📧 Login attempt for: ${email}`);

    // Forward to backend
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/auth/login`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend login error:', backendData);
      throw new Error(backendData.message || backendData.error || 'Login failed');
    }

    console.log('✅ Login successful via backend');
    
    // Return backend response (which should include token)
    return NextResponse.json({
      success: true,
      ...backendData, // Include token, user data, etc.
      message: 'Logged in successfully'
    });

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 401 }
    );
  }
}