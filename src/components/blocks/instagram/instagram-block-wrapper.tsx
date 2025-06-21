'use client';

import { InstagramBlockData } from '@/services/types';

interface InstagramFile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  fileId: string;
  blockId: string;
  publicUrl?: string;
}

interface ProcessedInstagramBlockData extends InstagramBlockData {
  avatarUrl?: string | null;
  files: InstagramFile[];
}
import { useBlockContext } from '../block-context';
import { getPublicUrlClient } from '@/lib/client-data';
import { InstagramBlock } from './instagram-block';
import { useEffect, useState } from 'react';

interface InstagramBlockWrapperProps {
  block: InstagramBlockData;
}

export function InstagramBlockWrapper({ block }: InstagramBlockWrapperProps) {
  const { isEditMode } = useBlockContext();
  const [processedBlock, setProcessedBlock] = useState<ProcessedInstagramBlockData | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      // In view mode, URLs should already be pre-fetched
      setProcessedBlock(block);
      return;
    }

    // In edit mode, fetch URLs for files that don't have them
    const processFiles = async () => {
      const [processedFiles, avatarUrl] = await Promise.all([
        // Process files
        Promise.all(
          block.files.map(async (file: InstagramFile) => {
            if (file.publicUrl) {
              return file;
            }
            
            try {
              const publicUrl = await getPublicUrlClient(file.fileId);
              return { ...file, publicUrl };
            } catch (error) {
              console.error(`Failed to fetch URL for file ${file.fileId}:`, error);
              return file;
            }
          })
        ),
        // Process avatar
        block.avatar && !('avatarUrl' in block)
          ? getPublicUrlClient(block.avatar).catch(() => null)
          : Promise.resolve(('avatarUrl' in block ? (block as ProcessedInstagramBlockData).avatarUrl : null) || null)
      ]);

      setProcessedBlock({
        ...block,
        files: processedFiles,
        avatarUrl
      } as ProcessedInstagramBlockData);
    };

    processFiles();
  }, [block, isEditMode]);

  if (!processedBlock) {
    return <div>Loading Instagram post...</div>;
  }

  return <InstagramBlock block={processedBlock} />;
}