"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PublishingSectionProps {
  isDraft: boolean;
  isPublished: boolean;
  scheduledDate: Date | undefined;
  publishedAt: Date | null | undefined;
  hasBlocks: boolean;
  onDraftModeChange: (checked: boolean) => void;
  onScheduledDateChange: (date: Date | undefined) => void;
  onStartAddingBlocks: () => void;
  onPublish: () => Promise<void>;
  onSchedulePublish: () => Promise<void>;
}

export const PublishingSection = React.memo<PublishingSectionProps>(({
  isDraft,
  isPublished,
  scheduledDate,
  publishedAt,
  hasBlocks,
  onDraftModeChange,
  onScheduledDateChange,
  onStartAddingBlocks,
  onPublish,
  onSchedulePublish,
}) => {
  // Determine if post is scheduled for future
  const isScheduledFuture = publishedAt && new Date(publishedAt) > new Date();
  const isPublishedNow = isPublished && publishedAt && new Date(publishedAt) <= new Date();
  return (
    <div className="flex flex-col space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <label htmlFor="draft-mode" className="text-sm font-medium">
          Draft Mode
        </label>
        <Switch
          id="draft-mode"
          checked={isDraft}
          onCheckedChange={onDraftModeChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Schedule Post
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={scheduledDate}
              onSelect={onScheduledDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className="w-full"
        variant="secondary"
        onClick={onStartAddingBlocks}
      >
        {hasBlocks ? "Add More Blocks" : "Start Adding Blocks"}
      </Button>

      <div className="flex flex-col space-y-2 pt-4 border-t">
        {/* Publish immediately button */}
        <Button
          className="w-full"
          variant={isDraft || isPublishedNow ? "outline" : "default"}
          disabled={!!isDraft || !!isPublishedNow}
          onClick={onPublish}
        >
          {isDraft 
            ? "Draft Mode Active" 
            : isPublishedNow
              ? "Already Published" 
              : "Publish Now"}
        </Button>
        
        {/* Schedule publish button */}
        {scheduledDate && !isDraft && (
          <Button
            className="w-full"
            variant="secondary"
            onClick={onSchedulePublish}
            disabled={!!isScheduledFuture}
          >
            {isScheduledFuture
              ? `Scheduled for ${format(scheduledDate, "PPP")}`
              : `Schedule for ${format(scheduledDate, "PPP")}`}
          </Button>
        )}
        
        {/* Status messages */}
        {isDraft && (
          <p className="text-sm text-muted-foreground text-center">
            Turn off draft mode to publish
          </p>
        )}
        {!isDraft && isPublishedNow && (
          <p className="text-sm text-muted-foreground text-center">
            Post is live. Use Save to update changes.
          </p>
        )}
        {!isDraft && isScheduledFuture && (
          <p className="text-sm text-muted-foreground text-center">
            Post will go live on {format(new Date(publishedAt), "PPP 'at' p")}.
          </p>
        )}
      </div>
    </div>
  );
});

PublishingSection.displayName = 'PublishingSection';