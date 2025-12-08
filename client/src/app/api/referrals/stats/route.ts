import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('📊 Referral stats API called');
  
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
    
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/referrals/stats`);
    
    const response = await fetch(`${BACKEND_URL}/api/referrals/stats`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.error || backendData.message || 'Failed to get referral stats');
    }

    console.log('✅ Referral stats retrieved successfully');
    
    return NextResponse.json({
      success: true,
      ...backendData
    });

  } catch (error: any) {
    console.error('❌ Referral stats error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get referral statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}