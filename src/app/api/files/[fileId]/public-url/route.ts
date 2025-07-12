import { NextResponse } from 'next/server';
import { getPublicUrl, unwrap } from '@/lib/data';
import { fileLogger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const logger = fileLogger.child({ endpoint: 'public-url' });
  
  try {
    const { fileId } = await params;
    logger.info({ fileId }, 'Fetching public URL');
    
    const url = await unwrap(getPublicUrl(fileId)) as string;
    
    logger.debug({ fileId, url }, 'Public URL generated');
    return NextResponse.json({ url });
  } catch (error) {
    const { fileId } = await params;
    logger.error({ error, fileId }, 'Failed to fetch public URL');
    return NextResponse.json(
      { error: 'Failed to fetch public URL' },
      { status: 500 }
    );
  }
}