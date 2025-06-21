"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollaboratorRole } from '@/generated/prisma';

interface Collaborator {
  id: string;
  role: CollaboratorRole;
  status: 'ACTIVE' | 'PENDING';
  joinedAt?: Date;
  name?: string;
  email: string;
  avatarUrl?: string | null;
}

interface CollaboratorItemProps {
  collaborator: Collaborator;
  loading: string | null;
  onRoleChange: (collaboratorId: string, userId: string, newRole: CollaboratorRole) => Promise<void>;
  getRoleBadgeColor: (role: CollaboratorRole) => string;
  getStatusText: (collaborator: Collaborator) => string;
  canManageRoles: (collaborator: Collaborator) => boolean;
  getUserDisplayName: (collaborator: Collaborator) => string;
  getUserInitials: (collaborator: Collaborator) => string;
}

export const CollaboratorItem = React.memo<CollaboratorItemProps>(({
  collaborator,
  loading,
  onRoleChange,
  getRoleBadgeColor,
  getStatusText,
  canManageRoles,
  getUserDisplayName,
  getUserInitials,
}) => {
  const handleRoleChange = React.useCallback((newRole: string) => {
    onRoleChange(collaborator.id, collaborator.id, newRole as CollaboratorRole);
  }, [collaborator.id, onRoleChange]);

  return (
    <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-background">
            <AvatarImage src={collaborator.avatarUrl || undefined} />
            <AvatarFallback className="text-sm font-medium">
              {getUserInitials(collaborator)}
            </AvatarFallback>
          </Avatar>
          {collaborator.role === 'OWNER' && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">★</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {getUserDisplayName(collaborator)}
            </span>
            <Badge 
              variant="secondary" 
              className={`${getRoleBadgeColor(collaborator.role)} text-xs`}
            >
              {collaborator.role.charAt(0) + collaborator.role.slice(1).toLowerCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {collaborator.email}
          </p>
          
          <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
            {getStatusText(collaborator)}
          </p>
        </div>

        {canManageRoles(collaborator) && (
          <div className="flex items-center gap-2">
            <Select
              value={collaborator.role}
              onValueChange={handleRoleChange}
              disabled={loading === collaborator.id}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTRIBUTOR">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Contributor
                  </div>
                </SelectItem>
                <SelectItem value="REVIEWER">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Reviewer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
});

CollaboratorItem.displayName = 'CollaboratorItem';