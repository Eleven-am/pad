"use client";

import { useCallback, useEffect, useReducer } from 'react';
import { createFormReducer } from '../../shared/sidebar-utils';
import { PostWithDetails } from '@/services/postService';

interface PostFormState {
  blogName: string;
  isDraft: boolean;
  scheduledDate: Date | undefined;
  category: string;
  selectedTags: string[];
}

interface PostFormActions {
  setBlogName: (name: string) => void;
  setIsDraft: (isDraft: boolean) => void;
  setScheduledDate: (date: Date | undefined) => void;
  setCategory: (category: string) => void;
  setSelectedTags: (tags: string[]) => void;
  resetForm: () => void;
}

export function usePostForm(initialPost: PostWithDetails | null): [PostFormState, PostFormActions] {
  const initialState: PostFormState = {
    blogName: initialPost?.title || "",
    isDraft: !initialPost?.published || true,
    scheduledDate: initialPost?.scheduledAt ? new Date(initialPost.scheduledAt) : undefined,
    category: initialPost?.categoryId || "",
    selectedTags: initialPost?.postTags?.map((tag) => tag.tagId) || [],
  };

  const reducer = createFormReducer(initialState);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Update form when post changes
  useEffect(() => {
    if (initialPost) {
      dispatch({
        type: 'UPDATE',
        payload: {
          blogName: initialPost.title || "",
          isDraft: !initialPost.published || true,
          scheduledDate: initialPost.scheduledAt ? new Date(initialPost.scheduledAt) : undefined,
          category: initialPost.categoryId || "",
          selectedTags: initialPost.postTags?.map((tag) => tag.tagId) || [],
        }
      });
    }
  }, [initialPost]);

  const actions: PostFormActions = {
    setBlogName: useCallback((name: string) => {
      dispatch({ type: 'UPDATE', payload: { blogName: name } });
    }, []),

    setIsDraft: useCallback((isDraft: boolean) => {
      dispatch({ type: 'UPDATE', payload: { isDraft } });
    }, []),

    setScheduledDate: useCallback((date: Date | undefined) => {
      dispatch({ type: 'UPDATE', payload: { scheduledDate: date } });
    }, []),

    setCategory: useCallback((category: string) => {
      dispatch({ type: 'UPDATE', payload: { category } });
    }, []),

    setSelectedTags: useCallback((tags: string[]) => {
      dispatch({ type: 'UPDATE', payload: { selectedTags: tags } });
    }, []),

    resetForm: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),
  };

  return [state, actions];
}