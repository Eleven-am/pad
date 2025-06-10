"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Activity } from 'lucide-react';
import { InviteCollaboratorModal } from './invite-collaborator-modal';
import { ActivitySidebar } from './activity-sidebar';
import { CollaborationSettings } from './collaboration-settings';
import { useCollaboration } from './collaboration-provider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface CollaborationHeaderProps {
  postId: string;
}

export function CollaborationHeader({ postId }: CollaborationHeaderProps) {
  const { collaborators, canInvite, loading } = useCollaboration();
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (loading) {
    return (
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTimeAgo = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-blue-100 text-blue-800';
      case 'CONTRIBUTOR': return 'bg-green-100 text-green-800';
      case 'REVIEWER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Collaborators</span>
            </div>
            
            <div className="flex items-center -space-x-2">
              {collaborators.slice(0, 3).map((collaborator) => (
                <div key={collaborator.id} className="relative group">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={collaborator.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name?.split(' ').map(n => n[0]).join('') || collaborator.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <div className="font-medium">{collaborator.name || collaborator.email}</div>
                    <div className="text-muted-foreground">
                      {collaborator.role} {getTimeAgo(collaborator.lastActive)}
                    </div>
                  </div>
                </div>
              ))}
              
              {collaborators.length > 3 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canInvite && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInviteModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Invite
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Activity
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80" hideClose>
                <ActivitySidebar postId={postId} />
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80" hideClose>
                <CollaborationSettings postId={postId} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <InviteCollaboratorModal 
        postId={postId}
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </div>
  );
}