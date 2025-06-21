import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
// import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { userService } from '@/services/di';

export async function SettingsServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Temporarily disabled for development
  // if (!session?.user?.id) {
  //   redirect('/auth');
  // }

  // Get full user data (fallback for development)
  const user = session?.user?.id 
    ? await userService.getUserById(session.user.id).toPromise()
    : {
        id: 'mock-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'ADMIN' as const,
        createdAt: new Date('2024-01-01'),
      };

  return <SettingsClient user={user} />;
}