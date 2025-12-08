import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🚀 Forgot password API called');
  
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    console.log(`📧 Forwarding password reset request to backend for: ${email}`);

    // Your backend URL
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/auth/forgot-password`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend error:', backendData);
      throw new Error(backendData.message || backendData.error || 'Backend request failed');
    }

    console.log('✅ Backend email sent successfully!');
    console.log('📨 Backend response:', backendData);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset email has been sent to your inbox!',
      backendResponse: backendData // Optional: include backend response
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}