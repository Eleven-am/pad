"use client";

import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import {Views} from "@/components/sidebars/types";
import {BlockType, UnifiedBlockOutput} from "@/services/types";
import {useTimer} from "@/hooks/useTimer";

interface BlockContextType {
	view: Views;
	postId: string;
	blockType: BlockType | null;
	blockName: string;
	blockId: string | null;
	blockData: UnifiedBlockOutput | null;
	setBlockId: (id: string | null) => void;
	setView: (view: Views) => void;
	setBlockType: (type: BlockType | null) => void;
	setBlockName: (name: string) => void;
	setBlockData: (data: UnifiedBlockOutput | null) => void;
	resetBlock: (view: Views) => void;
}

const BlockContext = createContext<BlockContextType | undefined> (undefined);

export function BlockProvider ({children, postId}: { children: ReactNode, postId: string }) {
	const { start } = useTimer();
	const [view, setView] = useState<Views> (Views.ManagePost);
	const [blockType, setBlockType] = useState<BlockType | null> (null);
	const [blockName, setBlockName] = useState<string>("");
	const [blockId, setBlockId] = useState<string | null>(null);
	const [blockData, setBlockData] = useState<UnifiedBlockOutput | null>(null);

	const resetBlock = useCallback((view: Views) => {
		setView(view);
		
		start(() => {
			setBlockType (null);
			setBlockName ("");
			setBlockId (null);
			setBlockData (null);
		}, 100);
	}, [start]);
	
	return (
		<BlockContext.Provider
			value={{
				view,
				postId,
				blockType,
				blockName,
				setView,
				setBlockType,
				setBlockName,
				blockId,
				blockData,
				setBlockId,
				setBlockData,
				resetBlock,
			}}
		>
			{children}
		</BlockContext.Provider>
	);
}

export function useBlockContext () {
	const context = useContext (BlockContext);
	if (context === undefined) {
		throw new Error ("useBlockContext must be used within a BlockProvider");
	}
	return context;
} 