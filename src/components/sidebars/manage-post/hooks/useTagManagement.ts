"use client";

import { useCallback, useEffect, useState } from 'react';
import { Tag } from '@/generated/prisma';

interface TagOption {
  label: string;
  value: string;
}

interface TagManagementHook {
  tagOptions: TagOption[];
  handleTagsChange: (values: string[]) => void;
  handleCreateTag: (params: { label: string }) => Promise<Tag>;
  handleTagsClose: () => Promise<void>;
}

export function useTagManagement(
  initialTags: Tag[] = [],
  selectedTags: string[],
  onTagsChange: (tags: string[]) => void,
  createTagFn: (params: { name: string; slug: string }) => Promise<Tag | null>,
  updatePostTagsFn: (tags: string[], userId: string) => Promise<void>,
  userId?: string
): TagManagementHook {
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);

  // Initialize tag options from existing tags
  useEffect(() => {
    if (initialTags) {
      setTagOptions(
        initialTags.map((tag) => ({
          label: tag.name,
          value: tag.id,
        }))
      );
    }
  }, [initialTags]);

  const handleTagsChange = useCallback((values: string[]) => {
    // Find new tags that don't exist in current options
    const newTags = values.filter(value =>
      !tagOptions.some(option => option.value === value)
    );

    // Add new tags to options
    if (newTags.length > 0) {
      const newOptions = newTags.map(tag => ({
        label: tag,
        value: tag
      }));
      setTagOptions(prev => [...prev, ...newOptions]);
    }

    onTagsChange(values);
  }, [tagOptions, onTagsChange]);

  const handleCreateTag = useCallback(async ({ label }: { label: string }) => {
    try {
      const result = await createTagFn({
        name: label,
        slug: label.toLowerCase().replace(/\s+/g, '-'),
      });
      
      if (!result) {
        throw new Error('Failed to create tag');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to create tag:', error);
      // TODO: Add toast notification
      throw error;
    }
  }, [createTagFn]);

  const handleTagsClose = useCallback(async () => {
    if (selectedTags.length > 0 && userId) {
      try {
        await updatePostTagsFn(selectedTags, userId);
      } catch (error) {
        console.error('Failed to update post tags:', error);
        // TODO: Add toast notification
      }
    }
  }, [selectedTags, updatePostTagsFn, userId]);

  return {
    tagOptions,
    handleTagsChange,
    handleCreateTag,
    handleTagsClose,
  };
}