"use client";

import { useEffect } from 'react';
import { useBlockPostActions, useBlockPostState } from '@/commands/CommandManager';

export function KeyboardShortcuts() {
  const { undo, redo } = useBlockPostActions();
  const { canUndo, canRedo } = useBlockPostState((state) => ({
    canUndo: state.canUndo,
    canRedo: state.canRedo
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field - don't trigger shortcuts
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.contentEditable === 'true';
      
      if (isEditing) return;

      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) ||
          ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // This component doesn't render anything
  return null;
}