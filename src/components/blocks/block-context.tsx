'use client';

import { createContext, useContext, ReactNode } from 'react';

interface BlockContextValue {
  isEditMode: boolean;
}

const BlockContext = createContext<BlockContextValue>({
  isEditMode: false,
});

export function BlockProvider({ children, isEditMode }: { children: ReactNode; isEditMode: boolean }) {
  return (
    <BlockContext.Provider value={{ isEditMode }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlockContext() {
  return useContext(BlockContext);
}