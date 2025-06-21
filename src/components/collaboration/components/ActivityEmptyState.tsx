"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { EmptyState } from '@/components/sidebars/shared/sidebar-components';

export const ActivityEmptyState = React.memo(() => {
  return (
    <EmptyState
      icon={<Edit className="h-5 w-5 text-muted-foreground" />}
      title="No activity yet"
      description="Start collaborating to see changes here"
    />
  );
});

ActivityEmptyState.displayName = 'ActivityEmptyState';