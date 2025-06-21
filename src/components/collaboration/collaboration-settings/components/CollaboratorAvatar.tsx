import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collaborator } from '../types';

interface CollaboratorAvatarProps {
  collaborator: Collaborator;
}

export const CollaboratorAvatar = React.memo<CollaboratorAvatarProps>(({ collaborator }) => (
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
));

CollaboratorAvatar.displayName = 'CollaboratorAvatar';