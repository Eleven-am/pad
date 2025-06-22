import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { userService } from '@/services/di';

export async function SettingsServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/auth');
  }

  // Get full user data
  const user = await userService.getUserById(session.user.id).toPromise();

  return <SettingsClient user={user} />;
}