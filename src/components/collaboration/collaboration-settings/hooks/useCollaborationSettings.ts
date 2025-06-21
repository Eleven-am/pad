import { useState, useCallback } from 'react';
import { CollaboratorRole } from '@/generated/prisma';
import { updateCollaboratorRole } from '@/lib/data';
import { unwrap } from '@/lib/data';
import { useCollaboration } from '../../collaboration-provider';

export function useCollaborationSettings(postId: string, currentUserId?: string) {
  const { collaborators, refresh } = useCollaboration();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = useCallback(async (
    collaboratorId: string, 
    userId: string, 
    newRole: CollaboratorRole
  ) => {
    setLoading(collaboratorId);
    try {
      await unwrap(updateCollaboratorRole(postId, userId, newRole, currentUserId || ''));
      refresh();
    } catch (error) {
      console.error('Failed to update role:', error);
      // TODO: Add toast notification
    } finally {
      setLoading(null);
    }
  }, [postId, currentUserId, refresh]);

  return {
    collaborators,
    loading,
    handleRoleChange
  };
}