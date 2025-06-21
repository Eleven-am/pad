"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProgressVariant } from '@/generated/prisma';

interface ProgressTrackerSectionProps {
  variant: ProgressVariant;
  showPercentage: boolean;
  onVariantChange: (variant: ProgressVariant) => void;
  onShowPercentageChange: (checked: boolean) => void;
}

export const ProgressTrackerSection = React.memo<ProgressTrackerSectionProps>(({
  variant,
  showPercentage,
  onVariantChange,
  onShowPercentageChange,
}) => {
  return (
    <>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">
          Progress Tracker Style
        </label>
        <Select value={variant} onValueChange={onVariantChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select progress style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProgressVariant.SUBTLE}>Subtle</SelectItem>
            <SelectItem value={ProgressVariant.VIBRANT}>Vibrant</SelectItem>
            <SelectItem value={ProgressVariant.CIRCULAR}>Circular</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <label htmlFor="show-percentage" className="text-sm font-medium">
          Show Progress Percentage
        </label>
        <Switch
          id="show-percentage"
          checked={showPercentage}
          onCheckedChange={onShowPercentageChange}
        />
      </div>
    </>
  );
});

ProgressTrackerSection.displayName = 'ProgressTrackerSection';