"use client";

import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {CreateChartBlockInput} from "@/services/types";
import {ChartType, File, Orientation as ChartOrientation, LabelPosition} from "@/generated/prisma";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarFooter, BlockSidebarHeader} from "@/components/sidebars/base-block-sidebar";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";
import {UploadComponent} from "@/components/upload-component";
import {analyzeFileForChart} from "@/lib/data";
import {ChartOptions, FieldOption, getCompatibleOptions} from "@/lib/charts";
import {X} from "lucide-react";
import {MultiSelect} from "@/components/multi-select";
import {unwrap} from "@/lib/unwrap";
import {cn} from "@/lib/utils";

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

export function ChartBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateChartBlockInput>) {
	const [type, setType] = useState<ChartType>(initialData.type || ChartType.LINE);
	const [title, setTitle] = useState(initialData.title || "");
	const [description, setDescription] = useState(initialData.description || "");
	const [showGrid, setShowGrid] = useState(initialData.showGrid ?? true);
	const [showLegend, setShowLegend] = useState(initialData.showLegend ?? true);
	const [showFooter, setShowFooter] = useState(initialData.showFooter ?? true);
	const [stacked, setStacked] = useState(initialData.stacked ?? false);
	const [connectNulls, setConnectNulls] = useState(initialData.connectNulls ?? false);
	const [fillOpacity, setFillOpacity] = useState(initialData.fillOpacity ?? 0.3);
	const [strokeWidth, setStrokeWidth] = useState(initialData.strokeWidth ?? 2);
	const [barRadius, setBarRadius] = useState(initialData.barRadius ?? 4);
	const [innerRadius, setInnerRadius] = useState(initialData.innerRadius ?? 0);
	const [outerRadius, setOuterRadius] = useState(initialData.outerRadius ?? 100);
	const [showLabels, setShowLabels] = useState(initialData.showLabels ?? true);
	const [labelKey, setLabelKey] = useState(initialData.labelKey || "");
	const [valueKey, setValueKey] = useState(initialData.valueKey || "");
	const [fileId, setFileId] = useState(initialData.fileId || "");
	const [xAxis, setXAxis] = useState(initialData.xAxis || "");
	const [yAxis, setYAxis] = useState(initialData.yAxis || "");
	const [series, setSeries] = useState<string[]>(initialData.series);
	
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [dotSize, setDotSize] = useState(initialData.dotSize ?? 4);
	const [showDots, setShowDots] = useState(initialData.showDots ?? false);
	const [startAngle, setStartAngle] = useState(initialData.startAngle ?? 0);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const [chartOptions, setChartOptions] = useState<ChartOptions | null>(null);
	const [orientation, setOrientation] = useState(initialData.orientation || ChartOrientation.VERTICAL);
	const [labelPosition, setLabelPosition] = useState(initialData.labelPosition || LabelPosition.INSIDE);
	
	useEffect(() => {
		if (fileId && fileId.length > 0) {
			setIsAnalyzing(true);
			setAnalysisError(null);
			
			unwrap(analyzeFileForChart(fileId))
				.then((analysisResult) => {
					const analysis = analysisResult as ChartOptions;
					setChartOptions(analysis);
					if (fileId === initialData.fileId) {
						return;
					}
					
					if (!xAxis && analysis.suggestedConfig.xAxis) {
						setXAxis(analysis.suggestedConfig.xAxis);
					}
					if (!yAxis && analysis.suggestedConfig.yAxis) {
						setYAxis(analysis.suggestedConfig.yAxis);
					}
					if (series.length === 0 && analysis.suggestedConfig.series && analysis.suggestedConfig.series.length > 0) {
						setSeries(analysis.suggestedConfig.series);
					}
					if (analysis.suggestedConfig.chartType) {
						setType(analysis.suggestedConfig.chartType);
					}
				})
				.catch(() => {
					setAnalysisError('Failed to analyze file data');
					setChartOptions(null);
				})
				.finally(() => {
					setIsAnalyzing(false);
				});
		} else {
			setChartOptions(null);
			setAnalysisError(null);
		}
	}, [fileId, initialData.fileId, series.length, xAxis, yAxis]);
	
	const compatibleOptions = useMemo(() => getCompatibleOptions(chartOptions, xAxis, series, type), [chartOptions, xAxis, series, type]);
	
	const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	}, []);
	
	const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
	}, []);
	
	const handleLabelKeyChange = useCallback((value: string) => {
		setLabelKey(value);
	}, []);
	
	const handleValueKeyChange = useCallback((value: string) => {
		setValueKey(value);
	}, []);
	
	const handleXAxisChange = useCallback((value: string) => {
		setXAxis(value);
		
		if (yAxis && !compatibleOptions.yAxisOptions.some(opt => opt.key === yAxis)) {
			setYAxis("");
		}
		
		// Filter out any series that are no longer compatible
		const validSeries = series.filter(s =>
			compatibleOptions.seriesOptions.some(opt => opt.key === s)
		);
		if (validSeries.length !== series.length) {
			setSeries(validSeries);
		}
	}, [yAxis, series, compatibleOptions]);
	
	const handleYAxisChange = useCallback((value: string) => {
		setYAxis(value);
	}, []);
	
	const handleSeriesChange = useCallback((values: string[]) => {
		setSeries(values);
	}, []);
	
	const handleOrientationChange = useCallback((value: string) => {
		const newOrientation = value as ChartOrientation;
		setOrientation(newOrientation);
	}, []);
	
	const handleLabelPositionChange = useCallback((value: string) => {
		const newPosition = value === "inside" ? LabelPosition.INSIDE :
			value === "outside" ? LabelPosition.OUTSIDE : LabelPosition.CENTER;
		setLabelPosition(newPosition);
	}, []);
	
	const handleOnfileUpload = useCallback((file: File) => {
		setFileId(file.id);
	}, []);
	
	const handleSave = useCallback(() => {
		onSave({
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
			fileId,
			xAxis,
			yAxis,
			series,
			orientation,
			labelPosition,
			showDots,
			dotSize,
			startAngle,
		});
	}, [
		type, title, description, showGrid, showLegend, showFooter,
		stacked, connectNulls, fillOpacity, strokeWidth, barRadius,
		innerRadius, outerRadius, showLabels, labelKey, valueKey,
		orientation, labelPosition, showDots, dotSize, startAngle,
		fileId, xAxis, yAxis, series, onSave,
	]);
	
	const isValid = useMemo(() =>
			fileId.trim().length > 0 &&
			xAxis.trim().length > 0 &&
			yAxis.trim().length > 0,
		[fileId, xAxis, yAxis]);
	
	const showAreaOptions = type === ChartType.AREA;
	const showBarOptions = type === ChartType.BAR;
	const showLineOptions = type === ChartType.LINE;
	const showPieOptions = type === ChartType.PIE;
	
	const renderFieldSelect = useCallback((
		id: string,
		label: string,
		value: string,
		onChange: (value: string) => void,
		options: FieldOption[],
		placeholder: string,
		allowEmpty = true
	) => {
		const hasOptions = options.length > 0;
		const isDisabled = isAnalyzing;
		
		let displayPlaceholder = placeholder;
		if (isAnalyzing) {
			displayPlaceholder = "Analyzing...";
		} else if (!hasOptions) {
			displayPlaceholder = "No suitable fields found";
		}
		
		const selectValue = hasOptions ? value : undefined;
		
		return (
			<div className="flex flex-col space-y-2">
				<Label htmlFor={id} className={!hasOptions ? "text-muted-foreground" : ""}>
					{label}
				</Label>
				<Select value={selectValue} onValueChange={onChange} disabled={isDisabled}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={displayPlaceholder} />
					</SelectTrigger>
					<SelectContent>
						{allowEmpty && hasOptions && (
							<SelectItem value="empty">None</SelectItem>
						)}
						{options.map((option) => (
							<SelectItem key={option.key} value={option.key}>
								{option.label} ({option.type})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}, [isAnalyzing]);
	
	const renderSeriesSelector = useCallback(() => {
		const hasOptions = compatibleOptions.seriesOptions.length > 0;
		const isDisabled = isAnalyzing;
		
		const seriesOptions = compatibleOptions.seriesOptions.map(option => ({
			label: `${option.label} (${option.type})`,
			value: option.key
		}));
		
		return (
			<div className="flex flex-col space-y-2">
				<Label className={!hasOptions ? "text-muted-foreground" : ""}>
					Series Fields (Optional)
				</Label>
				
				<MultiSelect
					options={seriesOptions}
					onValueChange={handleSeriesChange}
					defaultValue={series}
					placeholder={isAnalyzing ? "Analyzing..." : hasOptions ? "Select series fields" : "No suitable fields found"}
					searchPlaceholder="Search fields..."
					maxCount={3}
					className={cn("w-full", isDisabled && "opacity-50 cursor-not-allowed")}
					disabled={isDisabled}
				/>
			</div>
		);
	}, [compatibleOptions.seriesOptions, series, isAnalyzing, handleSeriesChange]);
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Chart" : "Create Chart"}
					onClose={onClose}
				/>
			}
			footer={
				<BlockSidebarFooter
					onSave={handleSave}
					onDelete={onDelete}
					isUpdate={isUpdate}
					isValid={isValid}
				/>
			}
		>
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-4">
					{!fileId && (
						<>
							<label className="text-sm font-medium">
								Upload Chart Data
							</label>
							<UploadComponent
								fileTypes={["application/json", "text/csv"]}
								onFileUpload={handleOnfileUpload}
								uploadEndpoint={'/api/files'}
							/>
						</>
					)}
					
					{fileId && (
						<div className="flex flex-col space-y-2">
							<label className="text-sm font-medium">
								Uploaded File
							</label>
							<div className="relative w-full flex items-center justify-between px-4 h-12 bg-muted rounded-lg overflow-hidden">
								<span className="text-sm text-muted-foreground">
									{isAnalyzing ? "Analyzing chart data..." : "Chart data file uploaded"}
								</span>
								<Button
									variant="ghost"
									className="p-1 rounded-full"
									onClick={() => {
										setFileId("");
										setChartOptions(null);
										setXAxis("");
										setYAxis("");
										setSeries([]);
										setLabelKey("");
										setValueKey("");
									}}
								>
									<X />
								</Button>
							</div>
						</div>
					)}
					
					{analysisError && (
						<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
							{analysisError}
						</div>
					)}
				</div>
				
				{compatibleOptions.warnings.length > 0 && (
					<div className="bg-yellow-50 border border-yellow-200 rounded p-3">
						<div className="flex items-center space-x-2">
							<span className="text-yellow-600">⚠️</span>
							<span className="text-sm font-medium text-yellow-800">Warnings</span>
						</div>
						<ul className="mt-1 text-sm text-yellow-700">
							{compatibleOptions.warnings.map((warning, index) => (
								<li key={index}>• {warning}</li>
							))}
						</ul>
					</div>
				)}
				
				{compatibleOptions.suggestions.length > 0 && (
					<div className="bg-blue-50 border border-blue-200 rounded p-3">
						<div className="flex items-center space-x-2">
							<span className="text-blue-600">💡</span>
							<span className="text-sm font-medium text-blue-800">Suggestions</span>
						</div>
						<ul className="mt-1 text-sm text-blue-700">
							{compatibleOptions.suggestions.map((suggestion, index) => (
								<li key={index}>• {suggestion}</li>
							))}
						</ul>
					</div>
				)}
				
				{chartOptions && (
					<>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="type">Chart Type</Label>
							<Select
								value={type}
								onValueChange={(value: ChartType) => setType(value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select chart type" />
								</SelectTrigger>
								<SelectContent>
									{compatibleOptions.validChartTypes.map((chartType) => (
										<SelectItem key={chartType} value={chartType}>
											{chartType.charAt(0).toUpperCase() + chartType.slice(1).toLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						
						{renderFieldSelect(
							"xAxis",
							"X-Axis Field",
							xAxis,
							handleXAxisChange,
							chartOptions.xAxisOptions,
							"Select X-axis field",
							false
						)}
						
						{renderFieldSelect(
							"yAxis",
							"Y-Axis Field",
							yAxis,
							handleYAxisChange,
							compatibleOptions.yAxisOptions,
							"Select Y-axis field",
							false
						)}
						
						{renderSeriesSelector()}
					</>
				)}
				
				<div className="flex flex-col space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={title}
						onChange={handleTitleChange}
						placeholder="Enter chart title"
					/>
				</div>
				
				<div className="flex flex-col space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={description}
						onChange={handleDescriptionChange}
						placeholder="Enter chart description"
						className="min-h-[100px]"
					/>
				</div>
				
				<div className="flex items-center space-x-2">
					<Switch
						id="showGrid"
						checked={showGrid}
						onCheckedChange={setShowGrid}
					/>
					<Label htmlFor="showGrid">Show Grid</Label>
				</div>
				
				<div className="flex items-center space-x-2">
					<Switch
						id="showLegend"
						checked={showLegend}
						onCheckedChange={setShowLegend}
					/>
					<Label htmlFor="showLegend">Show Legend</Label>
				</div>
				
				<div className="flex items-center space-x-2">
					<Switch
						id="showFooter"
						checked={showFooter}
						onCheckedChange={setShowFooter}
					/>
					<Label htmlFor="showFooter">Show Footer</Label>
				</div>
				
				{showLineOptions && (
					<>
						<div className="flex items-center space-x-2">
							<Switch
								id="connectNulls"
								checked={connectNulls}
								onCheckedChange={setConnectNulls}
							/>
							<Label htmlFor="connectNulls">Connect Null Values</Label>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="strokeWidth">Stroke Width</Label>
							<Slider
								id="strokeWidth"
								min={1}
								max={10}
								step={1}
								value={[strokeWidth]}
								onValueChange={([value]) => setStrokeWidth(value)}
							/>
						</div>
						
						<div className="flex items-center space-x-2">
							<Switch
								id="showDots"
								checked={showDots}
								onCheckedChange={setShowDots}
							/>
							<Label htmlFor="showDots">Show Data Points</Label>
						</div>
						
						{showDots && (
							<div className="flex flex-col space-y-2">
								<Label htmlFor="dotSize">Dot Size</Label>
								<Slider
									id="dotSize"
									min={2}
									max={12}
									step={1}
									value={[dotSize]}
									onValueChange={([value]) => setDotSize(value)}
								/>
							</div>
						)}
					</>
				)}
				
				{showAreaOptions && (
					<>
						<div className="flex items-center space-x-2">
							<Switch
								id="stacked"
								checked={stacked}
								onCheckedChange={setStacked}
							/>
							<Label htmlFor="stacked">Stacked Areas</Label>
						</div>
						
						<div className="flex items-center space-x-2">
							<Switch
								id="connectNulls"
								checked={connectNulls}
								onCheckedChange={setConnectNulls}
							/>
							<Label htmlFor="connectNulls">Connect Null Values</Label>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="fillOpacity">Fill Opacity</Label>
							<Slider
								id="fillOpacity"
								min={0}
								max={1}
								step={0.1}
								value={[fillOpacity]}
								onValueChange={([value]) => setFillOpacity(value)}
							/>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="strokeWidth">Stroke Width</Label>
							<Slider
								id="strokeWidth"
								min={1}
								max={10}
								step={1}
								value={[strokeWidth]}
								onValueChange={([value]) => setStrokeWidth(value)}
							/>
						</div>
					</>
				)}
				
				{showBarOptions && (
					<>
						<div className="flex items-center space-x-2">
							<Switch
								id="stacked"
								checked={stacked}
								onCheckedChange={setStacked}
							/>
							<Label htmlFor="stacked">Stacked Bars</Label>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="barRadius">Bar Radius</Label>
							<Slider
								id="barRadius"
								min={0}
								max={20}
								step={1}
								value={[barRadius]}
								onValueChange={([value]) => setBarRadius(value)}
							/>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="orientation">Orientation</Label>
							<Select value={orientation} onValueChange={handleOrientationChange}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select orientation" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ChartOrientation.VERTICAL}>Vertical</SelectItem>
									<SelectItem value={ChartOrientation.HORIZONTAL}>Horizontal</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</>
				)}
				
				{showPieOptions && (
					<>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="innerRadius">Inner Radius</Label>
							<Slider
								id="innerRadius"
								min={0}
								max={100}
								step={1}
								value={[innerRadius]}
								onValueChange={([value]) => setInnerRadius(value)}
							/>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="outerRadius">Outer Radius</Label>
							<Slider
								id="outerRadius"
								min={0}
								max={200}
								step={1}
								value={[outerRadius]}
								onValueChange={([value]) => setOuterRadius(value)}
							/>
						</div>
						
						<div className="flex flex-col space-y-2">
							<Label htmlFor="startAngle">Start Angle</Label>
							<Slider
								id="startAngle"
								min={0}
								max={360}
								step={15}
								value={[startAngle]}
								onValueChange={([value]) => setStartAngle(value)}
							/>
						</div>
						
						<div className="flex items-center space-x-2">
							<Switch
								id="showLabels"
								checked={showLabels}
								onCheckedChange={setShowLabels}
							/>
							<Label htmlFor="showLabels">Show Labels</Label>
						</div>
						
						{showLabels && (
							<div className="flex flex-col space-y-2">
								<Label htmlFor="labelPosition">Label Position</Label>
								<Select value={labelPosition} onValueChange={handleLabelPositionChange}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select label position" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="inside">Inside</SelectItem>
										<SelectItem value="outside">Outside</SelectItem>
										<SelectItem value="center">Center</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
						
						{/* Pie Chart Field Selection */}
						{chartOptions && (
							<>
								{renderFieldSelect(
									"labelKey",
									"Label Field",
									labelKey,
									handleLabelKeyChange,
									chartOptions.xAxisOptions.concat(chartOptions.seriesOptions),
									"Select label field",
									true
								)}
								
								{renderFieldSelect(
									"valueKey",
									"Value Field",
									valueKey,
									handleValueKeyChange,
									chartOptions.yAxisOptions,
									"Select value field",
									true
								)}
							</>
						)}
					</>
				)}
			</div>
		</BaseBlockSidebarLayout>
	);
}
