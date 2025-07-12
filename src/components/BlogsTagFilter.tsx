"use client";

import { memo } from "react";

interface BlogsTagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const BlogsTagFilter = memo<BlogsTagFilterProps>(({ tags, selectedTag, onTagSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          !selectedTag 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted hover:bg-muted/80'
        }`}
      >
        All Topics
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag === selectedTag ? null : tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            tag === selectedTag 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
});

BlogsTagFilter.displayName = 'BlogsTagFilter';

export default BlogsTagFilter;