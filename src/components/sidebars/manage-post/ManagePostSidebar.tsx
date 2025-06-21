"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { User } from "better-auth";
import { useMenu } from "@/components/menu";
import { useBlockPostState, useBlockPostActions } from "@/commands/CommandManager";

import { SidebarContainer, SidebarHeader, ScrollableContent } from "../shared/sidebar-components";
import { BlogMetadataSection } from "./components/BlogMetadataSection";
import { CategorySection } from "./components/CategorySection";
import { TagsSection } from "./components/TagsSection";
import { ProgressTrackerSection } from "./components/ProgressTrackerSection";
import { PublishingSection } from "./components/PublishingSection";

import { usePostForm } from "./hooks/usePostForm";
import { useCategoryManagement } from "./hooks/useCategoryManagement";
import { useTagManagement } from "./hooks/useTagManagement";
import { useProgressTracker } from "./hooks/useProgressTracker";
import { usePostActions } from "./hooks/usePostActions";

export const ManagePostSidebar = React.memo<{ user: User }>(({ user }) => {
  const { setBlocksSubPanel } = useMenu();
  
  const { post, categories, tags, hasBlocks, tracker } = useBlockPostState((state) => ({
    post: state.post,
    categories: state.categories,
    tags: state.tags,
    hasBlocks: state.blocks.length > 0,
    tracker: state.tracker
  }));

  const { 
    updatePost, 
    publishPost, 
    createCategory, 
    createTag, 
    updatePostTags, 
    updateProgressTracker 
  } = useBlockPostActions();

  // Form state management
  const [formState, formActions] = usePostForm(post);

  // Category management
  const categoryManagement = useCategoryManagement(formActions.setCategory);

  // Tag management
  const tagManagement = useTagManagement(
    tags,
    formState.selectedTags,
    formActions.setSelectedTags,
    createTag,
    updatePostTags,
    user.id
  );

  // Progress tracker management
  const progressTracker = useProgressTracker(
    tracker,
    post?.id,
    updateProgressTracker
  );

  // Post actions
  const postActions = usePostActions(
    post,
    user.id,
    formState,
    updatePost,
    publishPost,
    setBlocksSubPanel
  );

  // Event handlers with proper memoization
  const handleBlogNameChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    formActions.setBlogName(e.target.value);
  }, [formActions]);

  const handleCategorySubmit = useCallback(async (e: React.FormEvent) => {
    await categoryManagement.handleCategorySubmit(e, createCategory);
  }, [categoryManagement, createCategory]);

  const handleCancelNewCategory = useCallback(() => {
    categoryManagement.hideCategoryInput();
  }, [categoryManagement]);

  return (
    <SidebarContainer>
      <SidebarHeader 
        title="Manage Post"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={postActions.handleSave}
          className="flex items-center gap-2"
          disabled={!post}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </SidebarHeader>

      <ScrollableContent className="m-4 space-y-4">
        <BlogMetadataSection
          blogName={formState.blogName}
          onBlogNameChange={handleBlogNameChange}
        />

        <CategorySection
          category={formState.category}
          categories={categories}
          showNewCategoryInput={categoryManagement.showNewCategoryInput}
          newCategory={categoryManagement.newCategory}
          onCategoryChange={categoryManagement.handleCategoryChange}
          onNewCategoryChange={categoryManagement.setNewCategory}
          onCategorySubmit={handleCategorySubmit}
          onCancelNewCategory={handleCancelNewCategory}
        />

        <TagsSection
          tagOptions={tagManagement.tagOptions}
          selectedTags={formState.selectedTags}
          onTagsChange={tagManagement.handleTagsChange}
          onCreateTag={tagManagement.handleCreateTag}
          onTagsClose={tagManagement.handleTagsClose}
        />

        <ProgressTrackerSection
          variant={progressTracker.state.variant}
          showPercentage={progressTracker.state.showPercentage}
          onVariantChange={progressTracker.actions.setVariant}
          onShowPercentageChange={progressTracker.actions.setShowPercentage}
        />

        <PublishingSection
          isDraft={formState.isDraft}
          scheduledDate={formState.scheduledDate}
          hasBlocks={hasBlocks}
          onDraftModeChange={formActions.setIsDraft}
          onScheduledDateChange={formActions.setScheduledDate}
          onStartAddingBlocks={postActions.handleStartAddingBlocks}
          onPublish={postActions.handlePublish}
        />
      </ScrollableContent>
    </SidebarContainer>
  );
});

ManagePostSidebar.displayName = 'ManagePostSidebar';

// Export for backward compatibility
export const ManagePost = ManagePostSidebar;