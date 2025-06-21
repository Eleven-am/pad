"use client";

import {LineChartBlock} from "@/components/blocks/chart/line-chart-block";
import {BarChartBlock} from "@/components/blocks/chart/bar-chart-block";
import {AreaChartBlock} from "@/components/blocks/chart/area-chart-block";
import {PieChartBlock} from "@/components/blocks/chart/pie-chart-block";
import {ChartBlockData} from "@/services/types";
import {ChartType} from "@/generated/prisma";
import { TimeSeriesMetric, DashboardMetrics } from '@/services/dashboardService';


interface DashboardChartsProps {
	timeSeriesData: TimeSeriesMetric[];
	blockMetrics: DashboardMetrics['blocks'];
}

export function DashboardCharts ({ timeSeriesData, blockMetrics }: DashboardChartsProps) {
	const baseBlock = {
		id: "",
		blockName: "",
		showGrid: false,
		stacked: null,
		connectNulls: null,
		fillOpacity: null,
		strokeWidth: null,
		barRadius: null,
		orientation: null,
		labelPosition: null,
		showDots: null,
		dotSize: null,
		startAngle: null,
		innerRadius: null,
		outerRadius: null,
		showLabels: null,
		labelKey: null,
		valueKey: null,
		series: [],
		position: 0,
		postId: "",
		title: "Dashboard Overview",
		description: "Key metrics and trends",
		createdAt: new Date(),
		updatedAt: new Date(),
	}
	
	const lineChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.LINE,
		title: "Content Performance Trend",
		description: "Monthly views and engagement over time",
		showGrid: true,
		showLegend: true,
		showFooter: true,
		connectNulls: true,
		strokeWidth: 2,
		fileId: "mock",
		xAxis: "date",
		yAxis: "views",
		series: ["reads", "posts"],
	};
	
	const barChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.BAR,
		title: "Block Usage Distribution",
		description: "Distribution of different block types in content",
		showGrid: true,
		showLegend: true,
		showFooter: true,
		barRadius: 4,
		fileId: "mock",
		xAxis: "type",
		yAxis: "usage",
	};
	
	const areaChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.AREA,
		title: "Views and Reads Trend",
		description: "Daily views and reads over the past week",
		showGrid: true,
		showLegend: true,
		showFooter: true,
		fillOpacity: 0.3,
		connectNulls: true,
		fileId: "mock",
		xAxis: "date",
		yAxis: "views",
		series: ["reads"],
	};
	
	const pieChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.PIE,
		title: "Block Type Distribution",
		description: "Top 5 most used block types in content",
		showLegend: true,
		showFooter: true,
		showLabels: true,
		innerRadius: 0,
		outerRadius: 60,
		labelKey: "type",
		valueKey: "count",
		fileId: "mock",
		xAxis: "type",
		yAxis: "count",
	};
	
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<LineChartBlock
					block={lineChartBlock}
					chartData={{
						data: timeSeriesData.map(d => ({
							date: d.date,
							views: d.views,
							reads: d.reads,
							posts: d.posts
						})),
						xAxisKey: "date",
						yAxisKey: "views",
						seriesKeys: ["reads", "posts"],
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
					}}
				/>
				
				<BarChartBlock
					block={barChartBlock}
					chartData={{
						data: Object.entries(blockMetrics.distribution).map(([type, count]) => ({
							type: type.charAt(0).toUpperCase() + type.slice(1),
							usage: count,
							percentage: blockMetrics.totalBlocks > 0 ? ((count / blockMetrics.totalBlocks) * 100) : 0
						})),
						xAxisKey: "type",
						yAxisKey: "usage",
						seriesKeys: ["percentage"],
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
					}}
				/>
				
				<PieChartBlock
					block={pieChartBlock}
					chartData={{
						data: Object.entries(blockMetrics.distribution)
							.filter(([, count]) => count > 0)
							.slice(0, 5)
							.map(([type, count]) => ({
								type: type.charAt(0).toUpperCase() + type.slice(1),
								count: count
							})),
						xAxisKey: "type",
						yAxisKey: "count",
						seriesKeys: ["count"],
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
					}}
				/>
			</div>
			
			<AreaChartBlock
				block={areaChartBlock}
				chartData={{
					data: timeSeriesData.map(d => ({
						date: d.date,
						views: d.views,
						reads: d.reads
					})),
					xAxisKey: "date",
					yAxisKey: "views",
					seriesKeys: ["reads"],
					colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
				}}
			/>
		</div>
	);
} 