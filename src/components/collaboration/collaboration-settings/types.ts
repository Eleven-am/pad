import { CollaboratorRole } from '@/generated/prisma';

export interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  role: CollaboratorRole;
  avatarUrl: string | null;
  joinedAt: Date | null;
  status?: string;
}

export interface CollaborationSettingsProps {
  postId: string;
  currentUserId?: string;
}