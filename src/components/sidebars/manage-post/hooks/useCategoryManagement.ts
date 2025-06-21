"use client";

import { useCallback, useState } from 'react';
import { useToggle } from '../../shared/sidebar-utils';
import { Category } from '@/generated/prisma';

interface CategoryManagementHook {
  newCategory: string;
  showNewCategoryInput: boolean;
  setNewCategory: (category: string) => void;
  showCategoryInput: () => void;
  hideCategoryInput: () => void;
  handleCategoryChange: (value: string) => void;
  handleCategorySubmit: (e: React.FormEvent, onSubmit: (data: { name: string; slug: string }) => Promise<Category | null>) => Promise<void>;
  resetCategoryInput: () => void;
}

export function useCategoryManagement(
  onCategorySelect: (categoryId: string) => void
): CategoryManagementHook {
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, _toggleInput, setShowInput] = useToggle(false);

  const showCategoryInput = useCallback(() => {
    setShowInput(true);
  }, [setShowInput]);

  const hideCategoryInput = useCallback(() => {
    setShowInput(false);
    setNewCategory("");
  }, [setShowInput]);

  const resetCategoryInput = useCallback(() => {
    setNewCategory("");
    setShowInput(false);
  }, [setShowInput]);

  const handleCategoryChange = useCallback((value: string) => {
    if (value === "new") {
      showCategoryInput();
    } else {
      onCategorySelect(value);
    }
  }, [onCategorySelect, showCategoryInput]);

  const handleCategorySubmit = useCallback(async (
    e: React.FormEvent,
    onSubmit: (data: { name: string; slug: string }) => Promise<Category | null>
  ) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const category = await onSubmit({
        name: newCategory.trim(),
        slug: newCategory.trim().toLowerCase().replace(/\s+/g, '-')
      });
      if (category) {
        onCategorySelect(category.id);
        resetCategoryInput();
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      // TODO: Add toast notification
    }
  }, [newCategory, onCategorySelect, resetCategoryInput]);

  return {
    newCategory,
    showNewCategoryInput,
    setNewCategory,
    showCategoryInput,
    hideCategoryInput,
    handleCategoryChange,
    handleCategorySubmit,
    resetCategoryInput,
  };
}