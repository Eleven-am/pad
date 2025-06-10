"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CollaboratorRole } from '@/generated/prisma';
import { updateCollaboratorRole } from '@/lib/data';
import { unwrap } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useCollaboration } from './collaboration-provider';

interface CollaborationSettingsProps {
  postId: string;
  currentUserId?: string;
}

export function CollaborationSettings({ postId, currentUserId }: CollaborationSettingsProps) {
  const { collaborators, refresh } = useCollaboration();
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = async (collaboratorId: string, userId: string, newRole: CollaboratorRole) => {
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
  };

  const getRoleBadgeColor = (role: CollaboratorRole) => {
    switch (role) {
      case 'OWNER': return 'bg-blue-100 text-blue-800';
      case 'CONTRIBUTOR': return 'bg-green-100 text-green-800';
      case 'REVIEWER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (collaborator: Collaborator) => {
    if (collaborator.status === 'PENDING') return 'Invitation pending';
    if (collaborator.joinedAt) {
      return `Joined ${formatDistanceToNow(new Date(collaborator.joinedAt), { addSuffix: true })}`;
    }
    return 'Active';
  };

  const canManageRoles = (collaborator: Collaborator) => {
    return collaborator.role !== 'OWNER' && collaborator.status === 'ACTIVE';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Manage Collaborators</h3>
        <p className="text-sm text-muted-foreground">
          Control who can access and edit this post
        </p>
      </div>

      <ScrollArea className="h-80 pr-4">
        <div className="space-y-3">
          {collaborators.map((collaborator, index) => (
            <div key={collaborator.id} className="group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src={collaborator.avatarUrl || undefined} />
                    <AvatarFallback className="text-sm font-medium">
                      {collaborator.name?.split(' ').map(n => n[0]).join('') || 
                       collaborator.email[0].toUpperCase()}
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
                      {collaborator.name || 'Unknown User'}
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
                      onValueChange={(newRole) => 
                        handleRoleChange(collaborator.id, collaborator.id, newRole as CollaboratorRole)
                      }
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
          ))}
        </div>
      </ScrollArea>

      <div className="pt-4 border-t space-y-4">
        <h4 className="font-medium text-sm">Role Permissions</h4>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
            <div>
              <div className="font-medium">Contributor</div>
              <div className="text-muted-foreground text-xs">Can edit content and invite others</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
            <div>
              <div className="font-medium">Reviewer</div>
              <div className="text-muted-foreground text-xs">Can view and comment only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}