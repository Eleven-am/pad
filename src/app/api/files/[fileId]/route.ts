import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/server';
import { mediaService } from '@/services/di';

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