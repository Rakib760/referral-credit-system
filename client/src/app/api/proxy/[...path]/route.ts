import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = `${BACKEND_URL}/${path}`;
    
    console.log(`📡 Proxying GET to: ${url}`);
    
    const headers = new Headers(request.headers);
    headers.delete('host'); // Remove host header
    
    const response = await fetch(url, {
      headers,
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    console.error('❌ Proxy GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = `${BACKEND_URL}/${path}`;
    
    console.log(`📡 Proxying POST to: ${url}`);
    
    const body = await request.json();
    const headers = new Headers(request.headers);
    headers.delete('host');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    console.error('❌ Proxy POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Add other methods if needed (PUT, DELETE, etc.)