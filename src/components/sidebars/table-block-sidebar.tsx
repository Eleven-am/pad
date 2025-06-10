"use client";

import {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {CreateTableBlockInput, BlockType} from "@/services/types";
import {TableMobileLayout} from "@/generated/prisma";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter} from "@/components/sidebars/base-block-sidebar";
import {UploadComponent} from "@/components/upload-component";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {BarChart, X} from "lucide-react";
import {useBlockContext} from "./context/block-context";
import {Views} from "./types";
import {defaultCreateChartProps} from "../blocks/chart/chart-block-sidebar";
import {getAllBlockDefinitions} from "./registry/block-registry";

export const defaultCreateTableProps: CreateTableBlockInput = {
	caption: "Data Table",
	description: "A table displaying structured data",
	mobileLayout: TableMobileLayout.CARDS,
	fileId: "",
};

export function TableBlockSidebar({onClose, onSave, onDelete, initialData, isUpdate}: BaseBlockSidebarProps<CreateTableBlockInput>) {
	const [caption, setCaption] = useState(initialData.caption || "");
	const [description, setDescription] = useState(initialData.description || "");
	const [mobileLayout, setMobileLayout] = useState<TableMobileLayout>(initialData.mobileLayout || TableMobileLayout.CARDS);
	const [fileId, setFileId] = useState(initialData.fileId);
	
	const { setBlockType, setView } = useBlockContext();
	
	const handleCaptionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setCaption(e.target.value);
	}, []);
	
	const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
	}, []);
	
	const handleMobileLayoutChange = useCallback((value: TableMobileLayout) => {
		setMobileLayout(value);
	}, []);
	
	const handleSave = useCallback(() => {
		onSave({
			caption,
			description,
			mobileLayout,
			fileId,
		});
	}, [caption, description, mobileLayout, fileId, onSave]);
	
	const handleCreateChart = useCallback(() => {
		if (!fileId) {
			return;
		}
		
		const chartDefinition = getAllBlockDefinitions().find(block => block.type === BlockType.CHART);
		if (chartDefinition) {
			chartDefinition.defaultData = {
				...defaultCreateChartProps,
				fileId,
				title: `Chart from ${caption || 'Table Data'}`,
				description: description ? `Chart visualization of: ${description}` : "",
			};
		}
		
		setBlockType(BlockType.CHART);
		setView(Views.BlockSidebar);
	}, [fileId, caption, description, setBlockType, setView]);
	
	const isValid = useMemo(() => fileId.length > 0, [fileId]);
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Table" : "Create Table"}
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
			<div className="flex flex-col space-y-2">
				<label htmlFor="caption" className="text-sm font-medium">
					Table Caption
				</label>
				<Input
					id="caption"
					value={caption}
					onChange={handleCaptionChange}
					placeholder="Enter table caption"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="description" className="text-sm font-medium">
					Table Description
				</label>
				<Textarea
					id="description"
					value={description}
					onChange={handleDescriptionChange}
					placeholder="Enter table description"
					className="min-h-[100px]"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<Label htmlFor="mobileLayout">Mobile Layout</Label>
				<Select
					value={mobileLayout}
					onValueChange={handleMobileLayoutChange}
				>
					<SelectTrigger className={'w-full'}>
						<SelectValue placeholder="Select mobile layout" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={TableMobileLayout.CARDS}>Cards</SelectItem>
						<SelectItem value={TableMobileLayout.STACK}>Stack</SelectItem>
						<SelectItem value={TableMobileLayout.SCROLL}>Scroll</SelectItem>
					</SelectContent>
				</Select>
			</div>
			
			<div className="flex flex-col space-y-4">
				<label className="text-sm font-medium">
					Upload Table Data
				</label>
				<UploadComponent
					fileTypes={["application/json", "text/csv"]}
					onFileUpload={(file) => setFileId(file.id)}
					uploadEndpoint={'/api/files'}
				/>
				
				{fileId && (
					<div className="flex flex-col space-y-2">
						<label className="text-sm font-medium">
							Uploaded File
						</label>
						<div className="relative w-full flex items-center justify-between px-4 h-12 bg-muted rounded-lg overflow-hidden">
								<span className="text-sm text-muted-foreground">
									Table data file uploaded
								</span>
							<Button
								variant="ghost"
								className="p-1 rounded-full"
								onClick={() => setFileId("")}
							>
								<X />
							</Button>
						</div>
						
						<div className="mt-4 pt-4 border-t border-border">
							<div className="flex flex-col space-y-2">
								<label className="text-sm font-medium">
									Create Visualization
								</label>
								<Button
									variant="outline"
									onClick={handleCreateChart}
									className="w-full"
									disabled={!fileId}
								>
									<BarChart className="w-4 h-4 mr-2" />
									Create Chart from Table Data
								</Button>
								<p className="text-xs text-muted-foreground">
									Create a chart using the same data as this table
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</BaseBlockSidebarLayout>
	);
}
