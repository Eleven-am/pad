"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface BlogMetadataSectionProps {
  blogName: string;
  onBlogNameChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const BlogMetadataSection = React.memo<BlogMetadataSectionProps>(({
  blogName,
  onBlogNameChange,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="blogName" className="text-sm font-medium">
        Blog Name
      </label>
      <Textarea
        id="blogName"
        value={blogName}
        onChange={onBlogNameChange}
        placeholder="Enter your blog name"
        className="min-h-[100px]"
      />
    </div>
  );
});

BlogMetadataSection.displayName = 'BlogMetadataSection';