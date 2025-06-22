import React from 'react';
import { ChartType } from '@/generated/prisma';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
}

const CHART_TYPE_OPTIONS = [
  { value: ChartType.LINE, label: 'Line Chart' },
  { value: ChartType.AREA, label: 'Area Chart' },
  { value: ChartType.BAR, label: 'Bar Chart' },
  { value: ChartType.PIE, label: 'Pie Chart' },
] as const;

export const ChartTypeSelector = React.memo<ChartTypeSelectorProps>(({ value, onChange }) => {
  const handleValueChange = React.useCallback((newValue: string) => {
    onChange(newValue as ChartType);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="chart-type">Chart Type</Label>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id="chart-type">
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          {CHART_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

ChartTypeSelector.displayName = 'ChartTypeSelector';