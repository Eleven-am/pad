import React from "react";
import { Badge } from "@/components/ui/badge";
import { PostWithDetails } from "@/services/postService";

interface TagsSectionProps {
  postTags: PostWithDetails['postTags'];
}

export const TagsSection = React.memo<TagsSectionProps>(({ postTags }) => (
  <section className="pt-6">
    <h2 className="text-lg md:text-xl font-semibold mb-4">Tags</h2>
    <div className="flex flex-wrap gap-2">
      {postTags.map((tag) => (
        <Badge variant="secondary" className="text-xs md:text-sm py-1 px-3" key={tag.id}>
          {tag.tag.name}
        </Badge>
      ))}
    </div>
  </section>
));

TagsSection.displayName = 'TagsSection';