import { AnimatePresence, motion } from 'framer-motion';
import {ReactNode, createContext, useContext, useState, useEffect} from 'react';
import { cn } from '@/lib/utils';
import React from 'react';

export enum Direction {
	forward = 'forward',
	backward = 'backward'
}

interface AnimatedViewContextType {
	activeViewId: string;
	direction: Direction;
	horizontal: boolean;
}

interface AnimatedContentProps {
	children: ReactNode;
	className?: string;
	id: string;
}

interface AnimatedViewProviderProps {
	children: ReactNode;
	currentId: string;
	possibleIds: string[];
	horizontal?: boolean;
	className?: string;
}

interface AnimatedViewsProps {
	children: ReactNode;
	currentId: string;
	possibleIds: string[];
	vertical?: boolean;
	className?: string;
}

const variants = {
	enter: ({direction, horizontal}: {direction: Direction; horizontal: boolean}) => ({
		x: horizontal ? (direction === Direction.forward ? '100%' : '-100%') : 0,
		y: horizontal ? 0 : (direction === Direction.forward ? '100%' : '-100%'),
		opacity: 0,
	}),
	center: {
		x: 0,
		y: 0,
		opacity: 1,
	},
	exit: ({direction, horizontal}: {direction: Direction; horizontal: boolean}) => ({
		x: horizontal ? (direction === Direction.forward ? '-100%' : '100%') : 0,
		y: horizontal ? 0 : (direction === Direction.forward ? '-100%' : '100%'),
		opacity: 0,
	}),
};

const AnimatedViewContext = createContext<AnimatedViewContextType | undefined>(undefined);

function useAnimatedView() {
	const context = useContext(AnimatedViewContext);
	if (context === undefined) {
		throw new Error('useAnimatedView must be used within an AnimatedViewProvider');
	}
	return context;
}

function AnimatedViewProvider({
	children,
	currentId,
	className,
	possibleIds,
	horizontal = true
}: AnimatedViewProviderProps) {
	const [direction, setDirection] = useState<Direction>(Direction.forward);
	const [prevId, setPrevId] = useState(currentId);

	useEffect(() => {
		if (currentId !== prevId) {
			const currentIndex = possibleIds.indexOf(currentId);
			const prevIndex = possibleIds.indexOf(prevId);
			const direction = currentIndex > prevIndex ? Direction.forward : Direction.backward;
			setDirection(direction);
			setPrevId(currentId);
		}
	}, [currentId, prevId, possibleIds]);

	return (
		<AnimatedViewContext.Provider value={{
			activeViewId: currentId,
			direction,
			horizontal
		}}>
			<div className={cn("relative overflow-hidden", className)}>
				<AnimatePresence
					initial={false}
					mode="popLayout"
				>
					{children}
				</AnimatePresence>
			</div>
		</AnimatedViewContext.Provider>
	);
}

export function AnimatedContent({ children, className, id }: AnimatedContentProps) {
	const { direction, horizontal, activeViewId } = useAnimatedView();
	
	return (
		<motion.div
			key={id}
			initial="enter"
			animate={id === activeViewId ? "center" : "exit"}
			exit="exit"
			variants={variants}
			custom={{
				direction,
				horizontal,
			}}
			transition={{
				duration: 0.3,
				ease: "easeInOut"
			}}
			className={cn("absolute inset-0 w-full h-full", className)}
			style={{
				position: 'absolute',
				pointerEvents: id === activeViewId ? 'auto' : 'none'
			}}
		>
			{children}
		</motion.div>
	);
}

export function AnimatedViews({
	children,
	currentId,
	possibleIds,
	vertical = false,
	className = '',
}: AnimatedViewsProps) {
	return (
		<AnimatedViewProvider
			currentId={currentId}
			possibleIds={possibleIds}
			horizontal={!vertical}
			className={className}
		>
			{React.Children.map(children, (child) => {
				if (!React.isValidElement(child)) return child;
				const element = child as React.ReactElement<AnimatedContentProps>;
				return React.cloneElement(element, {
					key: element.props.id
				});
			})}
		</AnimatedViewProvider>
	);
}
