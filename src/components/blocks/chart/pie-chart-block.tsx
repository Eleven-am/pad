"use client";

import { PieChart, Pie, Cell } from 'recharts';
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
import { PreparedChartData, type Trend } from "@/lib/charts";
import { ChartBlockData } from "@/services/types";

interface PieChartBlockProps {
	block: ChartBlockData;
	chartData: PreparedChartData;
	className?: string;
}

export function PieChartBlock({ block, chartData, className }: PieChartBlockProps) {
	const {
		title,
		description,
		showLegend,
		showFooter,
		innerRadius,
		outerRadius,
		showLabels,
		labelKey,
		valueKey
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
	
	const { data, xAxisKey, yAxisKey, seriesKeys, colors } = chartData;
	
	const transformDataForPie = () => {
		if (labelKey && valueKey && data.length > 0 && data[0][labelKey] && data[0][valueKey]) {
			return data.map((item, index) => ({
				name: item[labelKey],
				value: item[valueKey],
				fill: colors[index] || '#64748b'
			}));
		}
		
		if (seriesKeys.length > 0) {
			return seriesKeys.map((seriesKey, index) => {
				const totalValue = data.reduce((sum, item) => {
					const value = item[seriesKey];
					return sum + (typeof value === 'number' ? value : 0);
				}, 0);
				
				return {
					name: seriesKey,
					value: totalValue,
					fill: colors[index] || '#64748b'
				};
			});
		}
		
		if (yAxisKey) {
			return data.map((item, index) => ({
				name: item[xAxisKey],
				value: item[yAxisKey],
				fill: colors[index % colors.length] || '#64748b'
			}));
		}
		
		const firstItem = data[0];
		const numericKeys = Object.keys(firstItem).filter(key =>
			key !== xAxisKey && typeof firstItem[key] === 'number'
		);
		
		if (numericKeys.length === 1) {
			return data.map((item, index) => ({
				name: item[xAxisKey],
				value: item[numericKeys[0]],
				fill: colors[index % colors.length] || '#64748b'
			}));
		}
		
		return numericKeys.map((key, index) => {
			const totalValue = data.reduce((sum, item) => sum + Number(item[key] || 0), 0);
			return {
				name: key,
				value: totalValue,
				fill: colors[index % colors.length] || '#64748b'
			};
		});
	};
	
	const pieData = transformDataForPie();
	
	const pieConfig = pieData.reduce((config, item) => {
		config[String(item.name)] = {
			label: String(item.name),
			color: item.fill
		};
		return config;
	}, {} as Record<string, { label: string; color: string }>);
	
	const calculatePieTrend = (): Trend | null => {
		if (pieData.length < 2) return null;
		
		const values = pieData.map(item => item.value).sort((a, b) => Number(b) - Number(a));
		const largest = values[0];
		const smallest = values[values.length - 1];
		
		if (largest === 0) return null;
		
		const ratio = (Number(largest) - Number(smallest)) / Number(largest) * 100;
		
		return {
			change: ratio,
			isPositive: ratio > 50,
			isFlat: ratio < 20
		};
	};
	
	const trend = showFooter ? calculatePieTrend() : null;
	
	const autoDescription = description || (() => {
		const total = pieData.reduce((sum, item) => sum + Number(item.value), 0);
		const largest = pieData.reduce((max, item) =>
			Number(item.value) > Number(max.value) ? item : max, pieData[0]
		);
		
		if (pieData.length === 1) {
			return `Single category with total value of ${total.toLocaleString()}`;
		}
		
		const largestPercentage = (((Number(largest.value) || 1) / total) * 100).toFixed(1);
		return `${pieData.length} categories totaling ${total.toLocaleString()}. ${largest.name} leads with ${largestPercentage}%`;
	})();
	
	const renderCustomizedLabel = (entry: { value: number }) => {
		if (!showLabels) return null;
		
		const total = pieData.reduce((sum, item) => sum + Number(item.value), 0);
		const percent = ((entry.value / total) * 100).toFixed(1);
		
		return `${percent}%`;
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
				<ChartContainer config={pieConfig}>
					<PieChart>
						<ChartTooltip
							content={<ChartTooltipContent nameKey="name" hideLabel />}
						/>
						
						{showLegend && (
							<ChartLegend
								content={<ChartLegendContent />}
								verticalAlign="bottom"
							/>
						)}
						
						<Pie
							data={pieData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={renderCustomizedLabel}
							outerRadius={outerRadius ?? 120}
							innerRadius={innerRadius ?? 0}
							fill="#8884d8"
							dataKey="value"
						>
							{pieData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.fill}
								/>
							))}
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
			
			{showFooter && trend && (
				<CardFooter className="flex-col items-start gap-2 text-sm">
					<div className="flex gap-2 font-medium leading-none">
						{trend.isFlat ? (
							<>
								Evenly distributed <Minus className="h-4 w-4" />
							</>
						) : trend.isPositive ? (
							<>
								Concentrated distribution <TrendingUp className="h-4 w-4" />
							</>
						) : (
							<>
								Balanced distribution <TrendingDown className="h-4 w-4" />
							</>
						)}
					</div>
					<div className="leading-none text-muted-foreground">
						{trend.isFlat
							? "Values are relatively similar across categories"
							: trend.isPositive
								? "One or few categories dominate the total"
								: "Values are well-balanced across categories"
						}
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
