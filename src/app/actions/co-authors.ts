'use server';

import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { 
  promoteToCoAuthor, 
  demoteFromCoAuthor, 
  getPostAuthors, 
  isUserAuthor,
  unwrap 
} from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { authLogger } from '@/lib/logger';

export async function promoteCollaboratorToCoAuthor(postId: string, collaboratorUserId: string) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    await unwrap(promoteToCoAuthor(postId, collaboratorUserId, session.user.id));
    
    revalidatePath(`/blogs/[slug]/edit`, 'page');
    revalidatePath(`/blogs/[slug]`, 'page');
    
    return { success: true };
  } catch (error) {
    authLogger.error({ error, postId, collaboratorUserId, userId: session?.user?.id }, 'Failed to promote to co-author');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to promote to co-author' 
    };
  }
}

export async function demoteCoAuthorToContributor(postId: string, coAuthorUserId: string) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    await unwrap(demoteFromCoAuthor(postId, coAuthorUserId, session.user.id));
    
    revalidatePath(`/blogs/[slug]/edit`, 'page');
    revalidatePath(`/blogs/[slug]`, 'page');
    
    return { success: true };
  } catch (error) {
    authLogger.error({ error, postId, coAuthorUserId, userId: session?.user?.id }, 'Failed to demote from co-author');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to demote from co-author' 
    };
  }
}

export async function getPostAuthorsAction(postId: string) {
  try {
    const authors = await unwrap(getPostAuthors(postId));
    return { success: true, data: authors };
  } catch (error) {
    authLogger.error({ error, postId }, 'Failed to get post authors');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get post authors' 
    };
  }
}

export async function checkUserAuthorStatus(postId: string, userId?: string) {
  try {
    if (!userId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      userId = session?.user?.id;
    }

    if (!userId) {
      return { success: true, data: { isAuthor: false } };
    }

    const userIsAuthor = await unwrap(isUserAuthor(postId, userId));
    return { success: true, data: { isAuthor: userIsAuthor } };
  } catch (error) {
    authLogger.error({ error, postId, userId }, 'Failed to check author status');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check author status' 
    };
  }
}