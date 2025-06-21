import { ReactNode } from "react";
import { PostWithDetails } from "@/services/postService";
import { ContentAnalysis } from "@/services/types";

export interface AuthorWithAvatar {
  id: string;
  name: string | null;
  email: string;
  avatarFile: { id: string; path: string } | null;
  avatarUrl: string | null;
  isOwner: boolean;
  joinedAt?: Date | null;
}

export interface BlogWrapperBaseProps {
  post: PostWithDetails;
  avatarUrl: string | null;
  analysis: ContentAnalysis;
  authorsPromise: Promise<{
    allAuthors: AuthorWithAvatar[];
  }>;
}

export interface BlogWrapperProps extends BlogWrapperBaseProps {
  children: ReactNode;
  className?: string;
}