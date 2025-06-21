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
  scheduledDate: Date | undefined;
  hasBlocks: boolean;
  onDraftModeChange: (checked: boolean) => void;
  onScheduledDateChange: (date: Date | undefined) => void;
  onStartAddingBlocks: () => void;
  onPublish: () => Promise<void>;
}

export const PublishingSection = React.memo<PublishingSectionProps>(({
  isDraft,
  scheduledDate,
  hasBlocks,
  onDraftModeChange,
  onScheduledDateChange,
  onStartAddingBlocks,
  onPublish,
}) => {
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
        <Button
          className="w-full"
          variant={isDraft ? "outline" : "default"}
          disabled={isDraft}
          onClick={onPublish}
        >
          {isDraft ? "Draft Mode Active" : "Publish Post"}
        </Button>
        {isDraft && (
          <p className="text-sm text-muted-foreground text-center">
            Turn off draft mode to publish
          </p>
        )}
      </div>
    </div>
  );
});

PublishingSection.displayName = 'PublishingSection';