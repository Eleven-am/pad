import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChartDisplayOptionsProps {
  showGrid: boolean;
  showLegend: boolean;
  showFooter: boolean;
  onShowGridChange: (value: boolean) => void;
  onShowLegendChange: (value: boolean) => void;
  onShowFooterChange: (value: boolean) => void;
}

export const ChartDisplayOptions = React.memo<ChartDisplayOptionsProps>(({
  showGrid,
  showLegend,
  showFooter,
  onShowGridChange,
  onShowLegendChange,
  onShowFooterChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Display Options</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={onShowGridChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-legend" className="text-sm">Show Legend</Label>
          <Switch
            id="show-legend"
            checked={showLegend}
            onCheckedChange={onShowLegendChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-footer" className="text-sm">Show Footer</Label>
          <Switch
            id="show-footer"
            checked={showFooter}
            onCheckedChange={onShowFooterChange}
          />
        </div>
      </div>
    </div>
  );
});

ChartDisplayOptions.displayName = 'ChartDisplayOptions';