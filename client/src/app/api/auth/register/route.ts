import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🚀 Register API called');
  
  try {
    const body = await request.json();
    const { email, password, name, referralCode } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    console.log(`📝 Registration for: ${email} (${name})`);

    // Forward to backend
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, referralCode }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend registration error:', backendData);
      throw new Error(backendData.message || backendData.error || 'Registration failed');
    }

    console.log('✅ Registration successful via backend');
    
    return NextResponse.json({
      success: true,
      ...backendData,
      message: 'Registration successful! Welcome to Referral System.'
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Registration failed.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 400 }
    );
  }
}