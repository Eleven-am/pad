import type { ChartConfig } from "@/components/ui/chart.tsx";
import { ChartType } from "@/generated/prisma";

export enum FieldType {
	TEXT = 'text',
	NUMBER = 'number',
	DATE = 'date',
	BOOLEAN = 'boolean'
}

export type DataValue = string | number | boolean | Date | null | undefined;

export type ChartDataValue = string | number | Date | null | undefined;

export type DataRow = Record<string, DataValue>;

export interface FieldOption {
	key: string;
	label: string;
	type: FieldType;
	uniqueValues: number;
	sampleValues?: DataValue[];
}

export interface ChartOptions {
	xAxisOptions: FieldOption[];
	yAxisOptions: FieldOption[];
	seriesOptions: FieldOption[];
	chartTypes: ChartType[];
	suggestedConfig: {
		xAxis: string;
		yAxis: string;
		series: string[];
		chartType: ChartType;
	};
}

export interface ChartSelections {
	xAxis: string;
	yAxis: string;
	series: string[];
	chartType: string;
}

export interface PreparedChartData {
	data: DataRow[];
	xAxisKey: string;
	yAxisKey: string | null;
	seriesKeys: string[];
	colors: string[];
}

export interface Trend {
	change: number;
	isPositive: boolean;
	isFlat: boolean;
}

interface FilteredOptions {
	yAxisOptions: FieldOption[];
	seriesOptions: FieldOption[];
	validChartTypes: ChartType[];
	warnings: string[];
	suggestions: string[];
}

interface SeriesComplexity {
	estimatedSeriesCount: number;
	estimatedDataPoints: number;
	complexity: 'low' | 'medium' | 'high' | 'extreme';
	shouldBlock: boolean;
}

function calculateSeriesComplexity(
	xField: FieldOption,
	selectedSeries: FieldOption[],
	chartType?: ChartType
): SeriesComplexity {
	if (selectedSeries.length === 0) {
		return {
			estimatedSeriesCount: 1,
			estimatedDataPoints: xField.uniqueValues,
			complexity: 'low',
			shouldBlock: false
		};
	}
	
	const estimatedSeriesCount = selectedSeries.reduce(
		(total, field) => total * field.uniqueValues,
		1
	);
	
	const estimatedDataPoints = xField.uniqueValues * estimatedSeriesCount;
	
	let maxSeries: number;
	let maxDataPoints: number;
	
	switch (chartType) {
		case ChartType.PIE:
			maxSeries = 1; // Pie charts can't handle multiple series
			maxDataPoints = 12; // Max slices for readability
			break;
		case ChartType.LINE:
		case ChartType.AREA:
			maxSeries = xField.uniqueValues > 20 ? 3 : 8;
			maxDataPoints = 200;
			break;
		case ChartType.BAR:
			maxSeries = xField.uniqueValues > 15 ? 4 : 10;
			maxDataPoints = 300;
			break;
		default:
			maxSeries = 8;
			maxDataPoints = 200;
	}
	
	let complexity: SeriesComplexity['complexity'];
	let shouldBlock = false;
	
	if (estimatedSeriesCount <= 3 && estimatedDataPoints <= maxDataPoints * 0.5) {
		complexity = 'low';
	} else if (estimatedSeriesCount <= 6 && estimatedDataPoints <= maxDataPoints * 0.75) {
		complexity = 'medium';
	} else if (estimatedSeriesCount <= maxSeries && estimatedDataPoints <= maxDataPoints) {
		complexity = 'high';
	} else {
		complexity = 'extreme';
		shouldBlock = true;
	}
	
	return {
		estimatedSeriesCount,
		estimatedDataPoints,
		complexity,
		shouldBlock
	};
}

export function getCompatibleOptions(
	chartOptions: ChartOptions | null,
	selectedXAxis: string,
	selectedSeries: string[] = [],
	chartType: ChartType
): FilteredOptions {
	if (!chartOptions || !chartOptions.xAxisOptions || chartOptions.xAxisOptions.length === 0) {
		return {
			yAxisOptions: [],
			seriesOptions: [],
			validChartTypes: [],
			warnings: ["No X-axis options available"],
			suggestions: []
		};
	}
	
	const xField = chartOptions.xAxisOptions.find(field => field.key === selectedXAxis);
	
	if (!xField) {
		return {
			yAxisOptions: [],
			seriesOptions: [],
			validChartTypes: [],
			warnings: [],
			suggestions: []
		};
	}
	
	const warnings: string[] = [];
	const suggestions: string[] = [];
	
	const selectedSeriesFields = selectedSeries
		.map(seriesKey => chartOptions.seriesOptions.find(field => field.key === seriesKey))
		.filter((field): field is FieldOption => field !== undefined);
	
	const complexity = calculateSeriesComplexity(xField, selectedSeriesFields, chartType);
	
	const yAxisOptions = chartOptions.yAxisOptions.filter(yField => {
		if (yField.key === selectedXAxis) return false;
		return yField.type === FieldType.NUMBER;
	});
	
	const seriesOptions = chartOptions.seriesOptions.filter(seriesField => {
		if (seriesField.key === selectedXAxis) return false;
		
		if (seriesField.type === FieldType.NUMBER) return false;
		
		const testSeriesFields = [...selectedSeriesFields, seriesField];
		const testComplexity = calculateSeriesComplexity(xField, testSeriesFields, chartType);
		
		if (testComplexity.shouldBlock) {
			return false;
		}
		
		return ! (xField.uniqueValues > 15 && seriesField.uniqueValues > 4);
	});
	
	const validChartTypes: ChartType[] = [];
	
	switch (xField.type) {
		case FieldType.DATE:
			validChartTypes.push(ChartType.LINE, ChartType.AREA);
			if (xField.uniqueValues <= 12 && complexity.estimatedSeriesCount <= 5) {
				validChartTypes.push(ChartType.BAR);
			}
			break;
		
		case FieldType.TEXT:
			validChartTypes.push(ChartType.BAR);
			// Pie charts only work with single series or no series
			if (xField.uniqueValues <= 8 && selectedSeries.length <= 1) {
				validChartTypes.push(ChartType.PIE);
			}
			break;
		
		case FieldType.NUMBER:
			validChartTypes.push(ChartType.LINE, ChartType.AREA);
			if (complexity.estimatedSeriesCount <= 6) {
				validChartTypes.push(ChartType.BAR);
			}
			break;
		
		case FieldType.BOOLEAN:
			validChartTypes.push(ChartType.BAR);
			if (selectedSeries.length <= 1) {
				validChartTypes.push(ChartType.PIE);
			}
			break;
	}
	
	if (selectedSeries.length === 0) {
		suggestions.push("Consider adding a series field to compare different categories");
	} else {
		switch (complexity.complexity) {
			case 'low':
				break;
			
			case 'medium':
				suggestions.push (`Chart will show ${complexity.estimatedSeriesCount} series - ensure they're meaningful to compare`);
				break;
			
			case 'high':
				warnings.push (`High complexity: ${complexity.estimatedSeriesCount} series may make chart harder to read`);
				suggestions.push ("Consider grouping similar categories or using fewer series fields");
				break;
			
			case 'extreme':
				warnings.push (`Too complex: ${complexity.estimatedSeriesCount} series would create an unreadable chart`);
				suggestions.push ("Reduce series fields or filter your data before charting");
				break;
		}
	}
	
	if (xField.uniqueValues > 20) {
		warnings.push(`High number of categories (${xField.uniqueValues}) may create cluttered chart`);
		suggestions.push("Consider grouping categories or filtering to top values");
	}
	
	if (complexity.estimatedDataPoints > 150) {
		warnings.push(`High data density (${complexity.estimatedDataPoints} points) may impact readability`);
	}

	if (selectedSeries.length > 1) {
		const seriesTypes = selectedSeriesFields.map(f => f.type);
		const hasOnlyText = seriesTypes.every(type => type === FieldType.TEXT);
		
		if (hasOnlyText) {
			suggestions.push("Multiple categorical series create hierarchical grouping - ensure this adds value");
		}
	}
	
	if (chartType === ChartType.PIE && selectedSeries.length > 1) {
		warnings.push("Pie charts cannot display multiple series - only first series will be used");
	}
	
	if (yAxisOptions.length === 0) {
		warnings.push("No suitable numeric fields available for Y-axis");
	}
	
	if (seriesOptions.length === 0 && selectedSeries.length === 0) {
		suggestions.push("No additional series options available - chart will show single data series");
	}
	
	if (xField.uniqueValues === 1) {
		warnings.push("X-axis field has only one unique value - chart may not be meaningful");
	}
	
	return {
		yAxisOptions,
		seriesOptions,
		validChartTypes,
		warnings,
		suggestions
	};
}

export function prepareChartData(
	data: DataRow[],
	userSelections: ChartSelections
): PreparedChartData {
	if (!data || data.length === 0) {
		return {
			data: [],
			xAxisKey: '',
			yAxisKey: null,
			seriesKeys: [],
			colors: []
		};
	}
	
	const { xAxis, yAxis, series } = userSelections;
	
	const availableKeys = new Set<string>();
	data.forEach(row => {
		Object.keys(row).forEach(key => availableKeys.add(key));
	});
	
	if (!availableKeys.has(xAxis)) {
		throw new Error(`X-axis field "${xAxis}" not found in data`);
	}
	
	if (!availableKeys.has(yAxis)) {
		throw new Error(`Y-axis field "${yAxis}" not found in data`);
	}
	
	// Validate all series fields exist
	const invalidSeries = series.filter(s => !availableKeys.has(s));
	if (invalidSeries.length > 0) {
		throw new Error(`Series fields not found: ${invalidSeries.join(', ')}`);
	}
	
	let transformedData: DataRow[];
	let seriesKeys: string[] = [];
	
	if (series.length === 0) {
		// No series grouping
		transformedData = data;
	} else if (series.length === 1) {
		// Single series field
		transformedData = groupDataForSeries(data, xAxis, yAxis, series[0]);
		seriesKeys = getUniqueSeriesValues(data, series[0]);
	} else {
		// Multiple series fields - create hierarchical combinations
		transformedData = groupDataForMultipleSeries(data, xAxis, yAxis, series);
		seriesKeys = getMultipleSeriesKeys(data, series);
	}
	
	const colors = generateColors(seriesKeys.length || 1);
	
	return {
		data: transformedData,
		xAxisKey: xAxis,
		yAxisKey: series.length === 0 ? yAxis : null,
		seriesKeys,
		colors
	};
}

function groupDataForMultipleSeries(
	data: DataRow[],
	xKey: string,
	yKey: string,
	seriesKeys: string[]
): DataRow[] {
	const grouped = new Map<DataValue, DataRow>();
	
	data.forEach(row => {
		const xValue = row[xKey];
		const yValue = row[yKey];
		
		if (xValue == null || yValue == null) {
			return;
		}
		
		// Create hierarchical series key from all series fields
		const seriesValues = seriesKeys.map(key => row[key]).filter(val => val != null);
		if (seriesValues.length !== seriesKeys.length) {
			return; // Skip if any series value is missing
		}
		
		const hierarchicalSeriesKey = seriesValues.join(' → ');
		
		if (!grouped.has(xValue)) {
			grouped.set(xValue, { [xKey]: xValue });
		}
		
		const group = grouped.get(xValue)!;
		
		// Aggregate values if multiple rows have same x and series combination
		if (group[hierarchicalSeriesKey] != null) {
			const existing = Number(group[hierarchicalSeriesKey]);
			const current = Number(yValue);
			if (!isNaN(existing) && !isNaN(current)) {
				group[hierarchicalSeriesKey] = existing + current;
			}
		} else {
			group[hierarchicalSeriesKey] = yValue;
		}
	});
	
	const result = Array.from(grouped.values());
	
	return result.sort((a, b) => {
		const aValue = a[xKey];
		const bValue = b[xKey];
		
		if (aValue instanceof Date && bValue instanceof Date) {
			return aValue.getTime() - bValue.getTime();
		}
		
		if (typeof aValue === 'string' && typeof bValue === 'string') {
			const aDate = new Date(aValue);
			const bDate = new Date(bValue);
			if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
				return aDate.getTime() - bDate.getTime();
			}
		}
		
		if (typeof aValue === 'number' && typeof bValue === 'number') {
			return aValue - bValue;
		}
		
		return String(aValue).localeCompare(String(bValue));
	});
}

function getMultipleSeriesKeys(data: DataRow[], seriesKeys: string[]): string[] {
	const uniqueCombinations = new Set<string>();
	
	data.forEach(row => {
		const seriesValues = seriesKeys.map(key => row[key]).filter(val => val != null);
		if (seriesValues.length === seriesKeys.length) {
			const hierarchicalKey = seriesValues.join(' → ');
			uniqueCombinations.add(hierarchicalKey);
		}
	});
	
	return Array.from(uniqueCombinations).sort();
}

export function generateChartConfig(chartData: PreparedChartData): ChartConfig {
	const config: ChartConfig = {};
	
	if (chartData.seriesKeys.length > 0) {
		chartData.seriesKeys.forEach((seriesKey, index) => {
			const color = chartData.colors[index] || '#64748b';
			const label = formatSeriesLabel(seriesKey);
			
			config[seriesKey] = {
				label,
				color
			};
		});
	} else if (chartData.yAxisKey) {
		const color = chartData.colors[0] || '#64748b';
		const label = formatSeriesLabel(chartData.yAxisKey);
		
		config[chartData.yAxisKey] = {
			label,
			color
		};
	}
	
	if (chartData.xAxisKey) {
		config[chartData.xAxisKey] = {
			label: formatSeriesLabel(chartData.xAxisKey)
		};
	}
	
	return config;
}

function formatSeriesLabel(key: string): string {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/[_-]/g, ' ')
		.replace(/\b\w/g, l => l.toUpperCase())
		.trim();
}

export function calculateTrend({data, yAxisKey, seriesKeys}: PreparedChartData): Trend | null {
	if (data.length < 2) return null;
	
	const firstPoint = data[0];
	const lastPoint = data[data.length - 1];
	
	if (yAxisKey && firstPoint[yAxisKey] && lastPoint[yAxisKey]) {
		const first = Number(firstPoint[yAxisKey]);
		const last = Number(lastPoint[yAxisKey]);
		
		if (isNaN(first) || isNaN(last) || first === 0) return null;
		
		const change = ((last - first) / first) * 100;
		return { change, isPositive: change > 0, isFlat: Math.abs(change) < 1 };
	}
	
	if (seriesKeys.length > 0) {
		const validSeries = seriesKeys.filter(key =>
			firstPoint[key] !== undefined &&
			firstPoint[key] !== null &&
			lastPoint[key] !== undefined &&
			lastPoint[key] !== null
		);
		
		if (validSeries.length === 0) return null;
		
		const changes: number[] = [];
		
		for (const key of validSeries) {
			const first = Number(firstPoint[key]);
			const last = Number(lastPoint[key]);
			
			if (!isNaN(first) && !isNaN(last) && first !== 0) {
				changes.push(((last - first) / first) * 100);
			}
		}
		
		if (changes.length === 0) return null;
		
		const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
		
		return {
			change: avgChange,
			isPositive: avgChange > 0,
			isFlat: Math.abs(avgChange) < 1
		};
	}
	
	return null;
}

export function getDescription({data, xAxisKey, seriesKeys}: PreparedChartData, description?: string | null): string {
	if (description) return description;
	if (data.length === 0) return '';
	
	const firstDate = data[0][xAxisKey];
	const lastDate = data[data.length - 1][xAxisKey];
	
	const formatDate = (dateValue: DataValue): string => {
		if (dateValue instanceof Date) {
			return dateValue.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		}
		
		if (typeof dateValue === 'string') {
			const date = new Date(dateValue);
			if (!isNaN(date.getTime())) {
				return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
			}
		}
		
		return String(dateValue);
	};
	
	if (seriesKeys.length > 1) {
		return `Showing ${seriesKeys.length} data series from ${formatDate(firstDate)} to ${formatDate(lastDate)}`;
	} else {
		return `Showing data from ${formatDate(firstDate)} to ${formatDate(lastDate)}`;
	}
}

export function analyzeChartOptions(data: DataRow[]): ChartOptions {
	if (!data || data.length === 0) {
		return {
			xAxisOptions: [],
			yAxisOptions: [],
			seriesOptions: [],
			chartTypes: [],
			suggestedConfig: { xAxis: '', yAxis: '', chartType: ChartType.BAR, series: [] }
		};
	}
	
	const allKeys = new Set<string>();
	data.forEach(row => {
		Object.keys(row).forEach(key => allKeys.add(key));
	});
	
	const fieldAnalysis: FieldOption[] = Array.from(allKeys).map(key => {
		const values = data.map(row => row[key]).filter((val): val is DataValue => val != null);
		const uniqueValues = new Set(values).size;
		const sampleValues = Array.from(new Set(values)).slice(0, 5);
		
		return {
			key,
			label: formatLabel(key),
			type: detectFieldType(values),
			uniqueValues,
			sampleValues
		};
	});
	
	const xAxisOptions = fieldAnalysis.filter(field => isValidXAxis(field, data.length));
	const yAxisOptions = fieldAnalysis.filter(field => isValidYAxis(field));
	const seriesOptions = fieldAnalysis.filter(field => isValidSeries(field, data.length));
	
	const chartTypes = determineChartTypes(xAxisOptions, yAxisOptions);
	
	const suggestedConfig = createSuggestedConfig(xAxisOptions, yAxisOptions, seriesOptions, chartTypes);
	
	return {
		xAxisOptions,
		yAxisOptions,
		seriesOptions,
		chartTypes,
		suggestedConfig
	};
}

function formatLabel(key: string): string {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/[_-]/g, ' ')
		.replace(/\b\w/g, l => l.toUpperCase())
		.trim();
}

function detectFieldType(values: DataValue[]): FieldType {
	if (values.length === 0) return FieldType.TEXT;
	
	const nonNullValues = values.filter((val): val is NonNullable<DataValue> => val != null);
	if (nonNullValues.length === 0) return FieldType.TEXT;
	
	const isBooleans = nonNullValues.every((val): val is boolean => typeof val === 'boolean');
	if (isBooleans) return FieldType.BOOLEAN;
	
	const isNumbers = nonNullValues.every(val => {
		if (typeof val === 'number') return true;
		if (typeof val === 'string') {
			return !isNaN(Number(val)) && val.trim() !== '';
		}
		return false;
	});
	if (isNumbers) return FieldType.NUMBER;
	
	const isDates = nonNullValues.every(val => {
		if (val instanceof Date) return true;
		if (typeof val === 'string') {
			const date = new Date(val);
			return !isNaN(date.getTime()) && val.match(/^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}T/);
		}
		return false;
	});
	
	if (isDates) return FieldType.DATE;
	
	return FieldType.TEXT;
}

function isValidXAxis(field: FieldOption, dataLength: number): boolean {
	if (field.type === FieldType.NUMBER) return true;
	
	if (field.type === FieldType.DATE) return true;
	
	if (field.type === FieldType.TEXT) {
		return field.uniqueValues <= Math.min(dataLength, 20);
	}
	
	return field.type === FieldType.BOOLEAN;
}

function isValidYAxis(field: FieldOption): boolean {
	return field.type === FieldType.NUMBER;
}

function isValidSeries(field: FieldOption, dataLength: number): boolean {
	if (field.type === FieldType.TEXT) {
		return field.uniqueValues >= 2 && field.uniqueValues <= Math.min(10, dataLength / 2);
	}
	
	return field.type === FieldType.BOOLEAN;
}

function determineChartTypes(xAxisOptions: FieldOption[], yAxisOptions: FieldOption[]): ChartType[] {
	const chartTypes: ChartType[] = [];
	
	if (yAxisOptions.length === 0) return chartTypes;
	
	const hasDateX = xAxisOptions.some(field => field.type === FieldType.DATE);
	const hasTextX = xAxisOptions.some(field => field.type === FieldType.TEXT);
	const hasNumberX = xAxisOptions.some(field => field.type === FieldType.NUMBER);
	
	if (hasDateX || hasNumberX) {
		chartTypes.push(ChartType.LINE);
	}
	
	if (hasTextX || hasDateX) {
		chartTypes.push(ChartType.BAR);
	}
	
	if (hasTextX) {
		chartTypes.push(ChartType.PIE);
	}
	
	if (hasDateX || hasNumberX) {
		chartTypes.push(ChartType.AREA);
	}
	
	return chartTypes;
}

function createSuggestedConfig(
	xAxisOptions: FieldOption[],
	yAxisOptions: FieldOption[],
	seriesOptions: FieldOption[],
	chartTypes: ChartType[]
): { xAxis: string; yAxis: string; series: string[]; chartType: ChartType } {
	const config = {
		xAxis: xAxisOptions[0]?.key || '',
		yAxis: yAxisOptions[0]?.key || '',
		chartType: chartTypes[0] || ChartType.BAR,
		series: [] as string[]
	};
	
	const dateField = xAxisOptions.find(field => field.type === FieldType.DATE);
	if (dateField) {
		config.xAxis = dateField.key;
		config.chartType = ChartType.LINE;
	}
	
	const goodSeries = seriesOptions.find(field =>
		field.uniqueValues >= 2 && field.uniqueValues <= 5
	);
	
	if (goodSeries) {
		(config as typeof config & { series: string[] }).series = [goodSeries.key];
	}
	
	return config;
}

function groupDataForSeries(
	data: DataRow[],
	xKey: string,
	yKey: string,
	seriesKey: string
): DataRow[] {
	const grouped = new Map<DataValue, DataRow>();
	
	data.forEach(row => {
		const xValue = row[xKey];
		const seriesValue = row[seriesKey];
		const yValue = row[yKey];
		
		if (xValue == null || seriesValue == null || yValue == null) {
			return;
		}
		
		if (!grouped.has(xValue)) {
			grouped.set(xValue, { [xKey]: xValue });
		}
		
		const group = grouped.get(xValue)!;
		group[String(seriesValue)] = yValue;
	});
	
	const result = Array.from(grouped.values());
	
	return result.sort((a, b) => {
		const aValue = a[xKey];
		const bValue = b[xKey];
		
		if (aValue instanceof Date && bValue instanceof Date) {
			return aValue.getTime() - bValue.getTime();
		}
		
		if (typeof aValue === 'string' && typeof bValue === 'string') {
			const aDate = new Date(aValue);
			const bDate = new Date(bValue);
			if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
				return aDate.getTime() - bDate.getTime();
			}
		}
		
		if (typeof aValue === 'number' && typeof bValue === 'number') {
			return aValue - bValue;
		}
		
		return String(aValue).localeCompare(String(bValue));
	});
}

function getUniqueSeriesValues(data: DataRow[], seriesKey: string): string[] {
	const uniqueValues = new Set<string>();
	
	data.forEach(row => {
		const value = row[seriesKey];
		if (value != null) {
			uniqueValues.add(String(value));
		}
	});
	
	return Array.from(uniqueValues).sort();
}

function generateColors(count: number): string[] {
	const colorPalettes = {
		cool: [
			'#64748b', // slate-500
			'#475569', // slate-600
			'#334155', // slate-700
			'#94a3b8', // slate-400
			'#cbd5e1', // slate-300
		],
		
		// Warm grays and subtle blues
		neutral: [
			'#6b7280', // gray-500
			'#4b5563', // gray-600
			'#374151', // gray-700
			'#9ca3af', // gray-400
			'#d1d5db', // gray-300
		],
		
		// Subtle blues progression
		blue: [
			'#3b82f6', // blue-500
			'#2563eb', // blue-600
			'#1d4ed8', // blue-700
			'#60a5fa', // blue-400
			'#93c5fd', // blue-300
		],
		
		// Muted earth tones
		earth: [
			'#78716c', // stone-500
			'#57534e', // stone-600
			'#44403c', // stone-700
			'#a8a29e', // stone-400
			'#d6d3d1', // stone-300
		]
	};
	
	let palette: string[];
	if (count === 1) {
		palette = colorPalettes.cool;
	} else if (count >= 2 && count <= 6) {
		palette = colorPalettes.earth;
	} else if (count <= 10) {
		palette = colorPalettes.neutral;
	} else {
		palette = colorPalettes.blue;
	}
	
	if (count <= palette.length) {
		return palette.slice(0, count);
	}
	
	const colors = [...palette];
	const baseHue = 220;
	const baseSaturation = 15;
	
	for (let i = palette.length; i < count; i++) {
		const lightness = 70 - (i * 8) % 40;
		const saturation = baseSaturation + (i * 5) % 20;
		colors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
	}
	
	return colors;
}

export function formatXAxisTick (value: ChartDataValue) {
	if (value instanceof Date) {
		return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
	
	const date = new Date(value as string);
	if (!isNaN(date.getTime()) && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
	
	if (typeof value === 'string' && value.length > 8) {
		return value.slice(0, 6) + '...';
	}
	
	return String(value);
}
