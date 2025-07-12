"use client";

import { Search } from "lucide-react";
import { memo } from "react";

interface BlogsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BlogsSearchBar = memo<BlogsSearchBarProps>(({ 
  value, 
  onChange, 
  placeholder = "Search articles..." 
}) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );
});

BlogsSearchBar.displayName = 'BlogsSearchBar';

export default BlogsSearchBar;