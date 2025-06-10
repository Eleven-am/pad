"use client";

import { ReactNode, useRef, CSSProperties, useContext, createContext, useState, useCallback } from 'react';

import { Portal } from '@radix-ui/react-portal';
import { Slot } from '@radix-ui/react-slot';
import { AnimatePresence, motion } from 'framer-motion';

import { useEventListener } from '@/hooks/useEventListener';

interface ModalEngineProps {
	children: ReactNode;
	open: boolean;
	onClose: () => void;
	className?: string;
	style?: CSSProperties;
}

interface ModalProps {
	children: ReactNode;
	className?: string;
}

interface ModalTriggerProps {
	children: ReactNode;
	asChild?: boolean;
	className?: string;
}

interface ModalContentProps {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
	closeOnEscape?: boolean;
}

interface ModalCloseProps {
	children: ReactNode;
	asChild?: boolean;
	className?: string;
}

interface ModalContext {
	open: boolean;
	openModal: () => void;
	onClose: () => void;
}

function ModalEngine({ children, open, onClose, className, style }: ModalEngineProps) {
	const outerModalRef = useRef<HTMLDivElement | null>(null);
	const innerModalRef = useRef<HTMLDivElement | null>(null);
	
	useEventListener('click', (e) => {
		if (outerModalRef.current &&
			innerModalRef.current &&
			(outerModalRef.current.contains(e.target as Node) &&
				!innerModalRef.current.contains(e.target as Node))
		) {
			onClose();
		}
	});
	
	return (
		<AnimatePresence>
			{
				open && (
					<Portal>
						<div
							 ref={outerModalRef}
						     className={'fixed w-full h-screen top-0 left-0 justify-center items-center backdrop-blur-md bg-secondary/60 flex z-50'}
						     style={style}
						>
							<motion.div
								ref={innerModalRef}
								className={className}
								initial={
									{
										opacity: 0,
										scale: 0.75,
									}
								}
								animate={
									{
										opacity: 1,
										scale: 1,
										transition: {
											ease: 'easeOut',
											duration: 0.15,
										},
									}
								}
								exit={
									{
										opacity: 0,
										scale: 0.75,
										transition: {
											ease: 'easeIn',
											duration: 0.15,
										},
									}
								}
							>
								{children}
							</motion.div>
						</div>
					</Portal>
				)
			}
		</AnimatePresence>
	);
}

const modalContext = createContext<ModalContext>({
	open: false,
	openModal: () => {},
	onClose: () => {},
});

function useModalContext() {
	const context = useContext(modalContext);
	if (!context) {
		throw new Error('useModalContext must be used within a ModalProvider');
	}
	return context;
}

export function Modal({ children, className }: ModalProps) {
	const [open, setOpen] = useState(false);
	
	const onClose = useCallback(() => setOpen(false), []);
	const openModal = useCallback(() => setOpen(true), []);
	
	return (
		<modalContext.Provider value={{ open, openModal, onClose }}>
			<div className={className}>
				{children}
			</div>
		</modalContext.Provider>
	);
}

export function ModalTrigger ({ children, asChild = false, className = 'cursor-pointer' }: ModalTriggerProps) {
	const { openModal } = useModalContext();
	const Comp = asChild ? Slot : 'button';
	
	return (
		<Comp onClick={openModal} className={className}>
			{children}
		</Comp>
	);
}

export function ModalContent({
    children,
    className,
    style,
}: ModalContentProps) {
	const { open, onClose } = useModalContext();
	
	return (
		<ModalEngine
			open={open}
			onClose={onClose}
			className={className}
			style={style}
		>
			{children}
		</ModalEngine>
	);
}

export function ModalClose ({
    children,
    asChild = false,
    className = 'cursor-pointer'
}: ModalCloseProps) {
	const { onClose } = useModalContext();
	const Comp = asChild ? Slot : 'button';
	
	return (
		<Comp onClick={onClose} className={className}>
			{children}
		</Comp>
	);
}