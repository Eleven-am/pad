"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Category } from '@/generated/prisma';

interface CategorySectionProps {
  category: string;
  categories: Category[];
  showNewCategoryInput: boolean;
  newCategory: string;
  onCategoryChange: (value: string) => void;
  onNewCategoryChange: (value: string) => void;
  onCategorySubmit: (e: React.FormEvent) => Promise<void>;
  onCancelNewCategory: () => void;
}

export const CategorySection = React.memo<CategorySectionProps>(({
  category,
  categories,
  showNewCategoryInput,
  newCategory,
  onCategoryChange,
  onNewCategoryChange,
  onCategorySubmit,
  onCancelNewCategory,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">
        Category
      </label>
      {showNewCategoryInput ? (
        <form onSubmit={onCategorySubmit} className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => onNewCategoryChange(e.target.value)}
            placeholder="Enter new category name"
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            Create
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelNewCategory}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
            <SelectItem value="new">
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create new category
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
});

CategorySection.displayName = 'CategorySection';