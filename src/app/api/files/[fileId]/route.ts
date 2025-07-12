import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/server';
import { mediaService } from '@/services/di';
import { MediaService } from '@/services/mediaService';
import { createReadStream } from 'fs';
import { fileLogger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const logger = fileLogger.child({ requestId, endpoint: 'file-get' });
  
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    logger.info({ fileId, hasToken: !!token }, 'File access request');
    
    if (!token) {
      logger.warn({ fileId }, 'File access denied - no token provided');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }
    
    const secret = process.env.FILE_ACCESS_SECRET || 'default-secret-change-in-production';
    const validation = MediaService.validateSecureToken(token, secret);
    
    if (!validation.valid) {
      if (validation.expired) {
        logger.warn({ fileId, tokenFileId: validation.fileId }, 'File access denied - token expired');
        return NextResponse.json(
          { error: 'Access token expired' },
          { status: 401 }
        );
      }
      logger.warn({ fileId, tokenFileId: validation.fileId }, 'File access denied - invalid token');
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }
    
    if (validation.fileId !== fileId) {
      logger.warn({ fileId, tokenFileId: validation.fileId }, 'File access denied - token mismatch');
      return NextResponse.json(
        { error: 'Token not valid for this file' },
        { status: 403 }
      );
    }
    
    const fileResult = await mediaService.getFile(fileId).toPromise();
    await mediaService.trackFileAccess(fileId).toPromise();
    
    logger.info({ fileId, filename: fileResult.filename, mimeType: fileResult.mimeType, size: fileResult.size }, 'File served successfully');
    
    const stream = createReadStream(fileResult.path);
    
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (err: Error) => {
          controller.error(err);
        });
      },
    });
    
    return new NextResponse(webStream, {
      headers: {
        'Content-Type': fileResult.mimeType,
        'Content-Disposition': `inline; filename="${fileResult.filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
    
  } catch (error) {
    logger.error({ error, fileId: (await params).fileId }, 'File retrieval error');
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const logger = fileLogger.child({ requestId, endpoint: 'file-delete' });
  
  try {
    const { fileId } = await params;
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      logger.warn({ fileId }, 'File deletion denied - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info({ fileId, userId: session.user.id }, 'Deleting file');
    
    const result = await mediaService.deleteFile(fileId, session.user.id).toPromise();
    
    logger.info({ fileId, filename: result.filename, userId: session.user.id }, 'File deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully',
      deletedFile: {
        id: result.id,
        filename: result.filename
      }
    });

  } catch (error) {
    const { fileId } = await params;
    logger.error({ error, fileId }, 'File deletion error');
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'File not found or access denied' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}