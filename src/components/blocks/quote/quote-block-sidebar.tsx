"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CreateQuoteBlockInput } from "@/services/types";
import { BaseBlockSidebarProps } from "@/components/sidebars/types";
import { BaseBlockSidebarLayout, BlockSidebarHeader, BlockSidebarFooter } from "@/components/sidebars/base-block-sidebar";

export const defaultCreateQuoteProps: CreateQuoteBlockInput = {
	quote: "The best way to predict the future is to invent it.",
	author: "Alan Kay",
	source: "Computer Scientist",
};

export function QuoteBlockSidebar({ onClose, onSave, onDelete, initialData, isUpdate }: BaseBlockSidebarProps<CreateQuoteBlockInput>) {
	const [quote, setQuote] = useState(initialData.quote);
	const [author, setAuthor] = useState(initialData.author);
	const [source, setSource] = useState(initialData.source);

	const handleQuoteChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setQuote(e.target.value);
	}, []);

	const handleAuthorChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setAuthor(e.target.value);
	}, []);

	const handleSourceChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		setSource(e.target.value);
	}, []);

	const handleSave = useCallback(() => {
		onSave({
			quote,
			author,
			source,
		});
	}, [quote, author, source, onSave]);

	const isValid = useMemo(() => quote.trim().length > 0, [quote]);

	return (
		<BaseBlockSidebarLayout
			header={
				<BlockSidebarHeader
					title={isUpdate ? "Edit Quote Component" : "Create Quote Component"}
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
			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<label htmlFor="quote" className="text-sm font-medium">
						Quote
					</label>
					<Textarea
						id="quote"
						value={quote}
						onChange={handleQuoteChange}
						placeholder="Enter your quote here"
						className="min-h-[100px]"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="author" className="text-sm font-medium">
						Author
					</label>
					<Textarea
						id="author"
						value={author}
						onChange={handleAuthorChange}
						placeholder="Enter the quote author"
						className="min-h-[100px]"
					/>
				</div>

				<div className="flex flex-col space-y-2">
					<label htmlFor="source" className="text-sm font-medium">
						Source
					</label>
					<Textarea
						id="source"
						value={source}
						onChange={handleSourceChange}
						placeholder="Enter the quote source"
						className="min-h-[100px]"
					/>
				</div>
			</div>
		</BaseBlockSidebarLayout>
	);
} 