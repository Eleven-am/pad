import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { readingAnalyticsService } from '@/services/di';
import { apiLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const logger = apiLogger.child({ requestId, endpoint: 'reading-distribution' });
  
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      logger.warn({ userId: null }, 'Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    logger.info({ userId: session.user.id, postId }, 'Fetching reading distribution');

    if (postId) {
      const result = await readingAnalyticsService.getReadingDistribution(postId).toPromise();
      
      logger.debug({ postId, resultCount: result.length }, 'Reading distribution fetched');
      return NextResponse.json({ distribution: result });
    } else {
      const distribution = [
        { range: '0-25%', count: 0, percentage: 0 },
        { range: '26-50%', count: 0, percentage: 0 },
        { range: '51-75%', count: 0, percentage: 0 },
        { range: '76-100%', count: 0, percentage: 0 },
      ];

      logger.debug('Returning empty distribution');
      return NextResponse.json({ distribution });
    }
  } catch (error) {
    logger.error({ error, postId: request.nextUrl.searchParams.get('postId') }, 'Error fetching reading distribution');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}