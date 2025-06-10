"use client";

import {ChangeEvent, useCallback, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {CreateCodeBlockInput} from "@/services/types";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {BaseBlockSidebarProps} from "@/components/sidebars/types";
import {BaseBlockSidebarLayout, BlockSidebarFooter, BlockSidebarHeader} from "@/components/sidebars/base-block-sidebar";

export const defaultCreateCodeProps: CreateCodeBlockInput = {
	codeText: `// Example of a React component using TypeScript
interface ButtonProps {
  string;
  () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};`,
	language: "typescript",
	showLineNumbers: true,
	title: "React Button Component Example",
	maxHeight: 400,
	startLine: 1,
	highlightLines: [1, 2, 3, 4, 5],
};

const languages = [
	{value: "typescript", label: "TypeScript"},
	{value: "javascript", label: "JavaScript"},
	{value: "python", label: "Python"},
	{value: "java", label: "Java"},
	{value: "csharp", label: "C#"},
	{value: "cpp", label: "C++"},
	{value: "ruby", label: "Ruby"},
	{value: "php", label: "PHP"},
	{value: "go", label: "Go"},
	{value: "rust", label: "Rust"},
	{value: "swift", label: "Swift"},
	{value: "kotlin", label: "Kotlin"},
	{value: "scala", label: "Scala"},
	{value: "html", label: "HTML"},
	{value: "css", label: "CSS"},
	{value: "sql", label: "SQL"},
	{value: "bash", label: "Bash"},
	{value: "json", label: "JSON"},
	{value: "yaml", label: "YAML"},
	{value: "markdown", label: "Markdown"},
];

export function CodeBlockSidebar ({
  onClose,
  onSave,
  onDelete,
  initialData,
  isUpdate
}: BaseBlockSidebarProps<CreateCodeBlockInput>) {
	const [codeText, setCodeText] = useState (initialData.codeText);
	const [language, setLanguage] = useState (initialData.language || "typescript");
	const [showLineNumbers, setShowLineNumbers] = useState (initialData.showLineNumbers ?? true);
	const [title, setTitle] = useState (initialData.title || "");
	const [maxHeight, setMaxHeight] = useState (initialData.maxHeight || 400);
	const [startLine, setStartLine] = useState (initialData.startLine || 1);
	const [highlightLines, setHighlightLines] = useState (initialData.highlightLines || []);
	
	const handleCodeChange = useCallback ((e: ChangeEvent<HTMLTextAreaElement>) => {
		setCodeText (e.target.value);
	}, []);
	
	const handleLanguageChange = useCallback ((value: string) => {
		setLanguage (value);
	}, []);
	
	const handleShowLineNumbersChange = useCallback ((checked: boolean) => {
		setShowLineNumbers (checked);
	}, []);
	
	const handleTitleChange = useCallback ((e: ChangeEvent<HTMLInputElement>) => {
		setTitle (e.target.value);
	}, []);
	
	const handleMaxHeightChange = useCallback ((e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt (e.target.value);
		if ( ! isNaN (value)) {
			setMaxHeight (value);
		}
	}, []);
	
	const handleStartLineChange = useCallback ((e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt (e.target.value);
		if ( ! isNaN (value)) {
			setStartLine (value);
		}
	}, []);
	
	const handleHighlightLinesChange = useCallback ((e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const lines = value.split (",").map (line => {
			const num = parseInt (line.trim ());
			return isNaN (num) ? null : num;
		}).filter ((num): num is number => num !== null);
		setHighlightLines (lines);
	}, []);
	
	const handleSave = useCallback (() => {
		onSave({
			codeText,
			language,
			showLineNumbers,
			title,
			maxHeight,
			startLine,
			highlightLines,
		});
	}, [codeText, language, showLineNumbers, title, maxHeight, startLine, highlightLines, onSave]);
	
	const isValid = codeText.trim ().length > 0;
	
	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Code Component" : "Create Code Component"}
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
			<div className="flex flex-col space-y-2 w-full">
				<label htmlFor="language" className="text-sm font-medium">
					Language
				</label>
				<Select value={language} onValueChange={handleLanguageChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select language"/>
					</SelectTrigger>
					<SelectContent>
						{languages.map (({value, label}) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="title" className="text-sm font-medium">
					Title
				</label>
				<Input
					id="title"
					value={title}
					onChange={handleTitleChange}
					placeholder="Enter code title"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="code" className="text-sm font-medium">
					Code
				</label>
				<Textarea
					id="code"
					value={codeText}
					onChange={handleCodeChange}
					placeholder="Enter your code"
					className="min-h-[200px] font-mono"
				/>
			</div>
			
			<div className="flex items-center justify-between">
				<label htmlFor="line-numbers" className="text-sm font-medium">
					Show Line Numbers
				</label>
				<Switch
					id="line-numbers"
					checked={showLineNumbers}
					onCheckedChange={handleShowLineNumbersChange}
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="max-height" className="text-sm font-medium">
					Max Height (px)
				</label>
				<Input
					id="max-height"
					type="number"
					value={maxHeight}
					onChange={handleMaxHeightChange}
					placeholder="Enter max height"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="start-line" className="text-sm font-medium">
					Start Line Number
				</label>
				<Input
					id="start-line"
					type="number"
					value={startLine}
					onChange={handleStartLineChange}
					placeholder="Enter start line number"
				/>
			</div>
			
			<div className="flex flex-col space-y-2">
				<label htmlFor="highlight-lines" className="text-sm font-medium">
					Highlight Lines (comma-separated)
				</label>
				<Input
					id="highlight-lines"
					value={highlightLines.join (", ")}
					onChange={handleHighlightLinesChange}
					placeholder="e.g., 1, 3, 5-7"
				/>
			</div>
		</BaseBlockSidebarLayout>
	);
} 