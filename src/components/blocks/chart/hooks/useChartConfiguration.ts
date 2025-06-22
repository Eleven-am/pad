import { useState, useCallback } from 'react';
import { ChartType, Orientation as ChartOrientation, LabelPosition } from '@/generated/prisma';
import { CreateChartBlockInput } from '@/services/types';

export interface ChartConfigurationState {
  type: ChartType;
  title: string;
  description: string;
  showGrid: boolean;
  showLegend: boolean;
  showFooter: boolean;
  stacked: boolean | null;
  connectNulls: boolean | null;
  fillOpacity: number | null;
  strokeWidth: number | null;
  barRadius: number | null;
  innerRadius: number | null;
  outerRadius: number | null;
  showLabels: boolean | null;
  labelKey: string;
  valueKey: string;
  orientation: ChartOrientation | null;
  labelPosition: LabelPosition | null;
  showDots: boolean | null;
  dotSize: number | null;
  startAngle: number | null;
  fileId: string;
  xAxis: string;
  yAxis: string;
  series: string[];
}

export function useChartConfiguration(initialData: CreateChartBlockInput) {
  const [config, setConfig] = useState<ChartConfigurationState>(() => ({
    type: initialData.type || ChartType.LINE,
    title: initialData.title || "",
    description: initialData.description || "",
    showGrid: initialData.showGrid ?? true,
    showLegend: initialData.showLegend ?? true,
    showFooter: initialData.showFooter ?? true,
    stacked: initialData.stacked ?? false,
    connectNulls: initialData.connectNulls ?? false,
    fillOpacity: initialData.fillOpacity ?? 0.3,
    strokeWidth: initialData.strokeWidth ?? 2,
    barRadius: initialData.barRadius ?? 4,
    innerRadius: initialData.innerRadius ?? 0,
    outerRadius: initialData.outerRadius ?? 100,
    showLabels: initialData.showLabels ?? true,
    labelKey: initialData.labelKey || "",
    valueKey: initialData.valueKey || "",
    orientation: initialData.orientation ?? null,
    labelPosition: initialData.labelPosition ?? null,
    showDots: initialData.showDots ?? null,
    dotSize: initialData.dotSize ?? null,
    startAngle: initialData.startAngle ?? null,
    fileId: initialData.fileId || "",
    xAxis: initialData.xAxis || "",
    yAxis: initialData.yAxis || "",
    series: initialData.series || [],
  }));

  const updateConfig = useCallback((updates: Partial<ChartConfigurationState>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleTypeChange = useCallback((newType: ChartType) => {
    updateConfig({ type: newType });
  }, [updateConfig]);

  const handleFileSelect = useCallback((fileId: string) => {
    updateConfig({ 
      fileId,
      xAxis: "",
      yAxis: "",
      series: [],
      labelKey: "",
      valueKey: ""
    });
  }, [updateConfig]);

  const handleFieldChange = useCallback((field: keyof ChartConfigurationState, value: unknown) => {
    updateConfig({ [field]: value });
  }, [updateConfig]);

  const buildChartInput = useCallback((): CreateChartBlockInput => {
    const {
      type,
      title,
      description,
      showGrid,
      showLegend,
      showFooter,
      stacked,
      connectNulls,
      fillOpacity,
      strokeWidth,
      barRadius,
      innerRadius,
      outerRadius,
      showLabels,
      labelKey,
      valueKey,
      orientation,
      labelPosition,
      showDots,
      dotSize,
      startAngle,
      fileId,
      xAxis,
      yAxis,
      series,
    } = config;

    return {
      type,
      title,
      description,
      showGrid,
      showLegend,
      showFooter,
      stacked: stacked ?? undefined,
      connectNulls: connectNulls ?? undefined,
      fillOpacity: fillOpacity ?? undefined,
      strokeWidth: strokeWidth ?? undefined,
      barRadius: barRadius ?? undefined,
      innerRadius: innerRadius ?? undefined,
      outerRadius: outerRadius ?? undefined,
      showLabels: showLabels ?? undefined,
      labelKey,
      valueKey,
      orientation: orientation ?? undefined,
      labelPosition: labelPosition ?? undefined,
      showDots: showDots ?? undefined,
      dotSize: dotSize ?? undefined,
      startAngle: startAngle ?? undefined,
      fileId,
      xAxis,
      yAxis,
      series,
    };
  }, [config]);

  return {
    config,
    updateConfig,
    handleTypeChange,
    handleFileSelect,
    handleFieldChange,
    buildChartInput,
  };
}