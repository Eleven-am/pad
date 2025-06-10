import { MediaService } from "@/services/mediaService";
import { TaskEither, createBadRequestError, Either } from "@eleven-am/fp";
import { DataRow, analyzeChartOptions, ChartOptions, prepareChartData, ChartSelections, PreparedChartData } from "@/lib/charts";
import { PrismaClient } from "@/generated/prisma";

/**
 * Service for handling table data operations, including retrieving and formatting data from files
 */
export class TableService {
	constructor (
		private readonly prisma: PrismaClient,
		private readonly mediaService: MediaService,
	) {}
	
	/**
	 * Retrieves formatted table data from a file based on its ID
	 * @param fileId - ID of the file containing table data
	 * @returns TaskEither resolving to an array of DataRow objects
	 */
	getFormatedData(fileId: string): TaskEither<DataRow[]> {
		return this.mediaService.getFileBuffer(fileId)
			.matchTask([
				{
					predicate: ({ file }) => file.mimeType === 'application/json',
					run: ({ buffer }) => this.getJsonTableData(buffer),
				},
				{
					predicate: ({ file }) => file.mimeType === 'text/csv',
					run: ({ buffer }) => this.getCsvTableData(buffer),
				}
			]);
	}
	
	/**
	 * NEW: Analyzes file data to suggest chart configuration options
	 * Replaces the old getChartOptions that relied on DataSource
	 *
	 * @param fileId - ID of the file to analyze
	 * @returns TaskEither resolving to ChartOptions with field analysis and suggestions
	 */
	analyzeFileForChart(fileId: string): TaskEither<ChartOptions> {
		return this.getFormatedData(fileId)
			.map((data) => analyzeChartOptions(data));
	}
	
	/**
	 * NEW: Prepares chart data from a file and user selections
	 * Replaces the old getChartOptions that relied on DataSource
	 *
	 * @param fileId - ID of the file containing the data
	 * @param userSelections - User's field selections for the chart
	 * @returns TaskEither resolving to PreparedChartData ready for rendering
	 */
	prepareChartFromFile(fileId: string, userSelections: ChartSelections): TaskEither<PreparedChartData> {
		return this.getFormatedData(fileId)
			.map((data) => prepareChartData(data, userSelections));
	}
	
	/**
	 * Parses JSON file buffer and returns formatted table data
	 *
	 * @private
	 * @param buffer - Buffer containing JSON file data
	 * @returns TaskEither resolving to DataRow array
	 */
	private getJsonTableData(buffer: Buffer): TaskEither<DataRow[]> {
		return Either
			.of(buffer.toString('utf8'))
			.chain((jsonString) => Either.tryCatch(() => JSON.parse(jsonString)))
			.filter(
				(parsed) => Array.isArray(parsed),
				() => createBadRequestError('Invalid JSON structure for table data')
			)
			.toTaskEither();
	}
	
	/**
	 * Parses CSV file buffer and returns formatted table data
	 *
	 * @private
	 * @param buffer - Buffer containing CSV file data
	 * @returns TaskEither resolving to DataRow array
	 */
	private getCsvTableData(buffer: Buffer): TaskEither<DataRow[]> {
		const csv = buffer.toString('utf8').trim();
		const lines = csv.split('\n')
		const result = []
		const headers = lines[0].split(',')
		
		for (let i = 1; i < lines.length; i++) {
			if (!lines[i])
				continue
			
			const obj: Record<string, string> = {}
			
			const currentLine = lines[i].split(',')
			
			for (let j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentLine[j]
			}
			
			result.push(obj)
		}
		
		return TaskEither.of(result);
	}
}