import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Collaborator } from '../types';
import { getRoleBadgeColor, getStatusText } from '../utils';

interface CollaboratorInfoProps {
  collaborator: Collaborator;
}

export const CollaboratorInfo = React.memo<CollaboratorInfoProps>(({ collaborator }) => (
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
));

CollaboratorInfo.displayName = 'CollaboratorInfo';