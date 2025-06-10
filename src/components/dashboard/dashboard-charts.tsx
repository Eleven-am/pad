"use client";

import {LineChartBlock} from "@/components/blocks/chart/line-chart-block";
import {BarChartBlock} from "@/components/blocks/chart/bar-chart-block";
import {AreaChartBlock} from "@/components/blocks/chart/area-chart-block";
import {PieChartBlock} from "@/components/blocks/chart/pie-chart-block";
import {ChartBlockData} from "@/services/types";
import {ChartType} from "@/generated/prisma";

// Mock data for charts
const mockChartData = {
	lineChart: {
		data: [
			{month: "Jan", views: 1200, engagement: 800, shares: 400},
			{month: "Feb", views: 1800, engagement: 1200, shares: 600},
			{month: "Mar", views: 2400, engagement: 1600, shares: 800},
			{month: "Apr", views: 2100, engagement: 1400, shares: 700},
			{month: "May", views: 2800, engagement: 1900, shares: 950},
			{month: "Jun", views: 3200, engagement: 2200, shares: 1100},
		],
		xAxis: "month",
		yAxis: "views",
		series: ["engagement", "shares"]
	},
	barChart: {
		data: [
			{type: "Text", usage: 35, engagement: 45, retention: 40},
			{type: "Image", usage: 25, engagement: 35, retention: 30},
			{type: "Chart", usage: 15, engagement: 25, retention: 20},
			{type: "Instagram", usage: 10, engagement: 30, retention: 25},
			{type: "Twitter", usage: 8, engagement: 20, retention: 15},
			{type: "Code", usage: 5, engagement: 15, retention: 10},
			{type: "Table", usage: 2, engagement: 10, retention: 8},
		],
		xAxis: "type",
		yAxis: "usage",
		series: ["engagement", "retention"]
	},
	areaChart: {
		data: [
			{time: "00:00", visitors: 100, active: 50, returning: 30},
			{time: "04:00", visitors: 50, active: 20, returning: 15},
			{time: "08:00", visitors: 300, active: 150, returning: 100},
			{time: "12:00", visitors: 500, active: 300, returning: 200},
			{time: "16:00", visitors: 400, active: 250, returning: 180},
			{time: "20:00", visitors: 200, active: 100, returning: 80},
			{time: "24:00", visitors: 100, active: 50, returning: 30},
		],
		xAxis: "time",
		yAxis: "visitors",
		series: ["active", "returning"]
	},
	pieChart: {
		data: [
			{platform: "Instagram", engagement: 35},
			{platform: "Twitter", engagement: 30},
			{platform: "Facebook", engagement: 20},
			{platform: "LinkedIn", engagement: 15},
		],
		labelKey: "platform",
		valueKey: "engagement"
	}
};

export function DashboardCharts () {
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
		xAxis: mockChartData.lineChart.xAxis,
		yAxis: mockChartData.lineChart.yAxis,
		series: mockChartData.lineChart.series,
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
		xAxis: mockChartData.barChart.xAxis,
		yAxis: mockChartData.barChart.yAxis,
	};
	
	const areaChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.AREA,
		title: "Daily Traffic Pattern",
		description: "Visitor and active user patterns throughout the day",
		showGrid: true,
		showLegend: true,
		showFooter: true,
		fillOpacity: 0.3,
		connectNulls: true,
		fileId: "mock",
		xAxis: mockChartData.areaChart.xAxis,
		yAxis: mockChartData.areaChart.yAxis,
		series: mockChartData.areaChart.series,
	};
	
	const pieChartBlock: ChartBlockData = {
		...baseBlock,
		type: ChartType.PIE,
		title: "Social Media Engagement",
		description: "Distribution of engagement across social platforms",
		showLegend: true,
		showFooter: true,
		showLabels: true,
		innerRadius: 0,
		outerRadius: 60,
		labelKey: mockChartData.pieChart.labelKey,
		valueKey: mockChartData.pieChart.valueKey,
		fileId: "mock",
		xAxis: mockChartData.pieChart.labelKey,
		yAxis: mockChartData.pieChart.valueKey,
	};
	
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<LineChartBlock
					block={lineChartBlock}
					chartData={{
						data: mockChartData.lineChart.data,
						xAxisKey: mockChartData.lineChart.xAxis,
						yAxisKey: mockChartData.lineChart.yAxis,
						seriesKeys: mockChartData.lineChart.series,
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
					}}
				/>
				
				<BarChartBlock
					block={barChartBlock}
					chartData={{
						data: mockChartData.barChart.data,
						xAxisKey: mockChartData.barChart.xAxis,
						yAxisKey: mockChartData.barChart.yAxis,
						seriesKeys: mockChartData.barChart.series,
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
					}}
				/>
				
				<PieChartBlock
					block={pieChartBlock}
					chartData={{
						data: mockChartData.pieChart.data,
						xAxisKey: mockChartData.pieChart.labelKey,
						yAxisKey: mockChartData.pieChart.valueKey,
						seriesKeys: ["engagement"],
						colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]
					}}
				/>
			</div>
			
			<AreaChartBlock
				block={areaChartBlock}
				chartData={{
					data: mockChartData.areaChart.data,
					xAxisKey: mockChartData.areaChart.xAxis,
					yAxisKey: mockChartData.areaChart.yAxis,
					seriesKeys: mockChartData.areaChart.series,
					colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]
				}}
			/>
		</div>
	);
} 