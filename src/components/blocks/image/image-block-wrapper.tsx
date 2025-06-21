'use client';

import { ImagesBlockData } from '@/services/types';
import { GalleryImage } from '@/generated/prisma';
import { useBlockContext } from '../block-context';
import { getPublicUrlClient } from '@/lib/client-data';
import { ImagesBlock } from './image-block';
import { useEffect, useState } from 'react';

interface ImageBlockWrapperProps {
  block: ImagesBlockData;
}

export function ImageBlockWrapper({ block }: ImageBlockWrapperProps) {
  const { isEditMode } = useBlockContext();
  const [processedBlock, setProcessedBlock] = useState<ImagesBlockData | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      // In view mode, URLs should already be pre-fetched
      setProcessedBlock(block);
      return;
    }

    // In edit mode, fetch URLs for images that don't have them
    const processImages = async () => {
      const processedImages = await Promise.all(
        block.images.map(async (image: GalleryImage) => {
          const imageWithUrl = image as GalleryImage & { publicUrl?: string };
          if (imageWithUrl.publicUrl) {
            return imageWithUrl;
          }
          
          try {
            const publicUrl = await getPublicUrlClient(image.fileId);
            return { ...image, publicUrl };
          } catch (error) {
            console.error(`Failed to fetch URL for image ${image.fileId}:`, error);
            return image;
          }
        })
      );

      setProcessedBlock({
        ...block,
        images: processedImages
      } as ImagesBlockData);
    };

    processImages();
  }, [block, isEditMode]);

  if (!processedBlock) {
    return <div>Loading images...</div>;
  }

  return <ImagesBlock block={processedBlock} />;
}