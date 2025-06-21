"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getPostCollaborators, canUserEditPost } from '@/lib/data';
import { unwrap } from '@/lib/data';
import { CollaboratorRole } from '@/generated/prisma';
import { CollaboratorWithUser } from '@/services/postCollaborationService';

interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  role: CollaboratorRole;
  avatarUrl: string | null;
  joinedAt: Date | null;
}

interface CollaborationContextValue {
  collaborators: Collaborator[];
  canEdit: boolean;
  canInvite: boolean;
  loading: boolean;
  refresh: () => void;
  userId?: string;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

interface CollaborationProviderProps {
  postId: string;
  userId?: string;
  children: React.ReactNode;
}

export function CollaborationProvider({ postId, userId, children }: CollaborationProviderProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [collaboratorsResult, canEditResult] = await Promise.all([
        unwrap(getPostCollaborators(postId)),
        userId ? unwrap(canUserEditPost(postId, userId)) : Promise.resolve(false)
      ]) as [CollaboratorWithUser[], boolean];

      setCollaborators(collaboratorsResult.map(c => ({
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        role: c.role,
        avatarUrl: c.user.avatarFile?.path || null,
        joinedAt: c.joinedAt
      })));
      
      setCanEdit(canEditResult);
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canInvite = canEdit && !!userId && collaborators.some(c => 
    c.email === userId && (c.role === 'OWNER' || c.role === 'CONTRIBUTOR')
  );

  const value: CollaborationContextValue = {
    collaborators,
    canEdit,
    canInvite,
    loading,
    refresh: fetchData,
    userId
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}