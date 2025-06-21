"use client";

import { useCallback, useEffect, useState } from 'react';
import { getPostActivity, unwrap } from '@/lib/data';
import { RevisionType } from '@/generated/prisma';

export interface ActivityItem {
  id: string;
  revisionType: RevisionType;
  summary: string;
  blocksAdded: number;
  blocksChanged: number;
  blocksRemoved: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface UsePostActivityHook {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePostActivity(postId: string, limit: number = 10): UsePostActivityHook {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await unwrap(getPostActivity(postId, limit));
      // Transform RevisionWithUser to ActivityItem
      const transformedActivities: ActivityItem[] = result.map((revision) => ({
        id: revision.id,
        revisionType: revision.revisionType,
        summary: revision.summary,
        blocksAdded: revision.blocksAdded,
        blocksChanged: revision.blocksChanged,
        blocksRemoved: revision.blocksRemoved,
        createdAt: revision.createdAt,
        user: {
          id: revision.user.id,
          name: revision.user.name,
          avatarUrl: revision.user.avatarFile?.path || null
        }
      }));
      setActivities(transformedActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity';
      setError(errorMessage);
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, limit]);

  const refetch = useCallback(async () => {
    await fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activities,
    loading,
    error,
    refetch,
  };
}