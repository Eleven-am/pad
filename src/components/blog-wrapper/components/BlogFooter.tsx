import React from "react";
import { TagsSection } from "./TagsSection";
import { AuthorBio } from "./AuthorBio";
import { BlogWrapperBaseProps } from "../types";

type BlogFooterProps = Omit<BlogWrapperBaseProps, 'analysis' | 'authorsPromise'>;

export const BlogFooter = React.memo<BlogFooterProps>(({ post, avatarUrl }) => {
  const { author, postTags } = post;

  return (
    <div className="flex w-full flex-col text-sm text-muted-foreground mt-4">
      <TagsSection postTags={postTags} />
      <AuthorBio author={author} avatarUrl={avatarUrl} />
    </div>
  );
});

BlogFooter.displayName = 'BlogFooter';