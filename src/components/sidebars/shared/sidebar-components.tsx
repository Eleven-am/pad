"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SidebarHeaderProps, LoadingStateProps, EmptyStateProps, SIDEBAR_CONSTANTS } from './sidebar-types';

export const SidebarHeader = React.memo<SidebarHeaderProps>(({ 
  title, 
  onBack, 
  showBackButton = false, 
  children 
}) => {
  return (
    <div className={`flex flex-col w-full ${SIDEBAR_CONSTANTS.SPACING.PADDING} ${SIDEBAR_CONSTANTS.SPACING.HEADER_GAP} border-b border-border`}>
      <div className="flex items-center justify-between">
        {showBackButton && onBack ? (
          <div className={`flex items-center ${SIDEBAR_CONSTANTS.SPACING.BUTTON_GAP}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="p-1"
            >
              <ArrowLeft className={SIDEBAR_CONSTANTS.SIZES.ICON} />
            </Button>
            <h3 className="text-lg font-semibold tracking-tight">
              {title}
            </h3>
          </div>
        ) : (
          <h3 className="text-lg font-semibold tracking-tight">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export const LoadingState = React.memo<LoadingStateProps>(({ 
  count = 3, 
  message: _message = "Loading..." 
}) => {
  return (
    <div className={`${SIDEBAR_CONSTANTS.SPACING.PADDING} ${SIDEBAR_CONSTANTS.SPACING.CONTENT_GAP}`}>
      <div className={SIDEBAR_CONSTANTS.SPACING.HEADER_GAP}>
        <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      </div>
      <div className={SIDEBAR_CONSTANTS.SPACING.CONTENT_GAP}>
        {Array.from({ length: count }).map((_, i) => (
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
});

LoadingState.displayName = 'LoadingState';

export const EmptyState = React.memo<EmptyStateProps>(({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export const SidebarContainer = React.memo<{ children: React.ReactNode; className?: string }>(({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
});

SidebarContainer.displayName = 'SidebarContainer';

export const SidebarContent = React.memo<{ children: React.ReactNode; className?: string }>(({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      {children}
    </div>
  );
});

SidebarContent.displayName = 'SidebarContent';

export const ScrollableContent = React.memo<{ children: React.ReactNode; className?: string }>(({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`overflow-y-auto ${SIDEBAR_CONSTANTS.SCROLL.BOTTOM_PADDING} ${className}`}>
      {children}
    </div>
  );
});

ScrollableContent.displayName = 'ScrollableContent';