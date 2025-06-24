import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for the tracking payload
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

// Cap time spent to prevent outliers (30 minutes)
const MAX_TIME_SPENT_SINGLE_SESSION = 30 * 60; // 30 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and text content types (sendBeacon sends as text)
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else {
      // sendBeacon sends data as text
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    // Validate the payload
    const validationResult = trackingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Must have either userId or anonymousId
    if (!data.userId && !data.anonymousId) {
      return NextResponse.json(
        { error: 'Either userId or anonymousId must be provided' },
        { status: 400 }
      );
    }

    // Get IP address from headers
    const headersList = await headers();
    const ipAddress = 
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      null;

    // Cap time spent to prevent outliers
    const cappedTimeSpent = Math.min(data.timeSpent, MAX_TIME_SPENT_SINGLE_SESSION);

    // Determine the unique constraint for upsert
    const whereClause = data.userId
      ? { postId_userId: { postId: data.postId, userId: data.userId } }
      : { postId_anonymousId: { postId: data.postId, anonymousId: data.anonymousId! } };

    // Use a transaction for atomic read-update
    await prisma.$transaction(async (tx) => {
      // Try to find existing record
      const existingRead = await tx.postRead.findUnique({ 
        where: whereClause as any // Type assertion needed due to union type
      });

      if (existingRead) {
        // Update existing record
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
      } else {
        // Create new record
        await tx.postRead.create({
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
      }

      // Optional: Update post view count cache or trigger analytics events
      // This could be done asynchronously in a background job for better performance
    });

    // Return 204 No Content as recommended for beacon endpoints
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error tracking read:', error);
    
    // Don't expose internal errors to clients
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}