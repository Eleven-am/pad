"use client";

import React from 'react';

export const RolePermissionsLegend = React.memo(() => {
  return (
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
  );
});

RolePermissionsLegend.displayName = 'RolePermissionsLegend';