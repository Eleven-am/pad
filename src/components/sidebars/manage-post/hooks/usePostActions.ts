"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { UpdatePostInput, PostWithDetails } from '@/services/postService';
import { BlocksSubPanel } from '@/components/menu/menu-context';

interface PostActionsHook {
  handleSave: () => Promise<void>;
  handlePublish: () => Promise<void>;
  handleSchedulePublish: () => Promise<void>;
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
    excerpt: string;
    excerptImageId: string;
    excerptByline: string;
  },
  updatePostFn: (postId: string, data: UpdatePostInput, userId: string) => Promise<void>,
  publishPostFn: (postId: string, userId: string) => Promise<void>,
  schedulePostFn: (postId: string, scheduledAt: Date, userId: string) => Promise<void>,
  setBlocksSubPanelFn: (panel: BlocksSubPanel) => void
): PostActionsHook {
  
  const handleSave = useCallback(async () => {
    if (!post?.id) return;

    // Saving post with excerpt data

    try {
      await updatePostFn(post.id, {
        title: formState.blogName,
        published: !formState.isDraft,
        scheduledAt: formState.scheduledDate || null,
        categoryId: formState.category || undefined,
        tagIds: formState.selectedTags.length > 0 ? formState.selectedTags : undefined,
        excerpt: formState.excerpt || undefined,
        excerptImageId: formState.excerptImageId || undefined,
        excerptByline: formState.excerptByline || undefined,
      }, userId);
      toast.success('Post saved successfully');
    } catch {
      toast.error('Failed to save post. Please try again.');
    }
  }, [post?.id, formState, updatePostFn, userId]);

  const handlePublish = useCallback(async () => {
    if (!post?.id) return;

    try {
      await publishPostFn(post.id, userId);
      toast.success('Post published successfully');
    } catch {
      toast.error('Failed to publish post. Please try again.');
    }
  }, [post?.id, publishPostFn, userId]);

  const handleSchedulePublish = useCallback(async () => {
    if (!post?.id || !formState.scheduledDate) return;

    try {
      await schedulePostFn(post.id, formState.scheduledDate, userId);
      toast.success('Post scheduled successfully');
    } catch {
      toast.error('Failed to schedule post. Please try again.');
    }
  }, [post?.id, formState.scheduledDate, schedulePostFn, userId]);

  const handleStartAddingBlocks = useCallback(() => {
    setBlocksSubPanelFn('select');
  }, [setBlocksSubPanelFn]);

  return {
    handleSave,
    handlePublish,
    handleSchedulePublish,
    handleStartAddingBlocks,
  };
}