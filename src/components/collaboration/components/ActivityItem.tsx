"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Edit } from 'lucide-react';
import { ActivityItem as ActivityItemType } from '../hooks/usePostActivity';
import { RevisionType } from '@/generated/prisma';

interface ActivityItemProps {
  activity: ActivityItemType;
  getActivityIconClass: (type: RevisionType) => string;
  getChangesSummary: (item: ActivityItemType) => string;
  getUserDisplayName: (user: { name: string | null; id: string }) => string;
  getUserInitials: (user: { name: string | null; id: string }) => string;
}

export const ActivityItem = React.memo<ActivityItemProps>(({
  activity,
  getActivityIconClass,
  getChangesSummary,
  getUserDisplayName,
  getUserInitials,
}) => {
  return (
    <div className="group flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="relative">
        <Avatar className="h-9 w-9 border-2 border-background">
          <AvatarImage src={activity.user.avatarUrl || undefined} />
          <AvatarFallback className="text-xs font-medium">
            {getUserInitials(activity.user)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border-2 border-background flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {getUserDisplayName(activity.user)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {activity.summary}
        </p>
        
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            <Edit className={getActivityIconClass(activity.revisionType)} />
            <span className="font-medium">
              {getChangesSummary(activity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';