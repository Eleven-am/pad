import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/server';
import { mediaService } from '@/services/di';
import { MediaService } from '@/services/mediaService';
import { createReadStream } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Validate token is provided
    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }
    
    // Validate token
    const secret = process.env.FILE_ACCESS_SECRET || 'default-secret-change-in-production';
    const validation = MediaService.validateSecureToken(token, secret);
    
    if (!validation.valid) {
      if (validation.expired) {
        return NextResponse.json(
          { error: 'Access token expired' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }
    
    // Verify token matches requested file
    if (validation.fileId !== fileId) {
      return NextResponse.json(
        { error: 'Token not valid for this file' },
        { status: 403 }
      );
    }
    
    // Get file metadata
    const fileResult = await mediaService.getFile(fileId).toPromise();
    
    // Track file access
    await mediaService.trackFileAccess(fileId).toPromise();
    
    // Create read stream
    const stream = createReadStream(fileResult.path);
    
    // Convert Node stream to Web stream
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
    
    // Return file with appropriate headers
    return new NextResponse(webStream, {
      headers: {
        'Content-Type': fileResult.mimeType,
        'Content-Disposition': `inline; filename="${fileResult.filename}"`,
        'Cache-Control': 'private, max-age=3600', // Private cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('File retrieval error:', error);
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
  try {
    const { fileId } = await params;
    
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the file
    const result = await mediaService.deleteFile(fileId, session.user.id).toPromise();
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully',
      deletedFile: {
        id: result.id,
        filename: result.filename
      }
    });

  } catch (error) {
    console.error('File deletion error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
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