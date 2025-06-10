"use client";

import { useCallback, useMemo, useState } from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PollingOption as PrismaPollingOption } from "@/generated/prisma";
import { PollingBlockData } from "@/services/types";

interface PollingBlockProps {
	block: PollingBlockData;
}

interface PollingOptionProps {
	option: PrismaPollingOption;
	disabled: boolean;
	isSelected: boolean;
	totalVotes: number;
	onVote: (optionId: string) => void;
}

function PollingOption({ option, disabled, isSelected, totalVotes, onVote }: PollingOptionProps) {
	const { id, label, count } = option;
	const percentage = useMemo(() => totalVotes > 0 ? (count / totalVotes) * 100 : 0, [count, totalVotes]);

	const handleVote = useCallback(() => {
		if (!disabled) {
			onVote(id);
		}
	}, [disabled, id, onVote]);

	return (
		<button
			onClick={handleVote}
			className={
				cn(
					'flex flex-col items-center justify-between border border-border rounded-lg p-4 space-y-2 shadow-sm w-full',
					{
						'border-muted/50 bg-muted/50 cursor-not-allowed': disabled,
						'border-primary/50 border-2 cursor-not-allowed': isSelected,
					}
				)
			}
		>
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center justify-start space-x-2">
					<span className="text-sm">{label}</span>
				</div>
				{
					disabled && (
						<div className="flex items-center justify-end space-x-2">
							<span className="text-sm">{percentage.toFixed(1)}%</span>
						</div>
					)
				}
			</div>
			{
				disabled && (
					<Progress value={percentage} className="w-full h-[4px] my-1" />
				)
			}
		</button>
	)
}

export function PollingBlock({ block }: PollingBlockProps) {
	const { title, description, options } = block;
	const [voted, setVoted] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string>('');
	const totalVotes = useMemo(() => options.reduce((acc, option) => acc + option.count, 0), [options]);

	const handleVote = useCallback((optionId: string) => {
		setSelectedOption(optionId);
		setVoted(true);
	}, []);

	return (
		<Card className="border-border/50">
			{(title || description) && (
				<CardHeader>
					{title && <CardTitle>{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
				</CardHeader>
			)}
			<CardContent className="space-y-4">
				{
					options.map((option) => (
						<PollingOption
							key={option.id}
							option={option}
							disabled={voted}
							isSelected={selectedOption === option.id}
							totalVotes={totalVotes}
							onVote={handleVote}
						/>
					))
				}
			</CardContent>
		</Card>
	);
}

