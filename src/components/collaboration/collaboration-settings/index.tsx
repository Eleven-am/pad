"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import { useMenu } from '@/components/menu';
import { CollaborationSettingsProps } from './types';
import { useCollaborationSettings } from './hooks/useCollaborationSettings';
import { CollaboratorItem } from './components/CollaboratorItem';
import { RolePermissions } from './components/RolePermissions';

const Header = React.memo<{ onBack: () => void }>(({ onBack }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-1"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold tracking-tight">Manage Collaborators</h3>
    </div>
    <p className="text-sm text-muted-foreground">
      Control who can access and edit this post
    </p>
  </div>
));

Header.displayName = 'Header';

export function CollaborationSettings({ postId, currentUserId }: CollaborationSettingsProps) {
  const { setCollaborateSubPanel } = useMenu();
  const { collaborators, loading, handleRoleChange } = useCollaborationSettings(postId, currentUserId);

  const handleBack = React.useCallback(() => {
    setCollaborateSubPanel(null);
  }, [setCollaborateSubPanel]);

  return (
    <div className="p-6 space-y-6">
      <Header onBack={handleBack} />

      <ScrollArea className="h-80 pr-4">
        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <CollaboratorItem
              key={collaborator.id}
              collaborator={collaborator}
              loading={loading === collaborator.id}
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>
      </ScrollArea>

      <RolePermissions />
    </div>
  );
}