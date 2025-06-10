"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
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
import { ChartBlockData } from "@/services/types";

interface LineChartBlockProps {
	block: ChartBlockData;
	chartData: PreparedChartData;
	className?: string;
}

export function LineChartBlock({ block, chartData, className }: LineChartBlockProps) {
	const {
		title,
		description,
		showGrid,
		showLegend,
		showFooter,
		connectNulls,
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
					<LineChart
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
							cursor={false}
							content={<ChartTooltipContent />}
						/>
						
						{showLegend && seriesKeys.length > 1 && (
							<ChartLegend
								content={<ChartLegendContent />}
							/>
						)}
						
						{seriesKeys.length > 0 ? (
							seriesKeys.map((seriesKey, index) => (
								<Line
									key={seriesKey}
									type="monotone"
									dataKey={seriesKey}
									stroke={chartData.colors[index] || '#64748b'}
									strokeWidth={strokeWidth || 3}
									dot={false}
									activeDot={{
										r: 6,
										strokeWidth: 0
									}}
									connectNulls={Boolean(connectNulls)}
								/>
							))
						) : (
							<Line
								type="monotone"
								dataKey={yAxisKey!}
								stroke={chartData.colors[0] || '#64748b'}
								strokeWidth={strokeWidth || 3}
								dot={false}
								activeDot={{
									r: 6,
									strokeWidth: 0
								}}
								connectNulls={Boolean(connectNulls)}
							/>
						)}
					</LineChart>
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