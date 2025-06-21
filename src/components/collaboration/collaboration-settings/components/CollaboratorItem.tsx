import React from 'react';
import { CollaboratorRole } from '@/generated/prisma';
import { Collaborator } from '../types';
import { canManageRoles } from '../utils';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { CollaboratorInfo } from './CollaboratorInfo';
import { RoleSelector } from './RoleSelector';

interface CollaboratorItemProps {
  collaborator: Collaborator;
  loading: boolean;
  onRoleChange: (collaboratorId: string, userId: string, newRole: CollaboratorRole) => void;
}

export const CollaboratorItem = React.memo<CollaboratorItemProps>(({ 
  collaborator, 
  loading,
  onRoleChange 
}) => (
  <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
    <div className="flex items-start gap-4">
      <CollaboratorAvatar collaborator={collaborator} />
      <CollaboratorInfo collaborator={collaborator} />
      
      {canManageRoles(collaborator) && (
        <div className="flex items-center gap-2">
          <RoleSelector
            currentRole={collaborator.role}
            onRoleChange={(newRole) => 
              onRoleChange(collaborator.id, collaborator.id, newRole)
            }
            disabled={loading}
          />
        </div>
      )}
    </div>
  </div>
));

CollaboratorItem.displayName = 'CollaboratorItem';