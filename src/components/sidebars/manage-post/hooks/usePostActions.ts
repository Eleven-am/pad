"use client";

import { useCallback } from 'react';
import { UpdatePostInput, PostWithDetails } from '@/services/postService';
import { BlocksSubPanel } from '@/components/menu/menu-context';

interface PostActionsHook {
  handleSave: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handleStartAddingBlocks: () => void;
}

export function usePostActions(
  post: PostWithDetails | null,
  userId: string,
  formState: {
    blogName: string;
    isDraft: boolean;
    scheduledDate: Date | undefined;
    category: string;
    selectedTags: string[];
  },
  updatePostFn: (postId: string, data: UpdatePostInput, userId: string) => Promise<void>,
  publishPostFn: (postId: string, userId: string) => Promise<void>,
  setBlocksSubPanelFn: (panel: BlocksSubPanel) => void
): PostActionsHook {
  
  const handleSave = useCallback(async () => {
    if (!post?.id) return;

    try {
      await updatePostFn(post.id, {
        title: formState.blogName,
        published: !formState.isDraft,
        scheduledAt: formState.scheduledDate || null,
        categoryId: formState.category || undefined,
        tagIds: formState.selectedTags.length > 0 ? formState.selectedTags : undefined,
      }, userId);
    } catch (error) {
      console.error('Failed to save post:', error);
      // TODO: Add toast notification
    }
  }, [post?.id, formState, updatePostFn, userId]);

  const handlePublish = useCallback(async () => {
    if (!post?.id) return;

    try {
      await publishPostFn(post.id, userId);
    } catch (error) {
      console.error('Failed to publish post:', error);
      // TODO: Add toast notification
    }
  }, [post?.id, publishPostFn, userId]);

  const handleStartAddingBlocks = useCallback(() => {
    setBlocksSubPanelFn('select');
  }, [setBlocksSubPanelFn]);

  return {
    handleSave,
    handlePublish,
    handleStartAddingBlocks,
  };
}