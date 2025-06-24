import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { readingAnalyticsService } from '@/services/di';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get postId from query params if provided
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (postId) {
      // Get distribution for specific post
      const result = await readingAnalyticsService.getReadingDistribution(postId).run();
      
      if (result.isLeft()) {
        return NextResponse.json({ error: result.getLeft() }, { status: 500 });
      }

      return NextResponse.json({ distribution: result.getRight() });
    } else {
      // Return empty distribution when no specific post is provided
      // You could enhance this to aggregate across all user's posts
      const distribution = [
        { range: '0-25%', count: 0, percentage: 0 },
        { range: '26-50%', count: 0, percentage: 0 },
        { range: '51-75%', count: 0, percentage: 0 },
        { range: '76-100%', count: 0, percentage: 0 },
      ];

      return NextResponse.json({ distribution });
    }
  } catch (error) {
    console.error('Error fetching reading distribution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}