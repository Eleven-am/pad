"use client";

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMenu } from '@/components/menu';

import { 
  SidebarContainer, 
  SidebarHeader, 
  LoadingState, 
  SidebarContent 
} from '../sidebars/shared/sidebar-components';

import { usePostActivity } from './hooks/usePostActivity';
import { useActivityFormatting } from './hooks/useActivityFormatting';
import { ActivityItem } from './components/ActivityItem';
import { ActivityEmptyState } from './components/ActivityEmptyState';

interface ActivitySidebarProps {
  postId: string;
  limit?: number;
}

export const ActivitySidebar = React.memo<ActivitySidebarProps>(({ 
  postId, 
  limit = 10 
}) => {
  const { setCollaborateSubPanel } = useMenu();
  const { activities, loading, error } = usePostActivity(postId, limit);
  const formatting = useActivityFormatting();

  const handleBack = React.useCallback(() => {
    setCollaborateSubPanel(null);
  }, [setCollaborateSubPanel]);

  if (loading) {
    return (
      <SidebarContainer>
        <SidebarHeader 
          title="Recent Activity"
          showBackButton
          onBack={handleBack}
        />
        <SidebarContent>
          <LoadingState 
            count={3}
            message="Loading activity..." 
          />
        </SidebarContent>
      </SidebarContainer>
    );
  }

  if (error) {
    return (
      <SidebarContainer>
        <SidebarHeader 
          title="Recent Activity"
          showBackButton
          onBack={handleBack}
        />
        <SidebarContent>
          <div className="p-6 text-center">
            <p className="text-sm text-destructive">
              Failed to load activity: {error}
            </p>
          </div>
        </SidebarContent>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <SidebarHeader 
        title="Recent Activity"
        showBackButton
        onBack={handleBack}
      >
        <p className="text-sm text-muted-foreground">
          See what your collaborators have been working on
        </p>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-6">
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <ActivityEmptyState />
              ) : (
                activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    getActivityIconClass={formatting.getActivityIconClass}
                    getChangesSummary={formatting.getChangesSummary}
                    getUserDisplayName={formatting.getUserDisplayName}
                    getUserInitials={formatting.getUserInitials}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SidebarContent>
    </SidebarContainer>
  );
});

ActivitySidebar.displayName = 'ActivitySidebar';