'use server';

import { userService } from '@/services/di';
import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authLogger } from '@/lib/logger';

export async function updateNotificationSettings(_settings: {
  emailComments: boolean;
  emailFollowers: boolean;
  emailWeeklyDigest: boolean;
  emailNewPosts: boolean;
}) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    
    return { success: true };
  } catch (error) {
    authLogger.error({ error, userId: session?.user?.id }, 'Failed to update notification settings');
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update notification settings' };
  }
}

export async function deleteAccount() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    await userService.deleteUser(session.user.id).toPromise();
    
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect('/');
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete account' };
  }
}