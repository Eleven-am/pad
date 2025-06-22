"use client";

import { AreaChartBlock } from './area-chart-block';
import { BarChartBlock } from './bar-chart-block';
import { LineChartBlock } from './line-chart-block';
import { PieChartBlock } from './pie-chart-block';
import {ChartBlockData} from "@/services/types";
import {Suspense, use, useMemo} from "react";
import {getFormatedData} from "@/lib/data";
import {ChartSelections, DataRow, prepareChartData} from "@/lib/charts";
import {unwrap} from "@/lib/unwrap";
import {$Enums} from "@/generated/prisma";
import ChartType = $Enums.ChartType;
import {BlockLoading} from "@/components/blocks/loading";

interface ChartBlockProps {
	block: ChartBlockData;
	className?: string;
}

interface ChartProps extends ChartBlockProps {
	promise: Promise<DataRow[]>;
}

function Chart({ block, className, promise }: ChartProps) {
	const { type } = block;
	const formattedData = use(promise);
	const chartData = useMemo(() => {
		const chartOptions: ChartSelections = {
			xAxis: block.xAxis,
			yAxis: block.yAxis,
			chartType: block.type,
			series: block.series as string[],
		};
		
		return prepareChartData(formattedData, chartOptions);
	}, [block.xAxis, block.yAxis, block.type, block.series, formattedData]);
	
	switch (type) {
		case ChartType.AREA:
			return <AreaChartBlock block={block} chartData={chartData} className={className} />;
		case ChartType.BAR:
			return <BarChartBlock block={block} chartData={chartData} className={className} />;
		case ChartType.LINE:
			return <LineChartBlock block={block} chartData={chartData} className={className} />;
		case ChartType.PIE:
			return <PieChartBlock block={block} chartData={chartData} className={className} />;
		default:
			return <LineChartBlock block={block} chartData={chartData} className={className} />;
	}
}

export function ChartBlock({ block, className }: ChartBlockProps) {
    return (
        <Suspense fallback={<BlockLoading className={className} />}>
            <Chart block={block} className={className} promise={unwrap(getFormatedData(block.fileId)) as Promise<DataRow[]>} />
        </Suspense>
    );
}

