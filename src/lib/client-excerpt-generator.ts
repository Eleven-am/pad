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
   * Extract first N characters from text
   */
  private static extractCharacters(text: string, charCount: number): string {
    if (text.length <= charCount) {
      return text;
    }
    
    const truncated = text.slice(0, charCount);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > charCount * 0.8) {
      return truncated.slice(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
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
  static generateExcerpt(blocks: UnifiedBlockOutput[], charLimit: number = 200): GeneratedExcerpt {
    const textBlocks = this.getTextBlocks(blocks);
    
    let excerptText = '';
    if (textBlocks.length > 0) {
      const combinedText = textBlocks
        .map(block => this.stripHtml(block.text))
        .join(' ');
      excerptText = this.extractCharacters(combinedText, charLimit);
    }

    const { fileId: imageFileId, alt: imageAlt } = this.findFirstImage(blocks);

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