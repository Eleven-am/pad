import React, { Suspense } from "react";
import { format } from "date-fns";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MultiAuthorDisplay } from "@/components/multi-author-display";
import { BlogWrapperBaseProps } from "../types";

type BlogHeaderProps = Omit<BlogWrapperBaseProps, 'avatarUrl'>;

const AuthorSkeleton = React.memo(() => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
  </div>
));

AuthorSkeleton.displayName = 'AuthorSkeleton';

const BlogMetadata = React.memo<{
  time: Date;
  readingTimeInMinutes: number;
  totalLikes: number;
}>(({ time, readingTimeInMinutes, totalLikes }) => (
  <div className="flex items-center gap-4">
    <time dateTime={time?.toISOString()} suppressHydrationWarning>
      {format(time, "d MMM yyyy")}
    </time>
    <span>{readingTimeInMinutes} min read</span>
    <span className="flex items-center gap-2 text-muted-foreground">
      <ThumbsUp className="w-4 h-4" />
      {totalLikes} 
    </span>
  </div>
));

BlogMetadata.displayName = 'BlogMetadata';

export const BlogHeader = React.memo<BlogHeaderProps>(({ 
  post, 
  analysis, 
  authorsPromise 
}) => {
  const { title, publishedAt, scheduledAt, _count } = post;
  const { readingTime } = analysis;
  const readingTimeInMinutes = Math.ceil(readingTime);
  const { totalLikes } = _count || { totalLikes: 0, totalReads: 0, totalViews: 0 };
  
  const time = publishedAt ? publishedAt : scheduledAt || new Date();
  
  return (
    <div className="mb-6 mt-4 border-b border-muted-foreground">
      <h1 className={cn(
        'font-newsreader text-xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-3',
      )}>
        {title}
      </h1>
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <Suspense fallback={<AuthorSkeleton />}>
          <MultiAuthorDisplay authorsPromise={authorsPromise} />
        </Suspense>
        <BlogMetadata 
          time={time} 
          readingTimeInMinutes={readingTimeInMinutes} 
          totalLikes={totalLikes} 
        />
      </div>
    </div>
  );
});

BlogHeader.displayName = 'BlogHeader';