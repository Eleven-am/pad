"use client"

import {useCallback, useMemo, useState} from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader
} from '@/components/ui/card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";
import { CodeBlockData } from '@/services/types';

interface CodeBlockProps {
	block: CodeBlockData;
	className?: string;
}

export function CodeBlock({ block, className }: CodeBlockProps) {
	const {
		codeText,
		language,
		showLineNumbers,
		title,
		maxHeight,
		highlightLines,
		startLine
	} = block;
	
	const [copied, setCopied] = useState(false);
	const { theme } = useTheme();
	
	const cssProperties = useMemo(() => {
		if (theme === 'dark') return oneDark;
		if (theme === 'light') return oneLight;
		
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? oneDark : oneLight;
		}
		
		return oneDark;
	}, [theme]);
	
	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(codeText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy code:', err);
		}
	}, [codeText]);
	
	const customStyle = useMemo(() => ({
		margin: 0,
		padding: 0,
		backgroundColor: 'transparent',
		fontSize: '0.875rem',
		lineHeight: '1.5',
		maxHeight: `${maxHeight}px`,
		overflow: 'auto',
	}), [maxHeight]);
	
	return (
		<Card className={`py-0 gap-0 overflow-hidden ${className || ''}`}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 bg-muted/30">
				<div className="flex items-center gap-2">
					{title ? (
						<span className="text-sm font-medium">{title}</span>
					) : (
						<span className="text-xs uppercase tracking-wide text-muted-foreground">
							{language}
						</span>
					)}
				</div>
				
				<Button
					variant="ghost"
					size="sm"
					onClick={handleCopy}
					className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
				>
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</CardHeader>
			
			<CardContent className="p-0">
				<SyntaxHighlighter
					language={language}
					style={cssProperties}
					customStyle={customStyle}
					showLineNumbers={showLineNumbers}
					startingLineNumber={startLine}
					lineNumberStyle={{
						minWidth: '3em',
						paddingRight: '1em',
						paddingLeft: '1rem',
						color: '#6b7280',
						borderRight: '1px solid hsl(var(--border))',
						marginRight: '1em',
						userSelect: 'none'
					}}
					lineProps={(lineNumber) => {
						const isHighlighted = highlightLines.includes(lineNumber);
						return {
							style: {
								display: 'block',
								backgroundColor: isHighlighted
									? 'hsl(var(--accent) / 0.1)'
									: 'transparent',
								borderLeft: isHighlighted
									? '3px solid hsl(var(--accent))'
									: '3px solid transparent',
								paddingLeft: '0.5rem',
								marginLeft: '-0.5rem',
								paddingRight: '1rem'
							}
						};
					}}
					codeTagProps={{
						style: {
							padding: '1rem',
							display: 'block'
						}
					}}
					wrapLongLines={false}
				>
					{codeText.trim()}
				</SyntaxHighlighter>
			</CardContent>
		</Card>
	);
}
