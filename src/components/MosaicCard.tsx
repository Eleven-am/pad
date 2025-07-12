"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { memo } from "react";
import { useFileId } from "@/hooks/useFileId";

interface MosaicCardProps {
  post: {
    id: string;
    title: string;
    excerpt?: string | null;
    excerptImage?: string | null;
    author: { name: string | null };
    readTime: string;
    tags: string[];
    slug: string;
  };
  index: number;
}

const MosaicCard = memo<MosaicCardProps>(({ post, index }) => {
  const { url, loading } = useFileId(post.excerptImage || '');
  
  // Create more dramatic height variations for mosaic effect - increased minimums
  const heightClasses = [
    "h-[420px]", "h-[540px]", "h-[480px]", "h-[460px]", 
    "h-[580px]", "h-[440px]", "h-[520px]", "h-[500px]",
    "h-[560px]", "h-[400px]", "h-[600px]", "h-[480px]"
  ];
  const cardHeight = heightClasses[index % heightClasses.length];
  
  // Vary image heights too for more dynamic layout - increased minimums
  const imageHeights = [
    "h-[240px]", "h-[320px]", "h-[280px]", "h-[260px]",
    "h-[360px]", "h-[220px]", "h-[300px]", "h-[340px]",
    "h-[380px]", "h-[200px]", "h-[400px]", "h-[280px]"
  ];
  const imageHeight = imageHeights[index % imageHeights.length];
  
  return (
    <article className={`group ${cardHeight} flex flex-col mb-6 bg-card rounded-xl overflow-hidden border border-border/50`}>
      <Link href={`/blogs/${post.slug}`} className="flex flex-col h-full">
        <div className={`relative ${imageHeight} bg-muted/30 overflow-hidden`}>
          {(!url && !loading) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-muted/50" />
            </div>
          ) : (
            <img
              src={url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{post.author.name}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          
          <h3 className="font-semibold text-lg leading-snug group-hover:text-primary/80 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
});

MosaicCard.displayName = 'MosaicCard';

export default MosaicCard;