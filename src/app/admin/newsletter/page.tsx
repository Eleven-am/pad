import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NewsletterAdminClient } from './newsletter-admin-client';
import { getNewsletterStats } from '@/app/actions/newsletter';

export default async function NewsletterAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Check if user is authenticated and is an admin
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/auth');
  }

  let stats = null;
  try {
    stats = await getNewsletterStats();
  } catch (error) {
    console.error('Failed to fetch newsletter stats:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Newsletter Administration</h1>
          <p className="text-muted-foreground">
            Send newsletters to your subscribers and manage your mailing list.
          </p>
        </div>

        <NewsletterAdminClient initialStats={stats} />
      </div>
    </div>
  );
}