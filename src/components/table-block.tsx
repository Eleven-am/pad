import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {JSX, type ReactNode, Suspense, use} from "react";
import { DataRow, DataValue } from "@/lib/charts";
import { getDataRows } from "@/lib/data";
import { TableBlockData } from "@/services/types";
import {unwrap} from "@/lib/unwrap";
import {BlockLoading} from "@/components/blocks/loading";

interface Column {
	key: string;
	label: string;
	align?: 'left' | 'center' | 'right';
	width?: string;
	render?: (value: DataValue, row: DataRow) => ReactNode;
}

interface TableBlockProps {
	block: TableBlockData;
	dataRowPromise: Promise<DataRow[]>;
}

interface ColumnGeneration {
	columns: Column[];
	data: DataRow[];
}

function formatLabel(key: string): string {
	return key
		.replace(/([A-Z])/g, ' $1')
		.replace(/[_-]/g, ' ')
		.replace(/\b\w/g, l => l.toUpperCase())
		.trim();
}

function detectAlignment(values: DataValue[]): 'left' | 'center' | 'right' {
	if (values.length === 0) return 'left';
	
	const nonNullValues = values.filter(val => val != null);
	if (nonNullValues.length === 0) return 'left';
	
	const isAllNumbers = nonNullValues.every(val =>
		typeof val === 'number' ||
		(typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')
	);
	
	if (isAllNumbers) return 'right';
	
	const isAllDates = nonNullValues.every(val => {
		if (val instanceof Date) return true;
		if (typeof val === 'string') {
			const date = new Date(val);
			return !isNaN(date.getTime()) && val.match(/^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}/);
		}
		return false;
	});
	
	if (isAllDates) return 'center';
	
	return 'left';
}

function detectWidth(key: string, values: DataValue[]): string | undefined {
	const shortFields = ['id', 'code', 'status', 'type'];
	const mediumFields = ['date', 'price', 'count', 'views', 'rating'];
	const wideFields = ['title', 'name', 'description', 'summary'];
	
	const lowerKey = key.toLowerCase();
	
	if (shortFields.some(field => lowerKey.includes(field))) {
		return '10%';
	}
	
	if (mediumFields.some(field => lowerKey.includes(field))) {
		return '15%';
	}
	
	if (wideFields.some(field => lowerKey.includes(field))) {
		return '30%';
	}
	
	if (values.length > 0) {
		const avgLength = values
			.filter(val => val != null)
			.reduce((sum: number, val) => sum + String(val).length, 0) / values.length;
		
		if (avgLength < 10) return '12%';
		if (avgLength < 20) return '18%';
		if (avgLength > 50) return '35%';
	}
	
	return undefined;
}

function createRenderer(values: DataValue[]): ((value: unknown) => (JSX.Element | string | null)) {
	if (values.length === 0) return () => null;
	
	const nonNullValues = values.filter(val => val != null);
	if (nonNullValues.length === 0) return () => null;
	
	const sampleValue = nonNullValues[0];
	
	if (typeof sampleValue === 'number' ||
		(typeof sampleValue === 'string' && !isNaN(Number(sampleValue)) && sampleValue.trim() !== '')) {
		
		const hasDecimalPattern = nonNullValues.some(val =>
			String(val).includes('.') && String(val).split('.')[1]?.length <= 2
		);
		
		if (hasDecimalPattern) {
			return (value) => {
				const num = Number(value);
				return isNaN(num) ? String(value) : num.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
			};
		}
		
		return (value) => {
			const num = Number(value);
			return isNaN(num) ? String(value) : num.toLocaleString();
		};
	}
	
	if (sampleValue instanceof Date ||
		(typeof sampleValue === 'string' && !isNaN(new Date(sampleValue).getTime()))) {
		return (value) => {
			const date = new Date(value as string);
			return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
		};
	}
	
	if (typeof sampleValue === 'string' && sampleValue.match(/^https?:\/\//)) {
		// eslint-disable-next-line react/display-name
		return (value) => (
			<a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
				{String(value).length > 30 ? `${String(value).substring(0, 30)}...` : String(value)}
			</a>
		);
	}
	
	if (typeof sampleValue === 'string') {
		const avgLength = nonNullValues.reduce((sum: number, val) => sum + String(val).length, 0) / nonNullValues.length;
		
		if (avgLength > 50) {
			// eslint-disable-next-line react/display-name
			return (value) => {
				const str = String(value);
				return str.length > 60 ? (
					<span title={str}>{str.substring(0, 60)}...</span>
				) : str;
			};
		}
		
		// eslint-disable-next-line react/display-name
		return (value) => (
			<span title={String(value)}>{String(value)}</span>
		);
	}
	
	return () => null;
}

function generateColumns(data: DataRow[]): ColumnGeneration {
	if (!data || data.length === 0) {
		return { columns: [], data };
	}
	
	const allKeys = new Set<string>();
	data.forEach(row => {
		Object.keys(row).forEach(key => allKeys.add(key));
	});
	
	const columns: Column[] = Array.from(allKeys).map(key => {
		const values = data.map(row => row[key]).filter(val => val != null);
		
		return {
			key,
			label: formatLabel(key),
			align: detectAlignment(values),
			width: detectWidth(key, values),
			render: createRenderer(values)
		};
	});
	
	return {
		columns,
		data
	};
}

function Block({ block, dataRowPromise }: TableBlockProps) {
	const tableData = use(dataRowPromise);
	const { caption, description, mobileLayout } = block;
	const { columns, data } = generateColumns(tableData);
	
	if (!data?.length || !columns?.length) {
		return null;
	}
	
	const getAlignment = (align?: string) => {
		switch (align) {
			case 'center': return 'text-center';
			case 'right': return 'text-right';
			default: return 'text-left';
		}
	};
	
	const renderCellValue = (column: Column, row: DataRow) => {
		const value = row[column.key];
		return column.render ? column.render(value, row) : String(value);
	};
	
	return (
		<Card className="border-border/50 py-0">
			<CardContent className="p-0">
				<table className={`w-full ${mobileLayout === 'SCROLL' ? 'table' : 'hidden sm:table'}`}>
					{caption && (
						<caption className="text-left">
							<CardHeader className={'p-6 w-full'}>
								<CardTitle>{caption}</CardTitle>
								{description && <CardDescription>{description}</CardDescription>}
							</CardHeader>
						</caption>
					)}
					<thead>
					<tr className="border-b border-border/50">
						{columns.map((column) => (
							<th
								key={column.key}
								className={`px-6 py-3 text-sm font-medium text-muted-foreground ${getAlignment(column.align)}`}
								style={{ width: column.width }}
							>
								{column.label}
							</th>
						))}
					</tr>
					</thead>
					<tbody>
					{data.map((row, index) => (
						<tr
							key={index}
							className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
						>
							{columns.map((column) => (
								<td
									key={column.key}
									className={`px-6 py-4 text-sm ${getAlignment(column.align)}`}
								>
									{renderCellValue(column, row)}
								</td>
							))}
						</tr>
					))}
					</tbody>
				</table>
				
				{mobileLayout !== 'SCROLL' && (
					<div className="sm:hidden w-full">
						{caption && (
							<div className="text-sm text-muted-foreground pt-4 pb-2 px-4 w-full">
								{caption}
							</div>
						)}
						
						{mobileLayout === 'CARDS' && (
							<div className="space-y-3 p-4">
								{data.map((row, index) => (
									<Card key={index} className="border-border/30">
										<CardContent className="p-3 space-y-2">
											{columns.map((column) => (
												<div key={column.key} className="flex justify-between items-start">
							                                <span className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-2">
							                                    {column.label}:
							                                </span>
															<span className="text-sm text-right flex-1">
																{renderCellValue(column, row)}
															</span>
												</div>
											))}
										</CardContent>
									</Card>
								))}
							</div>
						)}
						
						{mobileLayout === 'STACK' && (
							<div>
								{data.map((row, index) => (
									<div
										key={index}
										className="px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors space-y-1"
									>
										{columns.map((column, colIndex) => (
											<div key={column.key}>
												{colIndex === 0 ? (
													<div className="font-medium text-sm">
														{renderCellValue(column, row)}
													</div>
												) : (
													<div className="text-xs text-muted-foreground">
														<span className="font-medium">{column.label}:</span>{' '}
														{renderCellValue(column, row)}
													</div>
												)}
											</div>
										))}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function TableBlock({ block }: { block: TableBlockData }) {
	return (
		<Suspense fallback={<BlockLoading />}>
			<Block block={block} dataRowPromise={unwrap(getDataRows(block.fileId))} />
		</Suspense>
	);
}
