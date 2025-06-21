"use client";

import React from 'react';
import { MultiSelect } from '@/components/multi-select';
import { Tag } from '@/generated/prisma';

interface TagsSectionProps {
  tagOptions: { label: string; value: string }[];
  selectedTags: string[];
  onTagsChange: (values: string[]) => void;
  onCreateTag: (params: { label: string }) => Promise<Tag>;
  onTagsClose: () => Promise<void>;
}

export const TagsSection = React.memo<TagsSectionProps>(({
  tagOptions,
  selectedTags,
  onTagsChange,
  onCreateTag,
  onTagsClose,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">
        Tags
      </label>
      <MultiSelect
        creatable
        options={tagOptions}
        onValueChange={onTagsChange}
        defaultValue={selectedTags}
        placeholder="Select or create tags..."
        className="w-full"
        onCreateOption={onCreateTag}
        onClose={onTagsClose}
      />
    </div>
  );
});

TagsSection.displayName = 'TagsSection';