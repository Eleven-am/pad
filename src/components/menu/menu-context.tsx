"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { UnifiedBlockOutput, BlockType } from '@/services/types';

export type MenuPanel = 'post' | 'blocks' | 'queue' | 'collaborate' | 'view' | null;

export type BlocksSubPanel = 'select' | 'edit' | null;
export type CollaborateSubPanel = 'activity' | 'manage' | 'invite' | null;

interface MenuState {
  activePanel: MenuPanel;
  blocksSubPanel: BlocksSubPanel;
  collaborateSubPanel: CollaborateSubPanel;
  blockType?: BlockType;
  blockId?: string;
  blockData?: UnifiedBlockOutput | null;
  blockName?: string;
}

interface MenuContextValue extends MenuState {
  setActivePanel: (panel: MenuPanel) => void;
  setBlocksSubPanel: (subPanel: BlocksSubPanel) => void;
  setCollaborateSubPanel: (subPanel: CollaborateSubPanel) => void;
  setBlockType: (type: BlockType) => void;
  setBlockId: (id: string) => void;
  setBlockData: (data: UnifiedBlockOutput | null) => void;
  setBlockName: (name: string) => void;
  resetBlockState: () => void;
  closeAllPanels: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface MenuProviderProps {
  children: ReactNode;
  postId: string;
}

export function MenuProvider({ children, postId: _postId }: MenuProviderProps) {
  const [state, setState] = useState<MenuState>({
    activePanel: null,
    blocksSubPanel: null,
    collaborateSubPanel: null,
    blockType: undefined,
    blockId: undefined,
    blockData: null,
    blockName: undefined,
  });

  const setActivePanel = (panel: MenuPanel) => {
    setState(prev => ({
      ...prev,
      activePanel: panel,
      // Reset sub-panels when switching main panels
      blocksSubPanel: panel === 'blocks' ? prev.blocksSubPanel : null,
      collaborateSubPanel: panel === 'collaborate' ? prev.collaborateSubPanel : null,
    }));
  };

  const setBlocksSubPanel = (subPanel: BlocksSubPanel) => {
    setState(prev => ({
      ...prev,
      blocksSubPanel: subPanel,
      activePanel: subPanel ? 'blocks' : prev.activePanel,
    }));
  };

  const setCollaborateSubPanel = (subPanel: CollaborateSubPanel) => {
    setState(prev => ({
      ...prev,
      collaborateSubPanel: subPanel,
      activePanel: subPanel ? 'collaborate' : prev.activePanel,
    }));
  };

  const setBlockType = (type: BlockType) => {
    setState(prev => ({ ...prev, blockType: type }));
  };

  const setBlockId = (id: string) => {
    setState(prev => ({ ...prev, blockId: id }));
  };

  const setBlockData = (data: UnifiedBlockOutput | null) => {
    setState(prev => ({ ...prev, blockData: data }));
  };

  const setBlockName = (name: string) => {
    setState(prev => ({ ...prev, blockName: name }));
  };

  const resetBlockState = () => {
    setState(prev => ({
      ...prev,
      blockType: undefined,
      blockId: undefined,
      blockData: null,
      blockName: undefined,
    }));
  };

  const closeAllPanels = () => {
    setState(prev => ({
      ...prev,
      activePanel: null,
      blocksSubPanel: null,
      collaborateSubPanel: null,
    }));
  };

  const value: MenuContextValue = {
    ...state,
    setActivePanel,
    setBlocksSubPanel,
    setCollaborateSubPanel,
    setBlockType,
    setBlockId,
    setBlockData,
    setBlockName,
    resetBlockState,
    closeAllPanels,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}