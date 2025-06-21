"use client";

import { useCallback, useState } from 'react';
import { CollaboratorRole } from '@/generated/prisma';
import { updateCollaboratorRole, unwrap } from '@/lib/data';

interface UseCollaboratorManagementHook {
  loading: string | null;
  handleRoleChange: (collaboratorId: string, userId: string, newRole: CollaboratorRole) => Promise<void>;
}

export function useCollaboratorManagement(
  postId: string,
  currentUserId: string | undefined,
  refreshCollaborators: () => void
): UseCollaboratorManagementHook {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = useCallback(async (
    collaboratorId: string,
    userId: string,
    newRole: CollaboratorRole
  ) => {
    if (!currentUserId) return;
    
    setLoading(collaboratorId);
    try {
      await unwrap(updateCollaboratorRole(postId, userId, newRole, currentUserId));
      refreshCollaborators();
    } catch (error) {
      console.error('Failed to update role:', error);
      // TODO: Add toast notification
    } finally {
      setLoading(null);
    }
  }, [postId, currentUserId, refreshCollaborators]);

  return {
    loading,
    handleRoleChange,
  };
}