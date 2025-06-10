"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPostActivity } from '@/lib/data';
import { unwrap } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit, Trash2, Move } from 'lucide-react';
import { RevisionType } from '@/generated/prisma';

interface ActivityItem {
  id: string;
  revisionType: RevisionType;
  summary: string;
  blocksAdded: number;
  blocksChanged: number;
  blocksRemoved: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface ActivitySidebarProps {
  postId: string;
  limit?: number;
}

export function ActivitySidebar({ postId, limit = 10 }: ActivitySidebarProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const result = await unwrap(getPostActivity(postId, limit));
        setActivities(result);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [postId, limit]);

  const getActivityIcon = (type: RevisionType) => {
    switch (type) {
      case 'DRAFT_SAVE': return <Edit className="h-3 w-3" />;
      case 'MAJOR_EDIT': return <Edit className="h-3 w-3" />;
      case 'REVIEW_NOTES': return <Edit className="h-3 w-3" />;
      default: return <Edit className="h-3 w-3" />;
    }
  };

  const getChangesSummary = (item: ActivityItem) => {
    const changes = [];
    if (item.blocksAdded > 0) changes.push(`+${item.blocksAdded}`);
    if (item.blocksChanged > 0) changes.push(`~${item.blocksChanged}`);
    if (item.blocksRemoved > 0) changes.push(`-${item.blocksRemoved}`);
    return changes.join(', ') || 'No changes';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border animate-pulse">
              <div className="h-9 w-9 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          See what your collaborators have been working on
        </p>
      </div>
      
      <ScrollArea className="h-80 pr-4">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Edit className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs text-muted-foreground">
                Start collaborating to see changes here
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="group flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage src={activity.user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {activity.user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border-2 border-background flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {activity.user.name || 'Unknown User'}
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
                      {getActivityIcon(activity.revisionType)}
                      <span className="font-medium">
                        {getChangesSummary(activity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}