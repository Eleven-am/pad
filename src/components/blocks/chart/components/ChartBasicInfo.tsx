import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ChartBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const ChartBasicInfo = React.memo<ChartBasicInfoProps>(({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}) => {
  const handleTitleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
  }, [onTitleChange]);

  const handleDescriptionChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chart-title">Chart Title</Label>
        <Input
          id="chart-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter chart title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="chart-description">Description</Label>
        <Textarea
          id="chart-description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter chart description"
          rows={3}
        />
      </div>
    </div>
  );
});

ChartBasicInfo.displayName = 'ChartBasicInfo';