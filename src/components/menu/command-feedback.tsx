"use client";

import {useEffect, useState} from 'react';
import {useBlockPostState} from '@/commands/CommandManager';
import {cn} from '@/lib/utils';
import {CheckCircle, Redo, Undo} from 'lucide-react';

interface FeedbackState {
	show: boolean;
	type: 'undo' | 'redo' | 'save' | null;
	message: string;
}

export function CommandFeedback () {
	const [feedback, setFeedback] = useState<FeedbackState> ({
		show: false,
		type: null,
		message: ''
	});
	
	const {canUndo, canRedo} = useBlockPostState ((state) => ({
		canUndo: state.canUndo,
		canRedo: state.canRedo
	}));
	
	// Track changes in undo/redo state to show feedback
	const [prevCanUndo, setPrevCanUndo] = useState (canUndo);
	const [prevCanRedo, setPrevCanRedo] = useState (canRedo);
	
	useEffect (() => {
		// If canUndo changed from true to false, an undo was executed
		if (prevCanUndo && ! canUndo) {
			showFeedback ('undo', 'Action undone');
		}
		// If canRedo changed from true to false, a redo was executed
		else if (prevCanRedo && ! canRedo) {
			showFeedback ('redo', 'Action redone');
		}
		// If canUndo became true, a new action was performed
		else if ( ! prevCanUndo && canUndo) {
			showFeedback ('save', 'Action saved');
		}
		
		setPrevCanUndo (canUndo);
		setPrevCanRedo (canRedo);
	}, [canUndo, canRedo, prevCanUndo, prevCanRedo]);
	
	const showFeedback = (type: 'undo' | 'redo' | 'save', message: string) => {
		setFeedback ({show: true, type, message});
		setTimeout (() => {
			setFeedback (prev => ({...prev, show: false}));
		}, 2000);
	};
	
	const getIcon = () => {
		switch (feedback.type) {
			case 'undo':
				return <Undo className="w-4 h-4"/>;
			case 'redo':
				return <Redo className="w-4 h-4"/>;
			case 'save':
				return <CheckCircle className="w-4 h-4"/>;
			default:
				return null;
		}
	};
	
	const getColor = () => {
		switch (feedback.type) {
			case 'undo':
				return 'bg-blue-500';
			case 'redo':
				return 'bg-green-500';
			case 'save':
				return 'bg-emerald-500';
			default:
				return 'bg-gray-500';
		}
	};
	
	if ( ! feedback.show || ! feedback.type) return null;
	
	return (
		<div className="fixed bottom-4 right-4 z-50">
			<div className={cn (
				"flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg",
				"transform transition-all duration-300 ease-in-out",
				feedback.show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
				getColor ()
			)}>
				{getIcon ()}
				<span className="text-sm font-medium">{feedback.message}</span>
			</div>
		</div>
	);
}