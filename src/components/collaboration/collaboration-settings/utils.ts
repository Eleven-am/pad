import { CollaboratorRole } from '@/generated/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Collaborator } from './types';

export function getRoleBadgeColor(role: CollaboratorRole): string {
  switch (role) {
    case 'OWNER': return 'bg-blue-100 text-blue-800';
    case 'CONTRIBUTOR': return 'bg-green-100 text-green-800';
    case 'REVIEWER': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(collaborator: Collaborator): string {
  if (collaborator.status === 'PENDING') return 'Invitation pending';
  if (collaborator.joinedAt) {
    return `Joined ${formatDistanceToNow(new Date(collaborator.joinedAt), { addSuffix: true })}`;
  }
  return 'Active';
}

export function canManageRoles(collaborator: Collaborator): boolean {
  return collaborator.role !== 'OWNER' && collaborator.status === 'ACTIVE';
}