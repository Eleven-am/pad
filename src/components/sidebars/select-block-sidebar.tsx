"use client";

import React, {ChangeEvent, useCallback, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {BlockType} from "@/services/types";
import {useMenu} from "@/components/menu";
import {getAllBlockDefinitions} from "./registry/block-registry";
import {sortBy} from "@eleven-am/fp";

export const SelectBlock = React.memo(() => {
	const [searchQuery, setSearchQuery] = useState ("");
	const {setBlocksSubPanel, setBlockType} = useMenu ();
	const blocks = getAllBlockDefinitions ();
	
	const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery (e.target.value);
	}, []);
	
	const handleSelectBlock = useCallback((type: BlockType) => () => {
		setBlockType (type);
		setBlocksSubPanel ('edit');
	}, [setBlockType, setBlocksSubPanel]);
	
	const filteredBlocks = useMemo(() => blocks.filter((block) =>
		block.label.toLowerCase ().includes (searchQuery.toLowerCase ()) ||
		block.description.toLowerCase ().includes (searchQuery.toLowerCase ())
	), [blocks, searchQuery]);
	
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex flex-col w-full p-4 space-y-4 border-b border-border">
				<h3 className="text-lg font-semibold">
					Select a component
				</h3>
				<div className="relative group">
					<Search
						className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary pointer-events-none z-10"
					/>
					<Input
						type="search"
						value={searchQuery}
						onChange={handleSearch}
						placeholder="Search for a component"
						className="w-full h-10 pl-8"
					/>
				</div>
			</div>
			
			<div className="flex flex-col w-full flex-1 overflow-y-scroll">
				{sortBy(filteredBlocks, 'type', 'asc').map((block, index) => (
					<div key={`${block.type}-${index}`}>
						<div
							role="button"
							onClick={handleSelectBlock (block.type)}
							className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-muted/10 transition-colors duration-200"
						>
							{block.icon}
							<div className="flex flex-col">
								<span className="font-semibold">{block.label}</span>
								<span className="text-sm text-muted-foreground">{block.description}</span>
							</div>
						</div>
						{index < blocks.length - 1 && (
							<hr className="border-border"/>
						)}
					</div>
				))}
			</div>
		</div>
	);
});

SelectBlock.displayName = 'SelectBlock';