import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  console.log('🚀 Update profile API called');
  
  try {
    const body = await request.json();
    const { name } = body;
    
    const authHeader = request.headers.get('Authorization');

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Forward to backend
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.message || backendData.error || 'Failed to update profile');
    }

    return NextResponse.json({
      success: true,
      ...backendData,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile'
      },
      { status: 400 }
    );
  }
}