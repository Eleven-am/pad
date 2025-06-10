"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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
import {calculateTrend, generateChartConfig, getDescription, ChartDataValue, PreparedChartData} from "@/lib/charts";
import {ChartBlockData} from "@/services/types";

interface BarChartBlockProps {
	block: ChartBlockData;
	chartData: PreparedChartData;
	className?: string;
}

export function BarChartBlock({ block, chartData, className }: BarChartBlockProps) {
	const {
		title,
		description,
		showGrid,
		showLegend,
		showFooter,
		barRadius,
		stacked
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
	
	const formatXAxisTick = (value: ChartDataValue): string => {
		if (typeof value === 'string' && value.length > 8) {
			return value.slice(0, 6) + '...';
		}
		
		if (value === undefined || value === null) {
			return '';
		}
		
		return value.toString();
	};
	
	const trend = calculateTrend(chartData);
	const autoDescription = getDescription(chartData, description);
	
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
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
						accessibilityLayer
					>
						{showGrid && (
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
							cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
							content={<ChartTooltipContent indicator="dashed" />}
						/>
						
						{showLegend && seriesKeys.length > 1 && (
							<ChartLegend
								content={<ChartLegendContent />}
							/>
						)}
						
						{seriesKeys.length > 0 ? (
							seriesKeys.map((seriesKey) => (
								<Bar
									key={seriesKey}
									dataKey={seriesKey}
									fill={`var(--color-${seriesKey})`}
									radius={stacked ? [0, 0, 0, 0] : [barRadius ?? 4, barRadius ?? 4, 0, 0]}
									stackId={stacked ? "stack" : undefined}
								/>
							))
						) : (
							<Bar
								dataKey={yAxisKey!}
								fill={`var(--color-${yAxisKey})`}
								radius={[barRadius ?? 4, barRadius ?? 4, 0, 0]}
							/>
						)}
					</BarChart>
				</ChartContainer>
			</CardContent>
			
			{showFooter && trend && (
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
						Comparing first and last data points in the series
					</div>
				</CardFooter>
			)}
		</Card>
	);
}