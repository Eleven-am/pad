"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent
} from '@/components/ui/chart';
import {calculateTrend, formatXAxisTick, generateChartConfig, getDescription, PreparedChartData} from "@/lib/charts";
import {ChartBlockData} from "@/services/types";

interface AreaChartBlockProps {
	block: ChartBlockData;
	chartData: PreparedChartData;
	className?: string;
	gradientStops?: { offset: string; stopColor: string; stopOpacity: number }[];
}

export function AreaChartBlock({ block, chartData, className, gradientStops }: AreaChartBlockProps) {
	const {
		title,
		description,
		showGrid,
		showLegend,
		showFooter,
		stacked,
		connectNulls,
		fillOpacity,
		strokeWidth
	} = block;
	
	if (!chartData.data || chartData.data.length === 0) {
		return (
			<Card className={className}>
				<CardContent className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">No data available for chart</p>
				</CardContent>
			</Card>
		);
	}
	
	const { data, xAxisKey, yAxisKey, seriesKeys } = chartData;
	
	const chartConfig = generateChartConfig(chartData);
	
	const trend = (showFooter ?? true) ? calculateTrend(chartData) : null;
	const autoDescription = getDescription(chartData, description);
	
	const renderGradients = () => {
		if (!gradientStops) return null;
		
		return (
			<defs>
				<linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
					{gradientStops.map((stop, index) => (
						<stop
							key={index}
							offset={stop.offset}
							stopColor={stop.stopColor}
							stopOpacity={stop.stopOpacity}
						/>
					))}
				</linearGradient>
			</defs>
		);
	};
	
	return (
		<Card className={className}>
			{(title || autoDescription) && (
				<CardHeader>
					{title && <CardTitle>{title}</CardTitle>}
					{autoDescription && <CardDescription>{autoDescription}</CardDescription>}
				</CardHeader>
			)}
			
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
						accessibilityLayer
					>
						{renderGradients()}
						
						{(showGrid ?? true) && (
							<CartesianGrid
								vertical={false}
								strokeDasharray="3 3"
							/>
						)}
						
						<XAxis
							dataKey={xAxisKey}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={formatXAxisTick}
						/>
						
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => {
								if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
								if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
								return value.toLocaleString();
							}}
						/>
						
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="dot" />}
						/>
						
						{(showLegend ?? true) && seriesKeys.length > 1 && (
							<ChartLegend
								content={<ChartLegendContent />}
							/>
						)}
						
						{seriesKeys.length > 0 ? (
							seriesKeys.map((seriesKey) => (
								<Area
									key={seriesKey}
									type="natural"
									dataKey={seriesKey}
									stroke={`var(--color-${seriesKey})`}
									fill={gradientStops ? "url(#customGradient)" : `var(--color-${seriesKey})`}
									fillOpacity={gradientStops ? 1 : (fillOpacity ?? 0.3)}
									strokeWidth={strokeWidth ?? 2}
									stackId={(stacked ?? false) ? "a" : undefined}
									connectNulls={connectNulls ?? false}
								/>
							))
						) : (
							<Area
								type="natural"
								dataKey={yAxisKey!}
								stroke={`var(--color-${yAxisKey})`}
								fill={gradientStops ? "url(#customGradient)" : `var(--color-${yAxisKey})`}
								fillOpacity={gradientStops ? 1 : (fillOpacity ?? 0.3)}
								strokeWidth={strokeWidth ?? 2}
								stackId={(stacked ?? false) ? "a" : undefined}
								connectNulls={connectNulls ?? false}
							/>
						)}
					</AreaChart>
				</ChartContainer>
			</CardContent>
			
			{(showFooter ?? true) && trend && (
				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 font-medium leading-none">
						{trend.isFlat ? (
							<>
								Stable trend <Minus className="h-4 w-4" />
							</>
						) : trend.isPositive ? (
							<>
								Trending up by {Math.abs(trend.change).toFixed(1)}% <TrendingUp className="h-4 w-4" />
							</>
						) : (
							<>
								Trending down by {Math.abs(trend.change).toFixed(1)}% <TrendingDown className="h-4 w-4" />
							</>
						)}
					</div>
					<div className="leading-none text-muted-foreground">
						{(stacked ?? false)
							? "Showing cumulative values across all series"
							: "Comparing first and last data points in the series"
						}
					</div>
				</CardFooter>
			)}
		</Card>
	);
}