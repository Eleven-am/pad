"use client";

import { UnifiedBlockOutput, BlockType } from "@/services/types";

// Type helpers for block types
type TextBlockData = UnifiedBlockOutput & { type: BlockType.TEXT };

export interface GeneratedExcerpt {
  text: string;
  imageFileId?: string;
  imageAlt?: string;
  wordCount: number;
}

/**
 * Client-side excerpt generation utilities
 * Mirrors the server-side PostExcerptService logic
 */
export class ClientExcerptGenerator {
  
  /**
   * Remove HTML tags from text content
   */
  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  /**
   * Extract first N words from text
   */
  private static extractWords(text: string, wordCount: number): string {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const selectedWords = words.slice(0, wordCount);
    return selectedWords.join(' ') + (words.length > wordCount ? '...' : '');
  }

  /**
   * Calculate total word count from text blocks
   */
  private static calculateWordCount(textBlocks: Array<{ text: string }>): number {
    return textBlocks.reduce((total, block) => {
      const textContent = this.stripHtml(block.text);
      const words = textContent.split(/\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0);
  }

  /**
   * Find the first image block and extract file ID and alt text
   */
  private static findFirstImage(blocks: UnifiedBlockOutput[]): { fileId?: string; alt?: string } {
    for (const block of blocks) {
      if (block.type === BlockType.IMAGES) {
        const imagesData = (block as UnifiedBlockOutput & { data: { images?: Array<{ fileId?: string; file?: { id?: string }; alt?: string }> } }).data;
        if (imagesData?.images && imagesData.images.length > 0) {
          const firstImage = imagesData.images[0];
          return {
            fileId: firstImage.fileId || firstImage.file?.id,
            alt: firstImage.alt
          };
        }
      }
    }
    return {};
  }

  /**
   * Find all text blocks from the current blocks
   */
  private static getTextBlocks(blocks: UnifiedBlockOutput[]): Array<{ text: string }> {
    const textBlocks = blocks
      .filter((block): block is TextBlockData => {
        return block.type === BlockType.TEXT && !!(block as UnifiedBlockOutput & { data: { text?: string } }).data?.text;
      })
      .map(block => ({ text: (block as UnifiedBlockOutput & { data: { text: string } }).data.text }));
    return textBlocks;
  }

  /**
   * Generate excerpt from current blocks
   * Mirrors the server-side logic exactly
   */
  static generateExcerpt(blocks: UnifiedBlockOutput[], wordLimit: number = 20): GeneratedExcerpt {
    // Get text blocks for content extraction
    const textBlocks = this.getTextBlocks(blocks);
    
    // Extract excerpt from first text block
    let excerptText = '';
    if (textBlocks.length > 0) {
      const textContent = this.stripHtml(textBlocks[0].text);
      excerptText = this.extractWords(textContent, wordLimit);
    }

    // Find first image
    const { fileId: imageFileId, alt: imageAlt } = this.findFirstImage(blocks);

    // Calculate total word count
    const wordCount = this.calculateWordCount(textBlocks);

    return {
      text: excerptText,
      imageFileId,
      imageAlt,
      wordCount
    };
  }

  /**
   * Generate reading time estimate (200 words per minute)
   */
  static calculateReadTime(blocks: UnifiedBlockOutput[]): number {
    const textBlocks = this.getTextBlocks(blocks);
    const wordCount = this.calculateWordCount(textBlocks);
    return Math.max(1, Math.ceil(wordCount / 200));
  }
}