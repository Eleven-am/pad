"use client";

import { useCallback, useEffect, useState } from 'react';
import { ProgressVariant, ProgressTracker } from '@/generated/prisma';

interface ProgressTrackerState {
  variant: ProgressVariant;
  showPercentage: boolean;
}

interface ProgressTrackerActions {
  setVariant: (variant: ProgressVariant) => void;
  setShowPercentage: (show: boolean) => void;
}

interface ProgressTrackerHook {
  state: ProgressTrackerState;
  actions: ProgressTrackerActions;
}

export function useProgressTracker(
  initialTracker: ProgressTracker | null,
  postId: string | undefined,
  updateProgressTrackerFn: (postId: string, data: { variant: ProgressVariant; showPercentage: boolean }) => void
): ProgressTrackerHook {
  const [state, setState] = useState<ProgressTrackerState>({
    variant: ProgressVariant.SUBTLE,
    showPercentage: false,
  });

  // Update state when tracker changes
  useEffect(() => {
    if (initialTracker) {
      setState({
        variant: initialTracker.variant || ProgressVariant.SUBTLE,
        showPercentage: initialTracker.showPercentage || false,
      });
    }
  }, [initialTracker]);

  const setVariant = useCallback((variant: ProgressVariant) => {
    if (!postId) return;
    
    setState(prev => ({ ...prev, variant }));
    updateProgressTrackerFn(postId, {
      variant,
      showPercentage: state.showPercentage,
    });
  }, [postId, updateProgressTrackerFn, state.showPercentage]);

  const setShowPercentage = useCallback((showPercentage: boolean) => {
    if (!postId) return;
    
    setState(prev => ({ ...prev, showPercentage }));
    updateProgressTrackerFn(postId, {
      variant: state.variant,
      showPercentage,
    });
  }, [postId, updateProgressTrackerFn, state.variant]);

  return {
    state,
    actions: {
      setVariant,
      setShowPercentage,
    },
  };
}