"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CreateChartBlockInput } from "@/services/types";
import { ChartType } from "@/generated/prisma";
import { BaseBlockSidebarProps } from "@/components/sidebars/types";
import { BaseBlockSidebarLayout, BlockSidebarFooter, BlockSidebarHeader } from "@/components/sidebars/base-block-sidebar";
import { analyzeFileForChart } from "@/lib/data";
import { ChartOptions } from "@/lib/charts";
import { unwrap } from "@/lib/unwrap";

// Optimized sub-components
import { useChartConfiguration } from "./hooks/useChartConfiguration";
import { ChartTypeSelector } from "./components/ChartTypeSelector";
import { ChartBasicInfo } from "./components/ChartBasicInfo";
import { ChartDisplayOptions } from "./components/ChartDisplayOptions";
import { ChartFieldSelector } from "./components/ChartFieldSelector";
import { ChartFileUpload } from "./components/ChartFileUpload";

export const defaultCreateChartProps: CreateChartBlockInput = {
	type: ChartType.LINE,
	title: "",
	description: "",
	showGrid: true,
	showLegend: true,
	showFooter: true,
	stacked: false,
	connectNulls: false,
	fillOpacity: 0.3,
	strokeWidth: 2,
	barRadius: 4,
	innerRadius: 0,
	outerRadius: 100,
	showLabels: true,
	labelKey: "",
	valueKey: "",
	fileId: "",
	xAxis: "",
	yAxis: "",
	series: [],
};

export const ChartBlockSidebar = React.memo<BaseBlockSidebarProps<CreateChartBlockInput>>(({
	onClose, 
	onSave, 
	onDelete, 
	initialData, 
	isUpdate
}) => {
	const {
		config,
		handleTypeChange,
		handleFileSelect,
		handleFieldChange,
		buildChartInput,
	} = useChartConfiguration(initialData);

	const [chartOptions, setChartOptions] = useState<ChartOptions>({
		xAxisOptions: [],
		yAxisOptions: [],
		seriesOptions: [],
		chartTypes: [],
		suggestedConfig: {
			xAxis: '',
			yAxis: '',
			series: [],
			chartType: ChartType.BAR
		}
	});

	const [isAnalyzing, setIsAnalyzing] = useState(false);

	// Memoized handlers
	const handleTitleChange = useCallback((title: string) => {
		handleFieldChange('title', title);
	}, [handleFieldChange]);

	const handleDescriptionChange = useCallback((description: string) => {
		handleFieldChange('description', description);
	}, [handleFieldChange]);

	const handleShowGridChange = useCallback((showGrid: boolean) => {
		handleFieldChange('showGrid', showGrid);
	}, [handleFieldChange]);

	const handleShowLegendChange = useCallback((showLegend: boolean) => {
		handleFieldChange('showLegend', showLegend);
	}, [handleFieldChange]);

	const handleShowFooterChange = useCallback((showFooter: boolean) => {
		handleFieldChange('showFooter', showFooter);
	}, [handleFieldChange]);

	const handleXAxisChange = useCallback((xAxis: string) => {
		handleFieldChange('xAxis', xAxis);
	}, [handleFieldChange]);

	const handleYAxisChange = useCallback((yAxis: string) => {
		handleFieldChange('yAxis', yAxis);
	}, [handleFieldChange]);

	const handleSeriesChange = useCallback((series: string[]) => {
		handleFieldChange('series', series);
	}, [handleFieldChange]);

	const handleLabelKeyChange = useCallback((labelKey: string) => {
		handleFieldChange('labelKey', labelKey);
	}, [handleFieldChange]);

	const handleValueKeyChange = useCallback((valueKey: string) => {
		handleFieldChange('valueKey', valueKey);
	}, [handleFieldChange]);

	// File analysis effect
	useEffect(() => {
		if (!config.fileId) return;

		const analyzeFile = async () => {
			setIsAnalyzing(true);
			try {
				const analysis = await unwrap(analyzeFileForChart(config.fileId));
				setChartOptions(analysis);
			} catch (error) {
				console.error("Failed to analyze file:", error);
				setChartOptions({
					xAxisOptions: [],
					yAxisOptions: [],
					seriesOptions: [],
					chartTypes: [],
					suggestedConfig: {
						xAxis: '',
						yAxis: '',
						series: [],
						chartType: ChartType.BAR
					}
				});
			} finally {
				setIsAnalyzing(false);
			}
		};

		analyzeFile();
	}, [config.fileId]);

	// Memoized validation
	const isFormValid = useMemo(() => {
		if (!config.fileId) return false;
		
		if (config.type === ChartType.PIE) {
			return Boolean(config.labelKey && config.valueKey);
		}
		
		return Boolean(config.xAxis && config.yAxis && config.series.length > 0);
	}, [config.fileId, config.type, config.labelKey, config.valueKey, config.xAxis, config.yAxis, config.series]);

	// Memoized save handler
	const handleSave = useCallback(() => {
		if (!isFormValid) return;
		onSave(buildChartInput());
	}, [isFormValid, onSave, buildChartInput]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader 
					title={isUpdate ? "Edit Chart" : "Add Chart"} 
					onClose={onClose} 
				/>
			}
			footer={
				<BlockSidebarFooter 
					onSave={handleSave}
					onDelete={onDelete}
					isUpdate={isUpdate}
					isValid={isFormValid}
				/>
			}
		>
			<div className="space-y-6 p-4">
				<ChartTypeSelector 
					value={config.type} 
					onChange={handleTypeChange} 
				/>
				
				<ChartBasicInfo
					title={config.title}
					description={config.description}
					onTitleChange={handleTitleChange}
					onDescriptionChange={handleDescriptionChange}
				/>
				
				<ChartDisplayOptions
					showGrid={config.showGrid}
					showLegend={config.showLegend}
					showFooter={config.showFooter}
					onShowGridChange={handleShowGridChange}
					onShowLegendChange={handleShowLegendChange}
					onShowFooterChange={handleShowFooterChange}
				/>
				
				<ChartFileUpload
					fileId={config.fileId}
					onFileSelect={handleFileSelect}
				/>
				
				{config.fileId && !isAnalyzing && (
					<ChartFieldSelector
						xAxis={config.xAxis}
						yAxis={config.yAxis}
						series={config.series}
						labelKey={config.labelKey}
						valueKey={config.valueKey}
						xAxisOptions={chartOptions.xAxisOptions}
						yAxisOptions={chartOptions.yAxisOptions}
						seriesOptions={chartOptions.seriesOptions}
						chartType={config.type}
						onXAxisChange={handleXAxisChange}
						onYAxisChange={handleYAxisChange}
						onSeriesChange={handleSeriesChange}
						onLabelKeyChange={handleLabelKeyChange}
						onValueKeyChange={handleValueKeyChange}
					/>
				)}
				
				{isAnalyzing && (
					<div className="text-center py-4 text-muted-foreground">
						Analyzing file structure...
					</div>
				)}
			</div>
		</BaseBlockSidebarLayout>
	);
});

ChartBlockSidebar.displayName = 'ChartBlockSidebar';