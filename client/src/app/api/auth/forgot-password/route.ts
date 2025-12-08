import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🚀 Password reset API called');
  
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`📧 Sending real email to: ${email}`);

    // Call your BACKEND API (adjust URL to your backend)
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.message || 'Backend request failed');
    }

    console.log('✅ Backend email sent successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Password reset email has been sent to your inbox!'
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