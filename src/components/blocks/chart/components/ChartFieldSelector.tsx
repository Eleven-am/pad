import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';
import { FieldOption } from '@/lib/charts';

interface FieldSelectProps {
  id: string;
  label: string;
  value: string;
  options: FieldOption[];
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface MultiFieldSelectProps {
  id: string;
  label: string;
  value: string[];
  options: FieldOption[];
  placeholder: string;
  onChange: (value: string[]) => void;
  required?: boolean;
}

const FieldSelect = React.memo<FieldSelectProps>(({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
  required = false,
}) => {
  const handleValueChange = React.useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  const memoizedOptions = React.useMemo(() => 
    options.map(option => (
      <SelectItem key={option.key} value={option.key}>
        {option.label}
      </SelectItem>
    )), [options]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {memoizedOptions}
        </SelectContent>
      </Select>
    </div>
  );
});

const MultiFieldSelect = React.memo<MultiFieldSelectProps>(({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
  required = false,
}) => {
  const memoizedSelectOptions = React.useMemo(() =>
    options.map(option => ({
      value: option.key,
      label: option.label,
    })), [options]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <MultiSelect
        options={memoizedSelectOptions}
        defaultValue={value}
        onValueChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
});

interface ChartFieldSelectorProps {
  xAxis: string;
  yAxis: string;
  series: string[];
  labelKey: string;
  valueKey: string;
  xAxisOptions: FieldOption[];
  yAxisOptions: FieldOption[];
  seriesOptions: FieldOption[];
  chartType: string;
  onXAxisChange: (value: string) => void;
  onYAxisChange: (value: string) => void;
  onSeriesChange: (value: string[]) => void;
  onLabelKeyChange: (value: string) => void;
  onValueKeyChange: (value: string) => void;
}

export const ChartFieldSelector = React.memo<ChartFieldSelectorProps>(({
  xAxis,
  yAxis,
  series,
  labelKey,
  valueKey,
  xAxisOptions,
  yAxisOptions,
  seriesOptions,
  chartType,
  onXAxisChange,
  onYAxisChange,
  onSeriesChange,
  onLabelKeyChange,
  onValueKeyChange,
}) => {
  const showAxisFields = React.useMemo(() => 
    chartType !== 'PIE', [chartType]
  );

  const showPieFields = React.useMemo(() => 
    chartType === 'PIE', [chartType]
  );

  const labelFieldOptions = React.useMemo(() => 
    xAxisOptions.concat(seriesOptions), [xAxisOptions, seriesOptions]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Field Mapping</h3>
      
      {showAxisFields && (
        <>
          <FieldSelect
            id="x-axis"
            label="X Axis"
            value={xAxis}
            options={xAxisOptions}
            placeholder="Select X axis field"
            onChange={onXAxisChange}
            required
          />
          
          <FieldSelect
            id="y-axis"
            label="Y Axis"
            value={yAxis}
            options={yAxisOptions}
            placeholder="Select Y axis field"
            onChange={onYAxisChange}
            required
          />
          
          <MultiFieldSelect
            id="series"
            label="Series"
            value={series}
            options={seriesOptions}
            placeholder="Select series fields"
            onChange={onSeriesChange}
            required
          />
        </>
      )}
      
      {showPieFields && (
        <>
          <FieldSelect
            id="label-key"
            label="Label Field"
            value={labelKey}
            options={labelFieldOptions}
            placeholder="Select label field"
            onChange={onLabelKeyChange}
            required
          />
          
          <FieldSelect
            id="value-key"
            label="Value Field"
            value={valueKey}
            options={yAxisOptions}
            placeholder="Select value field"
            onChange={onValueKeyChange}
            required
          />
        </>
      )}
    </div>
  );
});

FieldSelect.displayName = 'FieldSelect';
MultiFieldSelect.displayName = 'MultiFieldSelect';
ChartFieldSelector.displayName = 'ChartFieldSelector';