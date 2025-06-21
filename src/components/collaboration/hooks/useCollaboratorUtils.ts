"use client";

import { useCallback } from 'react';
import { CollaboratorRole } from '@/generated/prisma';
import { formatDistanceToNow } from 'date-fns';

interface Collaborator {
  id: string;
  role: CollaboratorRole;
  status: 'ACTIVE' | 'PENDING';
  joinedAt?: Date;
  name?: string;
  email: string;
  avatarUrl?: string | null;
}

interface UseCollaboratorUtilsHook {
  getRoleBadgeColor: (role: CollaboratorRole) => string;
  getStatusText: (collaborator: Collaborator) => string;
  canManageRoles: (collaborator: Collaborator) => boolean;
  getUserDisplayName: (collaborator: Collaborator) => string;
  getUserInitials: (collaborator: Collaborator) => string;
}

export function useCollaboratorUtils(): UseCollaboratorUtilsHook {
  const getRoleBadgeColor = useCallback((role: CollaboratorRole) => {
    switch (role) {
      case 'OWNER': 
        return 'bg-blue-100 text-blue-800';
      case 'CONTRIBUTOR': 
        return 'bg-green-100 text-green-800';
      case 'REVIEWER': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusText = useCallback((collaborator: Collaborator) => {
    if (collaborator.status === 'PENDING') return 'Invitation pending';
    if (collaborator.joinedAt) {
      return `Joined ${formatDistanceToNow(new Date(collaborator.joinedAt), { addSuffix: true })}`;
    }
    return 'Active';
  }, []);

  const canManageRoles = useCallback((collaborator: Collaborator) => {
    return collaborator.role !== 'OWNER' && collaborator.status === 'ACTIVE';
  }, []);

  const getUserDisplayName = useCallback((collaborator: Collaborator) => {
    return collaborator.name || 'Unknown User';
  }, []);

  const getUserInitials = useCallback((collaborator: Collaborator) => {
    return collaborator.name?.split(' ').map(n => n[0]).join('') || 
           collaborator.email[0].toUpperCase();
  }, []);

  return {
    getRoleBadgeColor,
    getStatusText,
    canManageRoles,
    getUserDisplayName,
    getUserInitials,
  };
}