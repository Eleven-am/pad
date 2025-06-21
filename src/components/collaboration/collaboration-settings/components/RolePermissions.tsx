import React from 'react';

const roles = [
  {
    name: 'Contributor',
    description: 'Can edit content and invite others',
    color: 'bg-green-500'
  },
  {
    name: 'Reviewer',
    description: 'Can view and comment only',
    color: 'bg-yellow-500'
  }
];

export const RolePermissions = React.memo(() => (
  <div className="pt-4 border-t space-y-4">
    <h4 className="font-medium text-sm">Role Permissions</h4>
    <div className="grid grid-cols-1 gap-3 text-sm">
      {roles.map((role) => (
        <div key={role.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <div className={`h-2 w-2 rounded-full ${role.color} mt-2`} />
          <div>
            <div className="font-medium">{role.name}</div>
            <div className="text-muted-foreground text-xs">{role.description}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

RolePermissions.displayName = 'RolePermissions';