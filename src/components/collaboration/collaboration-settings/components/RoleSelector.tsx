import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollaboratorRole } from '@/generated/prisma';

interface RoleSelectorProps {
  currentRole: CollaboratorRole;
  onRoleChange: (newRole: CollaboratorRole) => void;
  disabled?: boolean;
}

export const RoleSelector = React.memo<RoleSelectorProps>(({ 
  currentRole, 
  onRoleChange, 
  disabled 
}) => (
  <Select
    value={currentRole}
    onValueChange={(newRole) => onRoleChange(newRole as CollaboratorRole)}
    disabled={disabled}
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
));

RoleSelector.displayName = 'RoleSelector';