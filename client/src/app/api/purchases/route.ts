import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('🛒 Purchase history API called');
  
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 401 }
      );
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${BACKEND_URL}/api/purchases/history`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.error || backendData.message || 'Failed to get purchase history');
    }

    return NextResponse.json({
      success: true,
      ...backendData
    });

  } catch (error: any) {
    console.error('❌ Purchase history error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get purchase history'
      },
      { status: 500 }
    );
  }
}