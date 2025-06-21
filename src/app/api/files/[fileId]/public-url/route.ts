import { NextResponse } from 'next/server';
import { getPublicUrl, unwrap } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const url = await unwrap(getPublicUrl(fileId)) as string;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to fetch public URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public URL' },
      { status: 500 }
    );
  }
}