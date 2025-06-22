'use server';

import { userService } from '@/services/di';
import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function updateNotificationSettings(_settings: {
  emailComments: boolean;
  emailFollowers: boolean;
  emailWeeklyDigest: boolean;
  emailNewPosts: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    // Update notification preferences
    // This would typically update user preferences in the database
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update notification settings:', error);
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

    // Delete the user account and all associated data
    await userService.deleteUser(session.user.id).toPromise();
    
    // Sign out the user after deletion
    await auth.api.signOut({
      headers: await headers(),
    });
    
    // Redirect to home page
    redirect('/');
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete account' };
  }
}