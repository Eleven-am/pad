import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import {prisma} from "@/services/di";
import { apiLogger } from '@/lib/logger';

const trackingSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().nullable(),
  anonymousId: z.string().nullable(),
  scrollDepth: z.number().min(0).max(1),
  timeSpent: z.number().min(0),
  completed: z.boolean(),
  userAgent: z.string().optional(),
  referrer: z.string().nullable().optional(),
});

const MAX_TIME_SPENT_SINGLE_SESSION = 30 * 60;

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const logger = apiLogger.child({ requestId, endpoint: 'track-read' });
  
  try {
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        logger.warn({ contentType }, 'Invalid JSON payload');
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    const validationResult = trackingSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn({ error: validationResult.error }, 'Invalid tracking payload');
      return NextResponse.json(
        { error: 'Invalid payload', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    if (!data.userId && !data.anonymousId) {
      logger.warn({ postId: data.postId }, 'Missing userId or anonymousId');
      return NextResponse.json(
        { error: 'Either userId or anonymousId must be provided' },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const ipAddress = 
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      null;

    const cappedTimeSpent = Math.min(data.timeSpent, MAX_TIME_SPENT_SINGLE_SESSION);
    
    logger.info({ 
      postId: data.postId, 
      userId: data.userId, 
      anonymousId: data.anonymousId, 
      timeSpent: cappedTimeSpent,
      scrollDepth: data.scrollDepth,
      completed: data.completed
    }, 'Tracking read activity');

    const whereClause = data.userId
      ? { postId_userId: { postId: data.postId, userId: data.userId } }
      : { postId_anonymousId: { postId: data.postId, anonymousId: data.anonymousId! } };

    await prisma.$transaction(async (tx) => {
      const existingRead = await tx.postRead.findUnique({ 
        where: whereClause as Parameters<typeof tx.postRead.findUnique>[0]['where']
      });

      if (existingRead) {
        await tx.postRead.update({
          where: { id: existingRead.id },
          data: {
            timeSpent: existingRead.timeSpent + cappedTimeSpent,
            scrollDepth: Math.max(existingRead.scrollDepth, data.scrollDepth),
            completed: existingRead.completed || data.completed,
            ipAddress: ipAddress || existingRead.ipAddress,
            userAgent: data.userAgent || existingRead.userAgent,
            referrer: data.referrer || existingRead.referrer,
          },
        });
        logger.debug({ postId: data.postId, existingReadId: existingRead.id }, 'Updated existing read record');
      } else {
        const newRead = await tx.postRead.create({
          data: {
            postId: data.postId,
            userId: data.userId,
            anonymousId: data.anonymousId,
            timeSpent: cappedTimeSpent,
            scrollDepth: data.scrollDepth,
            completed: data.completed,
            ipAddress,
            userAgent: data.userAgent,
            referrer: data.referrer,
          },
        });
        logger.debug({ postId: data.postId, newReadId: newRead.id }, 'Created new read record');
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error({ error }, 'Error tracking read');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}