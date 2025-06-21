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

export async function promoteCollaboratorToCoAuthor(postId: string, collaboratorUserId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    await unwrap(promoteToCoAuthor(postId, collaboratorUserId, session.user.id));
    
    // Revalidate relevant paths
    revalidatePath(`/blogs/[slug]/edit`, 'page');
    revalidatePath(`/blogs/[slug]`, 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to promote to co-author:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to promote to co-author' 
    };
  }
}

export async function demoteCoAuthorToContributor(postId: string, coAuthorUserId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    await unwrap(demoteFromCoAuthor(postId, coAuthorUserId, session.user.id));
    
    // Revalidate relevant paths
    revalidatePath(`/blogs/[slug]/edit`, 'page');
    revalidatePath(`/blogs/[slug]`, 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to demote from co-author:', error);
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
    console.error('Failed to get post authors:', error);
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
    console.error('Failed to check author status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check author status' 
    };
  }
}