"use client";

import { useCallback } from 'react';
import { RevisionType } from '@/generated/prisma';
import { ActivityItem } from './usePostActivity';

interface UseActivityFormattingHook {
  getActivityIconClass: (type: RevisionType) => string;
  getChangesSummary: (item: ActivityItem) => string;
  getUserDisplayName: (user: { name: string | null; id: string }) => string;
  getUserInitials: (user: { name: string | null; id: string }) => string;
}

export function useActivityFormatting(): UseActivityFormattingHook {
  const getActivityIconClass = useCallback((_type: RevisionType) => {
    // Return just the icon class name instead of JSX
    return "h-3 w-3";
  }, []);

  const getChangesSummary = useCallback((item: ActivityItem) => {
    const changes = [];
    if (item.blocksAdded > 0) changes.push(`+${item.blocksAdded}`);
    if (item.blocksChanged > 0) changes.push(`~${item.blocksChanged}`);
    if (item.blocksRemoved > 0) changes.push(`-${item.blocksRemoved}`);
    return changes.join(', ') || 'No changes';
  }, []);

  const getUserDisplayName = useCallback((user: { name: string | null; id: string }) => {
    return user.name || 'Unknown User';
  }, []);

  const getUserInitials = useCallback((user: { name: string | null; id: string }) => {
    return user.name?.[0]?.toUpperCase() || '?';
  }, []);

  return {
    getActivityIconClass,
    getChangesSummary,
    getUserDisplayName,
    getUserInitials,
  };
}