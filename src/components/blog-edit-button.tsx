import Link from 'next/link';
import { auth } from '@/lib/better-auth/server';
import { headers } from 'next/headers';
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isUserAuthor, unwrap } from '@/lib/data';

interface BlogEditButtonProps {
  postId: string;
  postSlug: string;
  className?: string;
}

export async function BlogEditButton({ postId, postSlug, className }: BlogEditButtonProps) {
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only show edit button if user is logged in and is an author (owner or co-author)
  if (!session?.user?.id) {
    return null;
  }

  try {
    const userIsAuthor = await unwrap(isUserAuthor(postId, session.user.id));
    if (!userIsAuthor) {
      return null;
    }
  } catch {
    // If there's an error checking author status, don't show the button
    return null;
  }

  return (
    <Link
      href={`/blogs/${postSlug}/edit`}
      className={cn(
        "fixed top-20 right-4 z-50",
        "flex items-center gap-2 px-4 py-2",
        "bg-primary text-primary-foreground",
        "rounded-full shadow-lg",
        "hover:bg-primary/90 transition-colors",
        "group",
        className
      )}
    >
      <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform" />
      <span className="text-sm font-medium">Edit Post</span>
    </Link>
  );
}